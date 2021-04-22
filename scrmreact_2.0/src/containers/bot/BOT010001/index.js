// 오인식문장관리
import React from 'react';
import {
	AppPanel, HeadPanel, MiddlePanel, SidePanel, MainPanel, ComponentPanel, SearchPanel,
	FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {MultiCheckBox, Checkbox, Radio, Textfield, InputCalendar, MultiSelectbox, TextPasswdfield, RangeInputCalendar, Selectbox, MulitSelectBox, Tree, InputFileUpload} from 'components';
import {Table, Grid} from 'components';
import {ComLib, DataLib, TransManager, newScrmObj} from 'common';

class SYS080001 extends React.Component {
	constructor(props) {
		super();
	
		this.snroProcessGridApi = null;
		this.snroProcessGrid    = null;

		this.state = {
			dsSnroProcessList : DataLib.datalist.getInstance(),	
			dsSelected        : DataLib.datalist.getInstance([{SORT_ORD: "", PROCESS_TP: "", PROCESS_CD:"", SUCCESS: "", SUCCESS_TTS: "", FAIL: "", FAIL_TTS: "", RTN_TARGET: ""}]),
			btnProps : {
				btnKeywordSave : {
					id       : 'btnKeywordSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},
			grdProps : {
				grdSnroProcess : {
					id       : 'grdSnroProcess',
					areaName : '시나리오 프로세스',
					height   : '380px',
					header   : [
									{headerName: '순번',	 field: 'SORT_ORD',	colId: 'SORT_ORD', width: 50},
									{headerName: '타입',          field: 'PROCESS_TP',	   colId: 'PROCESS_TP',	editable: true, defaultValue : '', width: 80, req: true, textAlign: 'center', singleClickEdit: true,
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('CALLBOT_SNRO', 'PROCESS_TP')},
									valueFormatter : (param) => ComLib.getComCodeName('CALLBOT_SNRO', param.value, 'PROCESS_TP')},										
									{headerName: '설명',   field: 'SNRO_EXPL',   	colId: 'SNRO_EXPL', width: 180},	
									{headerName: '성공시',          field: 'SUCCESS',	   colId: 'SUCCESS',	editable: true, defaultValue : '', width: 100, req: true,  textAlign: 'center', singleClickEdit: true,
										cellEditor: 'agSelectCellEditor',
										cellEditorParams: { values : ComLib.getComCodeValue('CALLBOT_SNRO', 'SUC_TP')},
										valueFormatter : (param) => ComLib.getComCodeName('CALLBOT_SNRO', param.value, 'SUC_TP')},	
									{headerName: '성공 TTS',	 field: 'SUCCESS_NM',	colId: 'SUCCESS_NM', width: 200},
									{headerName: '실패시',          field: 'FAIL',	   colId: 'FAIL',	editable: true, defaultValue : '', width: 100, req: true, textAlign: 'center', singleClickEdit: true,
										cellEditor: 'agSelectCellEditor',
										cellEditorParams: { values : ComLib.getComCodeValue('CALLBOT_SNRO', 'FAIL_TP')},
										valueFormatter : (param) => ComLib.getComCodeName('CALLBOT_SNRO', param.value, 'FAIL_TP')},	
									{headerName: '실패 TTS',	 field: 'FAIL_NM',	colId: 'FAIL_NM', width: 200},
								]
				}
			},
			textFieldProps : {
				iptSnroNm : {
					id          : 'iptSnroNm',
					name        : 'iptSnroNm',
					value       : '',
					placeholder : '',
				},
				iptSortOrd : {
					id          : 'iptSortOrd',
					name        : 'iptSortOrd',
					value       : '',
					placeholder : '',
				},
				iptSucTTS : {
					id          : 'iptSucTTS',
					name        : 'iptSucTTS',
					value       : '',
					placeholder : '',
				},
				iptFailTTS : {
					id          : 'iptFailTTS',
					name        : 'iptFailTTS',
					value       : '',
					placeholder : '',
				},
				iptRtnTarget : {
					id          : 'iptRtnTarget',
					name        : 'iptRtnTarget',
					value       : '',
					placeholder : '',
				},
			},
			selectboxProps : {
				selProcessTP : {
					id : 'selProcessTP',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('CALLBOT_SNRO', 'PROCESS_TP'), newScrmObj.constants.select.argument.select),
					value : "",
					width : '100%',
					selected : 0,
					disabled : false
				},
				selProcessExpl : {
					id : 'selProcessExpl',
					dataset : [],
					value : "",
					width : '100%',
					selected : 0,
					disabled : false
				},
				selProcessSuc : {
					id : 'selProcessSuc',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('CALLBOT_SNRO', 'SUC_TP'), newScrmObj.constants.select.argument.select),
					value : "",
					width : '100%',
					selected : 0,
					disabled : false
				},
				selProcessSucNm : {
					id : 'selProcessSucNm',
					dataset : [],
					value : "",
					width : '100%',
					selected : 0,
					disabled : false
				},
				selProcessFail : {
					id : 'selProcessFail',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('CALLBOT_SNRO', 'FAIL_TP'), newScrmObj.constants.select.argument.select),
					value : "",
					width : '100%',
					selected : 0,
					disabled : false
				},
				selProcessFailNm : {
					id : 'selProcessFailNm',
					dataset : [],
					value : "",
					width : '100%',
					selected : 0,
					disabled : false
				},
			},
		}
	}
	componentDidMount () {
		let snro = this.props.options.dsSnro;
		let tts  = this.props.options.dsSnroTts;
		let inter  = this.props.options.dsInter;

		let arrSnro    = [];
		let arrTtsNm   = [];
		let arrInter   = [];

		for (let i = 0; i < snro.length; i ++) {
			arrSnro.push({CODE: snro[i].SNRO_CD, CODE_NM: snro[i].SNRO_EXPL})
		}
		
		for (let i = 0; i < tts.length; i ++) {
			arrTtsNm.push({CODE: tts[i].SNRO_TTS_CD, CODE_NM: tts[i].SNRO_TTS_EXPL})
			
		}		
		
		for (let i = 0; i < inter.length; i ++) {
			arrInter.push({CODE: inter[i].ITF_CD, CODE_NM: inter[i].ITF_NM})
			
		}


		let props = this.props.options.params;
		let state = this.state;
		state['textFieldProps']['iptSnroNm'].value = props.SNRO_EXPL;
		state['selectboxProps']['selProcessExpl'].dataset    = ComLib.convComboList(arrSnro   , newScrmObj.constants.select.argument.select);
		state['selectboxProps']['selProcessSucNm'].dataset   = ComLib.convComboList(arrTtsNm  , newScrmObj.constants.select.argument.select);
		state['selectboxProps']['selProcessFailNm'].dataset  = ComLib.convComboList(arrTtsNm  , newScrmObj.constants.select.argument.select);
		state.processArr   = ComLib.convComboList(arrSnro   , newScrmObj.constants.select.argument.select);
		state.interfaceArr = ComLib.convComboList(arrInter  , newScrmObj.constants.select.argument.select)
		this.setState(state);
		this.transaction("SYS080001_R00")
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {		
		let serviceid = params[0];
		let transManager = new TransManager();
		
		transManager.setTransId(serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try {
			switch (serviceid) {
			case 'SYS080001_R00':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"SYS.R_getSnroProcess",
					datasetsend:"dsSearch",
					datasetrecv:"dsSnroProcessListRecv",
				});
				
				let props = this.props.options.params;

				transManager.addDataset('dsSearch', [{SNRO_CD: props.SNRO_CD}]);
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
		case 'SYS080001_R00':
			if (res.data.dsSnroProcessListRecv.length > 0) {
				let dsSnroProcessListRecv = res.data.dsSnroProcessListRecv;

				ComLib.setStateInitRecords(this, "dsSnroProcessList", dsSnroProcessListRecv);

			}	

			break;

		default : break;
		}
	}


	event = {
		// 버튼 이벤트
		button : {
			onClick : (e) => {
				switch (e.target.id) {
				case "btnSearch":
					if (this.validation("SYS010000_R01")) this.transaction("SYS010000_R01");
				
					break;
						
				default : break;
				}
			}
		},
		grid: {
			onSelectionChanged: (e) => {
				switch (e.id) {
				case "grdSnroProcess":
					console.log(e);
					let state = this.state;
					// state['textFieldProps']['iptFailTTS']
					// state['textFieldProps']['iptFailTTS']
					// state['textFieldProps']['iptFailTTS']
					// state['textFieldProps']['iptFailTTS']
						
					break;

				default: break
				}
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdSnroProcess":
					this.snroProcessGridApi = e.gridApi;
					this.snroProcessGrid    = e.grid;
					
					break;
				default: break
				}
			},
			onRowClicked: (e) => {
				ComLib.setStateRecords(this, "dsSelected", this.state.dsSnroProcessList.getRow(e.index));
				
				// 클릭을 한 번 더 했을 때 그리드에 선택된 인덱스가 풀리지 않도록 하기
				let processRows = this.snroProcessGridApi.rowModel.rowsToDisplay;
				let processRow;

				for (let i = 0; i < processRows.length; i ++) {
					if (processRows[i].data.SORT_ORD === e.data.SORT_ORD){
						processRow = this.snroProcessGridApi.rowModel.rowsToDisplay[i];
						break;
					}
				}
				processRow.setSelected(true);

				let tts = this.props.options.dsSnroTts;		
				let state = this.state;
				for (let i = 0; i < tts.length; i ++) {
					if (tts[i].SNRO_TTS_CD === e.data.SUCCESS_TTS) {
						state['textFieldProps']['iptSucTTS'].value = tts[i].SNRO_TTS_TEXT;
												
					} else if (tts[i].SNRO_TTS_CD === e.data.FAIL_TTS) {
						state['textFieldProps']['iptFailTTS'].value = tts[i].SNRO_TTS_TEXT;
												
					}
				}	
				this.setState(state);

				console.log(this.state.dsSnroProcessList)
				console.log(this.state.dsSelected)

			},
			onCellValueChanged: (e) => {				
				switch (e.id) {
				case "grdSnroProcess":	
					
					break;
		
				default: break;
				}
			},
			onDeleteRow: (e) => {
				switch (e.id) {
				case "grdSnroProcess":
					break;

				default: break;
				}
			},
			onBeforeInsertRow : (e) => {
				switch (e.id) {
				case "grdSnroProcess":
					
					break;

		
				default: break;
				}

				return {rtn: true, index: 0};
			},			
			onInsertRow : (e) => {
				switch (e.id) {
				case "grdSnroProcess":
					

					break;

		
				default: break;
				}
				
			}
		},
		input : {
			onChange: (e) => {
				let state = this.state;

				switch (e.target.id) {
				case 'iptSnroNm':

					state['textFieldProps']['iptSnroNm'].value = e.target.value;
	
					this.setState(state);
					
					break;
				case 'iptSnroSco':
					state['textFieldProps']['iptSnroNm'].value = e.target.value;
	
					this.setState(state);
					
					break;
				default: break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptSnroNm':
					
					break;

				case 'iptSnroSco':
					
					break;

				default: break;
				}

			}
		},
		selectbox: {
			onChange: (e) => {
				let state = this.state;
				let tts   = [];						
				let ttsText = '';

				state['selectboxProps'][e.target.id].selected = e.target.selectedIndex;
				state['selectboxProps'][e.target.id].value    = e.target.value;

				switch (e.target.id) {
				case 'selProcessTP':
					if (e.target.value === 'P') {
						state['selectboxProps']['selProcessExpl'].dataset = state.processArr;

					} else if (e.target.value === 'I') {
						state['selectboxProps']['selProcessExpl'].dataset = state.interfaceArr;

					} else {
						state['selectboxProps']['selProcessExpl'].dataset = [];

					}

					break;
				case 'selProcessSucNm':	
					tts = this.props.options.dsSnroTts;		
					
					for (let i = 0; i < tts.length; i ++) {
						if (tts[i].SNRO_TTS_CD === e.target.value) {
							ttsText = tts[i].SNRO_TTS_TEXT;
							
							break;
						}
					}	
					state['textFieldProps']['iptSucTTS'].value = ttsText;
					break;

				case 'selProcessFailNm':	
					tts = this.props.options.dsSnroTts;	

					for (let i = 0; i < tts.length; i ++) {
						if (tts[i].SNRO_TTS_CD === e.target.value) {
							ttsText = tts[i].SNRO_TTS_TEXT;
							
							break;
						}
					}	
					state['textFieldProps']['iptFailTTS'].value = ttsText;
					break;

				}

				this.setState(state);

			}
		}
	}


	render () {
		return (
			<React.Fragment>
				<FullPanel>
					<SubFullPanel>
						<SearchPanel>
							<RelativeGroup>
								<LFloatArea>
									<FlexPanel>
										<Label value="시나리오"/>
										<Textfield
											width       = {200}
											id          = {this.state.textFieldProps.iptSnroNm.id}
											name        = {this.state.textFieldProps.iptSnroNm.name}
											value       = {this.state.textFieldProps.iptSnroNm.value}
											readOnly    = {true}
											disabled    = {false}
										/>
										
									</FlexPanel>
								</LFloatArea>
							</RelativeGroup>
						</SearchPanel>
					</SubFullPanel>
					<SubFullPanel>
						<ComponentPanel>
							<Grid
								id          = {this.state.grdProps.grdSnroProcess.id} 
								areaName    = {this.state.grdProps.grdSnroProcess.areaName}
								header      = {this.state.grdProps.grdSnroProcess.header}
								data        = {this.state.dsSnroProcessList}
								height      = {this.state.grdProps.grdSnroProcess.height}
								addRowBtn   = {true}
								delRowBtn   = {true}
								onGridReady        = {this.event.grid.onGridReady}
								onRowClicked       = {this.event.grid.onRowClicked}
								onCellValueChanged = {this.event.grid.onCellValueChanged}
								onDeleteRow        = {this.event.grid.onDeleteRow}
								onInsertRow        = {this.event.grid.onInsertRow}
								onBeforeInsertRow  = {this.event.grid.onBeforeInsertRow}
								onSelectionChanged = {this.event.grid.onSelectionChanged}		
							/>
						</ComponentPanel>
					</SubFullPanel>
					<SubFullPanel>
						<ComponentPanel>	
							<FullPanel>
								<FlexPanel>
								<Table  
										id="tblUsrDetInfo" 
										colGrp = {[{width: '8%'}, {width: '12%'}, {width: '8%'}, {width: '26%'}, {width: '8%'}, {width: '42%'}]}
										tbData = {[
											[   {type : 'T', value : '순번'},
												{type : 'D', value : <Textfield
																		id          = {this.state.textFieldProps.iptSortOrd.id}
																		name        = {this.state.textFieldProps.iptSortOrd.name}
																		value       = {this.state.dsSelected.records[0]["SORT_ORD"]}
																		placeholder = {this.state.textFieldProps.iptSortOrd.placeholder}
																		minLength   = {this.state.textFieldProps.iptSortOrd.minLength}
																		maxLength   = {this.state.textFieldProps.iptSortOrd.maxLength}
																		readOnly    = {this.state.textFieldProps.iptSortOrd.readOnly}
																		disabled    = {this.state.textFieldProps.iptSortOrd.disabled}
																		onChange    = {this.event.input.onChange}
																	/>},	
												{type : 'T', value : '타입'},
												{type : 'D', value : <Selectbox
																		id       = {this.state.selectboxProps.selProcessTP.id}
																		value    = {this.state.dsSelected.records[0]["PROCESS_TP"]}
																		dataset  = {this.state.selectboxProps.selProcessTP.dataset}
																		width    = {this.state.selectboxProps.selProcessTP.width}
																		disabled = {this.state.selectboxProps.selProcessTP.disabled}
																		selected = {this.state.selectboxProps.selProcessTP.selected}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : '프로세스'},
												{type : 'D', value : <Selectbox
																		id       = {this.state.selectboxProps.selProcessExpl.id}
																		value    = {this.state.dsSelected.records[0]["PROCESS_CD"]}
																		dataset  = {this.state.selectboxProps.selProcessExpl.dataset}
																		width    = {this.state.selectboxProps.selProcessExpl.width}
																		disabled = {this.state.selectboxProps.selProcessExpl.disabled}
																		selected = {this.state.selectboxProps.selProcessExpl.selected}
																		onChange = {this.event.selectbox.onChange}
																	/>, colSpan : 3},											
											],
											[   {type : 'T', value : '성공 액션'},
												{type : 'D', value : <Selectbox 
																		id       = {this.state.selectboxProps.selProcessSuc.id}
																		value    = {this.state.dsSelected.records[0]["SUCCESS"]}
																		dataset  = {this.state.selectboxProps.selProcessSuc.dataset}
																		width    = {this.state.selectboxProps.selProcessSuc.width}
																		disabled = {this.state.selectboxProps.selProcessSuc.disabled}
																		selected = {this.state.selectboxProps.selProcessSuc.selected}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : 'TTS 명'},
												{type : 'D', value : <Selectbox
																		id       = {this.state.selectboxProps.selProcessSucNm.id}
																		value    = {this.state.dsSelected.records[0]["SUCCESS_TTS"]}
																		dataset  = {this.state.selectboxProps.selProcessSucNm.dataset}
																		width    = {this.state.selectboxProps.selProcessSucNm.width}
																		disabled = {this.state.selectboxProps.selProcessSucNm.disabled}
																		selected = {this.state.selectboxProps.selProcessSucNm.selected}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : 'TTS'},
												{type : 'D', value : <Textfield
																		id          = {this.state.textFieldProps.iptSucTTS.id}
																		name        = {this.state.textFieldProps.iptSucTTS.name}
																		value       = {this.state.textFieldProps.iptSucTTS.value}
																		placeholder = {this.state.textFieldProps.iptSucTTS.placeholder}
																		minLength   = {this.state.textFieldProps.iptSucTTS.minLength}
																		maxLength   = {this.state.textFieldProps.iptSucTTS.maxLength}
																		readOnly    = {this.state.textFieldProps.iptSucTTS.readOnly}
																		disabled    = {this.state.textFieldProps.iptSucTTS.disabled}
																		onChange    = {this.event.input.onChange}
																	/>, colSpan : 3}										
											],
											[   {type : 'T', value : '실패 액션'},
												{type : 'D', value : <Selectbox
																		id       = {this.state.selectboxProps.selProcessFail.id}
																		value    = {this.state.dsSelected.records[0]["FAIL"]}
																		dataset  = {this.state.selectboxProps.selProcessFail.dataset}
																		width    = {this.state.selectboxProps.selProcessFail.width}
																		disabled = {this.state.selectboxProps.selProcessFail.disabled}
																		selected = {this.state.selectboxProps.selProcessFail.selected}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : 'TTS 명'},
												{type : 'D', value : <Selectbox
																		id       = {this.state.selectboxProps.selProcessFailNm.id}
																		value    = {this.state.dsSelected.records[0]["FAIL_TTS"]}
																		dataset  = {this.state.selectboxProps.selProcessFailNm.dataset}
																		width    = {this.state.selectboxProps.selProcessFailNm.width}
																		disabled = {this.state.selectboxProps.selProcessFailNm.disabled}
																		selected = {this.state.selectboxProps.selProcessFailNm.selected}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : 'TTS'},
												{type : 'D', value : <Textfield
																		id          = {this.state.textFieldProps.iptFailTTS.id}
																		name        = {this.state.textFieldProps.iptFailTTS.name}
																		value       = {this.state.textFieldProps.iptFailTTS.value}
																		placeholder = {this.state.textFieldProps.iptFailTTS.placeholder}
																		minLength   = {this.state.textFieldProps.iptFailTTS.minLength}
																		maxLength   = {this.state.textFieldProps.iptFailTTS.maxLength}
																		readOnly    = {this.state.textFieldProps.iptFailTTS.readOnly}
																		disabled    = {this.state.textFieldProps.iptFailTTS.disabled}
																		onChange    = {this.event.input.onChange}
																	/>, colSpan : 3}										
											],
											[   {type : 'T', value : '타겟프로세스'},
												{type : 'D', value : <Textfield
																		id          = {this.state.textFieldProps.iptRtnTarget.id}
																		name        = {this.state.textFieldProps.iptRtnTarget.name}
																		value       = {this.state.dsSelected.records[0]["RTN_TARGET"]}
																		placeholder = {this.state.textFieldProps.iptRtnTarget.placeholder}
																		minLength   = {this.state.textFieldProps.iptRtnTarget.minLength}
																		maxLength   = {this.state.textFieldProps.iptRtnTarget.maxLength}
																		readOnly    = {this.state.textFieldProps.iptRtnTarget.readOnly}
																		disabled    = {this.state.textFieldProps.iptRtnTarget.disabled}
																		onChange    = {this.event.input.onChange}
																	/>},
												{type : 'D', value : <RFloatArea><Button
																		color    = 'purple' 
																		fiiled   = "o" 
																		id       = {this.state.btnProps.btnKeywordSave.id}
																		value    = {this.state.btnProps.btnKeywordSave.value}
																		disabled = {this.state.btnProps.btnKeywordSave.disabled}
																		hidden   = {this.state.btnProps.btnKeywordSave.hidden}
																		onClick  = {this.event.button.onClick}
																	/></RFloatArea>, colSpan : 6}										
											]
										]}
									/>
								</FlexPanel>
							</FullPanel>			
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default SYS080001;