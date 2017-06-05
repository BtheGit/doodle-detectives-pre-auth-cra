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

// // Enable CORS from client-side
// app.use(function(req, res, next) {  
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

// // The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());

//TODO: configure routes
app.get('/*', (req, res) => {
	console.log(req.session)
	console.log(req.user)
	res.sendFile(path.join(__dirname, '/public/views/index.html'))
})

// app.get('/room', (req, res) => {
// 	console.log(req.session)
// 	res.sendFile(path.join(__dirname, '/public/app/index.html'))	
// })

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
	//TODO Game logic functions and loop
	socket.on('setup_client', (packet) => {
		console.log('setup packet', packet)
		client = createGameClient(socket, packet.name);
		console.log('Client created', client.name)
		if(!packet.sessionId) {
			console.log('Creating Game Session')

			const session = createGameSession(generateRandomId()); //could also just use socket id?
			session.join(client);

			client.send({
				type: 'setup_session',
				payload: {
				  id: session.id,
				  color: generateRandomColor()
				}
			});
			gameroomSocketHandlers(socket, client, session);
		}
		else  {
			console.log('Client joined session')

			const session = gameSessionsMap.get(packet.sessionId) || createGameSession(packet.sessionId);
			session.join(client);

			client.send({
				type: 'setup_session',
				payload: {
				  id: session.id,
				  color: generateRandomColor()
				}
			});
			//Update clients with new player joined to session
			broadcastSession(session);
			gameroomSocketHandlers(socket, client, session);
		}	
		//Initiate Packet Handlers
	})

	//Restore Chat Logs (this will only happen if client is reconnecting once user auth is implemented)
	// restoreClientChatLog(socket, chatLog);

})

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

//Since I'm not using this to generate local copies of games, I really only need to send a list of
//player names here. This is overkill.
// function broadcastSession(session) {
// 	if(session) {
// 		//extract all clients into new array using spread operator
// 		const clients = [...session.clients] || []; //To avoid server crash if there are no clients
// 		clients.forEach( client => {
// 			client.send({
// 				type: 'broadcast_session',
// 				clients: {
// 					//Receiving client will self-identify with 'you'
// 					self: client.id,
// 					//object of all client ids and current state
// 					players: clients.map(client => {
// 						return {
// 							id: client.id,
// 							name: client.name,
// 							color: client.color
// 						}
// 					})
// 				}
// 			})
// 		})
// 	}
// 	//This will update the DB when implemented to track rooms and occupants
// 	// parseMapForDB(sessionsMap);
// }


// const generateChatPacket = payload => {
// 	return {
// 		type: 'chat_message',
// 		payload: {
// 			name: payload.name,
// 			time: payload.time,
// 			content: payload.content
// 		}
// 	};
// };

//EARLY TESTING DEPRECATED // can be used for sitewide messaging
// const broadcastChatMessage = packet => {
// 	io_gameroom.emit('packet', packet);	
// };

//TODO
// const restoreClientChatLog = (socket, log) => {
// 	log.map(entry => {
// 		sendChatMessage(socket, generateChatPacket(entry));
// 	});
// };


// const gameroomSocketHandlers = (socket, client, session) => {

// 	//Handles typical client communications (chat/game)
// 	socket.on('packet', (packet) => {
// 		// console.log('Packet received: ', packet.type)
// 		if(packet) {
// 			if(packet.type === 'chat_message') {
// 				//Store message to log, generate packet for broadcast, then broadcast it
// 				session.addChatMessage(packet.payload)
// 				const newPacket = generateChatPacket(packet.payload);
// 				//Chat messages will be broadcast to everybody 
// 				//(client will only see own message on return from server for easy sync)
// 				client.broadcast(newPacket);
// 			}
// 			else if(packet.type === 'path') {
// 				//TODO: create an array of paths for restore (and separate them by turn for voting?)

// 				client.broadcast(packet)
// 			}
// 		}
// 	});

// 	socket.on('disconnect', () => {
// 		const session = client.session;
// 		if(session) {

// 			console.log('Client disconnected from session', session.id);
// 			session.leave(client);

// 			//Update clients when a player disconnects
// 			//Or terminate session altogether
// 			if(session.clients.size) {
// 				broadcastSession(session);
// 			} else {
// 				console.log(`Session ${session.id} removed`)
// 				gameSessionsMap.delete(session.id)				
// 			}
// 		}

// 	})
// };


server.listen(port);
console.log('Server is listening on port: ', port)