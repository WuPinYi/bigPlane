const express = require('express'),
	rp = require('request-promise'),
	model = require('../model.js'),
	task = require('./task.js');

const app = express();

//Wrap async functions for async error handling
const wrap = fn => (...args) => fn(...args).catch(args[2])

app.post('/', wrap(async(req, res, next) => {

	var mission = new model.Mission({
		userId: req.user._id,
		projectId: req.user.projectId,
		name: req.body.name
	});

	await mission.save();

	//Inject fake tasks array
	mission = mission.toObject();
	mission.tasks = [];

	res.send(mission);
}))

app.put('/:missionId', wrap(async(req, res, next) => {

	var result = await model.Mission.findByIdAndUpdate({
		_id: req.params.missionId,
		userId: req.user._id	//validate user
	}, {
		$set: {
			name: req.body.name
		}
	}, {
		new: true,
		runValidators: true
	});

	res.send(result);
}))

app.delete('/:missionId', wrap(async(req, res, next) => {

	var result = await model.Mission.findOneAndRemove({
		_id: req.params.missionId,
		userId: req.user._id	//validate user
	});

	res.send({});

	//TODO: remove tasks of the mission


}))

app.use('/:missionId/t', wrap(async (req, res, next) => {
	req.mission = await model.Mission.findOne({
		_id: req.params.missionId,
		userId: req.user._id
	});

	if(!req.mission)
		return res.status(404).send('Mission not found');

	next();
}), task);

module.exports = app;