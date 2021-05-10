//STT 결과조회
import React from 'react';

import {
	ComponentPanel, FullPanel,  RFloatArea, RelativeGroup, LFloatArea, FlexPanel, SearchPanel} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {RangeInputCalendar, Selectbox, Textfield} from 'components';
import {Grid} from 'components';
import {StrLib, TransManager, ComLib, DataLib, newScrmObj, DateLib} from 'common';

class View extends React.Component {
	constructor(props) {
		super();

		this.sttResultGrdApi = null;
		this.sttResultGrd    = null;

		this.state = {
			buttonProps : {
				btnSearchProps : {
					id : 'btnJobFileSearchList',
					disabled : false,
					value : '조회',
					hidden : false
				},
			},
			gridSttResultList : {
				areaName : 'STT결과조회',
				id : 'gridSttResultList',
				infoCheckBox :  {
					use : true,
					colId : 'CHK',
				},
				header : 				
				[
					
					 {headerName: '콜 아이디',	field: 'CALL_ID',		colId: 'CALL_ID',		editable: true, width : '300' }
					,{headerName: '콜구분',	field: 'CALL_TP',		colId: 'CALL_TP',		editable: false, width : '130', textAlign: 'center', 
						valueFormatter : (params) => { return ComLib.getComCodeName('CMN', params.value,'CALL_TP')}
					}
					,{headerName: '작업구분',	field: 'JOB_TP',	    colId: 'JOB_TP',	editable: false, width : '120', textAlign: 'center', 
						valueFormatter : (params) => { return ComLib.getComCodeName('CMN', params.value,'JOB_TP')}
					}				
					,{headerName: '등록일시',	field: 'REG_DTM',	    colId: 'REG_DTM',	editable: false, width : '200'}	
					,{headerName: '센터',		field: 'CENT_NM',		colId: 'CENT_NM',	editable: false, width : '120'}
					,{headerName: '팀',			field: 'TEAM_NM',	    colId: 'TEAM_NM',	editable: false, width : '120'}					
					,{headerName: '상담원',	    field: 'CONST_NM',		colId: 'CONST_NM',  editable: false, width : '100', textAlign: 'center'}										
					,{headerName: '작업상태',   field: 'JOB_STATE',    colId: 'JOB_STATE',  editable: false, width : '100', textAlign: 'center', 
						valueFormatter : (params) => { return ComLib.getComCodeName('STT_JOB_INFO', params.value, 'JOB_STATE') }
					}
					,{headerName: '에러코드',	field: 'ERR_CD',		colId: 'ERR_CD',	editable: false, width : '130',
						tooltipComponent: 'customTooltip', tooltipField: "ERR_CONT" }
					,{headerName: '상담내용',	field: 'ACTION_ICON',	colId: 'ACTION_ICON', width : '80', 
						cellRenderer: 'actionButton', 
						fiiled: true,
						color: 'blue'
					},
				],
				paging : {
					start: 0,
					size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
					loading: false
				},	
			},
			rangeCalendarProps : {
				rgcSearchJob : {
					label : '등록일시',
					id : 'searchJobDateCalender',
					strtId : 'searchJobDateCalenderStart',
					endId : 'searchJobDateCalenderEnd',
					startDate : DateLib.getAddMonth(DateLib.getToday(), -3),
					endDate : DateLib.getToday(),
				}
			},
			selectboxProps : {
				selJobStateSearch : {
					id : 'selJobStateSearch',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('STT_JOB_INFO', 'JOB_STATE'), newScrmObj.constants.select.argument.all),
					width : 120,
					selected : 0,
					disabled : false,
					label : "작업상태"
				},
				selCenterList : {
					id : 'selCenterList',
					dataset : ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.all),
					width : 120,
					selected : 0,
					disabled : false,
					label : "센터"
				},
				selTeamList : {
					id : 'selTeamList',
					width : 120,
					selected : 0,
					disabled : false,
					label : "팀",
					value : '',

				},
				selUserList : {
					id : 'selUserList',
					width : 120,
					selected : 0,
					disabled : false,
					label : "상담원명",
					value : '',
				},
				selReqUserList : {
					id : 'selReqUserList',
					width : 120,
					selected : 0,
					disabled : false,
					label : "요청자명",
					value : '',
				}
			},
			textFieldProps : {
				iptSearch : {
					id : 'iptSearch',
					name : 'iptSearch',
					value : '',
					placeholder : '',
					minLength : 1,
					maxLength : 255,
					readOnly : false,
					disabled : false,
					label : '콜아이디',
					
				}
			},
			dsSttResultInfo : DataLib.datalist.getInstance(),
			dsSrch: DataLib.datalist.getInstance([{CENT_CD: ComLib.setOrgComboValue("CENT_CD"), TEAM_CD: ComLib.setOrgComboValue("TEAM_CD"), USR_CD: ""}]),
			// dsGrp: DataLib.datalist.getInstance([{CENT_CD: "", TEAM_CD: ComLib.setOrgComboValue("TEAM_CD"), USR_CD: ""}]), disabled : false,			
		}
		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.inputcalendar.onChange = this.event.inputcalendar.onChange.bind(this);
		this.event.input.onChange   = this.event.input.onChange.bind(this);
	}

	/*------------------------------------------------------------------------------------------------*/
		// [2. React Lifecycle Method Zone] ==> 리액트 컴포넌트 생명주기 메소드
		// 참고 site : https://ko.reactjs.org/docs/react-component.html#constructor
	/*------------------------------------------------------------------------------------------------*/
	/*------------------------------------------------------------------------------------------------*
		1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
		=> 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	 ------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		if (this.validation("STT030000_R01")) this.transaction("STT030000_R01");

	}
	/*------------------------------------------------------------------------------------------------*
		2) componentDidUpdate () => 갱신이 일어나 직후에 호춮 (최초 렌더링 시에는 호출되지 않음)
		=> prevProps와 현재 props를 비교할 수 있음 -> 조건문으로 감싸지 않고 setState를 실행할 시, 무한 반복 가능성 -> 반드시 setState를 쓰려면 조건문으로 작성
	 ------------------------------------------------------------------------------------------------*/
	componentDidUpdate (prevProps, prevState, snapshot) {
		
	}
	/*------------------------------------------------------------------------------------------------*
		3) componentWillUnmount () => 컴포넌트가 마운트 해제되어 제거되기 직전에 호출
		=> 타이머 제거, 네트워크 요청 취소 등 수행 -> 마운트가 해제되기 때문에 setState를 호출하면 안됨
	 ------------------------------------------------------------------------------------------------*/
	componentWillUnmount () {

	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (transId) => {

		switch (transId) {
			case 'STT030000_R01' :
				if(StrLib.isNull(this.state.rangeCalendarProps.rgcSearchJob.startDate) || StrLib.isNull(this.state.rangeCalendarProps.rgcSearchJob.endDate) )  {
					ComLib.openDialog('A', 'COME0004', ['시작일자', '종료일자']);
					return false;
				}
				if(this.state.rangeCalendarProps.rgcSearchJob.startDate > this.state.rangeCalendarProps.rgcSearchJob.endDate ) {
					ComLib.openDialog('A', 'SYSI0010', ['검색 시작일자가 종료일자보다 클 수 없습니다.']);
					return false;
				}
				break;
			default :
				break;
		}
		return true;
	}
	handler = {
		setDs : (transId) => {
			switch (transId) {
			case "STT030000_R01" :
				let state = this.state;

				state['gridSttResultList']['paging'].start = 0;

				this.setState(state, () => {
					this.transaction('STT030000_R01');
				});
				break;
			}
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (transId) => {
		let transManager = new TransManager();
		
		transManager.setTransId(transId);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		let state       = this.state;	
		
		let pageStart   = state['gridSttResultList']['paging'].start;
		let pageLimit   = state['gridSttResultList']['paging'].size;

		try {
			switch (transId) {
			case 'STT030000_R01':
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_JobHistory",
					datasetsend: "dsSrchParamInfo",
					datasetrecv: "dsSttResultInfo",
				});

				transManager.addDataset('dsSrchParamInfo', [{ JOB_START_DATE: state.rangeCalendarProps.rgcSearchJob.startDate
					                                       ,  JOB_END_DATE  : state.rangeCalendarProps.rgcSearchJob.endDate  
														   ,  CALL_ID       : state.textFieldProps.iptSearch.value
					                                       ,  JOB_STATE     : state.selectboxProps.selJobStateSearch.value
					                                       ,  CENT_CD       : state.selectboxProps.selCenterList.value
					                                       ,  TEAM_CD       : state.selectboxProps.selTeamList.value
					                                       ,  CONST_CD      : state.selectboxProps.selUserList.value
					                                       ,  QUERY_START   : pageStart
					                                       ,  QUERY_LIMIT   : pageLimit
				}]);
				state.lastStartDate = state.rangeCalendarProps.rgcSearchJob.startDate;
			    state.lastEndDate   = state.rangeCalendarProps.rgcSearchJob.endDate;
			    state.lastCallid   = state.textFieldProps.iptSearch.value;
			    state.lastJobState  = state.selectboxProps.selJobStateSearch.value;
			    state.lastCenter    = state.selectboxProps.selCenterList.value;
			    state.lastYeam      = state.selectboxProps.selTeamList.value;
			    state.lastUser      = state.selectboxProps.selUserList.value;

				this.setState(state);

				transManager.agent();

				break;

			case 'STT030000_R02':
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_JobHistory",
					datasetsend: "dsSrchParamInfo",
					datasetrecv: "dsSttResultInfo",
				});

				transManager.addDataset('dsSrchParamInfo', [{ JOB_START_DATE: state.lastStartDate
														   ,  JOB_END_DATE  : state.lastEndDate  
														   ,  CALL_ID       : state.lastCallid  
														   ,  JOB_STATE     : state.lastJobState
														   ,  CENT_CD       : state.lastCenter
														   ,  TEAM_CD       : state.lastYeam
														   ,  CONST_CD      : state.lastUser
														   ,  QUERY_START   : pageStart
														   ,  QUERY_LIMIT   : pageLimit
				}]);

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
		case 'STT030000_R01':
			if(res.data.dsSttResultInfo.length > 0) {
				ComLib.setStateInitRecords(this, "dsSttResultInfo", res.data.dsSttResultInfo);
			} else {
				ComLib.setStateRecords(this, "dsSttResultInfo", "");
			}
			
			this.setState({...this.state
				, gridSttResultList : { ...this.state.gridSttResultList
					, paging : { ...this.state.gridSttResultList.paging
						, loading : false
					}
				}
			});
		case 'STT030000_R02':
			ComLib.setStateInitRecords(this, "dsSttResultInfo", res.data.dsSttResultInfo);
			
			if (this.state.gridSttResultList.paging.excelLoadAll) {
				this.sttResultGrd.downExcelData();
			}

			this.setState({...this.state
				, gridSttResultList : { ...this.state.gridSttResultList
					, paging : { ...this.state.gridSttResultList.paging
						, loading : false
						, excelLoadAll: false
					}
				}
			});
			break;
		default : break;
		}
	}


	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		// 버튼 이벤트
		button : {
			onClick : (e) => {
				switch (e.target.id) {
				case "btnJobFileSearchList" :
					if(this.validation("STT030000_R01")) {
						this.handler.setDs('STT030000_R01');	
					}
					break;
				default : break;
				}
			}
		}, 
		inputcalendar : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'searchJobDateCalender':					
					this.setState({...this.state, 
							rangeCalendarProps : {...this.state.rangeCalendarProps
													, rgcSearchJob : 
														{...this.state.rangeCalendarProps.rgcSearchJob, startDate : e.startDate, endDate : e.endDate}
												}});
				break; 
				default : break;
				}
			}
		},
		selectbox: {
			onChange: (e) => {
				switch (e.id) {
				case 'selJobStateSearch':
					this.setState({...this.state, 
							selectboxProps : {...this.state.selectboxProps
													, selJobStateSearch : 
														{...this.state.selectboxProps.selJobStateSearch, selected : e.target.selectedIndex, value : e.target.value}
											}});
				break;
				case 'selCenterList':
					this.setState({...this.state, 
						selectboxProps : {...this.state.selectboxProps
												, selCenterList : 
													{...this.state.selectboxProps.selCenterList, selected : e.target.selectedIndex, value : e.target.value}
										}});
					ComLib.setStateValue(this, "dsSrch", 0, "CENT_CD", e.target.value, "TEAM_CD", "");
					
				break;
				case 'selTeamList':
					this.setState({...this.state, 
						selectboxProps : {...this.state.selectboxProps
												, selTeamList : 
													{...this.state.selectboxProps.selTeamList, selected : e.target.selectedIndex, value : e.target.value}
										}});
					ComLib.setStateValue(this, "dsSrch", 0, "TEAM_CD", e.target.value);	
				break;
				case 'selUserList':
					this.setState({...this.state, 
						selectboxProps : {...this.state.selectboxProps
												, selUserList : 
													{...this.state.selectboxProps.selUserList, selected : e.target.selectedIndex, value : e.target.value}
										}});
					ComLib.setStateValue(this, "dsSrch", 0, "CONST_CD", e.target.value);	
				break;
				case 'selReqUserList':
					this.setState({...this.state, 
						selectboxProps : {...this.state.selectboxProps
												, selReqUserList : 
													{...this.state.selectboxProps.selReqUserList, selected : e.target.selectedIndex, value : e.target.value}
										}});
				break;
				default : break;
				}
			},
		},
		grid: {
			onActionCellClicked : (e) => {
				console.log("action cell clicked STT030000")
				console.log(e)
				let option = { width: '600px', height: '740px', modaless: true, UUID: e.data.STT_UNQ, callId : e.data.CALL_ID, useUuid: true}
				ComLib.openPlayer(option);
				
			},
			onGridReady : (e) => {
				this.sttResultGrdApi = e.gridApi;
				this.sttResultGrd    = e.grid;
			},
			onCellValueChanged: (e) => {
				this.sttResultGrd.gridDataset.setValue(e.index , e.col, e.oldValue);
				this.sttResultGrdApi.setRowData(this.sttResultGrd.gridDataset.getRecords());
			},
			onScrollEnd: (e) => {
				if (!this.state.gridSttResultList.paging.loading) {
					this.setState({...this.state
						, gridSttResultList : { ...this.state.gridSttResultList
							, paging : { ...this.state.gridSttResultList.paging
								, start : this.state.gridSttResultList.paging.start + this.state.gridSttResultList.paging.size
								, loading : true
								, excelLoadAll : e.excelLoadAll
							}
						}
					}, () => {
						this.transaction("STT030000_R02");
					});
				}
			},
		},
		input : {
			onChange : (e) => {
				switch (e.target.id) {
					case 'iptSearch' :
						this.setState({...this.state
							, textFieldProps : { ...this.state.textFieldProps
								,iptSearch : { ...this.state.textFieldProps.iptSearch, value : e.target.value }
							}});
					break;
					default : break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptSearch' :
					if (e.key === 'Enter') {
						if(this.validation("STT030000_R01")) {
							this.handler.setDs('STT030000_R01');	
						}
					}
					break;
				default: break;
				}
			},
		},
	}	

	setSearchParam = () => {
		let dsSrchParamInfo = {};

		
		
		return dsSrchParamInfo;		
	}

	render () {
		return (
			<React.Fragment>
				<FullPanel>					
					<SearchPanel>
						<RelativeGroup>
							<LFloatArea>
								<FlexPanel>
									<Label value={this.state.rangeCalendarProps.rgcSearchJob.label} req={true}/>
									<RangeInputCalendar
										id        = {this.state.rangeCalendarProps.rgcSearchJob.id}
										strtId    = {this.state.rangeCalendarProps.rgcSearchJob.strtId}
										endId     = {this.state.rangeCalendarProps.rgcSearchJob.endId}	
										startDate = {this.state.rangeCalendarProps.rgcSearchJob.startDate}
										endDate   = {this.state.rangeCalendarProps.rgcSearchJob.endDate}
										onChange  = {this.event.inputcalendar.onChange}
									/>
									<Label value="콜아이디"/>
									<Textfield
										width       = {300}
										id          = {this.state.textFieldProps.iptSearch.id}
										name        = {this.state.textFieldProps.iptSearch.name}
										value       = {this.state.textFieldProps.iptSearch.value}
										placeholder = {this.state.textFieldProps.iptSearch.placeholder}
										minLength   = {this.state.textFieldProps.iptSearch.minLength}
										maxLength   = {this.state.textFieldProps.iptSearch.maxLength}
										readOnly    = {this.state.textFieldProps.iptSearch.readOnly}
										disabled    = {this.state.textFieldProps.iptSearch.disabled}
										onChange    = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>
									<Label value={this.state.selectboxProps.selCenterList.label}/>
									<Selectbox
										id = {this.state.selectboxProps.selCenterList.id}
										dataset = {this.state.selectboxProps.selCenterList.dataset}
										value = {this.state.dsSrch.records[0]["CENT_CD"]}
										width = {this.state.selectboxProps.selCenterList.width}
										disabled = {this.state.selectboxProps.selCenterList.disabled}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value={this.state.selectboxProps.selTeamList.label}/>
									<Selectbox
									 	id = {this.state.selectboxProps.selTeamList.id}
									 	dataset = {ComLib.convComboList(ComLib.getTeamList(this.state.dsSrch), newScrmObj.constants.select.argument.all)}
									 	value = {this.state.dsSrch.records[0]["TEAM_CD"]}
									 	width = {this.state.selectboxProps.selTeamList.width}
										disabled = {this.state.selectboxProps.selTeamList.disabled}
									 	onChange = {this.event.selectbox.onChange}
									/>
									<Label value={this.state.selectboxProps.selUserList.label}/>
									<Selectbox
										id = {this.state.selectboxProps.selUserList.id}
										dataset = {ComLib.convComboList(ComLib.getConstList(this.state.dsSrch), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSrch.records[0]["CONST_CD"]}
										width = {this.state.selectboxProps.selUserList.width}
										disabled = {this.state.selectboxProps.selUserList.disabled}
										onChange= {this.event.selectbox.onChange}
									/>
									<Label value={this.state.selectboxProps.selJobStateSearch.label}/>
									<Selectbox
										id       = {this.state.selectboxProps.selJobStateSearch.id}
										dataset  = {this.state.selectboxProps.selJobStateSearch.dataset}
										width    = {this.state.selectboxProps.selJobStateSearch.width}
										disabled = {this.state.selectboxProps.selJobStateSearch.disabled}
										selected = {this.state.selectboxProps.selJobStateSearch.selected}
										onChange = {this.event.selectbox.onChange}
									/>
								</FlexPanel>
							</LFloatArea>
							<RFloatArea>
								<Button 
									id = {this.state.buttonProps.btnSearchProps.id}
									color = 'blue' 
									value = {this.state.buttonProps.btnSearchProps.value}
									disabled = {this.state.buttonProps.btnSearchProps.disabled}
									hidden = {this.state.buttonProps.btnSearchProps.hidden}
									onClick = {this.event.button.onClick}
									icon = {'srch'}
									innerImage={true}
									fiiled = "o"
									mt = {5}
								/>
							</RFloatArea>
						</RelativeGroup>
					</SearchPanel>
					<ComponentPanel>
						<Grid
							areaName = {this.state.gridSttResultList.areaName}
							id       = {this.state.gridSttResultList.id}
							height   = "600px"
							header   = {this.state.gridSttResultList.header}
							data     = {this.state.dsSttResultInfo}

							addRowBtn   = {false}
							delRowBtn   = {false}
							dnlExcelBtn = {true}
							rowNum      = {true}							
							paging      = {true}
							infinite    = {true}
							suppressRowClickSelection = {true}

							totalRowCnt = {(this.state.dsSttResultInfo.getRecords().length === 0) ? 0 : this.state.dsSttResultInfo.getValue(0, 'totalcount')}

							onCellValueChanged = {this.event.grid.onCellValueChanged}
							onGridReady        = {this.event.grid.onGridReady}	
							onScrollEnd        = {this.event.grid.onScrollEnd}		
							onActionCellClicked= {this.event.grid.onActionCellClicked}			

						/>
					</ComponentPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;