import React from 'react';
import {Player} from 'components';

class STT000001 extends React.Component {
	constructor (props) {
		super();
	}
	render () {
		return (
			<div style={{width: '99%'}}>
				<Player ctrNo={this.props.options.ctrNo} callId = {this.props.options.callId} options ={this.props.options} popupdivid ={this.props.popupdivid}/>
			</div>
		);
	}
}
export default STT000001;