// STT인식률측정
import React from 'react';
import {
	SearchPanel, ComponentPanel, FullPanel, SubFullPanel, RFloatArea} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {RangeInputCalendar, Selectbox} from 'components';
import {Table, Grid} from 'components';
import {ComLib, DataLib, StrLib, TransManager, newScrmObj} from 'common';

class View extends React.Component {
	constructor(props) {
		super();

		this.state = {
			dsAccSwt : DataLib.datalist.getInstance(),

			lastSelAccType    : '',
			lastSelSearchType : '',
			lastCcalSearchDate: '',
			lastCalSearchDate : '',

			selectboxProps : {
				selAccType : {
					id       : 'selAccType',
					label    : '측정 상태',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList("STT_TBL_ACC_ANS","ACC_FLAG"), newScrmObj.constants.select.argument.all),
					width    : 200,
					selected : 0,
					disabled : false
				},   
				selSearchType : {
					id       : 'selSearchType',
					label    : '일자 타입',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList("STT_TBL_ACC_ANS","DATE_TYPE"), newScrmObj.constants.select.argument.select),
					width    : 200,
					selected : 0,
					disabled : false
				}, 
			},
			btnProps : {
				btnSearch: {
					id    : 'btnSearch',				
					value : '조회'
				}
			},
			rangeCalendarProps : {
				calSearchDate : {
					id        : 'calSearchDate',
					stId      : 'calSearchDateStart',
					endId     : 'calSearchDateEnd',
					startDate : null,
					endDate   : null
				}
			},			
			gridProps : {
				grdAccSwt : {
					id       : 'grdAccSwt',
					areaName : 'STT인식률측정',
					height   : '610px',
					header   : [
									{headerName: '센터명',		field: 'CENT_NM',		colId: 'CENT_NM'},
									{headerName: '파트명',		field: 'PART_NM',		colId: 'PART_NM'},
									{headerName: '팀명',		field: 'TEAM_NM',		colId: 'TEAM_NM'},
									{headerName: '상담원명',	field: 'USR_NM',		colId: 'USR_NM'},
									{headerName: '제출일자',	field: 'SUBMIT_DT',		colId: 'SUBMIT_DT'},
									{headerName: '상담일자',	field: 'CALL_ST_DT',	colId: 'CALL_ST_DT'},
									{headerName: '측정일자',	field: 'REG_DT',		colId: 'REG_DT'},
									{headerName: '내용보기',	field: 'ACC_CONT',	    colId: 'ACC_CONT', 
										cellRenderer: 'actionButton', 
										fiiled: true,
									},
									{headerName: '인식율',	    field: 'ACC',			colId: 'ACC'},
									{headerName: '인식율내역',	field: 'ACC_HISTORY',	colId: 'ACC_HISTORY', 
										cellRenderer: 'actionButton', 
										fiiled: true,
										color: 'red',
									},
								],				
					paging : {
						start: 0,
						size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
						page : 1
					},	
				}
			}
		}
	}

	componentDidMount () {

	}
	
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STT060000_R01':
			let state = this.state;	
			// let accType = state['selectboxProps']['selAccType'].value
			let searchType = state['selectboxProps']['selSearchType'].value
			let searchDateS = state['rangeCalendarProps']['calSearchDate'].startDate
			let searchDateE = state['rangeCalendarProps']['calSearchDate'].endDate

			// if (StrLib.isNull(accType)) {
			// 	ComLib.openDialog('A', 'SYSI0010', ['측정상태 미선택']);	

			// 	return false;
			// }

			if (StrLib.isNull(searchType)) {
				ComLib.openDialog('A', 'SYSI0010', ['일자타입 미선택']);	

				return false;
			}

			if (StrLib.isNull(searchDateS) || StrLib.isNull(searchDateE)) {
				ComLib.openDialog('A', 'SYSI0010', ['일자 미선택']);	

				return false;
			}
			
			break;
		default : break;
		}
		return true;
	}
	handler = {
		setDs : (transId) => {
			switch (transId) {
			case "STT060000_R01":

				let state = this.state;

				state['gridProps']['grdAccSwt']['paging'].start = 0;
				state['gridProps']['grdAccSwt']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('STT060000_R01');
				});
				break;
			default: break;
			}
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (serviceid) => {
		let transManager = new TransManager();	
		let state       = this.state;	
		
		let accType, searchType, searchDateS, searchDateE = '';
		let pageStart   = state['gridProps']['grdAccSwt']['paging'].start
		let pageLimit   = state['gridProps']['grdAccSwt']['paging'].size
		let pageEnd     = state['gridProps']['grdAccSwt']['paging'].page


		transManager.setTransId(serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try {
			switch (serviceid) {	
			case 'STT060000_R01':				
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STT.R_getAccRateList",
					datasetsend:"dsSearch",
					datasetrecv:"dsAccSwt",
				});
				
				accType     = state['selectboxProps']['selAccType'].value
				searchType  = state['selectboxProps']['selSearchType'].value
				searchDateS = state['rangeCalendarProps']['calSearchDate'].startDate
				searchDateE = state['rangeCalendarProps']['calSearchDate'].endDate

				transManager.addDataset('dsSearch',	[{	STD_FLAG    : accType,
														STD_TYPE    : searchType,
														S_DATE      : searchDateS,
														E_DATE      : searchDateE,
														QUERY_START : pageStart,
													 	QUERY_LIMIT : pageLimit,
													 	QUERY_PAGE  : pageEnd
													}]);
				
				transManager.agent();

				break;

			case 'STT060000_R02':				
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STT.R_getAccRateList",
					datasetsend:"dsSearch",
					datasetrecv:"dsAccSwt",
				});	
				accType     = state.lastSelAccType;
				searchType  = state.lastSelSearchType;
				searchDateS = state.lastCcalSearchDate;
				searchDateE = state.lastCalSearchDate;

				transManager.addDataset('dsSearch',	[{	STD_FLAG    : accType,
														STD_TYPE    : searchType,
														S_DATE      : searchDateS,
														E_DATE      : searchDateE,
														QUERY_START : pageStart,
													 	QUERY_LIMIT : pageLimit,
													 	QUERY_PAGE  : pageEnd
													}]);
				
				transManager.agent();

				break;

			default: break;
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
		case 'STT060000_R01':
			// let dsAccSwt = res.data.dsAccSwt;
			let test = [{CENT_NM: '강제', PART_NM: '데이터', REG_DT: '2222-22-22', CALL_ST_DT: '1111-11-11', totalcount: 2, ACC_FLAG: 'N',ACC_CONT: 'srch', ACC_HISTORY:'' },
			            {CENT_NM: '강제2', PART_NM: '데이터2', REG_DT: '2222-22-11', CALL_ST_DT: '1111-11-22', totalcount: 2, ACC_FLAG: 'Y',ACC_CONT: 'srch', ACC_HISTORY:'fileText'},];						
			let state = this.state;
			
			state.lastSelAccType     = state['selectboxProps']['selAccType'].value
			state.lastSelSearchType  = state['selectboxProps']['selSearchType'].value
			state.lastCcalSearchDate = state['rangeCalendarProps']['calSearchDate'].startDate
			state.lastCalSearchDate  = state['rangeCalendarProps']['calSearchDate'].endDate

			this.setState(state, ComLib.setStateInitRecords(this, "dsAccSwt", test))
			// this.setState(state, ComLib.setStateInitRecords(this, "dsAccSwt", dsAccSwt))

			console.log(state)
			break;	
		case 'STT060000_R02':
			let dsAccSwt = res.data.dsAccSwt;	

			ComLib.setStateInitRecords(this, "dsAccSwt", dsAccSwt);
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
				if (this.validation("STT060000_R01")) this.handler.setDs('STT060000_R01');
				break;		
			default : break;
			}
			}
		},
		grid: {	
			onScrollEnd: (e) => {
				let state = this.state;

				state['gridProps']['grdAccSwt']['paging'].start = state['gridProps']['grdAccSwt']['paging'].start + state['gridProps']['grdAccSwt']['paging'].size;
				state['gridProps']['grdAccSwt']['paging'].page  = state['gridProps']['grdAccSwt']['paging'].page + 1;


				this.setState(state, () => {
					this.transaction('STT060000_R02');
				});
			},
			onCellValueChanged: (e) => {
				switch (e.id) {
				case "grdAccSwt":			

					break;
				default: break;
				}
			},			
			onGridReady : (e) => {
				switch (e.id) {
				case "grdAccSwt":

					break;
				default: break;
				}
			},

			onInsertRow : (e) => {		
				switch (e.id) {
				case "grdAccSwt":	

					break;
				default: break;
				}
			},
			onActionCellClicked : (e) => {				
				switch (e.id) {
				case "grdAccSwt":	
					switch (e.col) {
					case "ACC_CONT":
						console.log(e.data)
						let params = e.data
						let option = { width: '1200px', height: '750px', modaless: false, params}
						ComLib.openPop('STT060001', '상담내용(' + e.data.CALL_ST_DT + ')', option);
						break;

					case "ACC_HISTORY":
						console.log(e.data)
						if (e.data.ACC_FLAG === 'N') {
							ComLib.openDialog('A', 'SYSI0010', ['인식율 내역이 없습니다.']);	
						}
						break;

					default: break;
					}

					break;

				default: break;
				}
			}
		},

		inputcalendar : {		
			onChange : (e) => {					
				switch (e.target.id) {									
				case 'calSearchDate' :	
					let state = this.state;

					state['rangeCalendarProps']['calSearchDate'].startDate = e.startDate;
					state['rangeCalendarProps']['calSearchDate'].endDate   = e.endDate;	

					this.setState(state);

					break;
				default : break;
				}				
			},
			// onFocusChange : (e) => {
			// 	switch (e.target.id) {
			// 	case 'iptRangeCal' :
			// 		this.setState({...this.state, rangeCalendarProps : {...this.state.rangeCalendarProps, focusedInput : e.focusedInput}});
			// 		break;
			// 	default : break;
			// 	}
			// }
		},

		selectbox : {
			onChange : (e) => {	
				let state = this.state;

				state['selectboxProps'][e.id].selected = e.target.selectedIndex;
				state['selectboxProps'][e.id].value    = e.target.value;	

				this.setState(state);
			}
		},
	}

	/*------------------------------------------------------------------------------------------------*/
	// [7. render Zone]
	//  - 화면 관련 내용 작성
	/*------------------------------------------------------------------------------------------------*/
	render () {
		return (
			<React.Fragment>
				<FullPanel>
					<SearchPanel>
						<Table  
							colGrp = {[{width: '5%'}, {width: '15%'}, {width: '5%'}, {width: '10%'}, {width: '20%'},{width: '50%'}]}
							tbData = {[[  					
										{type : 'D', value : <div style={{marginTop:'-9px'}}><Label value={this.state.selectboxProps.selAccType.label}/></div> },
										{type : 'D', value : <Selectbox
																id       = {this.state.selectboxProps.selAccType.id}
																dataset  = {this.state.selectboxProps.selAccType.dataset}								
																width    = {this.state.selectboxProps.selAccType.width}
																disabled = {this.state.selectboxProps.selAccType.disabled}
																selected = {this.state.selectboxProps.selAccType.selected}
																onChange = {this.event.selectbox.onChange}
															/> },
										{type : 'D', value : <div style={{marginTop:'-9px'}}><Label value={this.state.selectboxProps.selSearchType.label}/></div> },
										{type : 'D', value : <Selectbox
																id       = {this.state.selectboxProps.selSearchType.id}
																dataset  = {this.state.selectboxProps.selSearchType.dataset}								
																width    = {this.state.selectboxProps.selSearchType.width}
																disabled = {this.state.selectboxProps.selSearchType.disabled}
																selected = {this.state.selectboxProps.selSearchType.selected}
																onChange = {this.event.selectbox.onChange}
															/> },
										{type : 'D', value : <RangeInputCalendar
																id        = {this.state.rangeCalendarProps.calSearchDate.id}
																strtId    = {this.state.rangeCalendarProps.calSearchDate.stId}
																endId     = {this.state.rangeCalendarProps.calSearchDate.endId}
																startDate = {this.state.rangeCalendarProps.calSearchDate.startDate}
																endDate   = {this.state.rangeCalendarProps.calSearchDate.endDate}
																onChange  = {this.event.inputcalendar.onChange}
															/>},
										{type : 'D', value : <RFloatArea>
																<Button 
																	id         = {this.state.btnProps.btnSearch.id}
																	color      = 'blue' 
																	fiiled     = "o"
																	innerImage = {true} 
																	icon       = {'srch'} 
																	mt         = {5}
																	value      = {this.state.btnProps.btnSearch.value}								
																	onClick    = {this.event.button.onClick}										
																/>
															</RFloatArea> },	
									]]}
						/>		
					</SearchPanel>
					<SubFullPanel>
						<ComponentPanel>
							<Grid
								id       = {this.state.gridProps.grdAccSwt.id} 
								areaName = {this.state.gridProps.grdAccSwt.areaName}
								header   = {this.state.gridProps.grdAccSwt.header}
								data     = {this.state.dsAccSwt}
								height   = {this.state.gridProps.grdAccSwt.height}
								rowNum   = {true}		
								
								paging   = {true}
								infinite = {true}

								totalRowCnt = {(this.state.dsAccSwt.getRecords().length === 0) ? 0 : this.state.dsAccSwt.getValue(0, 'totalcount')}
								
								onScrollEnd       = {this.event.grid.onScrollEnd}		
								onActionCellClicked={this.event.grid.onActionCellClicked}	
							/>
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;