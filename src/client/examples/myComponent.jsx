const React = require('react');

const SubComponent = (props) => (
	<div>
		<b>My Prop:</b>
		<span>{ props.myProp }</span>
	</div>
);

class MyComponent extends React.Component {
	constructor(props) {
		super(props);

		//Native React state, CAUTION: this VIOLATES the Redux single state priciple
		this.state = {
			myState1: 123,
			myState2: 'This will not be changed after setState()'
		};
	}

	componentDidMount() {

		//Setting state after component mounted
		this.setState({
			myState1: 456
		})
	}

	render() {
		return (
			<div>
				<h3>MyComponent</h3>
				<h4>States</h4>
				<div>
					myState1:
					{ this.state.myState1 }
				</div>
				<div>
					myState2:
					{ this.state.myState2 }
				</div>
				<h4>Sub Components</h4>
				<SubComponent myProp={ 'Hello, World!' }/>
				<SubComponent myProp={ 'Foo, Bar.' }/>
			</div>
		)
	}
}

module.exports = MyComponent;