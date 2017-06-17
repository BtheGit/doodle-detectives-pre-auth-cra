import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Switch, Route, Redirect } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Room from './components/gameroom/Room';
import Lobby from './components/lobby/Lobby';
import Login from './components/Login';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);
	};

	render() {
		return (
			<Switch>
				<Route exact path='/' component={Lobby} />
				<Route path='/login' component={Login} />
				<PrivateRoute path='/newroom' isLoggedIn={this.props.isLoggedIn} component={Room} />
				<PrivateRoute path='/room/:id' isLoggedIn={this.props.isLoggedIn} component={Room} />
				<Route path="*" status={404} component={Lobby}/>
			</Switch>
		);
	};
};

const mapStateToProps = (state) => {
	return {
		isLoggedIn: state.gameReducer.isLoggedIn
	}
}

export default withRouter(connect(mapStateToProps)(App));
