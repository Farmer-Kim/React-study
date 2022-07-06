// STT인식률측정
import React from 'react';
import {
	SearchPanel, ComponentPanel, FullPanel, SubFullPanel, RFloatArea, FlexPanel,RelativeGroup, LFloatArea} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {RangeInputCalendar, Selectbox, ScrmLineBarChart} from 'components';
import {Table, Grid} from 'components';
import {ComLib, DataLib, StrLib, TransManager, DateLib} from 'common';

class View extends React.Component {
	constructor(props) {
		super();

		this.state = {
			
			useMaxSucc : 0,
			useMaxFail : 0,
			dataTP     :  "ALL",
			options : {
				useSucc: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "ALL_SUCC_CNT", "name" : "전체 성공", "color" : "red"}]
				},
				useFail: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "ALL_FAIL_CNT", "name" : "전체 실패", "color" : "blue"}]
				},
				jobSucc: {
					XAsisKey : 'REG_DT',
					dataKey  : []
				},
				jobFail: {
					XAsisKey : 'REG_DT',
					dataKey  : []
				},
				callSucc: {
					XAsisKey : 'REG_DT',
					dataKey  : []
				},
				callFail: {
					XAsisKey : 'REG_DT',
					dataKey  : []
				},
				allSucc: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "ALL_SUCC_CNT", "name" : "전체 성공", "color" : "red"}]
				},
				allFail: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "ALL_FAIL_CNT", "name" : "전체 실패", "color" : "blue"}]
				},
			},
		
			dsSttGraph: DataLib.datalist.getInstance([]),			
			dsTotalJobList: DataLib.datalist.getInstance([]),
			dsErrList: DataLib.datalist.getInstance([]),

			gridSttSucc_total: "0",
			gridSttSucc_header: [
				{headerName: '일자',	 field: 'REG_DT',		colId: 'REG_DT'},
				{headerName: '타입'    , field: 'TP_CONT',	    colId: 'TP_CONT', textAlign: 'center', 
					valueFormatter : (params) => { 						
						let returnVal = "";
						if (params.value === "ALL") {
							returnVal = "전체";
						} else {
							returnVal = params.value;
						}

						return returnVal;
					}},
				{headerName: '전체건수', field: 'TOT_CNT',		colId: 'TOT_CNT' , textAlign: 'center'},
				{headerName: '성공건수', field: 'SUCC_CNT',		colId: 'SUCC_CNT', textAlign: 'center'},
				{headerName: '실패건수', field: 'FAIL_CNT',		colId: 'FAIL_CNT', textAlign: 'center'},
				{headerName: '변환율',	 field: 'SUCC_PER',	    colId: 'SUCC_PER', textAlign: 'center', 
					valueFormatter : (params) => { 
						let numbered = Number(params.value) * 100;
						let returnVal = numbered + " %";
						return returnVal;
					}
				},
				{headerName: '실패율',	 field: 'FAIL_PER',	    colId: 'FAIL_PER', textAlign: 'center', 
					valueFormatter : (params) => { 
						let numbered = Number(params.value) * 100;
						let returnVal = numbered + " %";
						return returnVal;
					}
				}
			],
			gridSttFail_total: "0",
			gridSttFail_header: [
				{headerName: '발생건수', field: 'CNT',		colId: 'CNT', textAlign: 'center'},
				{headerName: '타입'    , field: 'TP_CONT',	colId: 'TP_CONT', textAlign: 'center'},
				{headerName: '오류코드', field: 'ERR_CD',	colId: 'ERR_CD', textAlign: 'center'},
				{headerName: '오류내용', field: 'ERR_CD',	colId: 'ERR_CD',
					cellEditor: 'agSelectCellEditor',
					cellEditorParams: { values : ComLib.getComCodeValue('STT_JOB_INFO', 'ERR_CD')},
					valueFormatter : (param) => ComLib.getComCodeName('STT_JOB_INFO', param.value, 'ERR_CD')}
			],
			
			calSearchDate_startDate : DateLib.getAddMonth(DateLib.getToday(), -3),
			calSearchDate_endDate   : DateLib.getToday(),

			selSearchType_value : "",

			btnProps : {
				btnSearch: {
					id    : 'btnSearch',				
					value : '조회'
				}
			},
					
		}
	}

	componentDidMount () {
		let JobTpList  = ComLib.getCommCodeList('CMN', 'JOB_TP');
		let callTpList = ComLib.getCommCodeList('CMN', 'CALL_TP');

		let jobDataKeySucc  = [];
		let jobDataKeyFail  = [];
		let callDataKeySucc = [];
		let callDataKeyFail = [];
		
		for (let i = 0; i < JobTpList.length; i ++) {
			jobDataKeySucc.push({"key" : JobTpList[i].CODE_NM + "_SUCC_CNT", "name" : JobTpList[i].CODE_NM + " 성공", "color": JobTpList[i].CD_VAL});
			jobDataKeyFail.push({"key" : JobTpList[i].CODE_NM + "_FAIL_CNT", "name" : JobTpList[i].CODE_NM + " 실패", "color": JobTpList[i].CD_VAL});
		}

		for (let i = 0; i < callTpList.length; i ++) {
			callDataKeySucc.push({"key" : callTpList[i].CODE_NM + "_SUCC_CNT", "name" : callTpList[i].CODE_NM + " 성공", "color": callTpList[i].CD_VAL});
			callDataKeyFail.push({"key" : callTpList[i].CODE_NM + "_FAIL_CNT", "name" : callTpList[i].CODE_NM + " 실패", "color": callTpList[i].CD_VAL});
		}

		this.setState({...this.state, options : {...this.state.options
			                                    	, jobSucc : {...this.state.options.jobSucc , dataKey: jobDataKeySucc}
													, jobFail : {...this.state.options.jobFail , dataKey: jobDataKeyFail}
													, callSucc: {...this.state.options.callSucc, dataKey: callDataKeySucc}
													, callFail: {...this.state.options.callFail, dataKey: callDataKeyFail}}} ,			
		() => {
			this.transaction("STT070000_R01");

		})	
	}
	
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STT070000_R01':
			let state = this.state;	
			let searchDateS = state.calSearchDate_startDate;
			let searchDateE = state.calSearchDate_endDate;
			
			if (StrLib.isNull(searchDateS) || StrLib.isNull(searchDateE) )  {
				ComLib.openDialog('A', 'COME0004', ['시작일자', '종료일자']);
				return false;
			}

			if (searchDateS > searchDateE ) {
				ComLib.openDialog('A', 'SYSI0010', ['검색시작일자가 검색종료일보다 클 수 없습니다.']);
				return false;
			}

			break;
		default : break;
		}
		return true;
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (serviceid) => {
		let transManager = new TransManager();	
		let state       = this.state;	
		
		transManager.setTransId(serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try {
			switch (serviceid) {	
			case 'STT070000_R01':				
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STT_STATIS.R_getSttSuccess",
					datasetsend:"dsSearch",
					datasetrecv:"dsSuccess",
				});
					
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STT_STATIS.R_getSttFail",
					datasetsend:"dsSearch",
					datasetrecv:"dsFail",
				});

				let searchType  = state.selSearchType_value;
				let searchDateS = state.calSearchDate_startDate;
				let searchDateE = state.calSearchDate_endDate;

				transManager.addDataset('dsSearch',	[{S_DATE: searchDateS, E_DATE: searchDateE, SCH_TP: searchType}]);
				
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
		case 'STT070000_R01':			
			let dsJobInfo = res.data.dsSuccess;
			let dsErrInfo = res.data.dsFail;
			let totalJobCnt = 0;
			let totalFailCnt = 0;
			
			let merged  = [];

			for (let i = 0; i < dsJobInfo.length; i ++) {
				let isExist    = false;
				let existIndex = -1;

				totalJobCnt += dsJobInfo[i].TOT_CNT;
				totalFailCnt += dsJobInfo[i].FAIL_CNT;

				for (let j = 0; j < merged.length; j ++) {
					if (merged[j].REG_DT === dsJobInfo[i].REG_DT) {
						isExist = true;
						existIndex = j;
						break;
					}
				}

				if (!isExist) {
					merged.push({REG_DT                               : dsJobInfo[i].REG_DT
						       , [dsJobInfo[i].TP_CONT + "_SUCC_CNT"] : dsJobInfo[i].SUCC_CNT
							   , [dsJobInfo[i].TP_CONT + "_FAIL_CNT"] : dsJobInfo[i].FAIL_CNT})

				} else {
					merged[existIndex][dsJobInfo[i].TP_CONT + "_SUCC_CNT"] = dsJobInfo[i].SUCC_CNT;
					merged[existIndex][dsJobInfo[i].TP_CONT + "_FAIL_CNT"] = dsJobInfo[i].FAIL_CNT;

				}
			}

			let JobTpList  = ComLib.getCommCodeList('CMN', 'JOB_TP');
			let callTpList = ComLib.getCommCodeList('CMN', 'CALL_TP');

			let maxData = [0,0,0,0,0,0]

			for (let i = 0; i < merged.length; i ++) {
				for (let j = 0; j < JobTpList.length; j ++) {
					if (merged[i][JobTpList[j].CODE_NM + "_SUCC_CNT"] === undefined) {
						merged[i][JobTpList[j].CODE_NM + "_SUCC_CNT"] = 0;
						merged[i][JobTpList[j].CODE_NM + "_FAIL_CNT"] = 0;
					}
					if (merged[i][JobTpList[j].CODE_NM + "_SUCC_CNT"] > maxData[2]) {
						maxData[2] = merged[i][JobTpList[j].CODE_NM + "_SUCC_CNT"];
					}
					if (merged[i][JobTpList[j].CODE_NM + "_FAIL_CNT"] > maxData[3]) {
						maxData[3] = merged[i][JobTpList[j].CODE_NM + "_FAIL_CNT"];
					}
				}

				for (let j = 0; j < callTpList.length; j ++) {
					if (merged[i][callTpList[j].CODE_NM + "_SUCC_CNT"] === undefined) {
						merged[i][callTpList[j].CODE_NM + "_SUCC_CNT"] = 0;
						merged[i][callTpList[j].CODE_NM + "_FAIL_CNT"] = 0;
					}			

					if (merged[i][callTpList[j].CODE_NM + "_SUCC_CNT"] > maxData[4]) {
						maxData[4] = merged[i][callTpList[j].CODE_NM + "_SUCC_CNT"];
					}
					if (merged[i][callTpList[j].CODE_NM + "_FAIL_CNT"] > maxData[5]) {
						maxData[5] = merged[i][callTpList[j].CODE_NM + "_FAIL_CNT"];
					}
				}
				
				if (merged[i]["ALL_SUCC_CNT"] > maxData[0]) {
					maxData[0] = merged[i]["ALL_SUCC_CNT"];
				}
				if (merged[i]["ALL_FAIL_CNT"] > maxData[1]) {
					maxData[1] = merged[i]["ALL_FAIL_CNT"];
				}
			}			

			for (let i = 0; i < maxData.length; i ++) {				
				let maxAdd = "1";
				for (let j = 0; j < String(maxData[i]).length -1; j ++) {
					maxAdd += "0"
				} 
				maxData[i] = (maxData[i]  + Number(maxAdd))  - maxData[i]%Number(maxAdd);
			} 

			let serTp = this.state.selSearchType_value;
			let useMaxSucc = 0;
			let useMaxFail = 0;
			let useSucc = {};
			let useFail = {};

			if (serTp === "") {
				useMaxSucc = maxData[0];
				useMaxFail = maxData[1];
				useSucc    = this.state.options.allSucc;
				useFail    = this.state.options.allFail;

			} else if (serTp === "1") {
				useMaxSucc = maxData[2];
				useMaxFail = maxData[3];
				useSucc    = this.state.options.jobSucc;
				useFail    = this.state.options.jobFail;

			} else {
				useMaxSucc = maxData[4];
				useMaxFail = maxData[5];
				useSucc    = this.state.options.callSucc;
				useFail    = this.state.options.callFail;
			}

			this.setState({...this.state, 
				useMaxSucc : useMaxSucc, useMaxFail : useMaxFail,
				maxData : maxData,
			    options: {...this.state.options, useSucc: useSucc, useFail: useFail},
				gridSttSucc_total : totalJobCnt,
				gridSttFail_total : totalFailCnt
			})

			ComLib.setStateInitRecords(this, "dsSttGraph", merged);	

			ComLib.setStateInitRecords(this, "dsTotalJobList", dsJobInfo);
			ComLib.setStateInitRecords(this, "dsErrList", dsErrInfo);	

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
				if (this.validation("STT070000_R01")) this.transaction('STT070000_R01');
				break;		
			default : break;
			}
			}
		},
		grid: {			
			onGridReady : (e) => {
				switch (e.id) {
				case "grdAccSwt":

					break;
				default: break;
				}
			},

		},

		inputcalendar : {		
			onChange : (e) => {					
				switch (e.target.id) {									
				case 'calSearchDate' :	
					let state = this.state;
	
					state.calSearchDate_startDate = e.startDate;
					state.calSearchDate_endDate   = e.endDate;	

					this.setState(state);

					break;
				default : break;
				}				
			},
		},

		selectbox : {
			onChange : (e) => {	
				let state = this.state;

				state.selSearchType_value    = e.target.value;	

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
						<RelativeGroup>						
							<LFloatArea>
								<FlexPanel>
									<Label value={"검색일자"}/>
									<RangeInputCalendar
										id        = {"calSearchDate"}
										strtId    = {"calSearchDateStart"}
										endId     = {"calSearchDateEnd"}
										startDate = {this.state.calSearchDate_startDate}
										endDate   = {this.state.calSearchDate_endDate}
										onChange  = {this.event.inputcalendar.onChange}
									/>
									<Selectbox
										id       = {"selSearchType"}
										dataset  = {ComLib.convComboList([{CODE_NM: "전체", CODE: ""},{CODE_NM: "작업별", CODE: "1"},{CODE_NM: "콜타입별", CODE: "2"}])}								
										width    = {100}
										onChange = {this.event.selectbox.onChange}
									/>
								</FlexPanel>
							</LFloatArea>	
							<RFloatArea>
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
							</RFloatArea>
						</RelativeGroup>
					</SearchPanel>
					<SubFullPanel>
						<FlexPanel>
							<ComponentPanel>
								<RelativeGroup>
									<Label value = {"STT 성공 건수"} />
									<ScrmLineBarChart 
										data = {this.state.dsSttGraph.getRecords()}
										maxData = {this.state.useMaxSucc}
										unit    = {"건"}
										options = {this.state.options.useSucc}	
										aspect={4.0/1.3}						
									/>
								</RelativeGroup>									
								<RelativeGroup>
									<Label value = {"STT 실패 건수"} />
									<ScrmLineBarChart 
										data = {this.state.dsSttGraph.getRecords()}
										maxData = {this.state.useMaxFail}
										unit    = {"건"}
										options = {this.state.options.useFail}	
										aspect={4.0/1.3}						
									/>
								</RelativeGroup>		
							</ComponentPanel>							
							<ComponentPanel>
								<Grid
									id       = {"gridSttSucc"} 
									areaName = {"STT 작업 내역 : " + this.state.gridSttSucc_total + " 건"}
									header   = {this.state.gridSttSucc_header}
									data     = {this.state.dsTotalJobList}
									height   = {'295px'}	
									addRowBtn   = {false}
									delRowBtn   = {false}
									dnlExcelBtn = {true}	
									orgMenu = {this.props.tray.MNU_ID}								
								/>							
								<Grid
									id       = {"gridSttFail"} 
									areaName = {"STT 오류 내역 : " + this.state.gridSttFail_total + " 건"}
									header   = {this.state.gridSttFail_header}
									data     = {this.state.dsErrList}
									height   = {'295px'}
									addRowBtn   = {false}
									delRowBtn   = {false}
									dnlExcelBtn = {true}	
									orgMenu = {this.props.tray.MNU_ID}								
								/>
							</ComponentPanel>
						</FlexPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;