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
	   , Selectbox        } from 'components';
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
			selectboxProps : {
				id       : 'svrList',
				dataset  : [{}],
				width    : 200,
				value    : "",
				selected : 1,
				disabled : false
			},
			options : {
				XAsisKey : '',
				dataKey  : [{}],
			},
			dailyOptions :{
				YAsisKey : 'PATH',
				dataKey  : [{key: '/', color: ''}],
			
			},
			dsResStatsticDaily : {
				SVR_HST : '',
				REG_DTM : '',
				CPU : '',
				MEM : '',
				IO : '',
				DISK : '',
				SWAP : '',
				PROC_STATE : '',
				MIN_CPU : '',
				MIN_IO : '',
				MIN_MEM : '',
				MIN_SWAP : '',
				MAX_CPU : '',
				MAX_IO : '',
				MAX_MEM : '',
				MAX_SWAP : '',
			},
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
					sqlmapid   : "COM.R_getSrvJobStatistic",
					datasetsend: "dsSvrJobStaticInfo",
					datasetrecv: "dsSvrJobInfo"
				});

				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "COM.R_getSrvAllJobStatisticDaily",
					datasetsend: "dsSvrJobStaticInfo",
					datasetrecv: "dsSvrAllJobDailyInfo"
				});	
				
				transManager.addDataset('dsSvrJobStaticInfo', [{"SVR_HST" : this.state.selectboxProps.value}]);	

				break;

			case 'COM010000_R03':
				transManager.addConfig({		
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "COM.R_getSrvResourceStatisticDaily",
					datasetsend: "dsSvrResourceStaticInfoDaily",
					datasetrecv: "dsSvrResourceInfoDaily"
				});
				
				transManager.addDataset('dsSvrResourceStaticInfoDaily', [{"SVR_HST" : this.state.selectboxProps.value}]);

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
			for(let intA = 0; intA < res.data.dsSvrInfo.length; intA++){					
				res.data.dsSvrInfo[intA].CODE_NM = res.data.dsSvrInfo[intA]['NAME'];
				res.data.dsSvrInfo[intA].CODE    = res.data.dsSvrInfo[intA]['VALUE'];
				delete res.data.dsSvrInfo[intA].NAME;
				delete res.data.dsSvrInfo[intA].VALUE;
			}
			
			this.setState({...this.state, selectboxProps : {...this.state.selectboxProps, dataset : ComLib.convComboList(res.data.dsSvrInfo, newScrmObj.constants.select.argument.all)}});							
			
			if (this.validation('COM010000_R02')) {
				this.transaction("COM010000_R02");
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

			for(let intA=0; intA<res.data.dsSvrAllJobDailyInfo.length; intA++ ){
				svr[intA] = res.data.dsSvrAllJobDailyInfo[intA].SVR_HST;

				svrChartView.push({"key" : svr[intA], "color" : svrDivColor[intA]} );

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
					}
				}
			}
			
			this.setState({...this.state, jobTpDiagramData: jobTpDiagramData
				, callTpDiagramData:callTpDiagramData
				, allData   : allSECT
				, jobTpData : jobTpSECT
				, CallTpData: callTpSECT
				, options : {...this.state.options,	dataKey : svrChartView }});

			ComLib.setStateInitRecords(this, "dsSrvDailyJobInfoforGraph", svrJobArr);

			this.transaction("COM010000_R03");
			break;
			
		case 'COM010000_R03' :			
			// let strResData= [];
			// let svrResArr = [];
			// let svrBarChartView = [];
				
			// console.log(res.data.dsSvrResourceInfoDaily)

			// if(res.data.dsSvrResourceInfoDaily.length > 0) {	
			// 	strResData = JSON.parse(res.data.dsSvrResourceInfoDaily[0].DISK);
			// 	for (var intA = 0; intA < strResData.length; intA++) {
			// 		let key = strResData[intA].PATH;
			// 		let value = strResData[intA].USAGE;	
			// 		svrResArr.push({ [key] : value});
			// 		svrBarChartView.push({"key" : strResData[intA].PATH });
			// 		svrBarChartView[intA].color = svrDivColor[intA];
			// 	}
			// 	this.setState({...this.state, dailyOptions : {...this.state.dailyOptions, dataKey : svrBarChartView }});
			// 	ComLib.setStateInitRecords(this, "dsSrvDailyResInfo", svrResArr);				
			// 	this.setState({...this.state, dsResStatsticDaily : res.data.dsSvrResourceInfoDaily[0]});  				
			// }else{
			// 	this.state.dsResStatsticDaily.CPU = '0';
			// 	this.state.dsResStatsticDaily.MEM = '0';
			// 	this.state.dsResStatsticDaily.IO = '0';
			// 	this.state.dsResStatsticDaily.DISK = '0';		
			// 	this.state.dsResStatsticDaily.MIN_CPU = '0';
			// 	this.state.dsResStatsticDaily.MIN_MEM = '0';
			// 	this.state.dsResStatsticDaily.MAX_CPU = '0';
			// 	this.state.dsResStatsticDaily.MAX_MEM = '0';
			// 	this.setState({...this.state, dailyOptions : {...this.state.dailyOptions, dataKey : [{key: '/', color: '#ffcf02'}] }});
			// 	ComLib.setStateRecords(this, "dsSrvDailyResInfo", []);				
			// 	this.setState({...this.state, dsResStatsticDaily : this.state.dsResStatsticDaily});
			// }

			break;
		default :  break;
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		testClick: (e) => {
			if (this.validation('COM010000_R02')) {
				this.transaction("COM010000_R02");
			}
		},
		onFailClick : (e) => {
			let params  = {type: this.state.selectboxProps.value};
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
				case 'svrList' :			
					this.setState({...this.state, selectboxProps : {...this.state.selectboxProps, value : e.target.value}}, 
							() => {
								if (this.validation('COM010000_R02')) {
									this.transaction("COM010000_R02");
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
						<button onClick={this.event.testClick} >test</button>
						<div width={'75%'}>
							<ComponentPanel>	
								<RelativeGroup>
									<FlexPanel>		
										<div>							
											<Selectbox
												id = {this.state.selectboxProps.id}
												value = {this.state.selectboxProps.value}
												dataset = {this.state.selectboxProps.dataset}
												width = {this.state.selectboxProps.width}
												disabled = {this.state.selectboxProps.disabled}
												selected = {this.state.selectboxProps.selected}
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
												{jobTpData !== null ?
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
													<div className="scrm-dash-data1">
														<h5 style={{color:"gray"}}>STT 처리 결과 없음</h5>
													</div>
												}	
											</FlexPanel>
										</div>
										<div>
											<div>
												<h3 className="scrm-dash-h3">콜구분별 성공건수</h3>
											</div>
											<FlexPanel>	
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
												{CallTpData !== null ?
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
													<div className="scrm-dash-data1">
														<h5 style={{color:"gray"}}>STT 처리 결과 없음</h5>
													</div>
												}	
											</FlexPanel>
										</div>
									</FlexPanel>
								</RelativeGroup>
							</ComponentPanel>	
							<ComponentPanel>
								<RelativeGroup>
									<Label value = {"서버별 금일 작업 내역"} />
									<ScrmLineBarChart 
										width = {1100}
										height = {400}
										data = {this.state.dsSrvDailyJobInfoforGraph.getRecords()}
										options = {this.state.options}							
									/>
								</RelativeGroup>
							</ComponentPanel>					
						</div>
						<ComponentPanel width={'25%'}>
							<div>
								<h3>서버 상황</h3>
							</div>
							{/* <div className="scrm-dash-data11 clear">
								<div>
									<h4>DISK 사용률</h4>
									<ScrmBarChart
										width = {300}
										height = {150}
										data = {this.state.dsSrvDailyResInfo.records}	
										layout = {'vertical'}								
										dailyOptions = {this.state.dailyOptions}
									/>			
								</div>
								<div>
									<h4>CPU 사용률</h4>
									<ProgressBar
										data={this.state.dsResStatsticDaily.CPU !== undefined ? this.state.dsResStatsticDaily.CPU : 0}
										options={{type: 'circle', status: 'active'}}
									/>
									<h4>최고치 : {this.state.dsResStatsticDaily.MAX_CPU !== undefined ? this.state.dsResStatsticDaily.MAX_CPU : 0}%</h4>
									<h4>최저치 : {this.state.dsResStatsticDaily.MIN_CPU !== undefined ? this.state.dsResStatsticDaily.MAX_CPU : 0}%</h4>
								</div>
								<div>
									<h4>Memory 사용률</h4>
									<ProgressBar data={this.state.dsResStatsticDaily.MEM}		options={{type: 'circle', status: 'active'}}/>
									<ProgressBar
										data={this.state.dsResStatsticDaily.MEM !== undefined ? this.state.dsResStatsticDaily.MEM : 0}
										options={{type: 'circle', status: 'active'}}
									/>
									<h4>최고치 : {this.state.dsResStatsticDaily.MAX_MEM !== undefined ? this.state.dsResStatsticDaily.MAX_MEM : 0}%</h4>
									<h4>최저치 : {this.state.dsResStatsticDaily.MIN_MEM !== undefined ? this.state.dsResStatsticDaily.MIN_MEM : 0}%</h4>
								</div>
							</div> */}
						</ComponentPanel>				
					</FlexPanel>
				</SubFullPanel>			

				
			</React.Fragment>
		);
	}
}
export default View;