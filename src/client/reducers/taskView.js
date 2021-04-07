const taskView = (state = {}, action) =>{
	switch(action.type) {
		case 'MODAL_OPEN_TASK':
			return {
				...action.data
			};
		case 'UPDATE_PROJECT_TASK':
			return {
				...action.data
			};
		case 'CREATE_PROJECT_TASK_LOG':
		{
			const logId  = action.data._id;
			var newstate = JSON.parse(JSON.stringify(state));
			newstate.logs.push(action.data);
			return newstate;
		}
		case 'UPDATE_PROJECT_TASK_LOG_START':
		{
			const logId  = action.data._id;
			var newstate = JSON.parse(JSON.stringify(state));

			for(var log of newstate.logs)
			{
				if(log._id == logId)
					log.edit = true;
				else
					log.edit = false;
			}

			return newstate;
		}
		case 'UPDATE_PROJECT_TASK_LOG':
		{
			const logId  = action.data._id;
			var newstate = JSON.parse(JSON.stringify(state));

			var log = newstate.logs.find(log => log._id == logId);
			if(log && (action.data.message || action.data.time))
				Object.assign(log, action.data);
			
			log.edit = false;

			return newstate;
		}
		case 'REMOVE_PROJECT_TASK_LOG':
		{
			const logId  = action.data._id;
			var newstate = JSON.parse(JSON.stringify(state));

			var logIndex = newstate.logs.findIndex(log => log._id == logId);
			if(log != -1)
				newstate.logs.splice(logIndex, 1);
			return newstate;
		}
		default:
			// Unknown action, return old state
			return state;
	}
};

const addTask = (state = { name: "", description: "", time: 0 }, action) =>{
	switch(action.type) {
		case 'MODAL_OPEN_ADDTASK':
			return {
				...action.data
			};
		default:
			// Unknown action, return old state
			return state;
	}
};

module.exports = {taskView, addTask};