const initialState = {
	playerName: '',
	playerScore: 0,
	isLoggedIn: false
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
		default:
			return state;
	}
}

export default gameReducer;