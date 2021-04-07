const modal = require('../modalReducer.js'),
	{taskView, addTask} = require('./taskView.js'),
	project = require('./project.js'),
	session = require('./session.js');


const { combineReducers } = require('redux');

//Argument 1: old state, set default state here
//Argument 2: action object

module.exports = combineReducers({
	modal,
	project,
	taskView,
	session,
	addTaskModal: addTask
});