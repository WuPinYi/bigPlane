const React = require('react');

//See name of routing params in App.jsx
const Params = ({match}) => (
	<div>
		<h3>Params</h3>
		<div>
			myParam1:
			<span> { match.params.myParam1 }</span>
		</div>
		<div>
			myParam2:
			<span> { match.params.myParam2 }</span>
		</div>
	</div>
);

module.exports = Params;