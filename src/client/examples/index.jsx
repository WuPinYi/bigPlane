const React = require('react'),
	{ Link } = require('react-router-dom'),
	MyComponent = require('./myComponent.jsx'),
	Params = require('./params.jsx'),
	{ connect } = require('react-redux'),
	Modal = require('../modal.jsx'),
	{ openModal, closeModal } = Modal;

// Component of /examples routing
const Index = ({match}) => (
	<div>
		<h3>Index</h3>
		<ul>
			<li><Link to={`${match.url}/myComponent`}>MyComponent</Link></li>
			<li><Link to={`${match.url}/params/variable1/variable2`}>Params</Link></li>
			<li><Link to={`${match.url}/redirect`}>Redirect</Link></li>
		</ul>
		<TaskInfo />
	</div>
)

module.exports = Index;