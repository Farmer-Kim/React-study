// 대시보드
import React from 'react';
import { ComLib
	   , DataLib
	   , StrLib
	   , TransManager
	   , newScrmObj       } from 'common';
import { SubFullPanel
	   , FlexPanel
	   , ComponentPanel
	   , RelativeGroup    } from 'components';
import { ScrmLineBarChart
	   , Selectbox        
	   , ScrmBarChart
	   , ProgressBar
	   , Table} from 'components';
import { PieChart         } from 'react-minimal-pie-chart';
import { Label            } from 'components';

const svrDivColor = ['darkRed','darkGreen','dodgerBlue','darkCyan','gray'];

class View extends React.Component {
	/*------------------------------------------------------------------------------------------------*/
	// [1. Default State Zone] 
	/*------------------------------------------------------------------------------------------------*/
	constructor(props) {
		
		super(props);
		
		this.state = {
			timeoutID: null,
			jobTpselected: null,
			jobTphoverd : undefined,
			callTphoverd: undefined,
			jobTpDiagramData  : { title: '', value: "", color: 'darkGreen' },
			callTpDiagramData : { title: '', value: "", color: 'darkGreen' },
			allData   : null,
			jobTpData : null,
			CallTpData: null,
			maxData   : 0,
			selectboxProps : {
				jobSvrInfo : {
					id       : 'jobSvrInfo',
					dataset  : [{}],
					width    : 200,
					value    : "",
					selected : 1,
					disabled : false
				},
				resSvrInfo : {
					id       : 'resSvrInfo',
					dataset  : [{}],
					width    : 200,
					value    : "",
					selected : 1,
					disabled : false
				}
			},
			options : {
				XAsisKey : '',
				dataKey  : [{}],
			},
			options2 : {
				XAsisKey : 'TM',
				dataKey  : [{}],
			},
			dailyOptions :{
				YAsisKey : 'PATH',
				dataKey  : [{key: '/', color: ''}],
			
			},
			dsResStatsticDaily : {
				SVR_HST : '',
				CPU : '',
				MEM : '',
				IO : '',
				DISK : '',
				SWAP : '',
				SVR_CONT : '',
				TM: ''
			},
			dsSvrResourceAvgMax: 
				[{AVG_CPU : '',
				AVG_IO  : '',
				AVG_MEM : '',
				AVG_SWAP: '',
				MAX_CPU : '',
				MAX_IO  : '',
				MAX_MEM : '',
				MAX_SWAP: '',
				SVR_CONT: '',
				SVR_HST : ''}]
			,
			dsJobStatisticDaily : {		
				SUCC_CNT_PERCENTAGE : '',
				FAIL_CNT_PERCENTAGE : '',
				REG_TIME    : '',
				TOTAL_CNT   : 0,
				SUCC_CNT    : 0,
				FAIL_CNT    : 0,
				FILE_SIZE   : 0,
				FILE_LENGTH : 0,
				TYPEN       : 0,
				TYPER       : 0,
				TYPES       : 0,
			},
		

			dsSrvDailyJobInfo : DataLib.datalist.getInstance([]),
			dsSrvDailyJobInfoforGraph: DataLib.datalist.getInstance([]),
			dsSrvDailyResInfo : DataLib.datalist.getInstance([]),
			dsSrvDailyResInfoforGraph: DataLib.datalist.getInstance([]),
				
		}
		
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);
		
	}
	/*------------------------------------------------------------------------------------------------*/
	// [2. OnLoad Event Zone]
	/*------------------------------------------------------------------------------------------------*/

	componentDidMount () {
		this.transaction('COM010000_R01');
	}
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (id) => {
		switch (id) {			
			case 'COM010000_R01' :				
				break;
			case 'COM010000_R02' :
				if (!StrLib.isNull(this.state.timeoutID)) {
					clearTimeout(this.state.timeoutID);
				}				

				var timeoutID = setTimeout(() => {
					if (document.getElementById('COM010000').style.cssText === "display: block;") {
						if (this.validation('COM010000_R02')) {
							this.transaction('COM010000_R02');
						} 
						
					} else {
						this.validation('COM010000_R02');
						
					}					
				}, 30000);	

				if (this.state.timeoutID !== timeoutID) {
					this.setState({...this.state, timeoutID: timeoutID});
				}
				
				break;
			default :
				break;
		}
		return true;
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (serviceid) => {		
		let transManager = new TransManager();

		transManager.setProgress(false);			
		transManager.setTransId (serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try  {
			switch (serviceid) {
			case 'COM010000_R01':
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "COM.R_getSrvList",
					datasetsend: "dsSrchSvrInfo",
					datasetrecv: "dsSvrInfo"
				});
				
				transManager.addDataset('dsSrchSvrInfo', [{}]);
				break;

			case 'COM010000_R02':					
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT_STATIS.R_getSrvJobStatistic",
					datasetsend: "dsSvrJobStaticInfo",
					datasetrecv: "dsSvrJobInfo"
				});

				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT_STATIS.R_getSrvAllJobStatisticDaily",
					datasetsend: "dsSvrJobStaticInfo",
					datasetrecv: "dsSvrAllJobDailyInfo"
				});	
				
				transManager.addDataset('dsSvrJobStaticInfo', [{"SVR_HST" : this.state.selectboxProps.jobSvrInfo.value}]);	

				break;

			case 'COM010000_R03':
				transManager.addConfig({		
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "RES.R_DailyResLast",
					datasetsend: "dsSearch",
					datasetrecv: "dsSvrResourceInfoDaily"
				});
				transManager.addConfig({		
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "RES.R_DailyResMax",
					datasetsend: "dsSearch",
					datasetrecv: "dsSvrResourceAvgMax"
				});
				transManager.addConfig({		
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "RES.R_DailyResTimeline",
					datasetsend: "dsSearch",
					datasetrecv: "dsSrvDailyResInfoforGraph"
				});		
				
				transManager.addDataset('dsSearch', [{"SVR_HST" : this.state.selectboxProps.resSvrInfo.value}]);

				break;
				
			default: break;
			}
			
			transManager.agent();

		} catch (err) {			
			console.log(err);
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {		
		switch (res.id) {
		case 'COM010000_R01' :
			let jobSvrInfo = [];
			let resSvrInfo = [];

			for(let intA = 0; intA < res.data.dsSvrInfo.length; intA++){	
				if (res.data.dsSvrInfo[intA].RESC_USE_FLAG === 'Y') {
					resSvrInfo.push({CODE_NM: res.data.dsSvrInfo[intA]['NAME'], CODE: res.data.dsSvrInfo[intA]['VALUE']})	
									
					if (res.data.dsSvrInfo[intA].TRN_FLAG === 'Y') {
						jobSvrInfo.push({CODE_NM: res.data.dsSvrInfo[intA]['NAME'], CODE: res.data.dsSvrInfo[intA]['VALUE']})	
					}
				}	
				// res.data.dsSvrInfo[intA].CODE_NM = res.data.dsSvrInfo[intA]['NAME'];
				// res.data.dsSvrInfo[intA].CODE    = res.data.dsSvrInfo[intA]['VALUE'];
				// delete res.data.dsSvrInfo[intA].NAME;
				// delete res.data.dsSvrInfo[intA].VALUE;
			}					

			this.setState({...this.state, selectboxProps : {...this.state.selectboxProps, jobSvrInfo: {...this.state.selectboxProps.jobSvrInfo, dataset : ComLib.convComboList(jobSvrInfo, newScrmObj.constants.select.argument.all)}
																						, resSvrInfo: {...this.state.selectboxProps.resSvrInfo, dataset : ComLib.convComboList(resSvrInfo), value: resSvrInfo[0].CODE}}});							
			
			if (this.validation('COM010000_R02')) {
				this.transaction("COM010000_R02");
				this.transaction("COM010000_R03");
			}
			
			break;

		case 'COM010000_R02' :
			
			ComLib.setStateInitRecords(this, "dsSrvDailyJobInfo", res.data.dsSvrJobInfo);	

			let allSECT    = this.state.dsSrvDailyJobInfo.getRecords().filter((item) => item.SECT === 'ALL');			
			let jobTpSECT  = this.state.dsSrvDailyJobInfo.getRecords().filter((item) => item.SECT === 'JOB_TP');
			let callTpSECT = this.state.dsSrvDailyJobInfo.getRecords().filter((item) => item.SECT === 'CALL_TP');

			let totalSeconds = allSECT[0].REC_TM;
			let hours = Math.floor(totalSeconds / 3600);

			totalSeconds %= 3600;

			let minutes = Math.floor(totalSeconds / 60);
			let seconds = totalSeconds % 60;

			let time = (hours > 0 ? hours + ":" : null) +  minutes + ":" + seconds;
			
			allSECT[0].REC_TM_HMS = time;

			let jobTpDiagramData  = [];
			let callTpDiagramData = [];

			for (let i = 0; i < jobTpSECT.length; i ++) {
				if (jobTpSECT[i].SUCC_CNT > 0) {
					jobTpDiagramData.push({title: jobTpSECT[i].TP_CONT, value: jobTpSECT[i].SUCC_CNT, color: ComLib.getComCodeCdVal("CMN", jobTpSECT[i].TP, "JOB_TP")})
				}
			}
			
			for (let i = 0; i < callTpSECT.length; i ++) {
				if (callTpSECT[i].SUCC_CNT > 0) {
					callTpDiagramData.push({title: callTpSECT[i].TP_CONT, value: callTpSECT[i].SUCC_CNT, color: ComLib.getComCodeCdVal("CMN", callTpSECT[i].TP, "CALL_TP")})
				}
			}
			
			let obj       = {};
			let fillTLObj = {};
			let svrJobArr    = [];
			let svr          = [];
			let svrChartView = []
			let strJobData   = [];
			let fillArr      = [];
			let number       = "";
			
			for(let intA = 0; intA < 24; intA ++){
				if(intA < 10)
					number += "0" + intA + "=" + 0 + ",";
				else if(intA < 23)
					number += intA + "=" + 0 + ",";
				else
					number += intA + "=" + 0;
			}

			fillTLObj.TIMELINE = number;
			let maxData = 0;
			for(let intA=0; intA<res.data.dsSvrAllJobDailyInfo.length; intA++ ){
				svr[intA] = res.data.dsSvrAllJobDailyInfo[intA].SVR_HST;

				svrChartView.push({"key" : svr[intA], "color" : svrDivColor[intA], "name": svr[intA]} );

				strJobData[intA] = res.data.dsSvrAllJobDailyInfo[intA].TIMELINE;

				fillArr = fillTLObj.TIMELINE.split(',');

				let arr = strJobData[intA].split(',');
				
				for(let intB=0; intB < fillArr.length; intB++){
					for(let intC=0; intC < arr.length; intC++){
						if (fillArr[intB].substring(0, 2) === arr[intC].substring(0, 2)) {
							fillArr[intB] = arr[intC];

							break;
						}
					}
					
					obj.name = fillArr[intB].substring(0,2);					
						
					svr[intA-1] = svr[intA-1] === undefined ? svr[intA] : svr[intA-1];

					if(obj.name === fillArr[intB].substring(0,fillArr[intB].indexOf("=")) && (svr[intA-1] !== svr[intA])){	
					//  같은 시간 작업 Index를 찾는다. (prev <--> curr)
						let index = svrJobArr.findIndex(x => x.name === obj.name);		

						svrJobArr[index][svr[intA]] = fillArr[intB].substring(3,fillArr[intB].length);	

					} else {		
						svrJobArr.push(
							{
								"name" : obj.name,
								[svr[intA]] :fillArr[intB].substring(3,fillArr[intB].length)
							}
						)
						if (maxData < Number(fillArr[intB].substring(3,fillArr[intB].length))) {
							maxData = Number(fillArr[intB].substring(3,fillArr[intB].length));
						}								
					}
				}
			}
			
			this.setState({...this.state, jobTpDiagramData: jobTpDiagramData
				, callTpDiagramData:callTpDiagramData
				, maxData   : maxData
				, allData   : allSECT
				, jobTpData : jobTpSECT
				, CallTpData: callTpSECT
				, options : {...this.state.options,	dataKey : svrChartView }});

			ComLib.setStateInitRecords(this, "dsSrvDailyJobInfoforGraph", svrJobArr);
			
			break;
			
		case 'COM010000_R03' :			
			let strResData= [];
			let svrResArr = [];
			let svrBarChartView = [];
							

			let svrChartView2 = [{"key" : "CPU", "color" : svrDivColor[0], "name" : "CPU"}
		                        ,{"key" : "MEM", "color" : svrDivColor[1], "name" : "MEM"}
							    ,{"key" : "SWAP", "color" : svrDivColor[2], "name" : "SWAP"}
								,{"key" : "IO", "color" : svrDivColor[3], "name" : "IO"}];
			let org = res.data.dsSrvDailyResInfoforGraph;
			let reversed = [];
			let maxData2 = 0;
			for (var intA = org.length - 1; intA > -1; intA--) {
				reversed.push(org[intA]);
				if (maxData2 < org[intA].CPU) {
					maxData2 = org[intA].CPU;
				}
				
				if (maxData2 < org[intA].MEM) {
					maxData2 = org[intA].MEM;
				}
				
				if (maxData2 < org[intA].SWAP) {
					maxData2 = org[intA].SWAP;
				}
				
				if (maxData2 < org[intA].IO) {
					maxData2 = org[intA].IO;
				}
			}

			ComLib.setStateInitRecords(this, "dsSrvDailyResInfoforGraph", reversed);
			
			if(res.data.dsSvrResourceInfoDaily.length > 0) {	
				strResData = JSON.parse(res.data.dsSvrResourceInfoDaily[0].DISK);
				for (var intA = 0; intA < strResData.length; intA++) {
					let key = strResData[intA].PATH;
					let value = strResData[intA].USAGE;	
					svrResArr.push({ [key] : value});
					svrBarChartView.push({"key" : strResData[intA].PATH });
					svrBarChartView[intA].color = svrDivColor[intA];
				}
				this.setState({...this.state, dailyOptions : {...this.state.dailyOptions, dataKey : svrBarChartView }
					                        , dsResStatsticDaily : res.data.dsSvrResourceInfoDaily[0]
										    , dsSvrResourceAvgMax : res.data.dsSvrResourceAvgMax
											, options2 : {...this.state.options2,	dataKey : svrChartView2 }
										    , maxData2 : maxData2 + 5});
				ComLib.setStateInitRecords(this, "dsSrvDailyResInfo", svrResArr);								
			}else{
				this.setState({...this.state, dailyOptions : {...this.state.dailyOptions, dataKey : [{key: '/', color: '#ffcf02'}] }
			                                , dsResStatsticDaily : {CPU: 0, MEM: 0, IO: 0, DISK: 0}
										    , dsSvrResourceAvgMax: [{AVG_CPU: 0, MAX_CPU: 0, AVG_MEM: 0, MAX_MEM: 0}]
											, options2 : {...this.state.options2,	dataKey : svrChartView2 }
											, maxData2 :  maxData2 + 5});
				ComLib.setStateRecords(this, "dsSrvDailyResInfo", []);		
			}

			break;
		default :  break;
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		onFailClick : (e) => {
			let params  = {type: this.state.selectboxProps.jobSvrInfo.value};
			let option1 = { width: '600px', height: '550px', modaless: false, params}

			ComLib.openPop('COM010001', 'STT 처리 오류', option1);
		},
		button : {
			onClick : () =>  {   
				
			}
		},
		selectbox : {
			onChange : (e) => {			
				switch (e.id) {
				case 'jobSvrInfo' :			
				
					this.setState({...this.state, selectboxProps: {...this.state.selectboxProps, jobSvrInfo: {...this.state.selectboxProps.jobSvrInfo, value : e.target.value}}}, 
							() => {
								if (this.validation('COM010000_R02')) {
									this.transaction("COM010000_R02");
								}
							}
						);
					break;	
				case 'resSvrInfo' :			
				
					this.setState({...this.state, selectboxProps: {...this.state.selectboxProps, resSvrInfo: {...this.state.selectboxProps.resSvrInfo, value : e.target.value}}}, 
							() => {
								if (this.validation('COM010000_R03')) {
									this.transaction("COM010000_R03");
								}
							}
						);
					break;				
				default : break;
				}
			}
		}
	}
	setSelected = (e, type) => {
		let {jobTpDiagramData, callTpDiagramData} = this.state;
		if (type === "jobTp") {
			if (e !== undefined) {
				this.setState({...this.state, jobTphoverd : jobTpDiagramData[e].title, jobTpselected: e});
	
			} 
		} else {
			if (e !== undefined) {
				this.setState({...this.state, callTphoverd : callTpDiagramData[e].title, callTpselected: e});
	
			} 
		}
		
	}
	setHovered = (e, type) => {
		let {jobTpDiagramData, callTpDiagramData} = this.state;
		if (type === "jobTp") {
			if (e !== undefined) {
				this.setState({...this.state, jobTphoverd : jobTpDiagramData[e].title, jobTpselected: e});
	
			} else {
				this.setState({...this.state, jobTphoverd : undefined, jobTpselected: e});

			}
		} else {
			if (e !== undefined) {
				this.setState({...this.state, callTphoverd : callTpDiagramData[e].title, callTpselected: e});
	
			} else {
				this.setState({...this.state, callTphoverd : undefined, callTpselected: e});
				
			}

		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [7. render Zone]
	//  - 화면 관련 내용 작성
	/*------------------------------------------------------------------------------------------------*/
	render () {
		let {jobTpDiagramData, callTpDiagramData, allData, jobTpData, CallTpData} = this.state;		
		return (
			<React.Fragment>
				<SubFullPanel>
					<FlexPanel>
						<ComponentPanel width={'55%'}>	
							<RelativeGroup>
								<FlexPanel>		
									<div>							
										<Selectbox
											id = {this.state.selectboxProps.jobSvrInfo.id}
											value = {this.state.selectboxProps.jobSvrInfo.value}
											dataset = {this.state.selectboxProps.jobSvrInfo.dataset}
											width = {this.state.selectboxProps.jobSvrInfo.width}
											disabled = {this.state.selectboxProps.jobSvrInfo.disabled}
											selected = {this.state.selectboxProps.jobSvrInfo.selected}
											onChange= {this.event.selectbox.onChange}
										/>
										<div>
											<h3 className="scrm-dash-h3">처리건수 : <span>{allData !== null ? allData[0].TOT_CNT + " 건": "0 건"}</span></h3>
										</div>
										{allData !== null ?
											<div className="scrm-dash-data1">
												<h5 style={{color: 'darkGreen'}}>성공건수 {allData[0].SUCC_CNT}건</h5>									
												<h5 style={{color: 'grey',cursor:'pointer'}} onClick={this.event.onFailClick}>실패건수 {allData[0].FAIL_CNT}건</h5>
											</div>		
											: 
											null
										}	
										{allData !== null ?
											<div className="srcm-dash-data3">
												<div>
													<p>녹취시간 {allData[0].REC_TM_HMS} </p>
												</div>
												<div>
													<p>파일크기 {allData[0].FILE_SIZE_GB} GB </p>
												</div>
											</div>		
											: 
											null
										}
										
									</div>
									<div>
										<div>
											<h3 className="scrm-dash-h3">작업구분별 성공건수</h3>
										</div>
										<FlexPanel>	
											{CallTpData !== null && allData[0].SUCC_CNT > 0
												?
													<PieChart
														style={{ height: '200px' }}
														data={jobTpDiagramData}
														radius={55}
														viewBoxSize={[120,120]}
														center={[70, 60]}
														lineWidth={50}
														lengthAngle={360}
														label={({ dataEntry }) => Math.round(dataEntry.percentage) + '%'}
														labelPosition={80}
														segmentsStyle={{ transition: 'stroke .3s', cursor: 'pointer' }}
														segmentsShift={(index) => (index === this.state.jobTpselected ? 4 : 0)}
														labelStyle={{
															fontSize: "10px",
															fill: '#fff',
															opacity: 0.75,
															pointerEvents: 'none',
														}}												
														onMouseOver={(_, index) => {
															this.setHovered(index, "jobTp");
														}}
														onMouseOut={() => {
															this.setHovered(undefined, "jobTp");
														}}
														animate		
													/>			
												:
													<div className="scrm-dash-data1" style={{marginLeft: "55px"}}>
														<h5 style={{color:"gray", marginLeft: "55px"}}>STT 처리 성공 없음</h5>
													</div>
											}					
											{jobTpData !== null && allData[0].SUCC_CNT > 0
												?
													<div className="scrm-dash-data1">
														{jobTpData.map((item, index) => {
															let title = item.TP_CONT + ": " + item.SUCC_CNT;
															let color = ComLib.getComCodeCdVal("CMN", item.TP, "JOB_TP");
														
															return <h5 key={index} style={{color:color}}>{title} </h5>													
														})}
														{this.state.jobTphoverd !== undefined ?
															<div className="srcm-dash-data3">
																{jobTpData.map((item, index) => {
																	let title = item.TP_CONT + ": " + item.SUCC_CNT;
																	let detail = "전체: " + item.TOT_CNT + ", " + "실패: " + item.FAIL_CNT;
																	let color = ComLib.getComCodeCdVal("CMN", item.TP, "JOB_TP");
																	if (this.state.jobTphoverd === ComLib.getComCodeName("CMN", item.TP, "JOB_TP")) {
																		return (<div key={index+"_div"}>
																					<h5 key={index+"_title"} style={{color:color}}>{title} </h5>
																					<h6 key={index+"_detail"} style={{color:color}}>{detail} </h6>																				
																				</div>)
																	} 															
																})}
															</div>
															:
															null
														}														
													</div>		
												: 
													<div className="scrm-dash-data1"/>
											}	
										</FlexPanel>
									</div>
									<div>
										<div>
											<h3 className="scrm-dash-h3">콜구분별 성공건수</h3>
										</div>
										<FlexPanel>	
											{CallTpData !== null && allData[0].SUCC_CNT > 0
												?
													<PieChart
														style       = {{ height: '200px' }}
														data        = {callTpDiagramData}
														radius      = {55}													
														center      = {[70, 60]}
														lineWidth   = {50}
														lengthAngle = {360}
														viewBoxSize = {[120,120]}
														label         = {({ dataEntry }) => Math.round(dataEntry.percentage) + '%'}
														labelPosition = {80}
														segmentsStyle = {{ transition: 'stroke .3s', cursor: 'pointer' }}
														segmentsShift = {(index) => (index === this.state.callTpselected ? 4 : 0)}
														labelStyle    = {{
															fontSize: "10px",
															fill: '#fff',
															opacity: 0.75,
															pointerEvents: 'none',
														}}												
														onMouseOver = {(_, index) => {this.setHovered(index    , "callTp");}}
														onMouseOut  = {()         => {this.setHovered(undefined, "callTp");}}	
													/>			
												:
													<div className="scrm-dash-data1" style={{marginLeft: "55px"}}>
														<h5 style={{color:"gray", marginLeft: "55px"}}>STT 처리 성공 없음</h5>
													</div>
											}

											{CallTpData !== null && allData[0].SUCC_CNT > 0
												?
													<div className="scrm-dash-data1">
														{CallTpData.map((item, index) => {
															let title = item.TP_CONT + " : " + item.SUCC_CNT + " 건"
															let color = ComLib.getComCodeCdVal("CMN", item.TP, "CALL_TP")

															return <h5 key={index} style={{color:color}}>{title} </h5>
														})}
														{this.state.callTphoverd !== undefined ?
															<div className="srcm-dash-data3">
																{CallTpData.map((item, index) => {
																	let title  = item.TP_CONT + ": " + item.SUCC_CNT;
																	let detail = "전체: " + item.TOT_CNT + ", " + "실패: " + item.FAIL_CNT;
																	let color  = ComLib.getComCodeCdVal("CMN", item.TP, "CALL_TP");

																	if (this.state.callTphoverd === ComLib.getComCodeName("CMN", item.TP, "CALL_TP")) {
																		return (<div key={index+"_div"}>
																					<h5 key={index+"_title"}  style={{color:color}}>{title}  </h5>
																					<h6 key={index+"_detail"} style={{color:color}}>{detail} </h6>																				
																				</div>)
																	} 															
																})}
															</div>
															:
															null
														}
													</div>		
												: 
													<div className="scrm-dash-data1"/>
											}	
										</FlexPanel>
									</div>
								</FlexPanel>
							</RelativeGroup>
							<RelativeGroup>
								<Label value = {"서버별 금일 작업 내역"} />
								<ScrmLineBarChart 
									data = {this.state.dsSrvDailyJobInfoforGraph.getRecords()}
									maxData = {this.state.maxData}
									unit    = {"건"}
									options = {this.state.options}	
									aspect={4.0/1.8}						
								/>
							</RelativeGroup>
						</ComponentPanel>		
						<ComponentPanel width={'40%'}>
							<div>
								<Selectbox
									id = {this.state.selectboxProps.resSvrInfo.id}
									value = {this.state.selectboxProps.resSvrInfo.value}
									dataset = {this.state.selectboxProps.resSvrInfo.dataset}
									width = {this.state.selectboxProps.resSvrInfo.width}
									disabled = {this.state.selectboxProps.resSvrInfo.disabled}
									selected = {this.state.selectboxProps.resSvrInfo.selected}
									onChange= {this.event.selectbox.onChange}
								/>
							</div>
							<div className="scrm-dash-data11">
								<RelativeGroup>
									<div style={{width: "100%", height: "200px"}}> 
										<h4>DISK 사용률</h4>
										<ScrmBarChart
											data = {this.state.dsSrvDailyResInfo.records}	
											layout = {'vertical'}								
											dailyOptions = {this.state.dailyOptions}
										/>			
									</div>
									<FlexPanel>
										<Table  
											id="tblUsrDetInfo" 
											colGrp = {[{width: '25%'}, {width: '25%'}, {width: '25%'}, {width: '25%'}]}
											tbData = {[
												[   {type : 'D', value : <div style={{marginLeft: "5px"}}>
																			<h4>CPU 사용률</h4>
																			<ProgressBar
																				data={this.state.dsResStatsticDaily.CPU !== undefined ? this.state.dsResStatsticDaily.CPU : 0}
																				options={{type: 'circle', status: 'active'}}
																			/>
																			<h4>최고치 : {this.state.dsSvrResourceAvgMax[0].MAX_CPU !== undefined ? this.state.dsSvrResourceAvgMax[0].MAX_CPU : 0}%</h4>
																			<h4>평균치 : {this.state.dsSvrResourceAvgMax[0].AVG_CPU !== undefined ? this.state.dsSvrResourceAvgMax[0].AVG_CPU : 0}%</h4>
																		</div>},
																		{type : 'D', value : <div style={{marginLeft: "5px"}}>
											<h4>Memory 사용률</h4>
											{/* <ProgressBar data={this.state.dsResStatsticDaily.MEM}		options={{type: 'circle', status: 'active'}}/> */}
											<ProgressBar
												data={this.state.dsResStatsticDaily.MEM !== undefined ? this.state.dsResStatsticDaily.MEM : 0}
												options={{type: 'circle', status: 'active'}}
											/>
											<h4>최고치 : {this.state.dsSvrResourceAvgMax[0].MAX_MEM !== undefined ? this.state.dsSvrResourceAvgMax[0].MAX_MEM : 0}%</h4>
											<h4>평균치 : {this.state.dsSvrResourceAvgMax[0].AVG_MEM !== undefined ? this.state.dsSvrResourceAvgMax[0].AVG_MEM : 0}%</h4>
										</div>},
																		{type : 'D', value : <div style={{marginLeft: "5px"}}>
											<h4>SWAP 사용률</h4>
											<ProgressBar
												data={this.state.dsResStatsticDaily.SWAP !== undefined ? this.state.dsResStatsticDaily.SWAP : 0}
												options={{type: 'circle', status: 'active'}}
											/>
											<h4>최고치 : {this.state.dsSvrResourceAvgMax[0].MAX_SWAP !== undefined ? this.state.dsSvrResourceAvgMax[0].MAX_SWAP : 0}%</h4>
											<h4>평균치 : {this.state.dsSvrResourceAvgMax[0].AVG_SWAP !== undefined ? this.state.dsSvrResourceAvgMax[0].AVG_SWAP : 0}%</h4>
										</div>},
																		{type : 'D', value : <div style={{marginLeft: "5px"}}>
											<h4>IO 사용률</h4>
											<ProgressBar
												data={this.state.dsResStatsticDaily.IO !== undefined ? this.state.dsResStatsticDaily.IO : 0}
												options={{type: 'circle', status: 'active'}}
											/>
											<h4>최고치 : {this.state.dsSvrResourceAvgMax[0].MAX_IO !== undefined ? this.state.dsSvrResourceAvgMax[0].MAX_IO : 0}%</h4>
											<h4>평균치 : {this.state.dsSvrResourceAvgMax[0].AVG_IO !== undefined ? this.state.dsSvrResourceAvgMax[0].AVG_IO : 0}%</h4>
										</div>},
																							
												]
											]}
										/>
									</FlexPanel>
									<FlexPanel>	
										<RelativeGroup>
											<Label value = {"리소스 내역"} />								
											<ScrmLineBarChart 
												data = {this.state.dsSrvDailyResInfoforGraph.getRecords()}
												maxData = {this.state.maxData2}
												unit    ={"%"}
												options = {this.state.options2}	
												aspect={4.0/1.2}						
											/>
										</RelativeGroup>
									</FlexPanel>
								</RelativeGroup>
							</div>
						</ComponentPanel>				
					</FlexPanel>
				</SubFullPanel>			

				
			</React.Fragment>
		);
	}
}
export default View;