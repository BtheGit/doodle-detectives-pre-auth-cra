//<Game Manager />
//<Event Handler />
//<Player />
//<Game />
//--<Canvas />
//--<Chatwindow />
//--<Display />
//----<Timer />
//----<Current Turn />
//--<Modal />
//----<Vote />
//----<Vote Results />
//<Connection Manager />

//Create new Game Manager -> pass it document refs

//Client State
// isDrawing
// isVoting

class Player {
	constructor(player) {
		this.state = {
			id: player.id,
			name: player.name,
			color: '',
			score: 0,
			path1: [],
			path2: [],			
		}
	}

	//Reducer for simple Player state changes
	updateState(newState) {
		this.state = Object.assign({}, this.state, newState);
	}

}

class GameManager {
	constructor(player) {
		this.state = {
			player: new Player(player)
		}
	}
}

class Game {
	constructor() {
		this.state = {

		}
	}
}

class Canvas {
	constructor() {
		this.state = {
			height: 0,
			width: 0,
			isDrawable: false,
		}
	}

	addPath() {

	}
}

class ChatWindow {
	constructor() {
		this.state = {
			messages: []
		}
	}

	sendMessage() {

	}

	logMessage(message) {
		this.state = Object.assign({}, this.state, {messages: [...this.state.messages, message]});		
	}

}

let isGameActive = false;
let isTurn = false; 

const chatWindow = new ChatWindow;
