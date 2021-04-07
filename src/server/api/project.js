const express = require('express'),
	rp = require('request-promise'),
	model = require('../model.js'),
	mission = require('./mission.js');

const app = express();

//Wrap async functions for async error handling
const wrap = fn => (...args) => fn(...args).catch(args[2])

app.get('/', wrap(async (req, res, next) => {

	var project = await model.Project.findById(req.user.projectId).lean();

	var missions = await model.Mission.find({
		projectId: project._id
	}).lean();

	for(var mission of missions) {
		var tasks = await model.Task.find({
			missionId: mission._id
		}).lean();

		mission.tasks = tasks;
	}

	project.missions = missions;

	res.send(project);
}))

app.use('/m', mission);

module.exports = app;