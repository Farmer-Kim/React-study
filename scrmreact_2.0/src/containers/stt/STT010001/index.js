import React from 'react';
import {RealTimeViewer} from 'components';

class STT010001 extends React.Component {
	constructor (props) {
		super();
	}
	componentDidMount () {
	}
	render () {
		return (
			<div style={{width: '99%'}}>
				<RealTimeViewer
					constCd={this.props.options.params.CONST_CD}
					constNm={this.props.options.params.CONST_NM}
					callId={this.props.options.params.CALL_ID}
				/>
			</div>
		);
	}
}
export default STT010001;