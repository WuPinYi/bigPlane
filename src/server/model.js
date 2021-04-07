const mongoose = require('mongoose'),
	{ ObjectId } = mongoose.Types;

mongoose.Promise = global.Promise;

const logScehma = mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: ['comment', 'worklog', 'estimate']
	},
	message: String,
	time: Number,
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	}
});

logScehma.pre('validate', function(next) {
	if(this.type == 'comment') {
		if(!this.message)
			return next(new Error('Message cannot be empty'));
		if(this.time)
			return next(new Error('Cannot set time when type is comment'));
	} else {
		if(this.time === undefined)
			return next(new Error('Time required'));
		if(this.time <= 0)
			return next(new Error('Time must be greater than 0'));
		if(this.message)
			return next(new Error('Cannot set message when type is not comment'));
	}
	next();
})

const taskSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	missionId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		default: '',
	},
	phase: {
		type: String,
		required: true,
		enum: ['todo', 'doing', 'done'],
		default: 'todo'
	},
	logs: [logScehma],
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	}
})

const missionSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	projectId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	name: {
		type: String,
		required: true,
		default: 'New Mission'
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	}
})

const projectSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	}
})

const userSchema = mongoose.Schema({
	fbId: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	projectId: {
		type: mongoose.Schema.Types.ObjectId
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	}
})

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Mission = mongoose.model('Mission', missionSchema);
const Task = mongoose.model('Task', taskSchema);

module.exports = {
	connection: mongoose.connection,
	connect: () => new Promise((resolve, reject) => {
		const db = mongoose.connection;
		db.once('open', resolve);
		db.on('error', reject);
		mongoose.connect('mongodb://localhost/bigplane_webfinal');
	}),
	User,
	Project,
	Mission,
	Task
};