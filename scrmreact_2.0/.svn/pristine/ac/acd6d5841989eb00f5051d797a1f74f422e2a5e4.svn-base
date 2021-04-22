import React from 'react';

class Label extends React.Component {
	static defaultProps = {
		color : 'black'
	}
	render () {
		return (
			<div className="scrm-label-div">
				{(this.props.content === undefined || !this.props.content)  					
					? <span style={{color : this.props.color}}>{this.props.value}</span>
					: <span style={{color : 'gray'}}>{this.props.value}</span>
				}
				{
					(this.props.req)
					? <span style={{color : 'red'}}>{'*'}</span>
					: null
				}
			</div>
		);
	}
}

export default Label;