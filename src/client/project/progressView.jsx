const  React = require('react'),
	{ connect } = require('react-redux'),
	{ Circle } = require('rc-progress'),
	{ Mission, MissionStatus } = require('./mission.jsx');


//Progess View直接連到State的資料
var ProgressView = (props) => {
	var doneTimeCount = 0, allTimeCount = 0, allSpentTime = 0, estimateTime = 0,
		doneCount = 0, allCount = 0;

	for(var mission of props.data.missions || [])
	{
		for(var task of mission.tasks)
		{
			var spendTime = 0;
			var expectedTime = 0;

			for(var log of task.logs)
				if(log.type == 'estimate')
					expectedTime += Number(log.time);
				else if(log.type == 'worklog')
					spendTime += Number(log.time);

			if(task.phase == 'done')
			{
				doneTimeCount += expectedTime === 0 ? 1 : expectedTime;
				doneCount += 1;
			}

			allTimeCount += expectedTime === 0 ? 1 : expectedTime;
			estimateTime += expectedTime;
			allSpentTime += spendTime;
		}

		allCount += mission.tasks.length;
	}

	var ratio = allTimeCount ? (doneTimeCount/allTimeCount) : 0;

	return (
		<div className="progressView">
			<div className="progressCircle" >
				<Circle percent={ratio * 100} strokeColor="#7BA23F" trailColor="#c0c4c8" strokeWidth="3" trailWidth="3" strokeLinecap="butt"/>
				<span>{Math.round(ratio * 100) + '%'}</span>
			</div>
			<p>{`Tasks Finished : ${doneCount} / ${allCount}`}</p>
			<p>{`Worked ${allSpentTime} hrs; Est.${estimateTime} hrs`}</p>
		</div>
	)
}

ProgressView = connect(state => ({
	data: state.project || []
}))(ProgressView);

module.exports = ProgressView;