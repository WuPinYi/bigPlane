const React = require('react'),
	ReactDom = require('react-dom'),
	{ Route, Switch, Redirect, Link, BrowserRouter} = require('react-router-dom'),
	Router = BrowserRouter,
	{ Provider, connect } = require('react-redux'),
	{ createStore, applyMiddleware, compose } = require('redux'),
	thunkMiddleware = require('redux-thunk').default,
	{ createLogger } = require('redux-logger'),
	reducers = require('./reducers'),
	ProjectIndex = require('./project/index.jsx'),
	Modal = require('./modal.jsx'),
	API = require('./api.js');

// To make React visible to React Developer Tools Chrome extension
window.React = React;

//Action Creators
const getUpdateStatusAction = status => ({
	type: 'UPDATE_STATUS',
	status
})

const getOpenLoginModalAction = () => ({
	type: 'MODAL_OPEN_LOGIN',
	name: 'Login'
});

//
class App extends React.Component {

	constructor(props) {
		super(props);
		this.logout = this.logout.bind(this);
		this.statusChangeCallback = this.statusChangeCallback.bind(this);
	}

	componentDidMount() {
		API.Session.getStatus()
			.then(status => {
				this.setSessionStatus(status);
			});
	}

	logout(){
		API.Session.logout()
		.then(status => {
			this.setSessionStatus(status);
		});
	}

	initFacebookSDK() {
		window.fbAsyncInit = () => {
			FB.init({
				appId      : '114609382470958',
				cookie     : true,
				xfbml      : true,
				version    : 'v2.8'
			});
			FB.AppEvents.logPageView();
			// FB.getLoginStatus(this.statusChangeCallback);

			FB.Event.subscribe('auth.statusChange', this.statusChangeCallback);
		};

		(function(d, s, id){
			 var js, fjs = d.getElementsByTagName(s)[0];
			 if (d.getElementById(id)) {return;}
			 js = d.createElement(s); js.id = id;
			 js.src = "//connect.facebook.net/en_US/sdk.js";
			 fjs.parentNode.insertBefore(js, fjs);
		 }(document, 'script', 'facebook-jssdk'));
	}

	setSessionStatus(status) {
		if(!status.loggedIn) {
			this.initFacebookSDK();
			this.props.dispatch(getOpenLoginModalAction());
			window.FB && FB.XFBML.parse();
		}
		else
			this.props.dispatch(Modal.closeModal());

		this.props.dispatch(getUpdateStatusAction(status))
	}

	statusChangeCallback(response) {
		if(response.status === 'connected') {

			const accessToken = response.authResponse.accessToken;

			API.Session.login(accessToken)
				.then(status => {
					this.setSessionStatus(status);
				});
		}
	}

	render() {

		const loggedIn = this.props.session.status.loggedIn;
		const name = this.props.session.status.user && this.props.session.status.user.name;

		return (
			<Router>
				<div className="app">
					<header>
						<Link to="/project">BigPlane</Link>
						{ 
							loggedIn && (
								<div className="pull-right">
									<span className="name">Hi, {name}</span>
									<button onClick={this.logout}>Logout</button>
								</div>
							)
						}
						
					</header>

					{
						loggedIn && (
							<Switch>
								<Route path="/project" component={ProjectIndex}/>
								<Redirect from="/" to="/project"/>
							</Switch>
						)
					}

					<Modal name="Login" className="loginModal" unclosable>
						<div className="fb-login-button" data-max-rows="1" data-size="large" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true"></div>
					</Modal>

				</div>
			</Router>
		)
	}
}

App = connect(state => ({
	session: state.session
}))(App);

// Logs Redux actions to console
const loggerMiddleware = createLogger();

// The Redux store

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
var store = createStore(
	reducers,
	composeEnhancers(
		applyMiddleware(
			thunkMiddleware,
			loggerMiddleware
		)
	)
);

ReactDom.render((
	<Provider store={store}>
		<App/>
	</Provider>
), document.getElementById('app'));