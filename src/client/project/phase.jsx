const React = require('react'),
	{ connect } = require('react-redux'),
	{ Link, BrowserHistory } = require('react-router-dom'),
 	{ openTaskModal, openAddTaskModal } = require('./taskView.jsx'),
 	API = require('../api.js');

const onClickRemoveTask = (e, props) => {
	//prevent trigger onClick of taskView
	e.stopPropagation();
	e.preventDefault();
	var { data , dispatch, missionId } = props;
	const _id = data._id;

	const updateState = {
		_id,
		missionId
	}

	//DELETE Task Request
	API.Task(missionId,_id).delete()
		.then(data => {
			dispatch({
				type: 'REMOVE_PROJECT_TASK',
				data: {
					_id,
					missionId
				}
			})
		})
}

const onClickTask = (e, props) => {
	var { data , dispatch, missionId } = props;
	data.missionId = missionId;
	dispatch(openTaskModal(data));
}

const onClickPhase = (e) => {
	//prevent trigger onClick of Mission
	if(!(/more/.test(e.target.getAttribute('class'))))
		e.preventDefault();
}

const onClickAddTask = (e, props) => {
	var { data , dispatch, missionId, phase } = props;
	//ADD TaskView Request
	API.Task(missionId).post({name: 'New Task'})
		.then(data => {
			dispatch({
				type: 'CREATE_PROJECT_TASK',
				data
			});

			dispatch(openTaskModal(data));
		});
}

var Task = (props) => (
	<div className="task" onClick={ (e) => onClickTask(e, props) }>
		{props.data.name}
		<button className="pull-right" onClick={ (e) => onClickRemoveTask(e, props) }>
			<i className="fa fa-times" aria-hidden="true"></i>
		</button>
	</div>
)

Task = connect()(Task);

class Phase extends React.Component {
	render() {
		const phase = this.props.phase;
		const className = this.props.className || "";
		const slim = /slim/.test(className);
		var data = (this.props.data || []).filter(obj => obj.phase === phase);
		const showmore = slim && data.length > 3;


		if(slim)
			data = data.slice(0,3);

		const phaseName = phase.toUpperCase();

		return (
			<div className={ `phase ${className}` } onClick={onClickPhase}>
				<div className="phaseName">
					{ phaseName }
				</div>
				{ 	
					data.map(obj => {
						if(obj.phase === this.props.phase)
							return <Task key={obj._id} missionId={this.props.missionId} data={obj}/>;
						else
							return null;
					})
				}
				{ 
					showmore ? (
						<div className="task more">
							{ 'More ' }
							<i className="fa fa-chevron-circle-down" aria-hidden="true"></i>
						</div>
					) : (
						<div className="task create" onClick={e => onClickAddTask(e, this.props)}>
							{ 'Create a Task ' }
							<i className="fa fa-plus-circle" aria-hidden="true"></i>
						</div>
					)
				}
			</div>
		)
	}
}
Phase = connect()(Phase);

module.exports = Phase;