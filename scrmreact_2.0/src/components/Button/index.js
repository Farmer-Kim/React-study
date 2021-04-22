import React from 'react';
import {Label} from 'components';
import {
	ComponentPanel, SearchPanel, FullPanel, SubFullPanel, RFloatArea, RelativeGroup, LFloatArea, FlexPanel
} from 'components';

class BasicButton extends React.Component{
	constructor (props) {
			super(props);
			this.state = { disbaled : this.props.disabled }
	}
	static defaultProps = {
		mt: '0px',
		mr: '0px',
		mb: '0px',
		ml: '0px',
		disabled: false,
		type : 'default',
		size : 'md',
		color : 'grey',
		filled : false,
		innerImage : false,
		onClick : (e) => {return;}
	}
	render () {
		let fiiled, innerImage, btnClass, iconClass;

		fiiled = (this.props.fiiled) ? '' : '-o';
		innerImage = (this.props.innerImage) ? ' i' : '';

		btnClass =  (this.props.value) ? 'scrm-btn ' + this.props.size + ' ' + this.props.color + fiiled : btnClass = 'scrm-btn ' + this.props.size + ' ' + this.props.color + fiiled + innerImage;

		if (this.props.innerImage) {
			switch (this.props.icon) {
				case "save"    : iconClass = 'xi-diskette xi-x'; break;
				case "add"     : iconClass = 'xi-plus xi-x';     break;
				case "del"     : iconClass = 'xi-minus xi-x';    break;
				case "check"   : iconClass = 'xi-check xi-x';    break;
				case "trash"   : iconClass = 'xi-trash-o xi-x';  break;				
				case "undo"    : iconClass = 'xi-undo';          break;
				case "redo"    : iconClass = 'xi-redo';          break;
				case "arrowUp" : iconClass = 'xi-arrow-up';      break;
				case "arrowDn" : iconClass = 'xi-arrow-down';    break;
				case "close"   : iconClass = 'xi-close';         break;
				case "play"    : iconClass = 'xi-play xi-x';     break;
				case "pause"   : iconClass = 'xi-pause xi-x';    break;
				case "left"    : iconClass = 'xi-arrow-left xi-x c-grey-6';   break;
				case "right"   : iconClass = 'xi-arrow-right xi-x c-grey-6';  break;
				case "copy"    : iconClass = (this.props.fiiled) ? 'xi-documents xi-x'  : 'xi-documents-o xi-x'; break;
				case "down"    : iconClass = (this.props.fiiled) ? 'xi-download xi-x'   : 'xi-download-o xi-x';  break;
				case "srch"    : iconClass = (this.props.fiiled) ? 'xi-search xi-x'     : 'xi-search-o xi-x';    break;
				default : iconClass = null; break;
			}
		}
		return (
			<button className = {btnClass} ref = { (ref) => this.button = ref } id = {this.props.id} onClick = {(e) => { e.target.blur(); this.props.onClick(e);} } disabled={ this.props.disabled }
					tooltip = {this.props.tooltip} style={{ marginTop: this.props.mt, marginRight: this.props.mr, marginBottom: this.props.mb, marginLeft: this.props.ml, visibility : (this.props.hidden) ? 'hidden' :  'visible'}}
			>
				{(this.props.innerImage && iconClass !== null) ? <i onClick= {(e) => { e.stopPropagation(); this.button.click(); }} className={ iconClass }></i> :  null}
				{this.props.value}
			</button>
		);
	}
}

class IconButton extends React.Component{
	render () {
		return (
			<button tooltip = {this.props.tooltip} className= {this.props.classes} id = {this.props.id} style={this.props.style} onClick = {this.props.onClick}></button>
		);
	}
}
class BadgeButton extends React.Component{
	render () {
		return (
			<button tooltip = {this.props.tooltip} className= {this.props.classes} id = {this.props.id} onClick = {this.props.onClick}></button>
		);
	}
}
class CsButton extends React.Component{
	constructor (props) {
		super(props);
		this.state = { disbaled : this.props.disabled }
	}
	static defaultProps = {
		disabled: false,
		type : 'default',
		size : 'xi-5x',
		color : 'grey',
		filled : false,
		onClick : (e) => {return;}
	}
	render () {
		let btnfiiled, fiiled, iconClass, btnClass;

		btnfiiled = this.props.callType !== 'E' ? '-o ' : '-o ';
		fiiled    = this.props.callType !== 'E' ? '-o ' : '-off ';
		btnClass  = 'scrm-cs-btn ' + (this.props.callType !== 'E' ? (this.props.callType === 'I' ? this.props.color : this.props.color2) : 'grey') + btnfiiled + 'i';
		iconClass = 'xi-microphone' + fiiled + this.props.size;  
		return (
			<button ref={(ref)=> this.button = ref} 
					className={btnClass} 
					tooltip={this.props.tooltip} 
					id={this.props.id} 
					style={{ border: '0', outline: '0', background: 'none'}}
					disabled={this.props.callType === 'E' ? true : false}>
				<i className={ iconClass }></i>
				<div>				
					<div className="scrm-label-div" style={{display: 'block'}}>
						<span style={{color : 'black'}}>{this.props.name}</span>						
					</div>
					{this.props.callType === 'E' ?
						<span style={{color: "#808080"}}>(-)</span>
						:
						this.props.callType === 'I' ?
							<span style={{color: this.props.color, fontWeight: "bold"}}>(In)</span>
							:
							<span style={{color: this.props.color2, fontWeight: "bold"}}>(Out)</span>
					}

				</div>
								
			</button>
		);
	}
}
export {BasicButton, IconButton, BadgeButton, CsButton};
