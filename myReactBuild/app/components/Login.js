import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { playerLogin } from '../redux/actions/actionCreators.js'

//TODO: Separate Presentation into separate dumb component

class Login extends Component {
	constructor(props){
		super(props)
		this.state = {
			name: ''
		}
	};

	handleChange = (e) => {
		let newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	};

	handleSubmit = (event) => {
		event.preventDefault();
		this.props.playerLogin(this.state.name);
		this.props.history.push('/');
	};

	render() {
		return (
			<div>
				<h1>Login</h1>
				<form onSubmit={this.handleSubmit}>
					<label>
						Name:
						<input type="text" name="name" value={this.state.name} onChange={this.handleChange}/>
					</label>
				</form>
				<Link to='/'>Lobby</Link>
			</div>
		)
	};
}

// ########## REDUX CONFIG ##########

const mapDispatchToProps = (dispatch) => {
	return {
		playerLogin: (name) => {dispatch(playerLogin(name))}
	}
}

export default connect(null, mapDispatchToProps)(Login)
