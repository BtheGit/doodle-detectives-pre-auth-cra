const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise; //to suppress terminal errors
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const validator = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		//validate takes 2 args a) method of validation b) error
		validate: [validator.isEmail, 'Invalid Email Address'], 
		required: 'Please supply an email address'
	},
	name: {
		type: String,
		required: 'Please supply a name',
		trim: true
	}, 
	resetPasswordToken: String,
	resetPasswordExpires: Date

});

//Passport will modify schema to handle password.
//We are using the local strategy so we only need to tell passport which other field is being used as the username
//This also exposes a .register() method on the User model
userSchema.plugin(passportLocalMongoose, { usernameField: 'email'})

//Modifies errors to make them more useful to us instead of mongodb error codes
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
