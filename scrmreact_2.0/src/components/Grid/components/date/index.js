import React from 'react';
// import DatePicker from 'react-date-picker';
import TimePicker from 'react-time-picker';
import {StrLib, DateLib} from 'common';
import {InputCalendar, RangeInputCalendar} from 'components'

class DateComponent extends React.Component {
	state = { date: null }
	componentDidMount() {
		this.setState({ date:this.props.value});
	}
	onChange = (e) => {
		this.setState({ date: e.target.value });
	}
	getValue () {
		return this.state.date;
	}
	isPopup() {return true;}

	render() {
		let rangeBottom = this.props.api.getVerticalPixelRange().bottom;
		let rtn = "down";
		
		if ((rangeBottom - this.props.node.rowTop + this.props.bottom) < 330) {
			rtn = "up"
		} 

		return (<InputCalendar
					id={"gridCal"}
					value={this.state.date}
					disabled={false}
					onChange={this.onChange}
					direction={rtn}
				/>);
	}
}
class TimeComponent extends React.Component {
	state = { time: '00:00'}
	onChange = time => this.setState({ time })
	getValue () {return this.state.time;}
	isPopup() {return true;}
	render() {
		return ( <TimePicker onChange={this.onChange} value={this.state.time} format="HH:m" disableClock={true} maxTime={'23:59:59'}/> );
	}
}
class RangeDateComponent extends React.Component {
	constructor (props) {
		super(props);
		this.state = { startDate: null, endDate : null, oldStartDate: null, oldEndDate: null }
	}
	
	
	isPopup() {return true;}
	// onStrtDtChange = date => this.setState({ ...this.state, startDate : date });
	// onEndDtChange = date => this.setState({ ...this.state, endDate : date });

	componentDidMount () {
		this.setState({startDate   : this.props.data[this.props.sColId]
					 , endDate     : this.props.data[this.props.eColId]
					 , oldStartDate: this.props.data[this.props.sColId]
					 , oldEndDate  : this.props.data[this.props.eColId]});
	}

	onChangeDate= (e) => {
		this.setState({startDate : e.startDate, endDate : e.endDate});
	}

	getValue () {
		let startDate = this.state.startDate;
		let endDate   = this.state.endDate;

		let node = this.props.node;
		let sCol = this.props.sColId;
		let eCol = this.props.eColId;

		if (this.props.outputCheckFn) {
			
			let oldStartDate = this.state.oldStartDate;
			let oldEndDate   = this.state.oldEndDate;

			let rtn = this.props.outputCheckFn(node, startDate, endDate, oldStartDate, oldEndDate);
		
			startDate = rtn.startDate;
			endDate   = rtn.endDate;
			
			node.setDataValue(sCol,startDate);
			node.setDataValue(eCol,endDate);
	
			if (this.props.curState) {
				let today = Number(DateLib.getToday());
				let sDate = Number(startDate);
				let eDate = Number(endDate);
				let nowState = "NOW";
	
				if (sDate > today) {
					nowState = "BEFORE";
				} else if (eDate < today) {
					nowState = "AFTER";
				}
				node.setDataValue(this.props.curState, nowState);
			}
					
			return DateLib.getStringYymmdd(startDate) + " ~ " + DateLib.getStringYymmdd(endDate);
		} else {
			node.setDataValue(sCol,startDate);
			node.setDataValue(eCol,endDate);
	
			if (this.props.curState) {
				let today = Number(DateLib.getToday());
				let sDate = Number(startDate);
				let eDate = Number(endDate);
				let nowState = "NOW";
	
				if (sDate > today) {
					nowState = "BEFORE";
				} else if (eDate < today) {
					nowState = "AFTER";
				}
				node.setDataValue(this.props.curState, nowState);
			}
					
			return DateLib.getStringYymmdd(startDate) + " ~ " + DateLib.getStringYymmdd(endDate);
		}
	}
	afterGuiAttached() {
		document.getElementsByClassName("ag-react-container")[0].children[0].children[0].children[0].children[0].children[0].focus();

	}

	render () {
		let rangeBottom = this.props.api.getVerticalPixelRange().bottom;
		let rtn = "down";
		
		if ((rangeBottom - this.props.node.rowTop + this.props.bottom) < 330) {
			rtn = "up"
		} 

		return (
			<RangeInputCalendar
				id             = {"calGridRangeDate"} 
				strtId         = {"calGridRangeDateStr"}
				endId          = {"calGridRangeDateEnd"}
				startDate      = {this.state.startDate} 
				endDate        = {this.state.endDate} 
				width          = {200}
				showClearDates = {false}
				onChange       = {this.onChangeDate}
				direction={rtn}
			/>			
		);
	}
}
class RangeTimeComponent extends React.Component {
	constructor (props) {
		super(props);
		this.state = { strtTime: '00:00', endTime: '23:59'}
		this.onStrtTmChange = this.onStrtTmChange.bind(this);
		this.onEndTmChange = this.onEndTmChange.bind(this);
	}
	static defaultProps = {
		STRT_TM : '', END_TM : ''
	}
	onStrtTmChange = time => this.setState({ ...this.state, strtTime : time });
	onEndTmChange = time => this.setState({ ...this.state, endTime : time });
	getValue () {
		if (StrLib.isNull(this.state.endTime) && StrLib.isNull(this.state.strtTime)) {
			this.props.data.STRT_TM = '';
			this.props.data.END_TM = '';
			return '';
		} else {
			if (StrLib.isNull(this.state.strtTime)) {
				this.props.data.END_TM = this.state.endTime.replace(':', '');
				return this.state.endTime.replace(':', '');
			}
			if (StrLib.isNull(this.state.endTime)) {
				this.props.data.STRT_TM = this.state.strtTime.replace(':', '');
				return this.state.strtTime.replace(':', '');
			}
			this.props.data.STRT_TM = this.state.strtTime.replace(':', '');
			this.props.data.END_TM = this.state.endTime.replace(':', '');
			return this.state.strtTime.replace(':', '') + this.state.endTime.replace(':', '');
		}
	}
	componentDidMount () {
		this.setState({strtTime : StrLib.getFormatterTime(this.props.data.STRT_TM), endTime : StrLib.getFormatterTime(this.props.data.END_TM)});
	}
	isPopup() {return true;}
	render() {
		return (
			<div style={{display : 'flex'}}>
				<span style={{marginRight : '5px'}}><b> 시작시간 : </b></span>
				<TimePicker onChange={this.onStrtTmChange} value={this.state.strtTime} format="HH:mm" disableClock={true} maxTime={'23:59:59'}/> 
				<span style={{marginLeft: '5px', marginRight : '5px'}}> ~ </span>
				<span style={{marginRight : '5px'}}><b> 종료시간 :  </b></span>
				<TimePicker onChange={this.onEndTmChange} value={this.state.endTime} format="HH:mm" disableClock={true} maxTime={'23:59:59'}/> 
			</div>
		);
	}
}
export {DateComponent, TimeComponent, RangeDateComponent, RangeTimeComponent}