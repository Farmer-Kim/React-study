// 학습 등록
import React from 'react';
import {
	FlexPanel, FullPanel, SubFullPanel, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {Textfield, InputCalendar, Selectbox} from 'components';
import {ComLib, DataLib, DateLib, StrLib, newScrmObj} from 'common';

class View extends React.Component {
	constructor(props) {
		super();

		this.state = {
			dsMisSenList : DataLib.datalist.getInstance(),
			selectboxProps : {
				selTime : {
					id       : 'selTime',
					value    : '',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList("CMN_SET", "STT_TRN_LST"), newScrmObj.constants.select.argument.select),
					width    : 150,
					selected : 0,
					disabled : false
				}
			},
			calendarProps : {
				caldate : {
					id : 'caldate',
					value : DateLib.getToday(),
					isOpen : false,
					maxDate : null,
					minDate : DateLib.getToday(),
					required : false,
				},
			},			
			textFieldProps : {
				iptTrnTitle : {
					id          : 'iptTrnTitle',
					name        : 'iptTrnTitle',
					value       : '',
					placeholder : '학습타이틀',
					minLength   : 1,
					maxLength   : 12,
					readOnly    : false,
					disabled    : false
				}
			},
			btnProps : {
				btnAppTrain : {
					id       : 'btnAppTrain',
					disabled : false,
					value    : '확인',
					hidden   : false
				},
			},
		}
	}
	componentDidMount () {

	}
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/	
	validation = (...params) => {
		let transId = params[0];

		switch (transId) {
			case 'addNewTrain' :
				if (StrLib.isNull(this.state.calendarProps.caldate.value)) {
					ComLib.openDialog('A', 'SYSI0010', '학습일자 공백');

					return false;

				} 

				if (this.state.selectboxProps.selTime.selected === 0) {
					ComLib.openDialog('A', 'SYSI0010', '학습 시간 미 선택');

					return false;

				} 

				if (StrLib.isNull(this.state.textFieldProps.iptTrnTitle.value)) {
					ComLib.openDialog('A', 'SYSI0010', '학습 타이틀 미입력');

					return false;

				}	

				break;


			default :
				break;
		}

		return true;

	}

	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		selectbox: {
			onChange: (e) => {
				let state = this.state;

				state['selectboxProps'][e.target.id].selected = e.target.selectedIndex;
				state['selectboxProps'][e.target.id].value    = e.target.value;

				this.setState(state);

			}
		},
		inputcalendar : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'caldate':
					if (e.target.value < DateLib.getToday() && !StrLib.isNull(e.target.value)) {						
						ComLib.openDialog('A', 'COME0003', ['학습일자']);

						return;
					}

					let state = this.state;
	
					state['calendarProps']['caldate'].value =  e.target.value;

					this.setState(state);						
					
					break;

				default : break;
				}
				
			}
		},
		input : {
			onChange: (e) => {
				switch (e.target.id) {
				case 'iptTrnTitle':
					let state = this.state;

					state['textFieldProps']['iptTrnTitle'].value = e.target.value;
	
					this.setState(state);
					
					break;

				default: break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptTrnTitle':
					if (e.key === 'Enter') {
						if (this.validation("addNewTrain")) {
							let date  = this.state.calendarProps.caldate.value;
							let time  = this.state.selectboxProps.selTime.value;
							let title = e.target.value;
							this.props.onCallbackFunc({date: date, time: time, title: title});
							this.props.onClose();
						}
					}
					
					break;

				default: break;
				}

			}
		},
		button : {
			onClick : (e) => {
				switch (e.target.id) {
				case "btnAppTrain":					
					if (this.validation("addNewTrain")) {
						let date  = this.state.calendarProps.caldate.value;
						let time  = this.state.selectboxProps.selTime.value;
						let title = this.state.textFieldProps.iptTrnTitle.value;
						this.props.onCallbackFunc({date: date, time: time, title: title});
						this.props.onClose();
					}

					break;
				default : break;
				}
			}
		},
	}

	render () {
		return (
			<React.Fragment>
				<FullPanel>
					<SubFullPanel>
						<div className="scrm-cal-div">
							<InputCalendar
								id              = {this.state.calendarProps.caldate.id}
								value           = {this.state.calendarProps.caldate.value}
								isOpen          = {this.state.calendarProps.caldate.isOpen}
								maxDate         = {this.state.calendarProps.caldate.maxDate}
								minDate         = {this.state.calendarProps.caldate.minDate}
								required        = {this.state.calendarProps.caldate.required}
								onChange        = {this.event.inputcalendar.onChange}
							/>
							<Selectbox
								id       = {this.state.selectboxProps.selTime.id}
								value    = {this.state.selectboxProps.selTime.value}
								dataset  = {this.state.selectboxProps.selTime.dataset}
								width    = {this.state.selectboxProps.selTime.width}
								disabled = {this.state.selectboxProps.selTime.disabled}
								selected = {this.state.selectboxProps.selTime.selected}
								onChange = {this.event.selectbox.onChange}
							/>
						</div>
					</SubFullPanel>		
					<SubFullPanel>
						<FlexPanel>
							<div className="scrm-cal-div">
								<Label value="타이틀명"/>
								<Textfield
									width       = {280}
									id          = {this.state.textFieldProps.iptTrnTitle.id}
									name        = {this.state.textFieldProps.iptTrnTitle.name}
									value       = {this.state.textFieldProps.iptTrnTitle.value}
									placeholder = {this.state.textFieldProps.iptTrnTitle.placeholder}
									minLength   = {this.state.textFieldProps.iptTrnTitle.minLength}
									maxLength   = {this.state.textFieldProps.iptTrnTitle.maxLength}
									readOnly    = {this.state.textFieldProps.iptTrnTitle.readOnly}
									disabled    = {this.state.textFieldProps.iptTrnTitle.disabled}
									onChange    = {this.event.input.onChange}
									onKeyPress  = {this.event.input.onKeyPress}
								/>
							</div>
						</FlexPanel>
						<br/><br/>									
						<RelativeGroup>
							<Label value="학습진행일자 선택 및 학습타이틀을 입력하세요."/>
							<Label value="학습 가능 일자는 금일 부터입니다."/><br/>
							<Label value="학습 가능 시간대는 20:00 ~ 02:00 사이 입니다."/>
						</RelativeGroup>
						<br/><br/><br/>
						<RelativeGroup>
							<Button
								color    = 'purple' 
								fiiled   = "o" 
								id       = {this.state.btnProps.btnAppTrain.id}
								value    = {this.state.btnProps.btnAppTrain.value}
								disabled = {this.state.btnProps.btnAppTrain.disabled}
								hidden   = {this.state.btnProps.btnAppTrain.hidden}
								onClick  = {this.event.button.onClick}
								mt       = {5}
							/>
						</RelativeGroup>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;