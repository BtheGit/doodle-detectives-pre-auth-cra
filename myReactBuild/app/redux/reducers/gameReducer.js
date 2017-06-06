const initialState = {
	playerName: '',
	playerScore: 0,
	isLoggedIn: false,
	activeRooms: [],
};

const gameReducer = (state = initialState, action) => {
	switch(action.type) {
		case 'SET_PLAYER_NAME':
			return ({
				...state,
				playerName: action.payload
			});
		case 'UPDATE_SCORE':
			return({
				...state,
				playerScore: state.playerScore + action.payload
			});
		case 'LOGIN':
			return({
				...state,
				isLoggedIn: true
			})
		case 'LOGOUT':
			return({
				...state,
				isLoggedIn: false
			})
		case 'UPDATE_ACTIVE_ROOMS':
			return({
				...state,
				activeRooms: action.payload
			})
		default:
			return state;
	}
}

export default gameReducer;