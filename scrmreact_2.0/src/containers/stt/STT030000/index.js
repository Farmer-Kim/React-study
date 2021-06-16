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
				selSearchType: {
					id : 'selSearchType',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('STT_JOB_INFO', 'SCH_TP2'), newScrmObj.constants.select.argument.select),
					width : 120,
					value :'',
					selected : 0,
					disabled : false,
				},
				selCallTP : {
					id : 'selCallTP',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('CMN', 'CALL_TP'), newScrmObj.constants.select.argument.all),
					width : 120,
					selected : 0,
					disabled : false,
					label : "콜구분"
				},
				selJobStateSearch : {
					id : 'selJobStateSearch',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('STT_JOB_INFO', 'JOB_STATE'), newScrmObj.constants.select.argument.all),
					width : 120,
					selected : 0,
					disabled : false,
					label : "작업상태"
				},
				selJobTP : {
					id : 'selJobTP',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('CMN', 'JOB_TP'), newScrmObj.constants.select.argument.all),
					width : 120,
					selected : 0,
					disabled : false,
					label : "작업구분"
				},
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
					label : '',
					
				}
			},
			dsSttResultInfo : DataLib.datalist.getInstance(),
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
					                                       ,  SCH_TP        : state.selectboxProps.selSearchType.value
														   ,  SCH_VAL       : state.textFieldProps.iptSearch.value
					                                       ,  JOB_STATE     : state.selectboxProps.selJobStateSearch.value
					                                       ,  CALL_TP       : state.selectboxProps.selCallTP.value
														   ,  JOB_TP	    : state.selectboxProps.selJobTP.value
					                                       ,  QUERY_START   : pageStart
					                                       ,  QUERY_LIMIT   : pageLimit
				}]);
				state.lastStartDate = state.rangeCalendarProps.rgcSearchJob.startDate;
			    state.lastEndDate   = state.rangeCalendarProps.rgcSearchJob.endDate;
			    state.lastSearchTP  = state.selectboxProps.selSearchType.value;
			    state.lastSearchVal = state.textFieldProps.iptSearch.value;
			    state.lastJobState  = state.selectboxProps.selJobStateSearch.value;
			    state.lastCallTp    = state.selectboxProps.selCallTP.value;
			    state.lastJobTp     = state.selectboxProps.selJobTP.value;

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
														   ,  SCH_TP        : state.lastSearchTP  
														   ,  SCH_VAL       : state.lastSearchVal
														   ,  JOB_STATE     : state.lastJobState
														   ,  CALL_TP       : state.lastCallTp
														   ,  JOB_TP	    : state.lastJobTp
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
				this.setState({...this.state
					, gridSttResultList : { ...this.state.gridSttResultList
						, paging : { ...this.state.gridSttResultList.paging
							, loading : false
							, excelLoadAll: false
						}
					}
				}, () => {
						this.sttResultGrd.downExcelData();

				});
				
			} else {
				this.setState({...this.state
					, gridSttResultList : { ...this.state.gridSttResultList
						, paging : { ...this.state.gridSttResultList.paging
							, loading : false
						}
					}
				});
			}
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
				case 'selSearchType':
				this.setState({...this.state, 
					selectboxProps : {...this.state.selectboxProps
											, selSearchType : 
												{...this.state.selectboxProps.selSearchType, selected : e.target.selectedIndex, value : e.target.value}}});
					break;

				case 'selJobStateSearch':
					this.setState({...this.state, 
							selectboxProps : {...this.state.selectboxProps
													, selJobStateSearch : 
														{...this.state.selectboxProps.selJobStateSearch, selected : e.target.selectedIndex, value : e.target.value}
											}});
					break;

				case 'selCallTP': 
					this.setState({...this.state, 
							selectboxProps : {...this.state.selectboxProps
													, selCallTP : 
														{...this.state.selectboxProps.selCallTP, selected : e.target.selectedIndex, value : e.target.value}
											}});
					break;
				case 'selJobTP':
					this.setState({...this.state, 
						selectboxProps : {...this.state.selectboxProps
												, selJobTP : 
													{...this.state.selectboxProps.selJobTP, selected : e.target.selectedIndex, value : e.target.value}
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
				let option = { width: '600px', height: '740px', modaless: true, UUID: e.data.STT_UNQ, callId : e.data.CALL_ID, useUuid: true, JOB_TP: e.data.JOB_TP}
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
									<Label value="검색조건"/>
									<Selectbox
										id       = {this.state.selectboxProps.selSearchType.id}
										dataset  = {this.state.selectboxProps.selSearchType.dataset}
										value    = {this.state.selectboxProps.selSearchType.value}
										width    = {this.state.selectboxProps.selSearchType.width}
										disabled = {this.state.selectboxProps.selSearchType.disabled}
										onChange = {this.event.selectbox.onChange}
									/>
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
									<Label value = {this.state.selectboxProps.selJobStateSearch.label}/>
									<Selectbox
										id       = {this.state.selectboxProps.selJobStateSearch.id}
										dataset  = {this.state.selectboxProps.selJobStateSearch.dataset}
										width    = {this.state.selectboxProps.selJobStateSearch.width}
										disabled = {this.state.selectboxProps.selJobStateSearch.disabled}
										selected = {this.state.selectboxProps.selJobStateSearch.selected}
										onChange = {this.event.selectbox.onChange}
									/>									
									<Label value = {this.state.selectboxProps.selCallTP.label}/>
									<Selectbox
										id       = {this.state.selectboxProps.selCallTP.id}
										value    = {this.state.selectboxProps.selCallTP.value}
										dataset  = {this.state.selectboxProps.selCallTP.dataset}
										width    = {this.state.selectboxProps.selCallTP.width}
										disabled = {this.state.selectboxProps.selCallTP.disabled}
										selected = {this.state.selectboxProps.selCallTP.selected}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value = {this.state.selectboxProps.selJobTP.label}/>
									<Selectbox
										id       = {this.state.selectboxProps.selJobTP.id}
										value    = {this.state.selectboxProps.selJobTP.value}
										dataset  = {this.state.selectboxProps.selJobTP.dataset}
										width    = {this.state.selectboxProps.selJobTP.width}
										disabled = {this.state.selectboxProps.selJobTP.disabled}
										selected = {this.state.selectboxProps.selJobTP.selected}
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