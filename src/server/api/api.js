const express = require('express'),
	rp = require('request-promise'),
	model = require('../model.js'),
	project = require('./project.js');

const app = express();

//Wrap async functions for async error handling
const wrap = fn => (...args) => fn(...args).catch(args[2])

const requireLogin = wrap(async (req, res, next) => {
	if(!req.session.status || !req.session.status.loggedIn)
		return next(new Error('Login required'));

	req.user = await model.User.findById(req.session.status.user._id);

	next();
})

const getFacebookUser = async function(accessToken) {
	const user = await rp({
		uri: `https://graph.facebook.com/v2.8/me?access_token=${accessToken}`,
		json: true
	});

	return user;
}

app.get('/status', wrap(async (req, res, next) => {
	const session = req.session;

	//Default status
	if(!session.status)
		session.status = {
			loggedIn: false,
			user: null
		}

	if(session.status.userId)
		session.status.user = await model.User.findById(session.status.userId);

	res.send(session.status);
}))

app.post('/login', wrap(async (req, res, next) => {
	if(!req.body.accessToken)
		return next('accessToken required');

	const graphUser = await getFacebookUser(req.body.accessToken);

	//Find user with fbId
	var user = await model.User.findOne({
		fbId: graphUser.id
	});

	//Create new user if not exists
	if(!user) {
		user = new model.User({
			fbId: graphUser.id,
			name: graphUser.name
		});

		var project = new model.Project({
			userId: user._id
		});


		user.projectId = project._id;

		await project.save();
		await user.save();
	}

	//Save to session
	if(!req.session.status)
		req.session.status = {};

	req.session.status.loggedIn = true;
	req.session.status.userId = user._id;
	req.session.status.user = user;

	//Respond session status
	res.send(req.session.status);
}));

app.post('/logout', (req, res, next) => {
	const session = req.session;

	//Default status
	session.status = {
		loggedIn: false,
		user: null
	}

	res.send(session.status);
})

app.use('/p', requireLogin, project);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send(err);
});

module.exports = app;