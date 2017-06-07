const Game = require('./Game');

//TODO: Track Room Players current scores, persist them after each game

//This class will contain the logic for each game session (initiated by first player entering room, terminated
//by last player exiting room)
//Each time a new game is initiated a Game instance will be created
//Any tracking of state between games should be done at this level or higher

const MINIMUM_PLAYERS_FOR_GAME = 5;

class GameSession {
	constructor(id) {
		this.id = id;
		this.clients = new Set;
		this.chatLog = [];
		this.currentSessionStatus = 'isWaitingForPlayers';
		this.game = null;
		// this.usedSecrets = [] //figure out the best way to track variables like secrets/scores between games
	}

	//PUBLIC
	addChatMessage(msg) {
		this.chatLog = [...this.chatLog, msg];
	}

	getChatLog() {
		return this.chatLog || [];
	}

	//perhaps I should pass this function down and allow game to use it (so game doesn't have to directly track sockets)
	broadcastGameState() {
		const gameState = this.game.retrieveState();

		const clients = [...this.clients] || []; //To avoid server crash if there are no clients
		clients.forEach( client => {
			client.send({
				type: 'game_state_update',
				gameState
			})
		})		
	}

	broadcastSessionState() {
		const clients = [...this.clients] || []; //To avoid server crash if there are no clients

		//FILTER DATA We only want to have a list available. More specific player info, like color, is handled in the gameState
		const players = clients.map(client => {
			return {
				id: client.id,
				name: client.name,
			}
		});

		//This structure needs to match the client exactly since I'm just copying the object straight into updates
		const sessionState = {
			players,
			currentSessionStatus: this.currentSessionStatus
		}

		//Broadcast state to every player
		clients.forEach( client => {
			client.send({
				type: 'session_state_update',
				sessionState
			})
		})			
	}

	//TODO: make sure a maximum of 8 can join room
	join(client) {
		if(client.session) {
			throw new Error ('Client already in session')
		}

		this.clients.add(client);
		client.session = this;
		this._checkPlayerQuotas()
	}

	leave(client) {
		if(client.session !== this) {
			throw new Error('Client not in session')
		}

		this.clients.delete(client)
		client.session = null;
		this._checkPlayerQuotas()
	}

	//IN PROGRESS
	initGame() {
		this.currentSessionStatus = 'isGameActive';
		const players = this._createPlayerList();
		this.game = new Game(players)
		//return this.game so it's accessible to socket.io
		//OR. Sockets are available in this.clients, so nevermind
	}

	//This will be the player list that the Game instance manipulates and broadcasts to. 
	//Passing a copy will allow us to mutate it at will for the duration of the game and
	//reset for the next game without consequence
	_createPlayerList() {
		let players = Array.from(this.clients);
		players = players.map(player => {
			return {
				id: player.id,
				name: player.name,
				socket: player.socket,
				color: '',
				isFake: false,
			}
		})
		return players;
	}

	_checkPlayerQuotas() {
		if(this.currentSessionStatus !== 'isGameActive') {
			if(this.clients.size >= MINIMUM_PLAYERS_FOR_GAME) {
				this.currentSessionStatus = 'isWaitingToStart';
			}	
			else {
				this.currentSessionStatus = 'isWaitingForPlayers';
			}
		}
	}
}

module.exports = GameSession;