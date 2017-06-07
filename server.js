// import environmental variables from variables.env file
require('dotenv').config({ path: 'variables.env' });


//TODO DATABASE / SESSIONS / AUTH
const mongoose = require('mongoose');
// Connect to our Database and handle an bad connections
mongoose.connect(process.env.DATABASE);
// Tell Mongoose to use ES6 promises
mongoose.Promise = global.Promise; 
//Handle mongoose errors
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

//Import database models
require('./models/User');

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const morgan = require('morgan');
const path = require('path');
const port = process.env.PORT;
const sessionOptions = {
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}

//TODO: Configure express
const app = express();
//TODO: Configure view engine 
app.use(express.static(path.join(__dirname, '/public/app')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Exposes a bunch of methods for validating data.
// app.use(expressValidator());
// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());
// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session(sessionOptions));

// // Passport JS to handle our logins
require('./config/passportConfig.js')
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS from client-side
app.use(function(req, res, next) {  
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// // The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());


//TODO: Route for API requests (list of active game sessions)
app.get('/API/getactiveroomslist', (req, res) => {
	const rooms = generateSessionsListForAPIRequests(gameSessionsMap)
	res.json(rooms)
})

//TODO: configure routes
app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/app/index.html'))
})

//TODO: Create Map of Game Sessions
const GameClient = require('./components/GameClient');
const GameSession = require('./components/GameSession');
const gameSessionsMap = new Map;

const server = require('http').Server(app);
//TODO: configure socket.io
const sio = require('socket.io');
const io = sio(server)
const io_lobby = io.of('/lobby');
const io_gameroom = io.of('/gameroom');

const {generateChatPacket, broadcastSession} = require('./sockets/socketHelpers');
const gameroomSocketHandlers = require('./sockets/gameroomHandlers')

io_gameroom.on('connection', (socket) => {
	let client;

	console.log('Gameroom connection detected:', socket.id)
	
	//Socket will wait for client information before creating client and (joining it to/creating) a game session
	//gameroomSocketHandlers will be added which are the main conduit of communicating between clients in a session
	//gameroomSocketHandlers also contains the disconnect logic for the socket
	socket.on('setup_client', (packet) => {
		client = createGameClient(socket, packet.name);
		client.send({type: 'temp_get_myid', id: client.id})
		console.log('Client created', client.name)
		if(!packet.sessionId) {
			console.log('Creating Game Session')

			const session = createGameSession(generateRandomId()); //could also just use socket id?
			session.join(client);

			client.send({
				type: 'setup_client',
				payload: {
				  id: session.id,
				  color: generateRandomColor(),
				  chatLog: session.getChatLog()
				}
			});
			//Initialize session state
			session.broadcastSessionState();
			//Initiate Packet Handlers
			gameroomSocketHandlers(socket, client, session, gameSessionsMap);
		}
		else  {

			const session = gameSessionsMap.get(packet.sessionId) || createGameSession(packet.sessionId);
			session.join(client);

			console.log(client.name, 'joined game session', session.id)

			client.send({
				type: 'setup_session',
				payload: {
				  id: session.id,
				  color: generateRandomColor(),
				  chatLog: session.getChatLog()
				}
			});
			//Update clients with new player joined to session
			session.broadcastSessionState();
			// broadcastSession(session);
			//Initiate Packet Handlers
			gameroomSocketHandlers(socket, client, session, gameSessionsMap);
			// session.initGame();
		}	
	})


})

//####################### DB Logic ##########################

//Converts relevant info from Map into an array of objects to be rendered on the menu screen as room choices.
//As of now this is only room id and active players. 
//TODO: add client names
function generateSessionsListForAPIRequests(map) {
	let sessionsList = [];
	let rooms = [...map.entries()];
	rooms.forEach(([sessionId, session]) => {
		//Convert Set into Array to extract names
		let clients = Array.from([...session.clients]);
		clients = clients.map(client => client.name);
		sessionsList.push({sessionId, clients})

	})
	return sessionsList;
}

//################################################
//############ GAMEROOM LOGIC ####################

//TODO: Wait for players
//TODO: Setup game (assign order and colors)
//TODO: Main game loop (stepping through array of turns)

function generateRandomId(len = 8) {

	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let length = len;
	let id = '';
	while(length--) {
		id += chars[Math.random() * chars.length | 0]
	}
	return id;
}

function generateRandomColor() {
	return '#' + (0x1000000 + Math.random() * 0xFFFFFF).toString(16).substr(1,6);
}

function createGameSession(id) {
	if(gameSessionsMap.has(id)){
		throw new Error('Session already exists')
	}

	const session = new GameSession(id);
	gameSessionsMap.set(id, session);	
	
	return session;
}

function createGameClient(socket, name, id = generateRandomId()) {
	return new GameClient(socket, name, id);
}

//######################################################
//######################################################

server.listen(port);
console.log('Server is listening on port: ', port)