const Query = require('./query.js');

const Session = {
	login: (accessToken) => new Query('/api/login').post({accessToken}),
	logout: () => new Query('/api/logout').post(),
	getStatus: () => new Query('/api/status').get()
};

const Project = (options) => new Query('/api/p', options);
const Mission = (_id, options) => new Query(`/api/p/m/${_id || ''}`, options);
const Task = (missionId, _id, options) => new Query(`/api/p/m/${missionId}/t/${_id || ''}`, options);
const Log = (missionId, taskId, _id, options) => new Query(`/api/p/m/${missionId}/t/${taskId}/l/${_id || ''}`, options);

module.exports = { Session, Mission, Task, Log, Project };