import React from 'react';
import {  StrLib } from 'common';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import moment from 'moment';

class Checkbox extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);
		this.onClick = this.onClick.bind(this);
	}
	static defaultProps = {
		index : 0,
		onClick : () => {return;},
		onChange : () => {return;}

	}
	onClick = (e) => {
		this.props.onClick({ id : this.props.id, target : e.target, index : this.props.index, checked : document.getElementById(e.target.id).checked });
	}
	onChange = (e) => {
		this.props.onChange({ id : this.props.id, target : e.target, index : this.props.index, checked : document.getElementById(e.target.id).checked });
	}
	render () {
		return (
			<div className='scrm-input-checkbox-div'>
				<input	className = "scrm-input-checkbox-input"
						type = "checkbox"
						id = {'chk_' + this.props.id + '_' + this.props.index + '_' + this.props.keyProp}
						value = {this.props.keyProp}
						readOnly = {this.props.readOnly}
						name = {this.props.id}
						checked = { this.props.checked === 'Y'}
						onClick = {this.onClick}
						onChange = {this.onChange}
				/>
				<label className = "scrm-input-checkbox-label" htmlFor={'chk_' + this.props.id + '_' + this.props.index + '_' + this.props.keyProp} readOnly = {this.props.readOnly}> {this.props.value} </label>
			</div>
		);
	}
}
class MultiCheckBox extends React.Component {
	constructor (props) {
		super(props);
		this.onChange = this.onChange.bind(this);
		this.onClick = this.onClick.bind(this);
	}
	static defaultProps = {
		onClick : () => {return;},
		onChange : () => {return;}
	}
	onClick = (e) => {
		this.props.onClick({target: e.target, id : this.props.id, index : e.index, checked: Array.from(document.getElementsByName(e.target.name))[e.index].checked});
	}
	onChange = (e) => {
		this.props.onChange({target: e.target, id : this.props.id, index : e.index, checked: Array.from(document.getElementsByName(e.target.name))[e.index].checked});
	}
	render () {
		return (
			<React.Fragment>
			{
				this.props.dataset.map((item, i) => {
					return (
						<Checkbox
							key = {'checkbox_' + this.props.id + "_"+ i}
							id = {this.props.id}
							index = {i}
							value = {item[this.props.value]}
							keyProp =  {item[this.props.keyProp]}
							checked = {item['value']}
							onChange = {this.onChange}
							onClick = {this.onClick}
						/>
					)
				})
			}
			</React.Fragment>
		);
	}
}
class Radio extends React.Component {
	constructor (props) {
		super(props);
		this.state  = {
			selectedOption : this.props.selected || this.props.dataset[this.props.defaultSelected][this.props.keyProp]
		}
		this.onChange = this.onChange.bind(this);
	}
	static defaultProps = {
		onChange : () => { return; }
	}
	onChange = (e) => {
		this.props.onChange({ id: this.props.id, value : e.target.value});
	}
	componentDidMount () {

	}
	setRadio = (props) => {
		return (
			props.dataset.map((item, i) => {
				return (
					<div key={'radio_div_' + i} className ='scrm-input-radio-div'>
						<input	className ='scrm-input-radio-input'
								key={'radio_'+ i}
								id = {'rdo_' + i + '_' + props.keyProp}
								type="radio"
								name={props.id}
								value={item[props.keyProp]}
								checked = {
									(props.selected === null)
									? props.defaultSelected === i
									: props.selected === item[props.keyProp]
								}
								readOnly = {this.props.readOnly}
								disabled = {this.props.disabled}
								onChange = {this.onChange}
						/>
						<label	className ='scrm-input-radio-label'
								key={'radio_label_' + i}
								htmlFor={'rdo_' + i + '_' + props.keyProp}
								readOnly = {this.props.readOnly}
								disabled = {this.props.disabled}
						>
							{item[props.value]}
						</label>
					</div>
				);
			})
		);
	}
	render () {
		return (
			<div className='scrm-input-div' style={{width: this.props.width}}>
				{ this.setRadio(this.props) }
			 </div>
		);
	}
}
class Textfield extends React.Component {
	static defaultProps = {
		onKeyPress : () => {return;},
		onChange : () => {return;},
		onBlur : () => {return;},
		tooltip : false
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
				<div className='scrm-input-div' style={{width: this.props.width}}>
					<input	className = "scrm-input-text"
							type="text"
							id = {this.props.id}
							name = {this.props.name}
							value = {this.rtnVal(this.props.value)}
							placeholder = {this.props.placeholder}
							minLength =  {this.props.minLength}
							maxLength = {this.props.maxLength}
							readOnly = {this.props.readOnly}
							disabled = {this.props.disabled}
							onChange = {(e) => this.props.onChange(e)}
							onKeyPress= {(e) => this.props.onKeyPress(e)}
							onBlur = {(e) => {this.props.onBlur(e)}}
							autoComplete  = 'off'
							tooltip="ss"
					/>
				</div>
		);
	}
}
class TextPasswdfield extends React.Component {
	render () {
		return (
			<div className='scrm-input-div'>
				<input
					className = "scrm-input-password"
					type="password"
					id = {this.props.id}
					name = {this.props.name}
					value = {this.props.value}
					placeholder = {this.props.placeholder}
					maxlength = {this.props.maxlength}
					minlength =  {this.props.minlength}
					readOnly = {this.props.readOnly}
					onChange = {(e) => this.props.onChange(e)}
					onKeyPress= {(e) => this.props.onKeyPress(e)}
					autoComplete  = 'off'
				/>
			</div>
		);
	}
}
class InputCalendar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: null,
		};
	}
	render () {
		return (
			<React.Fragment>
				<SingleDatePicker
					id = {this.props.id}
					date = {convertDate(this.props.value)}
					numberOfMonths = {1}
					placeholder = {'일자'}
					monthFormat = {"YYYY년 MM월"}
					isOutsideRange = {(e) => {return ;}}
					disabled = {this.props.disabled}
					showClearDate = {true}
					showDefaultInputIcon
					openDirection = {this.props.direction ? this.props.direction : 'down'}
					verticalSpacing={0}
  					inputIconPosition="after"
					displayFormat = {'YYYY-MM-DD'}
					onDateChange={(date) => {
						this.props.onChange({
							target : {
								id : this.props.id,
								value : (date) ? date.format('YYYYMMDD') : null,
							}
						})
					}}
					focused={this.state.focused}
					onFocusChange={({ focused }) => this.setState({ focused })}
				/>
			</React.Fragment>
		);
	}
}
class RangeInputCalendar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			focusedInput: null,
		};
	}
	static defaultProps = {
		startDate: null,
		endDate: null,
	}
	render () {
		return (
			<React.Fragment>
				<DateRangePicker
					enableOutsideDays = {true}
					disabled = {this.props.disabled}
					showClearDates = {true}
					showDefaultInputIcon
					isOutsideRange = {(e) => {return ;}}
					minimumNights={0}
					verticalSpacing={0}
					inputIconPosition="after"
					openDirection = {this.props.direction ? this.props.direction : 'down'} 
					displayFormat = {'YYYY-MM-DD'}
					monthFormat = {"YYYY년 MM월"}
					startDateId="startDate"
					endDateId="endDate"
					startDatePlaceholderText = {"시작일자"}
					endDatePlaceholderText = {"종료일자"}
					startDate={convertDate(this.props.startDate)}
					endDate={convertDate(this.props.endDate)}
					onDatesChange={({ startDate, endDate }) => {
						this.props.onChange({
							target : {
								id : this.props.id,
							},
							startDate : (startDate) ? startDate.format('YYYYMMDD') : null,
							endDate : (endDate) ? endDate.format('YYYYMMDD') : null,
						})
					}}
					focusedInput={this.state.focusedInput}
					onFocusChange={(focusedInput) => { this.setState({ focusedInput })}}
				/>
			</React.Fragment>
		);
	}
}
const convertDate = (date) => {
	if (date !== null && date !== undefined) {
		return moment(date);
	} else {
		return null;
	}
}
export { MultiCheckBox, Checkbox, Radio, Textfield, InputCalendar, TextPasswdfield, RangeInputCalendar}