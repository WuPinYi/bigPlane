const express = require('express'),
	rp = require('request-promise'),
	model = require('../model.js');

const app = express();

//Wrap async functions for async error handling
const wrap = fn => (...args) => fn(...args).catch(args[2])

app.post('/', wrap(async(req, res, next) => {
	var task = req.task;

	task.logs.push({
		type: req.body.type,
		message: req.body.message,
		time: req.body.time
	});

	await task.save();

	const log = task.logs[task.logs.length - 1];

	res.send(log);
}));

app.put('/:logId', wrap(async(req, res, next) => {
	var task = req.task;

	var log = task.logs.find((log) => {
		return log._id == req.params.logId;
	});

	if(!log)
		return res.status(404).send('Log not found');

	if(req.body.type !== undefined && req.body.type !== log.type) {
		if(log.type === 'comment')
			log.message = undefined;
		else
			log.time = undefined;
		log.type = req.body.type;
	}

	if(req.body.message !== undefined)
		log.message = req.body.message;

	if(req.body.time !== undefined)
		log.time = req.body.time;

	await task.save();

	res.send(log);
}));

app.delete('/:logId', wrap(async(req, res, next) => {
	var task = req.task;

	var index = task.logs.findIndex((log) => {
		return log._id == req.params.logId;
	});

	if(index === -1)
		return res.status(404).send('Log not found');

	task.logs.splice(index, 1);

	await task.save();

	res.send({});
}));


module.exports = app;