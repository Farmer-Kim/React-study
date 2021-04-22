import React from 'react';
import ReactDOM from 'react-dom';
import {ComLib} from 'common';
import {map} from './utils';
class TreeSelectbox extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);
		this.onBlur= this.onChange.bind(this);
	}
	componentDidMount () {
		let target    = this.props.id.substring(0, this.props.id.lastIndexOf("__"));
		let divElement = document.getElementById(target + '__div').getElementsByTagName('div')[0];

		let selectElement = divElement.getElementsByTagName('select')[0];
		
		if (selectElement !== undefined) {
			let selectOptions = selectElement.getElementsByTagName('option'); 
		
			for(let i = 0; i < selectOptions.length; i ++) {
				if (Number(selectOptions[i].id) === this.props.selected) {
					selectOptions[i].setAttribute("selected", "selected");
					break;
				}
			}	

			selectElement.focus();
		} 
		
	}
	onChange = (e) => {		
		let len           	  = e.target.id.substring(e.target.id.lastIndexOf("__") + 2)
		let targetNoLen       = e.target.id.substring(0, e.target.id.lastIndexOf("__"));
		let target            = targetNoLen.substring(0, targetNoLen.lastIndexOf("__"));
		let changetreeIndex   = target.substring(target.lastIndexOf("__") + 2);
		let changeColumWithID = target.substring(0, target.lastIndexOf("__"));
		let changeColum       = changeColumWithID.substring(0, changeColumWithID.lastIndexOf("__"));

		let treedata = map({
			treeData: this.props.treeData,
			getNodeKey: node => node.treeIndex,
			callback: param => { 
				if (param['node']['treeIndex'] === Number(changetreeIndex)) {
					param['node'][changeColum] = e.target.value;
					
				} 
				return param['node'];
			},
			ignoreCollapsed: false,
		});

		this.props.updateTreeData(false, treedata);

		const element = <input	className   = "scrm-input-text"
								type        = "text"
								id          = {targetNoLen}
								name        = {len}
								value       = {ComLib.getComCodeName(changeColum, e.target.value)}
								placeholder = {e.target.value}
								minLength   = {0}
								maxLength   = {100}
								readOnly    = {false}
								disabled    = {false}
								onClick     = {(e) => this.props.event.treeRow.selectbox.onChange(e)}
						/>;
		
		ReactDOM.render(element, document.getElementById(targetNoLen + '__div'));


	}
	render() {
		return (
			<div className='scrm-select-div'  style={{width : Number(this.props.name)+'px'}}>
				<select
					id = {this.props.id}
					value = {this.props.value} 
					disabled = {false}
					onBlur={this.onChange}
					onChange = {this.onChange}
					
				> 
					{
						ComLib.convComboList(ComLib.getCommCodeList(this.props.codeValue)).filter(item=> item.value !== null && item.value !== undefined).map((prop, key) => {
							return (<option id={key} value={prop.value} key={prop.value + '_' + key} >{prop.name}</option>);
						})
					}
				</select>
			</div>
		)
	}
}
export {TreeSelectbox}