//sync

export function login() {
	return({
		type: 'LOGIN'
	});
};

export function logout() {
	return({
		type: 'LOGOUT'
	})
}

export function updateScore(score) {
	return({
		type: 'UPDATE_SCORE',
		payload: score
	});
};

export function setPlayerName(name) {
	return({
		type: 'SET_PLAYER_NAME',
		payload: name
	});
};

//async
export function playerLogin(name) {
	return function (dispatch) {
		dispatch(setPlayerName(name));
		dispatch(login());
		localStorage.setItem('localClient', JSON.stringify({name}))
	};
};

export function playerLogout() {
	return function (dispatch) {
		dispatch(setPlayerName(''));
		dispatch(logout());
		localStorage.clear();
	};
};

export function practiceThunk() {
	return function(dispatch) {
		setTimeout(() => {dispatch(updateScore(5))}, 2000)
	};
};