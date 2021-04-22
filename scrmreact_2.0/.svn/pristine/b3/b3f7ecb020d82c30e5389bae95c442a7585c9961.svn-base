import React from 'react';
import DatePicker from 'react-date-picker';
import TimePicker from 'react-time-picker';
import {StrLib, DateLib} from 'common';


class DateComponent extends React.Component {
	state = { date: new Date() }
	componentDidMount() {
		if (this.props.value === null || this.props.value === undefined) {

		}
	}
	onChange = date => this.setState({ date })
	getValue () {
		return DateLib.getStringDate(this.state.date);
	}
	isPopup() {return true;}
	render() {
		return ( <DatePicker onChange={this.onChange} value={this.state.date} />);
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
		this.state = { strtDate: '', endDate : '' }
	}
	static defaultProps = {
		STRT_DT : '', END_DT : ''
	}
	
	isPopup() {return true;}
	onStrtDtChange = date => this.setState({ ...this.state, strtDate : date });
	onEndDtChange = date => this.setState({ ...this.state, endDate : date });
	getValue () {
		let strtDate = DateLib.getStringDate(this.state.strtDate);
		let endDate = DateLib.getStringDate(this.state.endDate);

		if (StrLib.isNull(endDate) && StrLib.isNull(strtDate)) {
			this.props.data.STRT_DT = '';
			this.props.data.END_DT = '';
			return '';
		} else {
			if (StrLib.isNull(endDate)) {
				this.props.data.STRT_DT = strtDate;
				return strtDate;
			}
			if (StrLib.isNull(strtDate)) {
				this.props.data.END_DT = endDate;
				return endDate;
			}
			this.props.data.STRT_DT = strtDate;
			this.props.data.END_DT = endDate;
			return strtDate + endDate;
		}
	}
	componentDidMount () {
		this.setState({strtDate : DateLib.getDateYymmdd(this.props.data.STRT_DT), endDate : DateLib.getDateYymmdd(this.props.data.END_DT)});
	}
	render () {
		return (
			<div style={{display : 'flex'}}>
				<span style={{marginRight : '5px'}}><b> 시작일자 : </b></span>
				<DatePicker onChange={this.onStrtDtChange} value={this.state.strtDate} />
				<span style={{marginLeft: '5px', marginRight : '5px'}}> ~ </span>
				<span style={{marginRight : '5px'}}><b> 종료일자 :  </b></span>
				<DatePicker onChange={this.onEndDtChange} value={this.state.endDate} />
			</div>
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