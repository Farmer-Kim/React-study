// 수동 STT요청
import React from 'react';
import {
	ComponentPanel, FlexPanel, FullPanel,  LFloatArea, RFloatArea, SearchPanel
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {RangeInputCalendar, Selectbox, InputFileUpload} from 'components';
import {Grid} from 'components';
import {TransManager, StrLib, ComLib, DataLib, DateLib, newScrmObj} from 'common';
 
class View extends React.Component {
	constructor(props) {
		super();
		
		this.selfFileListGrdApi = null;
		this.selfFileListGrd    = null;

		this.state = {
			buttonProps : {
				btnSearchProps : {
					id : 'btnSelfFileSearchList',
					disabled : false,
					value : '조회',
					hidden : false
				}	
			},
			gridProps: {
				grdSelfFileList : {
					areaName : '수동STT	요청',
					id : 'grdSelfFileList',
					height : "320px",
					header : 
					[
						 {headerName: '파일명',	        field: 'FILE_NM',		colId: 'FILE_NM',	width: 400}
						,{headerName: '작업요청자',		field: 'REG_USR_NM',	colId: 'REG_USR_NM', textAlign: 'center',	width: 100}
						,{headerName: '학습상태',	    field: 'JOB_STATE',	     colId: 'JOB_STATE', textAlign: 'center',	width: 100,
								cellEditor: 'agSelectCellEditor',
								cellEditorParams: { values : ComLib.getComCodeValue('STT_JOB_INFO', 'JOB_STATE')},
								valueFormatter : (param) => ComLib.getComCodeName('STT_JOB_INFO', param.value, 'JOB_STATE')}	
						,{headerName: '등록일자',		field: 'REG_DTM',		colId: 'REG_DTM',	width: 100}
						,{headerName: '에러코드',	field: 'ERR_CD',		colId: 'ERR_CD',	editable: false, width : '130',
							tooltipComponent: 'customTooltip', tooltipField: "ERR_CONT" }
						,{headerName: '상담내용',	    field: 'ACTION_ICON',	colId: 'ACTION_ICON',	width: 100, 
							cellRenderer: 'actionButton', 
							fiiled: true,
							color: 'blue'
						},
					],				
					paging : {
						start: 0,
						size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
						page : 1,
						loading: false
					},				
		
				}
			},								
			rangeCalendarProps : {
				label : '기간',
				id : 'searchDateCalender',
				strtId : 'searchDateCalenderStart',
				endId : 'searchDateCalenderEnd',				
				startDate : DateLib.getAddMonth(DateLib.getToday(), -3),
				endDate : DateLib.getToday(),
				focusedInput : null,
			},	
			fileUpload : {
				id : 'fileUpload',
				width : "100%",
				height : "250",
			},
			selectboxProps : {
				selUserList : {
					id : 'selUserList',
					width : 160,
					selected : 0,
					disabled : false,
					label : "요청자명",
					value : '',					
				},
			},
			fileDataArray : [],
			existsBrdCdFileDataArray : [],
			existsVlaBrdInfoArray : [],
			dsSelfFileList : DataLib.datalist.getInstance(),
			dsSrch: DataLib.datalist.getInstance([{CENT_CD: "", TEAM_CD: "", AUTH_LV: "", SRCH_DV: "NM", SRCH_VALUE: ""}]),
			dsGrp: DataLib.datalist.getInstance([{CENT_CD: "", TEAM_CD: "", USR_CD: ""}]),				
			lastUsrCd     : '',
			lastStartDate : '',
			lastEndDate   : ''
		}

		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.fileUploadValidation = this.fileUploadValidation.bind(this);	
		this.event.inputcalendar.onChange = this.event.inputcalendar.onChange.bind(this);	
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);
		this.searchEnterKey = this.searchEnterKey.bind(this);
		
	}
	
	componentDidMount () {	
		this.transaction('STT040000_R01');
	}

	componentWillUnmount () {

	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (transId) => {

		switch (transId) {
			case 'STT040000_R01' :

				if(StrLib.isNull(this.state.rangeCalendarProps.startDate) || StrLib.isNull(this.state.rangeCalendarProps.endDate) )  {
					ComLib.openDialog('A', 'COME0004', ['시작일자', '종료일자']);
					return false;
				}

				if(this.state.rangeCalendarProps.startDate > this.state.rangeCalendarProps.endDate ) {
					ComLib.openDialog('A', 'SYSI0010', ['검색시작일자가 검색종료일보다 클 수 없습니다.']);
					return false;
				}						
				break;

			case 'STT040000_C01':

				if(this.state.fileDataArray.length === 0) {
					ComLib.openDialog('A', 'SYSI0010', ['STT를 수행할 데이터가 없습니다.']);
					return false
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
			case "STT040000_R01" :
				let state = this.state;

				state['gridProps']['grdSelfFileList']['paging'].start = 0;
				state['gridProps']['grdSelfFileList']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('STT040000_R01');
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
		
		let pageStart   = state['gridProps']['grdSelfFileList']['paging'].start;
		let pageLimit   = state['gridProps']['grdSelfFileList']['paging'].size;

		try {
			switch (transId) {
			case 'STT040000_R01':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STT.R_SelfJobHistory",
					datasetsend:"dsSrchParamInfo",
					datasetrecv:"dsSelfFileList",
				});

				transManager.addDataset('dsSrchParamInfo', [{ START_DATE  : this.state.rangeCalendarProps.startDate
														   ,  END_DATE    : this.state.rangeCalendarProps.endDate 
														   ,  REQ_USR     : this.state.dsSrch.records[0]["USR_CD"]
														   ,  QUERY_START : pageStart
													 	   ,  QUERY_LIMIT : pageLimit
														}]);

				break;

			case 'STT040000_R02':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STT.R_SelfJobHistory",
					datasetsend:"dsSrchParamInfo",
					datasetrecv:"dsSelfFileList",
				});
				transManager.addDataset('dsSrchParamInfo', [{  START_DATE  : this.state.lastStartDate
															,  END_DATE    : this.state.lastEndDate 
															,  REQ_USR     : this.state.lastUsrCd
															,  QUERY_START : pageStart
															,  QUERY_LIMIT : pageLimit
														}]);

				break;

			case 'STT040000_C01':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.create,
					sqlmapid:"STT.C_JobSelfInfo",
					datasetsend:"dsSelfFileList",
				});								
				transManager.addDataset('dsSelfFileList', this.state.fileDataArray);
				
				break;
			default : break;
			}

			transManager.agent();

		} catch (err) {

		}

	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {
		
		let state = this.state;

		switch (res.id) {
		case 'STT040000_R01':			
			if(res.data.dsSelfFileList.length > 0) {
				ComLib.setStateInitRecords(this, "dsSelfFileList", res.data.dsSelfFileList);
									
				
				state.lastUsrCd     = state['selectboxProps']['selUserList'].value;
				state.lastStartDate = state['rangeCalendarProps'].startDate;
				state.lastEndDate   = state['rangeCalendarProps'].endDate;
				state['gridProps']['grdSelfFileList']['paging'].loading = false;

				this.setState(state);
				
			} else {								
				ComLib.setStateRecords(this, "dsSelfFileList", "");						
			}
			break;

		case 'STT040000_R02':
			ComLib.setStateInitRecords(this, "dsSelfFileList", res.data.dsSelfFileList);
			
			if (this.state.gridProps.grdSelfFileList.paging.excelLoadAll) {
				this.selfFileListGrd.downExcelData();
			}

			this.setState({...this.state, 
							gridProps: {...this.state.gridProps, 
								        grdSelfFileList: {...this.state.gridProps.grdSelfFileList, 
											              paging: {...this.state.gridProps.grdSelfFileList.paging, loading: false, excelLoadAll: false}}}})
			

			break;

		case 'STT040000_C01':
			ComLib.openDialog('A', 'SYSI0010', ['수동STT 요청이 정상적으로 완료 되었습니다.']);
			this.setState({...this.state , fileDataArray : []});										
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
					case "btnSelfFileSearchList" :		
						if (this.validation("STT040000_R01")) this.handler.setDs('STT040000_R01');	
						break;		
					default : break;				
				}
			}
		},
		inputcalendar : {
			onChange : (e) => {
				switch (e.target.id) {
					case 'searchDateCalender':
						let state = this.state;
						state['rangeCalendarProps'].startDate = e.startDate;
						state['rangeCalendarProps'].endDate   = e.endDate;
						this.setState(state); 
						break;
					default : break;				
				}
			},
		},		
        upload : {
			onUploadComplete : (e) => {
				console.log('onUploadComplete')
				switch (e.id) {
				case "fileUpload":

					let fileArray = this.state.fileDataArray
					const jobId = DateLib.getTodayTime();

					e.files.forEach((item, index) => {
									
						let row = item.file
						row.JOB_ID				= jobId;
						row.JOB_DV_CD			= ComLib.getComCodeValue('STT_TBL_JOB_INFO', 'DV_CD')[0];
						row.CALL_ID				= row.name;

						//현재는 코드에 반영되어 있는 서버리스트 서버패스의 코드값의 0번째를 셋팅함 PATH 연구소와 대화 필요
						// row.SERVER_NM			= ComLib.getComCodeValue('SERVER_LIST')[0]
						row.SERVER_NM			= 'rndvrm';
						//파일 PATH 이지만 연구소에서는 실질적으로 PATH + FILE_NAME 구로조 시스템이 되어 있기 때문에 
						// row.FILE_PATH 			= ComLib.getComCodeValue('SERVER_PATH')[0] + "/" + item.file.name
						row.FILE_PATH 			= "/home/vrm/work/" + item.file.name;
						row.FILE_NM   			= item.file.name;
						row.FILE_SIZE			= item.file.size;

						fileArray.push(row)
				
					})

					this.setState({...this.state, fileDataArray : fileArray});		
					if (this.validation("STT040000_C01")) this.transaction("STT040000_C01");							
				break;

				default : break;					
				}
			}
			
		},
		
		selectbox: {
			onChange: (e) => {
				switch (e.id) {			
				case 'selUserList':
					ComLib.setStateValue(this, "dsSrch", 0, "USR_CD", e.target.value);
					break;							
				default : break;
				}		
			},
		},
		grid: {
			onActionCellClicked : (e) => {
				console.log(e.data)
				let option = { width: '600px', height: '740px', modaless: true, UUID: e.data.STT_UNQ, callId : e.data.CALL_ID, useUuid: true}
				ComLib.openPlayer(option);

				
			},
			onGridReady : (e) => {
				this.selfFileListGrdApi = e.gridApi;
				this.selfFileListGrd    = e.grid;
			},
			onScrollEnd: (e) => {				
				if (!this.state.gridProps.grdSelfFileList.paging.loading) {
					this.setState({...this.state
						, gridProps : {...this.state.gridProps
							, gridSttResultList : { ...this.state.gridProps.grdSelfFileList
								, paging : { ...this.state.gridProps.grdSelfFileList.paging
									, start : this.state.gridProps.grdSelfFileList.paging.start + this.state.gridProps.grdSelfFileList.paging.size
									, loading : true
									, excelLoadAll : e.excelLoadAll
								}
							}
						}
					}, () => {
						this.transaction("STT040000_R02");
					});
				} 
			},
		},
				
	}

	fileUploadValidation(files) {
		
		console.log('fileUploadValidation')
		return true;
	}

	searchEnterKey(e) {
		e.preventDefault();
		if (e.code === 'Enter') {
			if (this.validation("STT040000_R01")) this.handler.setDs('STT040000_R01');
		}
		
	}
	  
	render () {
		return (			
			<React.Fragment >	
				<FullPanel>
					<SearchPanel>
						<div className="ie_flow_root" style={{alignItems:"center", display:"flow-root"}}>
							<LFloatArea>											
								<FlexPanel>
									<Label value={this.state.rangeCalendarProps.label} req={true} />
									<RangeInputCalendar
										id ={this.state.rangeCalendarProps.id}
										startDate = {this.state.rangeCalendarProps.startDate}
										endDate = {this.state.rangeCalendarProps.endDate}
										onChange = {this.event.inputcalendar.onChange}
										strtId  = {this.state.rangeCalendarProps.strtId}
										endId  = {this.state.rangeCalendarProps.endId}
									/>
									<div style={{marginLeft : '10px'}}/>
									<Label value={this.state.selectboxProps.selUserList.label}/>
									<Selectbox
										id = {this.state.selectboxProps.selUserList.id}
										dataset = {ComLib.convComboList(ComLib.getUserList(this.state.dsGrp, false), newScrmObj.constants.select.argument.all)}
										width = {this.state.selectboxProps.selUserList.width}
										disabled = {this.state.selectboxProps.selUserList.disabled}
										selected = {this.state.selectboxProps.selUserList.selected}
										onChange= {this.event.selectbox.onChange}
									/>
								</FlexPanel>														
							</LFloatArea>
							<RFloatArea>
								<FlexPanel>							
									<Button 
										id = {this.state.buttonProps.btnSearchProps.id}
										value = {this.state.buttonProps.btnSearchProps.value}
										disabled = {this.state.buttonProps.btnSearchProps.disabled}
										hidden = {this.state.buttonProps.btnSearchProps.hidden}
										onClick = {this.event.button.onClick}
										mr = {10}							
										color= 'blue' 
										icon = {'srch'}
										innerImage={true}
										fiiled = "o"
									/>
								</FlexPanel>
							</RFloatArea>
						</div>						
					</SearchPanel>
					<ComponentPanel>
						<Grid
							areaName = {this.state.gridProps.grdSelfFileList.areaName}		
							id       = {this.state.gridProps.grdSelfFileList.id}
							height   = {this.state.gridProps.grdSelfFileList.height}
							header   = {this.state.gridProps.grdSelfFileList.header}	
							data     = {this.state.dsSelfFileList}

							addRowBtn   = {false}
							delRowBtn   = {false}
							dnlExcelBtn = {true}
							rowNum      = {true}							
							paging      = {true}
							infinite    = {true}
							suppressRowClickSelection = {true}

							totalRowCnt = {(this.state.dsSelfFileList.getRecords().length === 0) ? 0 : this.state.dsSelfFileList.getValue(0, 'totalcount')}

							onGridReady        = {this.event.grid.onGridReady}	
							onScrollEnd        = {this.event.grid.onScrollEnd}		
							onActionCellClicked= {this.event.grid.onActionCellClicked}							
											
						/>
					</ComponentPanel>
					<ComponentPanel>
						<LFloatArea>
							<Label value={"MP3, WAV, PCM 형식 지원합니다."} req={true} />
						</LFloatArea>
						<InputFileUpload
							width = {this.state.fileUpload.width} 
							height = {this.state.fileUpload.height} 
							id = {this.state.fileUpload.id}
							onUploadComplete = {this.event.upload.onUploadComplete}
							uploadValidation = {this.fileUploadValidation}
						/>
					</ComponentPanel>					
				</FullPanel>
			</React.Fragment>
		)
	}	
}

export default View;