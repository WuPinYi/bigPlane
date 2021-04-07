const session = (state = {
	status: {
		loggedIn: false,
		user: null
	}
}, action) =>{
	switch(action.type) {

		case 'UPDATE_STATUS':
			return {
				...state,
				status: action.status
			};

		default:
			return state;
	}
}

module.exports = session;