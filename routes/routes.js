const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/views/index.html'))
})

app.get('/room', (req, res) => {
	console.log(req.session)
	res.sendFile(path.join(__dirname, '/public/app/index.html'))	
})

//USER/AUTH ROUTES
app.get('/login', userController.loginForm);
app.post('/login', authController.login);

app.get('/logout', authController.logout);
app.get('/register', userController.registerForm);

app.post('/register',
	//1) validate data
	userController.validateRegister,
	//2) register user
	catchErrors(userController.register),
	//3) login user
	authController.login
)

app.get('/account', authController.isLoggedIn, userController.account);
app.post('/account', catchErrors(userController.updateAccount));

app.post('/account/forgot', catchErrors(authController.forgot));
app.get('/account/reset/:token',
	catchErrors(authController.verifyToken),
	authController.reset
);
app.post('/account/reset/:token', 
	authController.confirmedPasswords,
	catchErrors(authController.verifyToken),
	catchErrors(authController.update)
);