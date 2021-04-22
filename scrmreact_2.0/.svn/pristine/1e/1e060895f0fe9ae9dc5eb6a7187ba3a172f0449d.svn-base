import React from 'react';
import { Progress } from "react-sweet-progress";

class ProgressBar extends React.Component {
	render () {
		return (
			<div className="scrm-progress-div">
				<Progress	type={this.props.options.type} percent={this.props.data} status={this.props.options.status}
							theme={
								{ 
									default : {
										symbol: this.props.data + '%',
										color : 'blue'
									},
									error : {
										symbol: this.props.data + '%',
										color : 'red'
									},
									success : {
										symbol: this.props.data + '%',
										color : 'green'
									}
								}
							}
				/>
			</div>
		)
	}
}
export default ProgressBar