const COLORS = [
	//Array of good colors (10)
	'yellow',
	'green',
	'blue',
	'red',
	'orange',
	'pink',
	'indigo',
	'violet',
	'brown',
	'teal'
]

const SECRETS = [
	{
		category: 'Animal',
		secret: 'Lion'
	},
	{
		category: 'Person',
		secret: 'Abraham Lincoln'
	},
	{
		category: 'Food',
		secret: 'Banana Split'
	},
	{
		category: 'Vehicle',
		secret: 'Helicopter'
	},
	{
		category: 'Halloween',
		secret: 'Headless Horseman'
	},
]

//Fischer-Yates Shuffle
const shuffleArray = (array) => {
  let i = array.length, 
  		j = 0,
    	temp;
  while(i) {
    j = Math.floor(Math.random() * i--);
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;	
  };
  return array;
}

class Game {
	constructor(players) {
		//NB: For the current implementation, the players cannot change after this point.
		//Players leaving or not participating will wreck the game.
		//Game variables
		this.state = {
			isGameDisplayingClue: true,
			isDrawingPhase: false,
			isVotingForFake: false,
			isVotingForGuess: false,
			isGameOver: false,
			playerList: [],
			activePlayer: [],
			currentSecret: {
				category: '',
				secret: ''
			},
			turnList: null,
		}

		//Initialize Game
		this._setupNewGame(players);
		console.log(this.state)
		//setTimeoutfor5seconds to begin first turn
		//at the end of each turn is an if statement
		//---if not last turn settimeout for next turn
		//---else settimeout for voting phase 1
	}

	_setFakePlayer(players) {
		//Randomly choose player as fake
		//Map array of player objects adding isFake property
		//replace old array
		const fake = players[Math.floor(Math.random() * players.length)]
		players = players.map(player => {
			const isFake = player.id === fake.id ? true : false;
			return Object.assign({}, player, {isFake})
		})
		return players;
	}

	_setPlayerColors(players, colors) {
		//Duplicate array of colors. Shuffle it
		//Map through array of players, for each player, pop off the last color and add it to the player		
		colors = shuffleArray([...colors])
		players = players.map(player => {
			const color = colors.pop();
			return Object.assign({}, player, {color})
		})
		return players;
	}

	_setPlayerTurnOrder(players) {
		return shuffleArray(players);
	}

	_createTurnList(players) {
		const playerTurns = [...players, ...players];
		// playerTurns = playerTurns.map(player => {

		// });
		return playerTurns;
	}

	//Select random secret from array of objects with category and secret
	//Add secret to list of used secrets
	//TODO: if secret is already used, generate a different one
	_generateSecret(secrets) {
		return secrets[Math.floor(Math.random() * secrets.length)];
	}

	_setupNewGame(players) {
		players = this._setFakePlayer(players);
		players = this._setPlayerColors(players, COLORS);
		console.log(players)
		players = this._setPlayerTurnOrder(players);
		this.state.playerList = players;

		this.state.turnList = this._createTurnList(players);

		this.state.currentSecret = this._generateSecret(SECRETS);
	}

	//Loop through array of turns
			// iterate through turn array(
			// 	check if last turn
			// 	(if last turn, at end of turn start voting phase)
			// 	at the beginning of each turn -> broadcast turn state (who is drawing)
			// 	start timer for turn
			// 	receive and broadcast paths from player only (also client-side prohibit sending when not your turn) to other players

			// 	(LATER if player disconnects, start 60sec pause loop. If player returns before, resume, otherwise quit)
			// 	(LATER blackmark on player for disconnect, enough = flag/ban)
			// )

	retrieveState() {
		return this.state;
	}


}

module.exports = Game;
