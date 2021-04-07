const modal = (state = {
	isOpen: false,
	active: null
}, action) =>{

	if(/MODAL_OPEN/.test(action.type))
		return {
			isOpen: true,
			active: action.name
		};
	

	if(action.type == 'MODAL_CLOSE')
		return {
			...state,
			isOpen: false
		};

	return state;
};

module.exports = modal;