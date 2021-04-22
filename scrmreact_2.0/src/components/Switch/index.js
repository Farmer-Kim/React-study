import React from 'react';

class Switch extends React.Component {
	render () {
		return (
			<label className="scrm-switch-label">
				<input className="scrm-switch-input" id={this.props.id} type="checkbox" onChange ={this.props.onChange.bind(this)} checked = {this.props.checked}/>
				<span className="scrm-switch-span"/>
			</label>
		);
	}
}
export default Switch;