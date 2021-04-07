const { Route, Redirect, Switch, Link, BrowserRouter} = require('react-router-dom'),
	Router = BrowserRouter,
	Index = require('./Index.jsx'),
	MyComponent = require('./myComponent.jsx'),
	Params = require('./params.jsx');

// Top level component of /examples routing
const Examples = ({match}) => (
	<div>
		<h2>Examples</h2>
		<p>Demonstrates multiple layer wrapping</p>
		<nav>
			<ul>
				<li><Link to={match.url}>Index</Link></li>
				<li><Link to={`${match.url}/myComponent`}>MyComponent</Link></li>
				<li><Link to={`${match.url}/params/variable1/variable2`}>URL Params</Link></li>
				<li><Link to={`${match.url}/redirect`}>Redirect</Link></li>
			</ul>
		</nav>
		<Switch>
			<Route exact path={match.url} component={Index}/>
			<Route path={`${match.url}/myComponent`} component={MyComponent}/>
			<Route path={`${match.url}/params/:myParam1/:myParam2`} component={Params}/>
			<Redirect from={`${match.url}/redirect`} to={match.url}/>
		</Switch>
	</div>
)

module.exports = Examples;