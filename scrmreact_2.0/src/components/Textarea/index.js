import React from 'react';
import { StrLib } from 'common';

class Textarea extends React.Component {
	static defaultProps = {
		width : "100px",
	}
	rtnVal = (value) => {
		switch (this.props.type) {
			case 'onlyNum' :
				if(StrLib.isNull(value)) return value;
				return typeof value === 'string' ? value.replace(/[^0-9]/g,"") : value.toString().replace(/[^0-9]/g,"");
			case 'onlyKor' :
				if(StrLib.isNull(value)) return value;
				return value.replace(/[a-z0-9]|[ \]{}()<>?|`~!@#$%^&*-_+=,.;:'\\]/g,"");
			case 'onlyEng' :
				if(StrLib.isNull(value)) return value;
				return value.replace(/[^a-zA-Z]/g,"");
			default :
				if (StrLib.isNull(value)) {
					return '';
				} else {
					return value;
				}
		}
	}
	render () {
		return (
			<div className='scrm-textarea-div' style={{width: this.props.width}}>
				<textarea className="scrm-textarea-input"
					type		="text"
					id			= {this.props.id}
					name		= {this.props.name}
					value		= {this.rtnVal(this.props.value)}
					placeholder	= {this.props.placeholder}
					minLength	= {this.props.minLength}
					maxLength	= {this.props.maxLength}
					readOnly	= {this.props.readOnly}
					disabled	= {this.props.disabled}
					rows		= {this.props.rows}
					onChange	= {(e) => this.props.onChange(e)}
					onKeyPress	= {(e) => this.props.onKeyPress(e)}
				/>
			</div>
		);
	}
}
export default Textarea;