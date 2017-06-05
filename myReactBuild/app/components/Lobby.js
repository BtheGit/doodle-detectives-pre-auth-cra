import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { playerLogin, playerLogout } from '../redux/actions/actionCreators.js'

//Login/Logout buttons & Link to gameroom are rendered conditionally based on isLoggedIn in gameReducer store
class Lobby extends Component {
	constructor(props){
		super(props)
		this.checkForUserInstance();
	}

	checkForUserInstance() {
		if(localStorage.getItem('localClient')) {
			console.log(localStorage.getItem('localClient'));
			const user = JSON.parse(localStorage.getItem('localClient'));
			this.props.playerLogin(user.name);
		}
	}

	//TODO: Make API Request for active game sessions to generate link table dynamically
	//TODO: Loading screen while waiting for results

	renderGuest() {
		return (
			<div>
				<Link to='/login'>Login</Link>
			</div>
		)
	}

	renderLoggedIn() {
		return (
			<div>
			<div>
				<Link to='/newroom'>Create New Room</Link>
			</div>
			<div>
				<Link to='/room/poop'>Room: Poop</Link>
			</div>
			<div>
				<Link to='/room/ugly'>Room: Ugly</Link>
			</div>
				<div onClick={this.props.playerLogout}>Logout</div>
			</div>
		)
	}

	render() {
		console.log(localStorage)
		return(
			<div>
				<h1>LOBBY</h1>
				{this.props.isLoggedIn ? <h2>Name: {this.props.playerName}</h2> : null}
				{this.props.isLoggedIn ? this.renderLoggedIn() : this.renderGuest()}
			</div>
		)
	}
}

//############### REDUX CONFIG #################
const mapStateToProps = (state) => {
	return {
		playerScore: state.gameReducer.playerScore,
		playerName: state.gameReducer.playerName,
		isLoggedIn: state.gameReducer.isLoggedIn
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		playerLogin: (name) => {dispatch(playerLogin(name))},
		playerLogout: () => {dispatch(playerLogout())}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)