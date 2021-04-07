const React = require('react'),
	{ connect } = require('react-redux'),
	Modal = require('../modal.jsx'),
	{ openModal, closeModal } = Modal,
	relativeTime = require('../relativeTime.js'),
	dateFormatter = require('../dateFormatter.js'),
	API = require('../api.js');

const openTaskModal = (data) => ({
	type: 'MODAL_OPEN_TASK',
	name: 'TaskView',
	data
});

class TaskView extends React.Component{
	constructor(props) {
		super(props);
		this.updateTask = this.updateTask.bind(this);
		this.deleteTask = this.deleteTask.bind(this);
		this.createLogComment = this.createLogComment.bind(this);
		this.createLogCommentKeyboardEvent = this.createLogCommentKeyboardEvent.bind(this);
		this.createLogTime = this.createLogTime.bind(this);
		this.autogrow = this.autogrow.bind(this);
	}

	componentDidUpdate(){
		var {name, description, phase} = this.refs;
		var {data} = this.props;


		if(name)
			name.value = data.name;

		if(description)
		{
			description.value = data.description;
			this.autogrow();
		}

		if(phase)
			phase.value = data.phase;
	}

	updateTask(){
		const { data, dispatch } = this.props,
				{ _id, createdAt, logs, missionId } = data;
		var { name, description, phase } = this.refs;

		name = name.value;
		description = description.value;
		phase = phase.value;

		//Update TaskView Request
		API.Task(missionId,_id).put({name, description, phase})
			.then(data => {
				dispatch({
					type: 'UPDATE_PROJECT_TASK',
					data: {
						...data,
						missionId
					}
				})
			})
	}

	deleteTask() {
		const { data, dispatch } = this.props,
			{ _id, missionId } = data;

		//DELETE Task Request
		API.Task(missionId,_id).delete()
			.then(data => {
				dispatch({
					type: 'REMOVE_PROJECT_TASK',
					data: {
						_id,
						missionId
					}
				});

				dispatch(Modal.closeModal());
			})
	}

	createLogComment(){
		var message = this.refs.comment.value || null;
		const { data, dispatch } = this.props,
			{ _id, missionId } = data;

		if(message)
		{
			API.Log(missionId,_id).post({type: 'comment', message})
				.then(data => {
					dispatch({
						type: 'CREATE_PROJECT_TASK_LOG',
						data: {
							...data,
							missionId,
							taskId: _id
						}
					})
				})

			this.refs.comment.value = "";
		}
	}

	createLogTime(type){
		var time = this.refs.logtime.value || null;
		const { data, dispatch } = this.props,
			{ _id, missionId } = data;

		if(time && time > 0)
		{
			API.Log(missionId, _id).post({type, time})
				.then(data => {
					dispatch({
						type: 'CREATE_PROJECT_TASK_LOG',
						data: {
							...data,
							missionId,
							taskId: _id
						}
					})
				})

			this.refs.logtime.value = "";
		}
	}

	createLogCommentKeyboardEvent(e)
	{
		if(e.keyCode == 0x0D)
		{
			e.preventDefault();
			this.createLogComment();
		}
	}

	autogrow()
	{
		var textarea = this.refs.description;
		if(textarea)
		{
			var adjustedHeight=textarea.clientHeight;
			
			adjustedHeight=Math.max(textarea.scrollHeight,adjustedHeight);
			if (adjustedHeight>textarea.clientHeight)
			{
				textarea.style.height=adjustedHeight+'px';
			}
		}
	}

	render() {
		var {data, dispatch} = this.props;

		var totalTime = 0;
		var useTime = 0;

		for(var log of (data.logs || []))
		{
			if(log.type === 'estimate')
				totalTime += Number(log.time);
			else if(log.type === 'worklog')
				useTime += Number(log.time);
		}

		var selectorColor = null;

		if(data.phase == 'todo')
			selectorColor = '#AB3B3A';
		else if(data.phase == 'doing')
			selectorColor = '#F9BF45';
		else if(data.phase == 'done')
			selectorColor = '#7BA23F';

		var logs = (data.logs || []).map(obj => <WorkLog key={obj._id} _id={obj.id} missionId={data.missionId} taskId={data._id} data={obj} />);
		logs.reverse();

		return (
			<Modal name="TaskView" className="taskView update">
				<input className="taskName" placeholder="Task Name" ref="name" onBlur={this.updateTask}/>
				<div className="taskTime" title={dateFormatter('Y-m-d H:i:s', data.createdAt)}>{ relativeTime(data.createdAt) }</div>
				<div className="taskSelector" style={{'backgroundColor':selectorColor}}>
					<select className="taskPhaseSelect" ref="phase" onChange={this.updateTask}>
						<option value='todo'>TODO</option>
						<option value='doing'>DOING</option>
						<option value='done'>DONE</option>
					</select>
				</div>
				<textarea className="taskDescription" placeholder="input some description..." ref="description" onKeyUp={this.autogrow} onBlur={this.updateTask}></textarea>

				<div className="timeAndDelete">
					<span className="timeOverview">Worked {useTime} hrs / Est. {totalTime} hrs</span>
					<button className="deleteTaskButton" onClick={this.deleteTask}>Delete Task</button>
				</div>


				<hr/>
				<div className="createLogBlock">
					<div className="taskCommentSendBox">
						<label>Write a Comment</label>
						<textarea className="taskComment" onKeyDown={this.createLogCommentKeyboardEvent} ref="comment" placeholder="Comment body" />
					</div>
					<div className="taskTimeLogArea">
						<label>Create a Log</label>
						<div>
							<input type="number" placeholder="Input time hrs" className="taskTimeLogInput" ref="logtime"/>
							<button className="taskLogButton" onClick={e => this.createLogTime('worklog')}>Log</button>
							<button className="taskEstimateButton" onClick={e => this.createLogTime('estimate')}>Extend</button>
						</div>
					</div>
				</div>
				<hr/>
				<div className="logContainer">{	logs }</div>

				<button className="closeModalButton darkButton visible-phone" onClick={()=>dispatch(Modal.closeModal())}>Close</button>
			</Modal>
		)
	}
}

TaskView = connect(state => ({
	data: { ...state.taskView }
}))(TaskView);

class WorkLog extends React.Component{

	constructor(props) {
		super(props);
		this.removeLog = this.removeLog.bind(this);
		this.startEditLog = this.startEditLog.bind(this);
		this.finishEditLog = this.finishEditLog.bind(this);
		this.discardEditLog = this.discardEditLog.bind(this);
		this.onEditInputKeyDown = this.onEditInputKeyDown.bind(this);
	}

	componentDidUpdate(){
		if(this.refs.editInput)
		{
			var {data} = this.props;

			this.refs.editInput.value = data.message ? data.message : data.time;
			this.refs.editInput.focus();
		}
	}

	removeLog () {
		var {data, missionId, taskId, dispatch} = this.props;
		var _id = data._id;
	
		API.Log(missionId,taskId,_id).delete()
			.then(data => {
				dispatch({
				type: 'REMOVE_PROJECT_TASK_LOG',
					data: {
						missionId,
						taskId,				
						_id
					}
				})
			})
	}

	startEditLog () {
		var {data, dispatch} = this.props;
		var _id = data._id;
	
		dispatch({
			type: 'UPDATE_PROJECT_TASK_LOG_START',
			data: {		
				_id
			}
		})
	}

	finishEditLog(){
		var {data, missionId, taskId, dispatch} = this.props;
		var {_id} = data;
		var newValue = this.refs.editInput.value;

		var obj = {
			missionId, taskId,
			_id: data._id,
			type: data.type
		}
		
		if(data.type == 'comment')
			obj.message = newValue;
		else
		{
			obj.time = Number(newValue);
			if(obj.time <= 0)
				return;
		}

		API.Log(missionId, taskId, _id).put(data.type == 'comment' ? { message: newValue } : {time: newValue})
			.then(data => {
				dispatch({
					type: 'UPDATE_PROJECT_TASK_LOG',
					data: {
						missionId, taskId,
						...data
					}
				})
			})
	}

	discardEditLog(){
		var {data, missionId, taskId, dispatch} = this.props;
		const {_id} = data;

		dispatch({
			type: 'UPDATE_PROJECT_TASK_LOG',
			data: {
				missionId,
				taskId,
				_id
			}
		})
	}

	onEditInputKeyDown(e)
	{
		if(e.keyCode == 0x0D || e.keyCode == 0x09) {
			e.preventDefault();
			this.finishEditLog();
		} else if(e.keyCode == 0x1B) {
			e.preventDefault();
			this.discardEditLog();
		}
	}

	render() {
		var {data, missionId, taskId} = this.props;
		var logrenderer = null;
		var edit = data.edit;

		if(!edit)
		{
			switch(data.type)
			{
				case 'comment':
					logrenderer = ( <div>{data.message}</div> );
					break;
				case 'estimate':
					logrenderer = ( <div>Estimate Time: {data.time} hrs</div> );
					break;
				case 'worklog':
					logrenderer = ( <div>Worked {data.time} hrs</div> );
					break;
			}
		}
		else
		{
			switch(data.type)
			{
				case 'comment':
					logrenderer = ( <textarea ref="editInput" onKeyDown={this.onEditInputKeyDown} onBlur={this.discardEditLog}/> );
					break;
				case 'estimate':
					logrenderer = ( <div>Estimate Time: <input type="number" ref="editInput" onKeyDown={this.onEditInputKeyDown} onBlur={this.discardEditLog}/> hrs</div>);
					break;
				case 'worklog':
					logrenderer = ( <div>Worked <input type="number" ref="editInput" onKeyDown={this.onEditInputKeyDown} onBlur={this.discardEditLog}/> hrs</div>);
					break;
			}
		}

		return (
			<div className={`log ${data.type}`}>
				{
					edit ? logrenderer : <div onClick={this.startEditLog}>{logrenderer}</div>
				}
				<button className="deleteButton" onClick={this.removeLog}>
					<i className="fa fa-times" aria-hidden="true"></i>
				</button>
				<div className="options">
					<span className="date" title={dateFormatter('Y-m-d H:i:s', data.createdAt)}>{relativeTime(data.createdAt)}</span>
					{' '}
					<button className="phoneDeleteButton hidden-desktop" onClick={this.removeLog}>Delete</button>
				</div>
			</div>
		)
	}
}

WorkLog = connect()(WorkLog);

const openAddTaskModal = (data) => ({
	type: 'MODAL_OPEN_ADDTASK',
	name: 'AddTaskModal',
	data
})

class AddTaskModal extends React.Component{
	constructor(props) {
		super(props);
		this.addTask = this.addTask.bind(this);
	}

	addTask(e) {
		e.preventDefault();

		var {name, description, time} = this.refs;
		var {dispatch, data} = this.props;
		var {phase, missionId} = data;

		name = name.value;

		if(!name)
			return null;

		description = description.value;
		time = time.value && Number(time.value);

		//ADD TaskView Request
		API.Task(missionId).post({name, description, phase, time})
			.then(data => {
				dispatch({
					type: 'CREATE_PROJECT_TASK',
					data
				});
	
				dispatch({
					type: 'MODAL_CLOSE'
				})
			});
	}

	render () {
		return (
			<Modal name="AddTaskModal" className="taskView create">
				<form onSubmit={e => this.addTask(e)}>
					<input className="taskName" placeholder="Task Name" ref="name" required></input>
					<textarea placeholder="Task Description" className="taskDescription" ref="description" rows="5"></textarea>
					<input className="taskTimeLogInput" type="number" placeholder="Estimate Time" step="0.5" ref="time"/>
					<span className="unit">hrs</span>
					<button className="darkButton" type="submit">
						<i className="fa fa-plus" aria-hidden="true"></i>
						{' Create'}
					</button>
				</form>
			</Modal>
		)
	}
}

AddTaskModal = connect(state => ({
	data: { ...state.addTaskModal }
}))(AddTaskModal);


module.exports = {TaskView, openTaskModal, AddTaskModal, openAddTaskModal};