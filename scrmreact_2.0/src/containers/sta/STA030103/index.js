// 결함 담당자 검색
import React from 'react';
import {
   Textfield, Textarea, Checkbox, InputCalendar, Table, RFloatArea, LFloatArea, RelativeGroup, Label} from 'components';
   
import {BasicButton as Button} from 'components';
import {TabPanel } from 'components';
import {DataLib, ComLib, TransManager, newScrmObj} from 'common';


class View extends React.Component {
	/*------------------------------------------------------------------------------------------------*/
	// [1. Default State Zone]
	/*------------------------------------------------------------------------------------------------*/
	constructor(props) {
		super(); 

		this.state = {	
			dsCentInfo : DataLib.datalist.getInstance(),
			tab1st : null,
			tab2nd : null,
			pageOne : null,

			imageFltIndex : 1, 
			imageFltTotal : 3,
			imageFixIndex : 1, 
			imageFixTotal : 3,
			imageCfnIndex : 1, 
			imageCfnTotal : 3,

			btnProps : {
				btnMenuSearch : {
					id       : 'btnMenuSearch',
					disabled : false,
					value    : '',
					hidden   : true
				},
				btnUserSearch: {
					id       : 'btnUserSearch',
					disabled : false,
					value    : '',
					hidden   : true
				},
				btnDevSearch: {
					id       : 'btnDevSearch',
					disabled : false,
					value    : '',
					hidden   : true
				},
				btnFltAddFile : {
					id       : 'btnFltAddFile',
					disabled : false,
					value    : '파일추가',
					hidden   : true
				},
				btnFltDelFile : {
					id       : 'btnFltDelFile',
					disabled : false,
					value    : '파일삭제',
					hidden   : true
				},
				btnFltSave : {
					id       : 'btnFltSave',
					disabled : false,
					value    : '저장',
					hidden   : true
				},
				btnFixAddFile : {
					id       : 'btnFixAddFile',
					disabled : false,
					value    : '파일추가',
					hidden   : false
				},
				btnFixDelFile : {
					id       : 'btnFixDelFile',
					disabled : false,
					value    : '파일삭제',
					hidden   : false
				},
				btnFixSave : {
					id       : 'btnFixSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
				btnCfnAddFile : {
					id       : 'btnCfnAddFile',
					disabled : false,
					value    : '파일추가',
					hidden   : false
				},
				btnCfnDelFile : {
					id       : 'btnCfnDelFile',
					disabled : false,
					value    : '파일삭제',
					hidden   : false
				},
				btnCfnSave : {
					id       : 'btnCfnSave',
					disabled : false,
					value    : '확인',
					hidden   : false
				},
			},
			
			calendarProps : {
				calOccDate : {
					id              : 'calOccDate',
					value           : '20200831',
					closeCalendar   : true,
					disabled        : true,
					disableCalendar : false,
					format          : 'y-MM-dd',
					isOpen          : false,
					maxDate         : null,
					minDate         : null,
					required        : false,
					returnValue     : 'start',
				}
			},

			checkBoxProps : {
				chkReject : {
					keyProp: '',
					id     : 'checkBoxProps',
					checked: 'N',
					index  : '1'
				}
			},

			textFieldProps : {
				iptFalutNo : {
					id          : 'iptFalutNo',
					name        : 'iptFalutNo',
					value       : '',
					placeholder : '',
					minLength   : 1,
					maxLength   : 10,
				},
				iptMenuPath : {
					id          : 'iptMenuPath',
					name        : 'iptMenuPath',
					value       : '',
					placeholder : '화면 경로',
					minLength   : 1,
					maxLength   : 50,
					readOnly    : true,
					disabled    : true
				},
				iptUser : {
					id          : 'iptUser',
					name        : 'iptUser',
					value       : '',
					placeholder : '결함 등록자',
					minLength   : 1,
					maxLength   : 10,
					readOnly    : true,
					disabled    : true
				},
				iptDev : {
					id          : 'iptDev',
					name        : 'iptDev',
					value       : '',
					placeholder : '조치 담당자',
					minLength   : 1,
					maxLength   : 3,
					readOnly    : true,
					disabled    : true
				},				
			},
			textAreaProps : {
				iptFltCN : {
					id          : 'iptFltCN',
					name        : 'iptFltCN',
					value       : '',
					placeholder : '',
					minLength   : 1,
					maxLength   : 2000,
					readOnly    : false,
					rows        : 12
				},	
			},
			selectboxProps : {
				selFaultType : {
					id : 'selFaultType',
					dataset : ComLib.convComboList(ComLib.getCommCodeList("DATE_TYPE"), newScrmObj.constants.select.argument.all),
					selected : 0,
					disabled : true
				},
				selProcessType : {
					id : 'selProcessType',
					dataset : ComLib.convComboList(ComLib.getCommCodeList("FT_CURR"), newScrmObj.constants.select.argument.all),
					selected : 0,
					disabled : true
				},
			},		
		}
   }

   /*------------------------------------------------------------------------------------------------*/
   // [2. OnLoad Event Zone]
   /*------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		
		//this.initPage(this.props.options)
		
	}

	initPage = (options) => {		
		let state = this.state;
		
		let fltCurr = '';
		

		if (options.data !== undefined){
			fltCurr = options.data.FT_CURR;
			if (options.type === 'old') {
				console.log("히스토리 확인시 조치,확인중 1개만 열리고 열리는 텝은 active")
				state['tabConfirmIndex'] = 0;		
				state['tabFixIndex']     = 0;
			} else {
				// fltCurr = 0: 미조치, 1: 진행, 2: 조치완료, 3: 반려, 4: 비정상, 5: 확인환료
				if (fltCurr === '0') {
					console.log("tab1 : 조치 (active)");
					console.log("미조치 : 개발자 사용자가 올린 신규 결함을 확인하고 담당자, 조치 예정일자 입력 또는 반려 (다음단계 : 반려, 진행)");
					state['btnProps']['btnFltSave']['hidden'] = false;
					state['btnProps']['btnDevSearch']['hidden'] = false;
					
				} else if (fltCurr === '1') {
					console.log("tab1 : 조치 (active)");
					console.log("진행   : 해당 담당 개발자 조치후 조치 내용을 입력 (다음단계 : 조치완료)");
					state['tabFixIndex']     = 0;
				} else if (fltCurr === '2') {
					console.log("tab1 : 조치 (active), tab2: 확인");
					console.log("조치완료 : 사용자가 개발자의 조치 내용을 조치텝에서 확인 하고 확인텝에서 비정상/확인완료 하기 (다음단계 : 비정상, 확인완료)");
					state['tabConfirmIndex'] = 1;		
					state['tabFixIndex']     = 0;
				} else if (fltCurr === '3') {
					console.log("tab1 : 조치 (active), tab2: 확인");
					console.log("반려 : 조치 tab에서 반려 사유를 사용자가 확인하고, 반려사항에 따라 비정상/확인완료 사용자가 하기 (다음단계 : 비정상, 확인완료)");
					state['tabConfirmIndex'] = 1;		
					state['tabFixIndex']     = 0;
				} else if (fltCurr === '4') {
					console.log("tab1 : 확인 (active), tab2: 조치");
					console.log("비정상 : 사용자가 비정상 처리 해논것을 확인텝에서 확인후, 조치예정일자 입력 (다음단계 : 진행)");
					state['tabConfirmIndex'] = 0;		
					state['tabFixIndex']     = 1;
				} else {
					console.log("tab1 : 조치 , tab2: 확인 (active)");
					console.log("확인완료 : 사용자가 올려논 확인상태 최종 확인");
					state['tabConfirmIndex'] = 0;		
					state['tabFixIndex']     = 1;
				}
			}
		} else {	
			state['calendarProps']['calOccDate']['disabled'] = false;

			state['selectboxProps']['selFaultType']['disabled'] = false;

			state['textFieldProps']['iptMenuPath']['disabled'] = false;

			state['btnProps']['btnMenuSearch']['hidden'] = false;
			state['btnProps']['btnDevSearch']['hidden'] = false;
			state['btnProps']['btnFltAddFile']['hidden'] = false;
			state['btnProps']['btnFltDelFile']['hidden'] = false;
			state['btnProps']['btnFltSave']['hidden'] = false;
			
		}
		
		this.setState(state);

		//state['pageOne'] = pageOne;

		
	}
   /*------------------------------------------------------------------------------------------------*/
   // [3. validation Event Zone]
   //  - validation 관련 정의
   /*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STA020000_R01':
			
			break;
		
		default : break;
		}

		return true;
	}

   /*------------------------------------------------------------------------------------------------*/
   // [4. transaction Event Zone]
   //  - transaction 관련 정의
   /*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {
		let serviceid = params[0];
		let transManager = new TransManager();

		try {
			switch (serviceid) {
			case 'STA020000_R01' :
				transManager.setTransId(serviceid);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STA.R_getQAVlaStaCode",
					datasetsend:"dsSrchStaCode",
					datasetrecv:"dsSvrStatCodeInfo"
				});
				
				transManager.addDataset('dsSrchStaCode', [{}]);					
				transManager.agent();	

				break;

			default : break;
			}
		} catch (err) {

		}
	}

   /*------------------------------------------------------------------------------------------------*/
   // [5. Callback Event Zone]
   //  - Callback 관련 정의
   /*------------------------------------------------------------------------------------------------*/
	callback = (res) => {
		
		switch (res.id) {
		case 'STA020000_R01':

			break;
	
		default : break;
		}
	}

   /*------------------------------------------------------------------------------------------------*/
   // [6. event Zone]
   //  - 각 Component의 event 처리
   /*------------------------------------------------------------------------------------------------*/
	event = {
		button: {
			onClick: (e) => {
				switch (e.target.id) {
				case 'imgCfnRight':
					let state = this.state;
					state['imageCfnIndex']= 9999;
					this.setState(state)

					break;
		
				default : break;
				}
			}
		},
		tab: {
			onClick: () => {
				
			}
		},
		checkBox: {
			onClick: () => {
				
			},
			onChange: () => {
				
			},
		},
		input: {
			onChange: () => {
				
			},
		},
		inputcalendar: {
			onChange: () => {
				
			},
		},

	}

   /*------------------------------------------------------------------------------------------------*/
   // [7. render Zone]
   //  - 화면 관련 내용 작성
   /*------------------------------------------------------------------------------------------------*/

	render () {		
		return (
			<React.Fragment>
				<Table  
					id="tblFix" 
					colGrp = {[{width: '15%'}, {width: '35%'}, {width: '15%'},{width: '35%'}]}
					tbData = {[[{type : 'T', value : '조치NO'},
								{type : 'D', value : <Textfield
														id          = {this.state.textFieldProps.iptFalutNo.id}
														name        = {this.state.textFieldProps.iptFalutNo.name}
														value       = {this.state.textFieldProps.iptFalutNo.value}
														placeholder = {this.state.textFieldProps.iptFalutNo.placeholder}
														minLength   = {this.state.textFieldProps.iptFalutNo.minLength}
														maxLength   = {this.state.textFieldProps.iptFalutNo.maxLength}
														readOnly    = {true}
														disabled    = {true}
													/>},
								{type : 'T', value : '진행상태'},
								{type : 'D', value : <Textfield
														id          = {this.state.textFieldProps.iptFalutNo.id}
														name        = {this.state.textFieldProps.iptFalutNo.name}
														value       = {this.state.textFieldProps.iptFalutNo.value}
														placeholder = {this.state.textFieldProps.iptFalutNo.placeholder}
														minLength   = {this.state.textFieldProps.iptFalutNo.minLength}
														maxLength   = {this.state.textFieldProps.iptFalutNo.maxLength}
														readOnly    = {true}
														disabled    = {true}
													/>}],
								[{type : 'T', value : '조치예정'},
								{type : 'D', value : <InputCalendar
														id              = {this.state.calendarProps.calOccDate.id}
														value           = {this.state.calendarProps.calOccDate.value}
														closeCalendar   = {this.state.calendarProps.calOccDate.closeCalendar}
														disabled        = {this.state.calendarProps.calOccDate.disabled}
														disableCalendar = {this.state.calendarProps.calOccDate.disableCalendar}
														format          = {this.state.calendarProps.calOccDate.format}
														isOpen          = {this.state.calendarProps.calOccDate.isOpen}
														maxDate         = {this.state.calendarProps.calOccDate.maxDate}
														minDate         = {this.state.calendarProps.calOccDate.minDate}
														required        = {this.state.calendarProps.calOccDate.required}
														returnValue     = {this.state.calendarProps.calOccDate.returnValue}
														onChange        = {this.event.inputcalendar.onChange}
													/>},
								{type : 'T', value : '조치일자'},
								{type : 'D', value : <LFloatArea><InputCalendar
														id              = {this.state.calendarProps.calOccDate.id}
														value           = {this.state.calendarProps.calOccDate.value}
														closeCalendar   = {this.state.calendarProps.calOccDate.closeCalendar}
														disabled        = {this.state.calendarProps.calOccDate.disabled}
														disableCalendar = {this.state.calendarProps.calOccDate.disableCalendar}
														format          = {this.state.calendarProps.calOccDate.format}
														isOpen          = {this.state.calendarProps.calOccDate.isOpen}
														maxDate         = {this.state.calendarProps.calOccDate.maxDate}
														minDate         = {this.state.calendarProps.calOccDate.minDate}
														required        = {this.state.calendarProps.calOccDate.required}
														returnValue     = {this.state.calendarProps.calOccDate.returnValue}
														onChange        = {this.event.inputcalendar.onChange}
													/></LFloatArea>}],
								[{type : 'T', value : '담당자'},
								{type : 'D', value : <Textfield
														id          = {this.state.textFieldProps.iptFalutNo.id}
														name        = {this.state.textFieldProps.iptFalutNo.name}
														value       = {this.state.textFieldProps.iptFalutNo.value}
														placeholder = {this.state.textFieldProps.iptFalutNo.placeholder}
														minLength   = {this.state.textFieldProps.iptFalutNo.minLength}
														maxLength   = {this.state.textFieldProps.iptFalutNo.maxLength}
														readOnly    = {true}
														disabled    = {true}
													/>},
								{type : 'T', value : '결함반려'},
								{type : 'D', value : <LFloatArea>
														<Checkbox
															id       = {'chk_' + this.state.checkBoxProps.chkReject.id + '_' + this.state.checkBoxProps.chkReject.index + '_' + this.state.checkBoxProps.chkReject.keyProp}
															value    = {this.state.checkBoxProps.chkReject.keyProp}
															name     = {this.state.checkBoxProps.chkReject.id}
															checked  = {this.state.checkBoxProps.chkReject.checked === 'Y'}
															onClick  = {this.event.checkBox.onClick}
															onChange = {this.event.checkBox.onChange}
														/>
													</LFloatArea>}],
								[{type : 'T', value : '내용'},
								{type : 'D', value : <Textarea
														id          = {this.state.textAreaProps.iptFltCN.id}
														name        = {this.state.textAreaProps.iptFltCN.name}
														value       = {this.state.textAreaProps.iptFltCN.value}
														placeholder = {this.state.textAreaProps.iptFltCN.placeholder}
														minLength   = {this.state.textAreaProps.iptFltCN.minLength}
														maxLength   = {this.state.textAreaProps.iptFltCN.maxLength}
														readOnly    = {this.state.textAreaProps.iptFltCN.readOnly}
														rows        = {this.state.textAreaProps.iptFltCN.rows}
														onChange    = {this.event.input.onChange}
													/>, colSpan: 3}],
								[{type : 'T', value : '이미지'},
								{type : 'D', value : <div className="gallery" style={{width:"100%", height:"200px"}}>
														<a target="_blank" href="img_forest.jpg">
															<img src="img_forest.jpg" alt="Forest" height="200"></img>
														</a>
													</div>, colSpan: 5}]]}
				/>
				<RelativeGroup>
					<RFloatArea>
						<Button
							id = {'imgFixLeft'}
							value = {'◀'}
							onClick = {this.event.button.onClick}
						/>
						<Label value={this.state.imageFixIndex + " / " + this.state.imageFixTotal}/>
						<Button
							id = {'imgFixRight'}
							value = {'▶'}
							onClick = {this.event.button.onClick}
							mt       = {5}
						/>
					</RFloatArea>	
				</RelativeGroup>
				<RelativeGroup>
					<RFloatArea>
						<Button
							id       = {this.state.btnProps.btnFixAddFile.id}
							value    = {this.state.btnProps.btnFixAddFile.value}
							disabled = {this.state.btnProps.btnFixAddFile.disabled}
							hidden   = {this.state.btnProps.btnFixAddFile.hidden}
							onClick  = {this.event.button.onClick}
							mt       = {5}
						/>
						<Button
							id       = {this.state.btnProps.btnFixDelFile.id}
							value    = {this.state.btnProps.btnFixDelFile.value}
							disabled = {this.state.btnProps.btnFixDelFile.disabled}
							hidden   = {this.state.btnProps.btnFixDelFile.hidden}
							onClick  = {this.event.button.onClick}
							mt       = {5}
						/>
						<Button
							id       = {this.state.btnProps.btnFixSave.id}
							value    = {this.state.btnProps.btnFixSave.value}
							disabled = {this.state.btnProps.btnFixSave.disabled}
							hidden   = {this.state.btnProps.btnFixSave.hidden}
							onClick  = {this.event.button.onClick}
							mt       = {5}
						/>
					</RFloatArea>
				</RelativeGroup>
			</React.Fragment>
			)
	}
}

export default View;