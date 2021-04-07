const project = (state = {}, action) =>{
	switch(action.type) {
		case 'UPDATE_PROJECT':
			return {
				...action.data
			};
		case 'CREATE_PROJECT_MISSION':
		{
			var newstate = JSON.parse(JSON.stringify(state));
			newstate.missions.push(action.data);
			return newstate;
		}
		case 'REMOVE_PROJECT_MISSION':
		{
			const missionId = action.data.missionId;
			var newstate = JSON.parse(JSON.stringify(state));
			const missionIndex = newstate.missions.findIndex(mission => mission._id === missionId);

			if(missionIndex != -1)
				newstate.missions.splice(missionIndex, 1);

			return newstate;
		}
		case 'UPDATE_PROJECT_MISSION_START':
		{
			const missionId = action.data.missionId;
			var newstate = JSON.parse(JSON.stringify(state));
			var mission = newstate.missions.find(mission => mission._id === missionId);
			mission.edit = true;
			return newstate;
		}
		case 'UPDATE_PROJECT_MISSION_END':
		{
			const { _id, name } = action.data;
			var newstate = JSON.parse(JSON.stringify(state));
			var mission = newstate.missions.find(mission => mission._id === _id);
			mission.edit = false;
			if(name)
				mission.name = name;
			return newstate;
		}
		case 'CREATE_PROJECT_TASK':
		{
			const missionId = action.data.missionId;

			var newstate = JSON.parse(JSON.stringify(state));

			newstate.missions.find(mission => mission._id === missionId).tasks.push(action.data);

			return newstate;
		}
		case 'UPDATE_PROJECT_TASK':
		{
			const missionId = action.data.missionId,
				  taskId = action.data._id;

			const {name, description, phase} = action.data;

			var newstate = JSON.parse(JSON.stringify(state));
			var updateData ={name, description, phase};

			var task = newstate.missions.find(mission => mission._id === missionId).tasks.find(task => task._id === taskId);
			Object.assign(task, updateData);

			return newstate;
		}
		case 'REMOVE_PROJECT_TASK':
		{
			const missionId = action.data.missionId,
				  taskId = action.data._id;

			var newstate = JSON.parse(JSON.stringify(state));
			var mission = newstate.missions.find(mission => mission._id === missionId);
			var taskIndex = mission.tasks.findIndex(task => task._id === taskId);

			if(taskIndex != -1)
				mission.tasks.splice(taskIndex, 1);

			return newstate;
		}
		case 'CREATE_PROJECT_TASK_LOG':
		{
			const missionId = action.data.missionId,
				  taskId = action.data.taskId;

			var newstate = JSON.parse(JSON.stringify(state));

			var mission = newstate.missions.find(mission => mission._id === missionId);
			var task = mission.tasks.find(task => task._id === taskId);

			task.logs.push(action.data);

			return newstate;
		}
		case 'UPDATE_PROJECT_TASK_LOG':
		{
			const missionId = action.data.missionId,
				  taskId = action.data.taskId,
				  logId = action.data._id;

			var newstate = JSON.parse(JSON.stringify(state));

			var mission = newstate.missions.find(mission => mission._id === missionId);
			var task = mission.tasks.find(task => task._id === taskId);
			var log = task.logs.find(log => log._id == logId);

			if(action.data.message || action.data.time)
				Object.assign(log, action.data);

			return newstate;
		}
		case 'REMOVE_PROJECT_TASK_LOG':
		{
			const missionId = action.data.missionId,
				  taskId = action.data.taskId,
				  logId = action.data._id;

			var newstate = JSON.parse(JSON.stringify(state));

			var mission = newstate.missions.find(mission => mission._id === missionId);
			var task = mission.tasks.find(task => task._id === taskId);
			var logIndex = task.logs.findIndex(log => log._id == logId);

			if(logIndex != -1)
				task.logs.splice(logIndex, 1);

			return newstate;
		}
		default:
			// Unknown action, return old state
			return state;
	}
};

module.exports = project;