const React = require('react'),
Phase = require('./phase.jsx'),
	{ connect } = require('react-redux'),
 { Route, Redirect, Switch, Link, BrowserRouter, withRouter} = require('react-router-dom'),
 API = require('../api.js');

const MissionStatus = (props) => {
	const ratio = props.ratio || 0;
	const done = props.done || false;

	var img = null;

	if(done)
		img = "/images/done.svg";
	else if(ratio <= 1)
		img = "/images/working.svg";
	else
		img = "/images/overdue.svg";

	return (
		<img className={`statusImg ${props.className || ''}`} src={img}/>
	)
}

const stopLink = (e) =>
{
	e.stopPropagation();
	e.preventDefault();
}

// Top level component of /examples routing
class Mission extends React.Component{

	constructor(props) {
		super(props);
		this.onClickRemoveMission = this.onClickRemoveMission.bind(this);
		this.onStartEditMission = this.onStartEditMission.bind(this);
		this.onEditingMission = this.onEditingMission.bind(this);
		this.onDismissEditMission = this.onDismissEditMission.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		const data = this.props.data || [];
		if(data.edit)
		{
			this.refs.name.value = data.name;
			this.refs.name.focus();
		}
	}

	onClickRemoveMission(e) 
	{
		if(e)
			stopLink(e);
		
		var {data, dispatch} = this.props;
		const missionId = data._id;
	
		//DELETE TaskView Request
		API.Mission(missionId).delete()
			.then(data => {
				dispatch({
					type: 'REMOVE_PROJECT_MISSION',
					data: {missionId}
				});

				if(!this.props.slim)
					this.props.history.push("/project/");
			})
	}	

	onStartEditMission(e) 
	{
		if(this.props.slim)
			stopLink(e);
	
		var {data, dispatch} = this.props;
		var missionId = data._id;
	
		dispatch({
			type: 'UPDATE_PROJECT_MISSION_START',
			data: {missionId}
		});
	}

	onEditingMission (e) 
	{
		if(e.keyCode == 0x0D)
		{
			//post api
			var {data, dispatch} = this.props;
			var name = this.refs.name.value;
	
			//UPDATE TaskView Request
			API.Mission(data._id).put({name})
				.then(data => {
					dispatch({
						type: 'UPDATE_PROJECT_MISSION_END',
						data
					})
				});
		}
		else if(e.keyCode == 0x1B)
		{
			this.onDismissEditMission(e);
		}
	}

	onDismissEditMission (e)
	{
		stopLink(e);
		var {dispatch, data} = this.props;
		dispatch({
			type: 'UPDATE_PROJECT_MISSION_END',
			data: {_id: data._id}
		});
	}

	render() {
		const data = this.props.data || [];

		var editView = null;
		if(!data.edit)
		{
			editView = (
				<button className="editMissionButton" onClick={e => this.onStartEditMission(e)}>
					{ data.name + ' ' }
					<i className="fa fa-pencil" aria-hidden="true"></i>
				</button>
			);
		}
		else
		{
			editView = (
				<input 	ref="name" 
					onClick={e => stopLink(e)}
					onKeyDown={e => this.onEditingMission(e)}
					onBlur={e => this.onDismissEditMission(e)}></input>
			);
		}

		var useTime = 0, expectedTime = 0;

		for(var task of data.tasks)
		{
			for(var log of task.logs)
			{
				switch(log.type)
				{
					case 'estimate':
						expectedTime += Number(log.time);
						break;
					case 'worklog':
						useTime += Number(log.time);
						break;
					default:
						break;
				}
			}
		}

		var workingRatio = expectedTime == 0 ? 2 : (useTime / expectedTime);

		var doneCount = data.tasks.filter((task) => task.phase == 'done').length;
		var allCount = data.tasks.length;

		const { slim } = this.props;
		const className = 'mission' + (slim ? ' slim' : '');
		const phaseClassName = slim ? 'slim hidden-phone' : '';
		const deleteButtonClassName = 'deleteMissionButton' + (slim ? ' hidden-phone' : '');
	
		return (
			<div className={className}>
				<Link to="/project">
					<button className={deleteButtonClassName} onClick={e => this.onClickRemoveMission(e)}>
						{'DELETE '}
						<i className="fa fa-times" aria-hidden="true"></i>
					</button>
				</Link>
				<div className="missionName">
					{editView}
				</div>
				<div className="missionBody">
					<div className="missionStatus">
						<MissionStatus ratio={workingRatio} done={doneCount === allCount}/>
					</div>
					<Phase className={phaseClassName} phase="todo" missionId={data._id} data={data.tasks}/>
					<Phase className={phaseClassName} phase="doing" missionId={data._id} data={data.tasks}/>
					<Phase className={phaseClassName} phase="done" missionId={data._id} data={data.tasks}/>
				</div>
			</div>
		)
	}
}

Mission = withRouter(Mission);
Mission = connect()(Mission);

module.exports = { Mission, MissionStatus };