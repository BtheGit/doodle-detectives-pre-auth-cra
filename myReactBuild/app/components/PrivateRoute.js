import React from 'react';
import { Route, Redirect } from 'react-router';

const PrivateRoute = ({component: Component, isLoggedIn, ...rest}) => {
	return(
		<Route 
			{...rest} 
			render={props => isLoggedIn ? 
													<Component {...props}/> : 
													<Redirect to={{pathname: '/login', state: {from: props.location}}} />
			} 
		/>
	);
};

													// <Redirect to='/login' />
export default PrivateRoute;