const  React = require('react'),
	{ Route, Redirect, Switch, Link, BrowserRouter} = require('react-router-dom'),
	{ RouteTransition } = require('react-router-transition'),
	Router = BrowserRouter,
	{TaskView, AddTaskModal} = require('./taskView.jsx'),
	{ Mission } = require('./mission.jsx'),
	ProgressView = require('./progressView.jsx'),
	ProjectFakeData = require('../project_fake.json'),
	{ connect } = require('react-redux'),
	{ ObjectId } =  require('../debugHelpers.js'),
	API = require('../api.js');

const getProjectData = () => 
	dispatch => {
		API.Project().get()
		.then(data => {
				dispatch({
					type: 'UPDATE_PROJECT',
					data
				});
			})

		return {
			type: 'UPDATE_PROJECT',
			data: {}
		}
	}

const addMission = (dispatch) => {

	//ADD TaskView Request
	API.Mission().post()
	.then(data => {
		dispatch({
			type: 'CREATE_PROJECT_MISSION',
			data
		})
	})
}

var ProjectIndex = ({data, match, dispatch}) => (
	<div>
		{ data.map(obj => {
			return <Link key={obj._id} to={`/project/${obj._id}`}><Mission match={match} data={obj} slim={true}/></Link>;
		})}
		<button className="darkButton createMissionButton" onClick={()=>addMission(dispatch)}>
			<i className="fa fa-plus" aria-hidden="true"></i>
			{' Create a Mission'}
		</button>
	</div>
)

var MissionIndex = ({data, match}) => (
	<div>
		{ data.map(obj => {
			const r = new RegExp(obj._id);
			if(r.test(match.url))
				return <Mission match={match} key={obj._id} data={obj}/>;
			else
				return null;
		})}
		<Link to="/project">
			<button className="darkButton createMissionButton">
				<i className="fa fa-chevron-circle-down" aria-hidden="true"></i>
				{ ' Show all Missions' }
			</button>
		</Link>
	</div>
)



ProjectIndex = connect(state => ({
	data: state.project.missions || []
}))(ProjectIndex);

MissionIndex = connect(state => ({
	data: state.project.missions || []
}))(MissionIndex);



// Top level component of /project routing
class Index extends React.Component {
	componentDidMount() {
		

		this.props.dispatch(getProjectData());
	}

	render() {
		return (
			<div>
				<ProgressView/>
				<div className="routerContainer">
					<Route render={({location, history, match}) => (
						<RouteTransition
							pathname={location.pathname}
							runOnMount={false}
							atEnter={{ translateX: 100 }}
							atLeave={{ translateX: -150 }}
							atActive={{ translateX: 0 }}
							mapStyles={styles => ({ transform: `translateX(${styles.translateX}%)`,
													position: 'absolute',
												    top: 0,
													width: '100%'})}
						>
							<Switch key={location.key} location={location}>
								<Route exact path={match.url} component={ProjectIndex}/>
								<Route path={`${match.url}/:missionId`} component={MissionIndex} />
							</Switch>
						</RouteTransition>
					)} />
				</div>
				
				<TaskView/>
				<AddTaskModal/>
			</div>
		)
	}
}

Index = connect(state => ({
	project: state.project
}))(Index);

module.exports = Index;
