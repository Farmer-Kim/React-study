// 결함등록
import React from 'react';
import {
   ComponentPanel, FlexPanel, FullPanel, SubFullPanel, RelativeGroup
} from 'components';
import {BasicButton as Button, Label} from 'components';
import {Textfield, RangeInputCalendar, Selectbox, RFloatArea} from 'components';
import {Grid, Table} from 'components';
import {ComLib, DataLib, newScrmObj, TransManager} from 'common';

class View extends React.Component {
	/*------------------------------------------------------------------------------------------------*/
	// [1. Default State Zone]
	/*------------------------------------------------------------------------------------------------*/
	constructor(props) {
		super(props);
			
		this.FaultGridApi = null;
		this.FaultChkGridApi = null;

		this.FaultGrid = null;
		this.FaultChkGrid = null;

		this.state = {	
			dsFaultList    : DataLib.datalist.getInstance(),	
			dsFaultChkList : DataLib.datalist.getInstance(),

			dsFaultData : 
				[
				
				{FT_LV:'조치요망', FT_PATH:'QA 관리 > 평가표 관리' , OCC_DT:'87-02-14', FL_CN:'평가표 저장 버튼 색 변경'   , FL_IMG:'img.jpg'      , FT_CURR:'0', DEV_NM:'', EST_FIX_DT:'', FIX_DT:'', USER_NM:'권세훈', CONF_DT:''},
				{FT_LV:'긴급'    , FT_PATH:'QA 관리 > 평가표 관리' , OCC_DT:'87-02-14', FL_CN:'평가표 조회 안됨'          , FL_IMG: ''            , FT_CURR:'1', DEV_NM:'홍길동', EST_FIX_DT:'20-10-29', FIX_DT:'', USER_NM:'권세훈', CONF_DT:''},
				{FT_LV:'조치요망', FT_PATH:'QA 관리 > 평가표 관리' , OCC_DT:'87-02-14', FL_CN:'평가표 저장 버튼 색 변경'   , FL_IMG:'img.jpg'      , FT_CURR:'2', DEV_NM:'홍길동', EST_FIX_DT:'20-10-29', FIX_DT:'20-10-30', USER_NM:'권세훈', CONF_DT:''},
				{FT_LV:'조치요망', FT_PATH:'QA 관리 > 평가표 관리' , OCC_DT:'87-02-14', FL_CN:'평가표 저장 버튼 색 변경'   , FL_IMG:'img.jpg'      , FT_CURR:'3', DEV_NM:'홍길동', EST_FIX_DT:'', FIX_DT:'', USER_NM:'권세훈', CONF_DT:''},
				{FT_LV:'조치요망', FT_PATH:'QA 관리 > 평가표 관리' , OCC_DT:'87-02-14', FL_CN:'평가표 저장 버튼 색 변경'   , FL_IMG:'img.jpg'      , FT_CURR:'4', DEV_NM:'홍길동', EST_FIX_DT:'', FIX_DT:'', USER_NM:'권세훈', CONF_DT:'20-11-11'},
				{FT_LV:'심각'    , FT_PATH:'시스템 관리 > 공통코드', OCC_DT:'20-09-25', FL_CN:'소분류 코드 저장시 서버에러', FL_IMG:'small.jpg', FT_CURR:'5', DEV_NM:'홍길동', EST_FIX_DT:'20-10-01', FIX_DT:'20-10-02', USER_NM:'권세훈', CONF_DT:'20-10-03'},	
				],
			dsFaultChkData :
				[
				{FT_CURR: '0', CONT: '실제 히스토리는 미조치->진행->조치 완료로 덮어짐', NM: '권세훈', FL_IMG: 'small.jpg'     , DATE: '20-09-25'},
				{FT_CURR: '1', CONT: ''                     , NM: '홍길동', FL_IMG: ''           , DATE: '20-09-26'},
				{FT_CURR: '2', CONT: '쿼리 수정 완료'            , NM: '홍길동', FL_IMG: 'small_fixed.jpg', DATE: '20-10-02'},				
				{FT_CURR: '4', CONT: '그래도 오류남'            , NM: '홍길동', FL_IMG: 'small_fixed.jpg', DATE: '20-10-02'},				
				{FT_CURR: '3', CONT: '오류안남 다시 확인요망'            , NM: '홍길동', FL_IMG: 'small_fixed.jpg', DATE: '20-10-02'},	
				{FT_CURR: '5', CONT: '정상 확인'                 , NM: '권세훈', FL_IMG: ''               , DATE: '20-10-03'},
				],


			rangeCalendarProps : {
				calDate : {
					id      : 'calDate',
					startDate : '20200801',
					endDate   : '20200831',
				}
			},

			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
				btnUserSearch : {
					id       : 'btnUserSearch',
					disabled : false,
					value    : '사용자 검색',
					hidden   : false
				},
				btnDevSearch : {
					id       : 'btnDevSearch',
					disabled : false,
					value    : '담당자 검색',
					hidden   : false
				}
			},
			
			grdProps : {
				grdFault : {
					id : 'grdFault',
					areaName : '결함리스트',
					header: [
						{headerName: '결함등급'   ,	field: 'FT_LV',	        colId: 'FT_LV',      editable: false, width: 100, textAlign: 'center'},
						{headerName: '화면경로'   ,	field: 'FT_PATH',		colId: 'FT_PATH',	 editable: false, width: 200},
						{headerName: '발생일자'   ,	field: 'OCC_DT',		colId: 'OCC_DT',	 editable: false, width: 100, textAlign: 'center'},
						{headerName: '결함 내용'  ,	field: 'FL_CN',		    colId: 'FL_CN',	     editable: false, width: 300},
						{headerName: '결함이미지' ,	field: 'FL_IMG',		colId: 'FL_IMG',	 editable: false, width: 100, textAlign: 'center'},
						{headerName: '진행상태'   ,	field: 'FT_CURR',	    colId: 'FT_CURR',	 editable: false, width: 100, textAlign: 'center',
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('FT_CURR')},
							valueFormatter : (param) => ComLib.getComCodeName('FT_CURR', param.value)},
						{headerName: '조치 담당자',	field: 'DEV_NM',		colId: 'DEV_NM',	 editable: false, width: 100, textAlign: 'center'},
						{headerName: '조치예정일자', field: 'EST_FIX_DT',	colId: 'EST_FIX_DT', editable: false, width: 100, textAlign: 'center'},
						{headerName: '조치일자'    , field: 'FIX_DT',		colId: 'FIX_DT',	 editable: false, width: 100, textAlign: 'center'},
						{headerName: '결함 등록자' , field: 'USER_NM',		colId: 'USER_NM',	 editable: false, width: 100, textAlign: 'center'},
						{headerName: '확인일자'    , field: 'CONF_DT',		colId: 'CONF_DT',	 editable: false, width: 100, textAlign: 'center', resizable: false},
					],
				},
				grdFaultChk : {
					id : 'grdFaultChk',
					areaName : '조치,확인 리스트',
					header: [
						{headerName: '진행상태'   ,	field: 'FT_CURR',	    colId: 'FT_CURR',	 editable: false, width: 100, textAlign: 'center',
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('FT_CURR')},
							valueFormatter : (param) => ComLib.getComCodeName('FT_CURR', param.value)},
						{headerName: '조치 / 확인'    ,	field: 'CONT',	    colId: 'CONT',   editable: false, width: 700},
						{headerName: '담당자 / 등록자',	field: 'NM',		 colId: 'NM',	   editable: false, width: 100, textAlign: 'center'},
						{headerName: '화면이미지'     ,	field: 'FL_IMG',	 colId: 'FL_IMG',  editable: false, width: 100, textAlign: 'center'},
						{headerName: '일시'           ,	field: 'DATE',		colId: 'DATE',	  editable: false, width: 200, textAlign: 'center', resizable: false},
					],
				}											
			},
			summery : {
				reject    : 0,
				abnormal  : 0,
				inProcess : 0,
				fixed     : 0,
				confirmed : 0,
			},
			textFieldProps : {
				iptFaultTP : {
					id          : 'iptFaultTP',
					name        : 'iptFaultTP',
					value       : '',
					placeholder : '결함 등급',
					minLength   : 1,
					maxLength   : 10,
					readOnly    : false,
					disabled    : false
				},
				iptFaultCont : {
					id          : 'iptFaultCont',
					name        : 'iptFaultCont',
					value       : '',
					placeholder : '결함 내용',
					minLength   : 1,
					maxLength   : 50,
					readOnly    : false,
					disabled    : false
				},
				iptUserNm : {
					id          : 'iptUserNm',
					name        : 'iptUserNm',
					value       : '',
					placeholder : '결함 등록자',
					minLength   : 1,
					maxLength   : 10,
					readOnly    : false,
					disabled    : false
				},
				iptDevNm : {
					id          : 'iptDevNm',
					name        : 'iptDevNm',
					value       : '',
					placeholder : '조치 담당자',
					minLength   : 1,
					maxLength   : 3,
					readOnly    : false,
					disabled    : false
				},
				
			},
			selectboxProps : {
				selDateType : {
					id : 'selDateType',
					dataset : ComLib.convComboList(ComLib.getCommCodeList("DATE_TYPE"), newScrmObj.constants.select.argument.all),
					width : 80,
					selected : 0,
					disabled : false
				},
				selProcessType : {
					id : 'selProcessType',
					dataset : ComLib.convComboList(ComLib.getCommCodeList("FT_CURR"), newScrmObj.constants.select.argument.all),
					width : 80,
					selected : 0,
					disabled : false
				},
			},			
			
		}
   }

   /*------------------------------------------------------------------------------------------------*/
   // [2. OnLoad Event Zone]
   /*------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		
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
				case 'btnSearch':
					ComLib.setStateInitRecords(this, "dsFaultList", this.state.dsFaultData);
					ComLib.setStateInitRecords(this, "dsFaultChkList", this.state.dsFaultChkData);
					
					let state = this.state;
					
					state['summery'].abnormal  = '1';
					state['summery'].inProcess = '1';
					state['summery'].confirmed = '1';

					this.setState(state);

				break;

				case 'btnUserSearch':
					let option1 = { type: 'searchUser', width: '600px', height: '830px', modaless: false, callback :  () => {} }
					ComLib.openPop('STA030002', '사용자 검색', option1);
					
				break;

				case 'btnDevSearch':
					let option2 = { type: 'searchDev', width: '600px', height: '830px', modaless: false, callback :  () => {} }
					ComLib.openPop('STA030002', '담당자 검색', option2);
				break;

				default : break;
				}
			}
		},

		inputcalendar : {
			onCalendarClose : (e) => {
				switch (e.target.id) {
				case 'iptRangeCalStrt' : break;
				default : break;
				}
			},
			onCalendarOpen : (e) => {
				switch (e.target.id) {
				case 'iptRangeCalEnd' : break;
				default : break;
				}
			},
			onChange : (e) => {
				switch (e.target.id) {
				case 'calDate' :
					
				break;
				default : break;
				}
			}
		},
		selectbox : {
			onChange : (e) => {
				switch (e.id) {
				case 'cmbSrchVState' :		
				break;			
				default : break;
				}
			}
		},
		grid: {
			onGridReady : (e) => {
				switch (e.id) {
				case "grdFault":
					this.FaultGridApi = e.gridApi;
					this.FaultGrid    = e.grid;
					
					break;

				case "grdFaultChk":
					this.FaultChkGridApi = e.gridApi;
					this.FaultChkGrid    = e.grid;

					break;

				default: break
				}
				
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdFault":
					//console.log(e)
					
					break;

				case "grdFaultChk":
					console.log(e)

					break;		
				default: break;
				}
			},
			onRowDoubleClicked: (e) => {
				switch (e.id) {
				case "grdFault":
					console.log(e)
					let optionWidth1 = '1200px';
					if (e.data.FT_CURR === '0') {
						optionWidth1 = '650px';
					}
					let option1 = { width: optionWidth1, height: '830px', data: e.data, type: 'add', modaless: false, callback : () => {} }
					ComLib.openPop('STA030003', '결함상세화면', option1);
					break;

				case "grdFaultChk":
					console.log(e)
					let optionWidth2 = '1200px';
					if (e.data.FT_CURR === '0') {
						optionWidth2 = '650px';
					}
					let option2 = { width: optionWidth2, height: '830px', data: e.data, type: 'old', modaless: false, callback : () => {} }
					ComLib.openPop('STA030003', '결함조치 이력화면', option2);
					break;		
				default: break;
				}
			},
			onCellClicked: (e) => {
				switch (e.id) {
				case "grdFault":					
					if (e.col === 'FL_IMG') {
						let option1 = { width: '1200px', height: '830px', modaless: false, callback : (e) => {console.log(e)} }
						ComLib.openPop('STA030001', '이미지 미리보기', option1);
						
					} else if (e.col === 'EST_FIX_DT') {
						alert("달력 팝업 하여 날짜 입력 가능하게 (미조치 상태 또는 진행 상태 일떄, 담당자가 배정 되었을때, 해당담당자만 입력 가능)")
					}
					
					break;

				case "grdFaultChk":
					if (e.col === 'FL_IMG') {
						let option1 = { width: '1200px', height: '830px', modaless: false, callback : () => {} }
						ComLib.openPop('STA030001', '이미지 미리보기', option1);
					 
					}

					break;		
				default: break;
				}
			},
			onInsertRow: () => {

			},
			onDeleteRow: () => {
				
			},
			onBeforeInsertRow: (e) => {
				console.log(e)
				let option1 = { width: '650px', height: '830px', type: 'new', modaless: false, callback : () => {} }
				ComLib.openPop('STA030003', '결함 등록', option1);

				return {rtn: false};
			},
			onBeforeDeleteRow: (e) => {
				console.log(e)

				return false;							
			},
		}
	}

   /*------------------------------------------------------------------------------------------------*/
   // [7. render Zone]
   //  - 화면 관련 내용 작성
   /*------------------------------------------------------------------------------------------------*/

	render () {				
		return (
		<React.Fragment>
			<FullPanel>
				<ComponentPanel>
					<FlexPanel>
						<Table  
							id="tblSrchUsrMenuInfo" 
							colGrp = {[{width: '10%'}, {width: '15%'}, {width: '10%'}, {width: '10%'},{width: '15%'}, {width: '40%'} ]}
							tbData = {[
								[   {type : 'T', value : '결함등급'},
									{type : 'D', value : <Textfield
															id          = {this.state.textFieldProps.iptFaultTP.id}
															name        = {this.state.textFieldProps.iptFaultTP.name}
															value       = {this.state.textFieldProps.iptFaultTP.value}
															placeholder = {this.state.textFieldProps.iptFaultTP.placeholder}
															minLength   = {this.state.textFieldProps.iptFaultTP.minLength}
															maxLength   = {this.state.textFieldProps.iptFaultTP.maxLength}
															readOnly    = {this.state.textFieldProps.iptFaultTP.readOnly}
															disabled    = {this.state.textFieldProps.iptFaultTP.disabled}
														/>, colSpan: 2 },	
									{type : 'T', value : '일자구분'},
									{type : 'D', value : <Selectbox
															id       = {this.state.selectboxProps.selDateType.id}
															value    = {this.state.selectboxProps.selDateType.value}
															dataset  = {this.state.selectboxProps.selDateType.dataset}
															disabled = {this.state.selectboxProps.selDateType.disabled}
															selected = {this.state.selectboxProps.selDateType.selected}
														/>},
									{type : 'D', value : <RangeInputCalendar
															id        = {this.state.rangeCalendarProps.calDate.id}
															endId     = {this.state.rangeCalendarProps.calDate.endId}
															startDate = {this.state.rangeCalendarProps.calDate.startDate}
															endDate   = {this.state.rangeCalendarProps.calDate.endDate}
															onChange  = {this.event.inputcalendar.onChange}
														/>}										
								],
								[
									{type : 'T', value : '진행상태'},
									{type : 'D', value : <Selectbox
															id       = {this.state.selectboxProps.selProcessType.id}
															value    = {this.state.selectboxProps.selProcessType.value}
															dataset  = {this.state.selectboxProps.selProcessType.dataset}
															disabled = {this.state.selectboxProps.selProcessType.disabled}
															selected = {this.state.selectboxProps.selProcessType.selected}
														/>, colSpan: 2},
									{type : 'T', value : '결함내용'},
									{type : 'D', value : <Textfield
															id          = {this.state.textFieldProps.iptFaultCont.id}
															name        = {this.state.textFieldProps.iptFaultCont.name}
															value       = {this.state.textFieldProps.iptFaultCont.value}
															placeholder = {this.state.textFieldProps.iptFaultCont.placeholder}
															minLength   = {this.state.textFieldProps.iptFaultCont.minLength}
															maxLength   = {this.state.textFieldProps.iptFaultCont.maxLength}
															readOnly    = {this.state.textFieldProps.iptFaultCont.readOnly}
															rows        = {this.state.textFieldProps.iptFaultCont.rows}
														/>, colSpan: 2}					
									
								],
								[
									{type : 'T', value : '결함 등록자'},
									{type : 'D', value :  <Textfield
															id          = {this.state.textFieldProps.iptUserNm.id}
															name        = {this.state.textFieldProps.iptUserNm.name}
															value       = {this.state.textFieldProps.iptUserNm.value}
															placeholder = {this.state.textFieldProps.iptUserNm.placeholder}
															minLength   = {this.state.textFieldProps.iptUserNm.minLength}
															maxLength   = {this.state.textFieldProps.iptUserNm.maxLength}
															readOnly    = {this.state.textFieldProps.iptUserNm.readOnly}
															disabled    = {this.state.textFieldProps.iptUserNm.disabled}
														/>},
									{type : 'D', value :  <Button
															id         = {this.state.btnProps.btnUserSearch.id}
															value      = {this.state.btnProps.btnUserSearch.value}
															disabled   = {this.state.btnProps.btnUserSearch.disabled}
															hidden     = {this.state.btnProps.btnUserSearch.hidden}
															onClick    = {this.event.button.onClick}
															fiiled     = {true}
															innerImage = {true}
															icon       = {'srch'}
														/>},
									{type : 'T', value : '담당자'},
									{type : 'D', value :  <Textfield
															id          = {this.state.textFieldProps.iptDevNm.id}
															name        = {this.state.textFieldProps.iptDevNm.name}
															value       = {this.state.textFieldProps.iptDevNm.value}
															placeholder = {this.state.textFieldProps.iptDevNm.placeholder}
															minLength   = {this.state.textFieldProps.iptDevNm.minLength}
															maxLength   = {this.state.textFieldProps.iptDevNm.maxLength}
															readOnly    = {this.state.textFieldProps.iptDevNm.readOnly}
															disabled    = {this.state.textFieldProps.iptDevNm.disabled}
														/>},
									{type : 'D', value :  <Button
															id         = {this.state.btnProps.btnDevSearch.id}
															value      = {this.state.btnProps.btnDevSearch.value}
															disabled   = {this.state.btnProps.btnDevSearch.disabled}
															hidden     = {this.state.btnProps.btnDevSearch.hidden}
															onClick    = {this.event.button.onClick}
															fiiled     = {true}
															innerImage = {true}
															icon       = {'srch'}
														/>},

								]
							]}
						/>
						<Button
							id       = {this.state.btnProps.btnSearch.id}
							value    = {this.state.btnProps.btnSearch.value}
							disabled = {this.state.btnProps.btnSearch.disabled}
							hidden   = {this.state.btnProps.btnSearch.hidden}
							onClick  = {this.event.button.onClick}
							mr       = {20}
						/>
					</FlexPanel>
				</ComponentPanel>
				<ComponentPanel>
					<RelativeGroup>	
						<RFloatArea>
							<Label value={"반려 : "         + this.state.summery.reject}/>		
							<Label value={"미조치/비정상 : " + this.state.summery.abnormal}/>	
							<Label value={"진행 : "         + this.state.summery.inProcess}/>	
							<Label value={"조치완료 : "     + this.state.summery.fixed}/>	
							<Label value={"최종완료 : "     + this.state.summery.confirmed}/>	
						</RFloatArea>	
					</RelativeGroup>
					<SubFullPanel>
						<Grid						
							id        = {this.state.grdProps.grdFault.id} 
							areaName  = {this.state.grdProps.grdFault.areaName} 
							header    = {this.state.grdProps.grdFault.header}
							data      = {this.state.dsFaultList}
							height    = "300px"
							rowNum    = {true}

							onGridReady        = {this.event.grid.onGridReady}
							onRowClicked       = {this.event.grid.onRowClicked}
							onRowDoubleClicked = {this.event.grid.onRowDoubleClicked}
							onCellClicked      = {this.event.grid.onCellClicked}
							onBeforeInsertRow  = {this.event.grid.onBeforeInsertRow}									
							onBeforeDeleteRow  = {this.event.grid.onBeforeDeleteRow}
							onDeleteRow        = {this.event.grid.onDeleteRow}
							onInsertRow        = {this.event.grid.onInsertRow}
						/>
					</SubFullPanel>
					<SubFullPanel>						
						<Grid						
							id        = {this.state.grdProps.grdFaultChk.id} 
							areaName  = {this.state.grdProps.grdFaultChk.areaName} 
							header    = {this.state.grdProps.grdFaultChk.header}
							data      = {this.state.dsFaultChkList}
							height    = "200px"
							rowNum    = {true}
							addRowBtn = {false}
							delRowBtn = {false}

							onGridReady        = {this.event.grid.onGridReady}
							onRowClicked       = {this.event.grid.onRowClicked}
							onRowDoubleClicked = {this.event.grid.onRowDoubleClicked}
							onCellClicked      = {this.event.grid.onCellClicked}
						/>
					</SubFullPanel>
				</ComponentPanel>
			</FullPanel>
		</React.Fragment>
		)
	}
}

export default View;