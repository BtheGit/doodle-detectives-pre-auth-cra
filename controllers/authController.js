const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

//MIDDLEWARE
exports.isLoggedIn = (req, res, next) => {
	//check if user is authenticated and pass to next middleware
	if(req.isAuthenticated()) return next();
	//Flash failure and return to login
	req.flash('error', 'Oops you must be logged in to do that!');
	res.redirect('/login');
}

exports.confirmedPasswords = (req, res, next) => {
	//verify that password and confirm password entered by user match
	if(req.body.password === req.body['password-confirm']) return next();
	//Otherwise send them back to try again
	req.flash('error', "Passwords don't match!");
	res.redirect('back');
}

exports.verifyToken = async (req, res, next) => {
	//Lookup user by resetToken and by expiryDate - using $gt (greater than) it only returns a success if the 
	//expiryDate is greater than the current time (ie not expired)
	req.user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if(req.user) {
		return next();
	}
	//If no user found (which could just mean token is expired)
	req.flash('error', 'Password reset is invalid or expired');
	//TODO redirect to get reset token route
	res.redirect('/login');
}

//ROUTES
exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'Logged in.'
})

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out.')
	res.redirect('/');
};