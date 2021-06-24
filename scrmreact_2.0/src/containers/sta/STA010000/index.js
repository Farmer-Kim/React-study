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
					endDate : DateLib.getToday(),
					disabled : false
				},
			},
			buttonProps : {
				id : 'btnSearch',
				disabled : false,
				value : '조회',
				hidden : false
			},
			options : {
				cpu: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "CPU_AVG", "color" : "red", "name": "CPU 평균"}
					           ,{"key" : "CPU_MAX", "color" : "blue", "name": "CPU 최대"}]
				},
				mem: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "MEM_AVG", "color" : "red", "name": "메모리 평균"}
					           ,{"key" : "MEM_MAX", "color" : "blue", "name": "메모리 최대"}]
				},
				swap: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "SWAP_AVG", "color" : "red", "name": "SWAP 평균"}
				               ,{"key" : "SWAP_MAX", "color" : "blue", "name": "SWAP 최대"}]
				},
				io: {
					XAsisKey : 'REG_DT',
					dataKey  : [{"key" : "IO_AVG", "color" : "red", "name": "I/O 평균"}
					           ,{"key" : "IO_MAX", "color" : "blue", "name": "I/O 최대"}]
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
				}
			},		
			dsSrvDailyResInfoforGraph: DataLib.datalist.getInstance([]),		
		}

		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.inputcalendar.onChange = this.event.inputcalendar.onChange.bind(this);
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);		
	}

   /*------------------------------------------------------------------------------------------------*/
   // [2. OnLoad Event Zone]
   /*------------------------------------------------------------------------------------------------*/
   componentDidMount () {
		this.transaction("STA010000_R00")
	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STA010000_R00':
			
			break;

		case 'STA010000_R01':
			if(StrLib.isNull(this.state.rangeCalendarProps.rgcSearch.startDate) || StrLib.isNull(this.state.rangeCalendarProps.rgcSearch.endDate) )  {
				ComLib.openDialog('A', 'COME0004', ['시작일자', '종료일자']);
				return false;				
			}

			if(this.state.rangeCalendarProps.rgcSearch.startDate > this.state.rangeCalendarProps.rgcSearch.endDate ) {
				ComLib.openDialog('A', 'SYSI0010', ['검색 시작일자가 종료일자보다 클 수 없습니다.']);
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
	transaction = (transId) => {
		// let transId = params[0];
		let transManager = new TransManager();


		// let searchVlaBrdCd, searchVlaBrdVer; 

		try {
			switch (transId) {
				
			case 'STA010000_R00':				
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

			case 'STA010000_R01':
				transManager.setTransId(transId);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);				
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "RES.R_SearchResTimeline",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsSrvDailyResInfoforGraph",
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
		case 'STA010000_R00':	
			let resSvrInfo = [];

			for(let intA = 0; intA < res.data.dsSvrInfo.length; intA++){	
				if (res.data.dsSvrInfo[intA].RESC_USE_FLAG === 'Y') {
					resSvrInfo.push({CODE_NM: res.data.dsSvrInfo[intA]['NAME'], CODE: res.data.dsSvrInfo[intA]['VALUE']})	
						
				}	
			}	
			this.setState({...this.state, selectboxProps : {...this.state.selectboxProps, resSvrInfo: {...this.state.selectboxProps.resSvrInfo, dataset : ComLib.convComboList(resSvrInfo), value: resSvrInfo[0].CODE}}});							
			
			if (this.validation('STA010000_R01')) {
				this.transaction("STA010000_R01");
			}

			break;
		case 'STA010000_R01':		
			let maxData = [1,1,1,1];
			let org = res.data.dsSrvDailyResInfoforGraph;
			for (var intA = org.length - 1; intA > -1; intA--) {
				if (maxData[0] < org[intA].CPU_MAX) {
					maxData[0] = org[intA].CPU_MAX;
				}
				
				if (maxData[1] < org[intA].MEM_MAX) {
					maxData[1] = org[intA].MEM_MAX;
				}
				
				if (maxData[2] < org[intA].SWAP_MAX) {
					maxData[2] = org[intA].SWAP_MAX;
				}
				
				if (maxData[3] < org[intA].IO_MAX) {
					maxData[3] = org[intA].IO_MAX;
				}
			}
			
			for (let i = 0; i < maxData.length; i ++) {				
				let maxAdd = "1";
				for (let j = 0; j < String(maxData[i]).length -1; j ++) {
					maxAdd += "0"
				} 
				maxData[i] = (maxData[i]  + Number(maxAdd))  - maxData[i]%Number(maxAdd);
			} 

			if(org.length > 0) {
				ComLib.setStateInitRecords(this, "dsSrvDailyResInfoforGraph", org);
				this.setState({...this.state, maxDataCpu : maxData[0]
										    , maxDataMem : maxData[1]
										    , maxDataSwap: maxData[2]
										    , maxDataIo  : maxData[3]});
			} else {
				ComLib.setStateRecords(this, "dsSrvDailyResInfoforGraph", "");
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
		button: {
			onClick: (e) => {
				switch (e.target.id) {
				case 'btnSearch':
					if(this.validation("STA010000_R01")) {
						
						this.transaction("STA010000_R01")
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
						<ComponentPanel>
							<Label value = {"CPU"} />								
							<ScrmLineBarChart 
								data = {this.state.dsSrvDailyResInfoforGraph.getRecords()}
								maxData = {this.state.maxDataCpu}
								unit    ={"%"}
								options = {this.state.options.cpu}		
								aspect={4.0/0.3}					
							/>
							<Label value = {"Memory"} />								
							<ScrmLineBarChart 
								data = {this.state.dsSrvDailyResInfoforGraph.getRecords()}
								maxData = {this.state.maxDataMem}
								unit    ={"%"}
								options = {this.state.options.mem}	
								aspect={4.0/0.3}											
							/>
							<Label value = {"SWAP"} />								
							<ScrmLineBarChart 
								data = {this.state.dsSrvDailyResInfoforGraph.getRecords()}
								maxData = {this.state.maxDataSwap}
								unit    ={"%"}
								options = {this.state.options.swap}	
								aspect={4.0/0.3}												
							/>
							<Label value = {"I/O"} />								
							<ScrmLineBarChart 
								data = {this.state.dsSrvDailyResInfoforGraph.getRecords()}
								maxData = {this.state.maxDataIo}
								unit    ={"%"}
								options = {this.state.options.io}	
								aspect={4.0/0.3}												
							/>
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
 
export default View;


