// 상담원현황
import React from 'react';
import {
	ComponentPanel, SearchPanel, FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button} from 'components';
import {RangeInputCalendar, Selectbox, ScrmLineBarChart} from 'components';
import {Grid, Label} from 'components';
import {DataLib, ComLib, DateLib, StrLib, newScrmObj, TransManager} from 'common';

class View extends React.Component {
	constructor(props) {
		super();

		this.gridResult = null
		this.gridResultGridApi = null;

		this.state = {
			rangeCalendarProps : {
				rgcSearch : {
					label : '검색일시',
					id : 'searchDateCalender',
					strtId : 'searchDateCalenderStart',
					endId : 'searchDateCalenderEnd',
					startDate : DateLib.getAddMonth(DateLib.getToday(), -1),
					endDate : DateLib.getAddDate(DateLib.getToday(), - 1),
					disabled : false
				},
			},
			buttonProps : {
				id : 'btnSearch',
				disabled : false,
				value : '조회',
				hidden : false
			},
			useMaxSucc : 0,
			useMaxFail : 0,
			maxData : [0,0,0,0,0,0],
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
			selectboxProps : {
				resSvrInfo : {
					id       : 'resSvrInfo',
					dataset  : [{}],
					width    : 200,
					value    : "",
					selected : 1,
					disabled : false
				},
				serTp : {
					id       : 'serTp',
					dataset  :  ComLib.convComboList([{CODE_NM: "전체", CODE: "ALL"},{CODE_NM: "작업별", CODE: "JOB_TP"},{CODE_NM: "콜타입별", CODE: "CALL_TP"}]),
					width    : 200,
					value    : "ALL",
					selected : 1,
					disabled : false
				}
			},	
			grdProps : {
				grdErrList : {
					id : 'grdErrList',
					areaName : 'STT 오류 내역',
					header: [
								{headerName: '발생건수',	field: 'CNT',	colId: 'CNT',	editable: false, width: 50, textAlign: 'center'},
								{headerName: '오류코드',	field: 'ERR_CD',	colId: 'ERR_CD',	editable: false, width: 70, textAlign: 'center'},
								{headerName: '오류내용',	field: 'ERR_MSG',	colId: 'ERR_MSG',	editable: false, width: 150},			
							],
					height: '300px'
				},			
				grdTotalList : {
					id : 'grdTotalList',
					areaName : 'STT 작업 내역',
					header: [						
								{headerName: '일자',	    field: 'REG_DT',	colId: 'REG_DT',	editable: false, width: 110, textAlign: 'center'},
								{headerName: '전체건수',	field: 'TOT_CNT',	colId: 'TOT_CNT',	editable: false, width: 110, textAlign: 'center'},
								{headerName: '성공건수',	field: 'SUCC_CNT',	colId: 'SUCC_CNT',	editable: false, width: 110, textAlign: 'center'},
								{headerName: '실패건수',	field: 'FAIL_CNT',	colId: 'FAIL_CNT',	editable: false, width: 110, textAlign: 'center'},
								{headerName: '변환율'  ,	field: 'SUCC_PER',	colId: 'SUCC_PER',	editable: false, width: 110, textAlign: 'center'},
								{headerName: '실패율'  ,	field: 'FAIL_PER',	colId: 'FAIL_PER',	editable: false, width: 110, textAlign: 'center'},
							],
					height: '310px'
				},
			},	
			dsJobInfo: DataLib.datalist.getInstance([]),		
			dsTotalJobList: DataLib.datalist.getInstance([]),	
			dsErrList: DataLib.datalist.getInstance([]),	
		}

		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.inputcalendar.onChange = this.event.inputcalendar.onChange.bind(this);
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);		
	}

   /*------------------------------------------------------------------------------------------------*/
   // [2. OnLoad Event Zone]
   /*------------------------------------------------------------------------------------------------*/
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
				this.transaction("STA030000_R00");

			})		
	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STA030000_R00':
			
			break;

		case 'STA030000_R01':
			if (StrLib.isNull(this.state.rangeCalendarProps.rgcSearch.startDate) || StrLib.isNull(this.state.rangeCalendarProps.rgcSearch.endDate) )  {
				ComLib.openDialog('A', 'COME0004', ['시작일자', '종료일자']);
				return false;				
			}

			if (this.state.rangeCalendarProps.rgcSearch.startDate > this.state.rangeCalendarProps.rgcSearch.endDate ) {
				ComLib.openDialog('A', 'SYSI0010', ['검색 시작일자가 종료일자보다 클 수 없습니다.']);
				return false;
			}
		
			break;	

		case 'STA010000_R02':

									
			
			
			break;
						
		default : break;
		}
		return true;
	}

	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (transId) => {
		// let transId = params[0];
		let transManager = new TransManager();


		// let searchVlaBrdCd, searchVlaBrdVer; 

		try {
			switch (transId) {
				
			case 'STA030000_R00':				
				transManager.setTransId(transId);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);	
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "COM.R_getSrvList",
					datasetsend: "dsSrchSvrInfo",
					datasetrecv: "dsSvrInfo"
				});
				
				transManager.addDataset('dsSrchSvrInfo', [{}]);
				transManager.agent();	
				break;

			case 'STA030000_R01':
				transManager.setTransId(transId);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);				
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "RES.R_getSearchJobTimeline",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsJobInfo",
				});
	
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "RES.R_getSearchErrTimeline",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsErrInfo",
				});

				transManager.addDataset('dsSearchParam', [{S_DATE: this.state.rangeCalendarProps.rgcSearch.startDate
					                                     , E_DATE: this.state.rangeCalendarProps.rgcSearch.endDate 
													     , SVR_HST : this.state.selectboxProps.resSvrInfo.value }]);
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
		
		var state = this.state;
		switch (res.id) {			
		case 'STA030000_R00':	
			let resSvrInfo = [];

			for(let intA = 0; intA < res.data.dsSvrInfo.length; intA++){	
				if (res.data.dsSvrInfo[intA].RESC_USE_FLAG === 'Y' && res.data.dsSvrInfo[intA].TRN_FLAG === 'Y') {
					resSvrInfo.push({CODE_NM: res.data.dsSvrInfo[intA]['NAME'], CODE: res.data.dsSvrInfo[intA]['VALUE']})	
						
				}	
			}	
			this.setState({...this.state, selectboxProps : {...this.state.selectboxProps, resSvrInfo: {...this.state.selectboxProps.resSvrInfo, dataset : ComLib.convComboList(resSvrInfo), value: resSvrInfo[0].CODE}}});							
			
			if (this.validation('STA030000_R01')) {
				this.transaction("STA030000_R01");
			}

			break;
		case 'STA030000_R01':		
			let dsJobInfo = res.data.dsJobInfo;
			let dsErrInfo = res.data.dsErrInfo;
			let allSECT    = dsJobInfo.filter((item) => item.SECT === 'ALL');	
			
			ComLib.setStateInitRecords(this, "dsTotalJobList", allSECT);
			ComLib.setStateInitRecords(this, "dsErrList", dsErrInfo);	
			
			let merged  = [];

			for (let i = 0; i < dsJobInfo.length; i ++) {
				let isExist    = false;
				let existIndex = -1;

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

			let serTp = this.state.selectboxProps.serTp.value;
			let useMaxSucc = 0;
			let useMaxFail = 0;
			let useSucc = {};
			let useFail = {};

			if (serTp === "ALL") {
				useMaxSucc = maxData[0];
				useMaxFail = maxData[1];
				useSucc    = this.state.options.allSucc;
				useFail    = this.state.options.allFail;

			} else if (serTp === "JOB_TP") {
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
			    options: {...this.state.options, useSucc: useSucc, useFail: useFail}})
			ComLib.setStateInitRecords(this, "dsJobInfo", merged);	

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
					if(this.validation("STA030000_R01")) {
						
						this.transaction("STA030000_R01")
					};
				break;
				default : break;
				}
			}
		},

		inputcalendar : {
			onCalendarClose : (e) => {
				switch (e.target.id) {
				case 'searchDateCalender' : break;
				default : break;
				}
			},
			onCalendarOpen : (e) => {
				switch (e.target.id) {
				case 'searchDateCalender' : break;
				default : break;
				}
			},
			onChange : (e) => {
				switch (e.target.id) {
				case 'searchDateCalender' :
					let endDate = e.endDate;
					if (endDate > DateLib.getAddDate(DateLib.getToday(), - 1)) {
						ComLib.openDialog('A', 'SYSI0010', ['통계 자료는 전일 까지 조회 가능 합니다.']);
						endDate = DateLib.getAddDate(DateLib.getToday(), - 1);
					}

					this.setState({...this.state, rangeCalendarProps : {...this.state.rangeCalendarProps, rgcSearch:{...this.state.rangeCalendarProps.rgcSearch, startDate : e.startDate, endDate : endDate}}});
					break;
				default : break;
				}
			}
		},
		
		selectbox : {
			onChange : (e) => {			
				switch (e.id) {
				case 'resSvrInfo' :							
					this.setState({...this.state, selectboxProps: {...this.state.selectboxProps, resSvrInfo: {...this.state.selectboxProps.resSvrInfo, value : e.target.value}}});
					break;		
				case 'serTp' :
					
					let useMaxSucc = 0;
					let useMaxFail = 0;
					let useSucc = {};
					let useFail = {};

					let serTp = e.target.value ;

					if (serTp === "ALL") {
						useMaxSucc = this.state.maxData[0];
						useMaxFail = this.state.maxData[1];
						useSucc    = this.state.options.allSucc;
						useFail    = this.state.options.allFail;
		
					} else if (serTp === "JOB_TP") {
						useMaxSucc = this.state.maxData[2];
						useMaxFail = this.state.maxData[3];
						useSucc    = this.state.options.jobSucc;
						useFail    = this.state.options.jobFail;
		
					} else {		
						useMaxSucc = this.state.maxData[4];
						useMaxFail = this.state.maxData[5];
						useSucc    = this.state.options.callSucc;
						useFail    = this.state.options.callFail;
					}
					console.log(this.state)
					this.setState({...this.state, selectboxProps: {...this.state.selectboxProps, serTp: {...this.state.selectboxProps.serTp, value : e.target.value}}
					                            , useMaxSucc: useMaxSucc, useMaxFail: useMaxFail
											    , options: {...this.state.options, useSucc: useSucc, useFail: useFail}});
					break;
				default : break;
				}
			}
		}
	}

	render () {
		return (
			<React.Fragment>
				<FullPanel>					
					<SearchPanel>
						<RelativeGroup>
							<LFloatArea>
								<FlexPanel>
									<Label value={this.state.rangeCalendarProps.rgcSearch.label}/>
									<RangeInputCalendar
										id        = {this.state.rangeCalendarProps.rgcSearch.id}
										strtId    = {this.state.rangeCalendarProps.rgcSearch.strtId}
										endId     = {this.state.rangeCalendarProps.rgcSearch.endId}	
										startDate = {this.state.rangeCalendarProps.rgcSearch.startDate}
										endDate   = {this.state.rangeCalendarProps.rgcSearch.endDate}
										disabled  = {this.state.rangeCalendarProps.rgcSearch.disabled}
										onChange  = {this.event.inputcalendar.onChange}
									/>
									<Selectbox
										id = {this.state.selectboxProps.resSvrInfo.id}
										value = {this.state.selectboxProps.resSvrInfo.value}
										dataset = {this.state.selectboxProps.resSvrInfo.dataset}
										width = {this.state.selectboxProps.resSvrInfo.width}
										disabled = {this.state.selectboxProps.resSvrInfo.disabled}
										selected = {this.state.selectboxProps.resSvrInfo.selected}
										onChange= {this.event.selectbox.onChange}
									/>
								</FlexPanel>							
							</LFloatArea>
							<RFloatArea>
							<Button 
								id = {this.state.buttonProps.id}
								value = {this.state.buttonProps.value}
								disabled = {this.state.buttonProps.disabled}
								hidden = {this.state.buttonProps.hidden}
								onClick = {this.event.button.onClick}
								// mr = {10}									 							
								color = 'blue' 
								icon = {'srch'}
								innerImage={true}
								fiiled = "o"
									
							/>
							</RFloatArea>	
						</RelativeGroup>										
					</SearchPanel>
					<SubFullPanel>
						<FlexPanel>
							<ComponentPanel width={'60%'}>
								<RFloatArea>
									<Selectbox
										id       = {this.state.selectboxProps.serTp.id}
										value    = {this.state.selectboxProps.serTp.value}
										dataset  = {this.state.selectboxProps.serTp.dataset}
										width    = {this.state.selectboxProps.serTp.width}
										disabled = {this.state.selectboxProps.serTp.disabled}
										selected = {this.state.selectboxProps.serTp.selected}
										onChange = {this.event.selectbox.onChange}
									/>
								</RFloatArea>	
								<div style={{height: "50%", width:"100%"}}>
									<Label value = {"STT 성공 건수"} />
									<ScrmLineBarChart 
										data = {this.state.dsJobInfo.getRecords()}
										maxData = {this.state.useMaxSucc}
										unit    = {"건"}
										options = {this.state.options.useSucc}	
										aspect={4.0/1.1}						
									/>
								</div>
								<div style={{height: "50%", width:"100%"}}>
									<Label value = {"STT 실패 건수"} />
									<ScrmLineBarChart 
										data = {this.state.dsJobInfo.getRecords()}
										maxData = {this.state.useMaxFail}
										unit    = {"건"}
										options = {this.state.options.useFail}	
										aspect={4.0/1.1}						
									/>
								</div>
							</ComponentPanel>
							<ComponentPanel width={'40%'}>
								<Grid
									id       = {this.state.grdProps.grdTotalList.id} 
									areaName = {this.state.grdProps.grdTotalList.areaName}
									header   = {this.state.grdProps.grdTotalList.header}
									data     = {this.state.dsTotalJobList}
									height   = {this.state.grdProps.grdTotalList.height}
									rowNum      = {false}
									addRowBtn   = {false}
									delRowBtn   = {false}
									dnlExcelBtn = {true}						
								/>
								
								<Grid
									id       = {this.state.grdProps.grdErrList.id} 
									areaName = {this.state.grdProps.grdErrList.areaName}
									header   = {this.state.grdProps.grdErrList.header}
									data     = {this.state.dsErrList}
									height   = {this.state.grdProps.grdErrList.height}
									rowNum      = {false}
									addRowBtn   = {false}
									delRowBtn   = {false}
									dnlExcelBtn = {true}						
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


