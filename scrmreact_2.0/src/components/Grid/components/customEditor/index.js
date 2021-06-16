import React from 'react';
import { StrLib } from '../../../../common';
const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;
const KEY_ENTER = 13;
const KEY_TAB = 9;

class CustomEditor extends React.Component {
	constructor(props) {
		super(props);
			
		this.state = this.createInitialState(props);
	
		this.onKeyDown = this.onKeyDown.bind(this);
		this.handleChange = this.handleChange.bind(this);
	  }
	
	  createInitialState(props) {
		let startValue = '';
		let highlightAllOnFocus = true;
	
		if (props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE) {
		  // if backspace or delete pressed, we clear the cell
		  startValue = '';

		} else if (props.charPress) {
		  // if a letter was pressed, we start with the letter
		  startValue = props.charPress;
		  highlightAllOnFocus = false;

		} else if (props.value === undefined || props.value === null) {
			startValue = '';

			if (props.keyPress === KEY_F2) {
			  highlightAllOnFocus = false;
			}

		} else {
		  // otherwise we start with the current value
		  startValue = props.value;
		  
		  if (props.keyPress === KEY_F2) {
			highlightAllOnFocus = false;
		  }
		}

		let inputType  = 'none';

		if (this.props.colDef['type'] !== null || this.props.colDef['type'] !== undefined) {
			inputType = this.props.colDef['type'];
		}

		if (inputType !== 'none') {
			if (inputType === 'num') {
				startValue = Number(startValue.toString().replace(new RegExp("[^0-9]", "g"), ""))

			} else if (inputType === 'alpha') {
				startValue = startValue.toString().replace(new RegExp("[^A-Za-z]", "g"), "")
				
			} else if (inputType === 'alNum') {
				startValue = startValue.toString().replace(new RegExp("[^A-Za-z0-9]", "g"), "")

			} else if (inputType === 'code') {
				startValue = startValue.toString().replace(new RegExp("[^A-Za-z0-9_-]", "g"), "")

			} 
		}		

		return {
		  value: startValue,
		  highlightAllOnFocus,
		};
	  }
	
	  componentDidMount() {
		this.refs.input.addEventListener('keydown', this.onKeyDown);
	  }
	
	  componentWillUnmount() {
		this.refs.input.removeEventListener('keydown', this.onKeyDown);
	  }
	
	  afterGuiAttached() {
		// get ref from React component
		const eInput = this.refs.input;
		eInput.focus();
		if (this.state.highlightAllOnFocus) {
		  eInput.select();
	
		  this.setState({
			highlightAllOnFocus: false,
		  });
		} else {
		  // when we started editing, we want the carot at the end, not the start.
		  // this comes into play in two scenarios: a) when user hits F2 and b)
		  // when user hits a printable character, then on IE (and only IE) the carot
		  // was placed after the first character, thus 'apply' would end up as 'pplea'
		  const length = eInput.value ? eInput.value.length : 0;
		  if (length > 0) {
			eInput.setSelectionRange(length, length);
		  }
		}
	  }
	
	  getValue() {
		return this.state.value;
	  }
			
	  onKeyDown(event) {
		if (this.isLeftOrRight(event) || this.deleteOrBackspace(event)) {
		  event.stopPropagation();
		  return;
		}		
	  }
	
	  isLeftOrRight(event) {
		return [37, 39].indexOf(event.keyCode) > -1;
	  }
	
	  handleChange(event) {
		let inputType  = 'none';
		let inputValue = event.target.value;

		if (this.props.colDef['type'] !== null || this.props.colDef['type'] !== undefined) {
			inputType = this.props.colDef['type'];
		}

		if (inputType !== 'none') {
			if (inputType === 'num') {
				inputValue = inputValue.replace(new RegExp("[^0-9]", "g"), "")

			} else if (inputType === 'alpha') {
				inputValue = inputValue.replace(new RegExp("[^A-Za-z]", "g"), "")
				
			} else if (inputType === 'alNum') {
				inputValue = inputValue.replace(new RegExp("[^A-Za-z0-9]", "g"), "")

			} else if (inputType === 'code') {
				inputValue = inputValue.replace(new RegExp("[^A-Za-z0-9_-]", "g"), "")

			} else if (inputType === 'kor') {
				inputValue = inputValue.replace(new RegExp("[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣]", "g"), "")

			} 
		}	

		this.setState({ value: inputValue });
	  }
	
	  getCharCodeFromEvent(event) {
		event = event || window.event;
		return typeof event.which === 'undefined' ? event.keyCode : event.which;
	  }
		
	  render() {	
		if (this.props.colDef['maxLength'] !== undefined && this.props.colDef['maxLength'] !== null) {
			return (
				<input
				  ref="input"
				  value={this.state.value}
				  onChange={this.handleChange}
				  style={{ width: '100%', borderStyle: 'none', outline: 'none'}}
				  maxLength={ this.props.colDef['maxLength'] }
				 
				/>
			  );
		} else {
			return (
				<input
				  ref="input"
				  value={this.state.value}
				  onChange={this.handleChange}
				  style={{ width: '100%', borderStyle: 'none', outline: 'none'}}
				/>
			  );
		}
		
		
	  }

	  deleteOrBackspace(event) {
		return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.keyCode) > -1;
	  }
	
	  finishedEditingPressed(event) {
		const charCode = this.getCharCodeFromEvent(event);
		return charCode === KEY_ENTER || charCode === KEY_TAB;
	  }

}

export default CustomEditor