const express = require('express'),
	rp = require('request-promise'),
	model = require('../model.js'),
	log = require('./log.js');

const app = express.Router({
	params: 'inherit'
});

//Wrap async functions for async error handling
const wrap = fn => (...args) => fn(...args).catch(args[2])

app.post('/', wrap(async(req, res, next) => {

	var task = new model.Task({
		userId: req.user._id,
		missionId: req.mission._id,
		name: req.body.name,
		description: req.body.description,
		phase: req.body.phase
	})

	if(typeof(req.body.time) === 'number')
		task.logs.push({
			type: 'estimate',
			time: req.body.time
		});

	await task.save();

	res.send(task);
}))

app.put('/:taskId', wrap(async(req, res, next) => {

	var update = {};

	if (req.body.name !== undefined)
		update.name = req.body.name;

	if (req.body.description !== undefined)
		update.description = req.body.description;

	if (req.body.phase !== undefined)
		update.phase = req.body.phase;

	var result = await model.Task.findOneAndUpdate({
		_id: req.params.taskId,
		userId: req.user._id,
		missionId: req.mission._id,
	}, update, {
		new: true,
		runValidators: true
	});

	res.send(result);
}))

app.delete('/:taskId', wrap(async(req, res, next) => {

	var result = await model.Task.findOneAndRemove({
		_id: req.params.taskId,
		userId: req.user._id,
		missionId: req.mission._id,
	});

	res.send({});
}))

app.use('/:taskId/l', wrap(async (req, res, next) => {
	req.task = await model.Task.findOne({
		_id: req.params.taskId,
		userId: req.user._id,
		missionId: req.mission._id,
	});

	if(!req.task)
		return res.status(404).send('Task not found');

	next();
}), log);

module.exports = app;