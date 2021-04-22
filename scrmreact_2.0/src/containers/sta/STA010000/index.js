// 상담원현황
import React from 'react';
import {
	ComponentPanel, SearchPanel, FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button} from 'components';
import {RangeInputCalendar, Selectbox} from 'components';
import {Grid, Label} from 'components';
import {DataLib, ComLib, DateLib, StrLib, newScrmObj, TransManager} from 'common';

class View extends React.Component {
	constructor(props) {
		super();

		this.gridResult = null
		this.gridResultGridApi = null;

		this.state = {

			rangeCalendarProps : {
				id : 'searchRangeCalender',
				startDate : DateLib.getToday(),
				endDate : DateLib.getToday(),
				strtId : 'searchRangeCalenderStart',
				endId : 'searchRangeCalenderEnd',
				label : "계약일자"
			},

			selectboxProps : {
				selCenterList : {
					id : 'selCenterList',
					value : '',
					width : 120,
					selected : 1,
					disabled : false,
					label : "센터"
				}, 
				selTeamList : {
					id : 'selTeamList',
					value : '',
					width : 120,
					selected : 1,
					disabled : false,
					label : "팀"
				},
				selUserList : {
					id : 'selUserList',
					value : '',
					width : 80,
					selected : 1,
					disabled : false,
					label : "상담원"
				},	
				selVlaBrdNm : {
					id : 'selVlaBrdNm',
					dataset : [],
					width : 200,
					selected : 0,
					disabled : false,
					label : "평가표명",
					value : '',
				},
				selVlaBrdVer : {
					id : 'selVlaBrdVer',
					dataset : [{value : '', name : '선택'},],
					width : 150,
					selected : 0,
					disabled : false,
					label : "평가표버전",
					value : ''
				},	
			},

			buttonProps : {
				id : 'btnSearch',
				disabled : false,
				value : '조회',
				hidden : false
			},

			gridCtrCountTop5 : {
				label : '전월 계약건수 TOP5',
				id : 'gridCtrCountTop5',
				header : 
					[			
					 	{headerName:  '성명',	 	 field: 'CTR_TOP5_NM',		colId: 'CTR_TOP5_NM' , textAlign: 'center',}
						,{headerName: '계약건수',		 field: 'CTR_CNT',		colId: 'CTR_CNT' ,textAlign: 'right',}
					]			
			},
			gridScoreTop5 : {
				label : '전월 평균점수 TOP5',
				id : 'gridScoreTop5',
				header : 
					[			
						{headerName:  '성명',	 	 field: 'SCR_TOP5_NM',		colId: 'SCR_TOP5_NM' , textAlign: 'center',}
						,{headerName: '점수',		 field: 'SCR_TOP5',			colId: 'SCR_TOP5', textAlign: 'right',}
					]			
			},

			gridRcnRtoTop5 : {
				label : '전월 자동준수율 TOP5',
				id : 'gridRcnRtoTop5',
				header : 
					[			
						{headerName:  '성명',	 	 field: 'RCN_TOP5_NM',		colId: 'RCN_TOP5_NM' , textAlign: 'center',}
						,{headerName: '인식률',		 field: 'RCN_TOP5',			colId: 'RCN_TOP5', textAlign: 'right', }
					]			
			},

			gridSTASearchList : {
				label : '상담원현황',
				id : 'gridSTASearchList',
				header: [					
					{headerName: '센터명',			field: 'CENT_NM',		colId: 'CENT_NM',	},
					{headerName: '팀명',			field: 'TEAM_NM',		colId: 'TEAM_NM',	},
					{headerName: '상담원명',		field: 'USR_NM',		colId: 'USR_NM',	 },
					{
						headerName: '계약건수',		field: '',		colId: '',
						children : [																					
							{headerName: '합',				field: 'VS_CNT',			colId: 'VS_CNT',	},
							{headerName: '자동평가',		field: 'SUM_AUTO_CNT',		colId: 'SUM_AUTO_CNT',	},
							{headerName: '수동평가',		field: 'SUM_PER_CNT',		colId: 'SUM_PER_CNT',	 },
						]
					},

					{	headerName: '평가표명',		field: 'VLA_NM',		colId: 'VLA_NM',
						children : [
							{headerName: '평균점수',		field: 'TOT_ALL_SCORE_PER',		colId: 'TOT_ALL_SCORE_PER', textAlign: 'center',	 },	
							{headerName: '가입동의',		field: 'TOT_S1',		colId: 'TOT_S1', textAlign: 'center',},	
							{headerName: '고객맞이',		field: 'TOT_S2',		colId: 'TOT_S2', textAlign: 'center',},
							{headerName: '고객응대',		field: 'TOT_S3',		colId: 'TOT_S3', textAlign: 'center',},
							{headerName: '업무처리',		field: 'TOT_S4',		colId: 'TOT_S4', textAlign: 'center',},
							{headerName: '마무리태도',		field: 'TOT_S5',		colId: 'TOT_S5', textAlign: 'center',},
	
						]
					},
					
				],


			},

			
			dsMonCTRtop5 : DataLib.datalist.getInstance(),
			dsMonSCRtop5 : DataLib.datalist.getInstance(),
			dsMonRCNtop5 : DataLib.datalist.getInstance(),
			dsResultList : DataLib.datalist.getInstance(),
			//Admin 화면인데 제한을 두어야 하는가??? 검토 일단은 주석처리하도록 함
			// dsSrch: DataLib.datalist.getInstance([{CENT_CD: ComLib.setOrgComboValue("CENT_CD"), TEAM_CD: ComLib.setOrgComboValue("TEAM_CD"), USR_CD: ComLib.setOrgComboValue("USR_CD"), VLA_STA_CD: ""}]),			
			dsSrch: DataLib.datalist.getInstance([{CENT_CD: "", TEAM_CD: "", USR_CD: "", VLA_STA_CD: ""}]),
			dsBrdHeaderRecv : DataLib.datalist.getInstance(),			
		}

		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.inputcalendar.onChange = this.event.inputcalendar.onChange.bind(this);
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);		
	}

   /*------------------------------------------------------------------------------------------------*/
   // [2. OnLoad Event Zone]
   /*------------------------------------------------------------------------------------------------*/
   componentDidMount () {

		this.transaction("STA010000_R00");
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



			break;	

		case 'STA010000_R02':

			if(StrLib.isNull(this.state.rangeCalendarProps.startDate) || StrLib.isNull(this.state.rangeCalendarProps.endDate) )  {
				ComLib.openDialog('A', 'COME0004', ['시작일자', '종료일자']);
				return false;				
			}

			if(this.state.rangeCalendarProps.startDate > this.state.rangeCalendarProps.endDate ) {
				ComLib.openDialog('A', 'SYSI0010', ['검색 시작일자가 종료일자보다 클 수 없습니다.']);
				return false;
			}						
			
			if(StrLib.isNull(this.state.selectboxProps.selVlaBrdNm.value)) {
				ComLib.openDialog('A', 'SYSI0010', ['평가표명을 선택해주세요.']);
				return false;				
			}

			if(StrLib.isNull(this.state.selectboxProps.selVlaBrdVer.value)) {
				ComLib.openDialog('A', 'SYSI0010', ['평가표버전을 선택해주세요.']);
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
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STA.R_getBrdList",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsBrdListRecv",
				});
				// transManager.addConfig  ({
				// 	dao        : transManager.constants.dao.base,
				// 	crudh      : transManager.constants.crudh.read,
				// 	sqlmapid   : "STA.R_getSTAHeader",
				// 	datasetsend: "dsSearchParam",
				// 	datasetrecv: "dsBrdHeaderRecv",
				// });
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STA.R_getMonCTRTop5",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsMonCTRtop5",
				});
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STA.R_getMonSCRTop5",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsMonSCRtop5",
				});
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STA.R_getMonRCNTop5",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsMonRCNtop5",
				});	
				
				// const searchLastMon = params[1]

				transManager.addDataset('dsSearchParam', [{"STA_MONTH" : this.getLastMonth()}]);
				transManager.agent();	
				break;

				case 'STA010000_R01':
					transManager.setTransId(transId);
					transManager.setTransUrl(transManager.constants.url.common);
					transManager.setCallBack(this.callback);					
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "STA.R_getBrdVerList",
						datasetsend: "dsSearchParam",
						datasetrecv: "dsBrdVerListRecv",
					});

					

					transManager.addDataset('dsSearchParam', [{"VLA_BRD_CD" : this.state.selectboxProps.selVlaBrdNm.value}]);
					transManager.agent();

					break;

				case 'STA010000_R02':
					transManager.setTransId(transId);
					transManager.setTransUrl(transManager.constants.url.common);
					transManager.setCallBack(this.callback);					
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "STA.R_getSTAEvaluateList",
						datasetsend: "dsSearchParam",
						datasetrecv: "dsResultList",
					});
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "STA.R_getSTAHeader",
						datasetsend: "dsSearchParam",
						datasetrecv: "dsBrdHeaderRecv",
					});

					

					transManager.addDataset('dsSearchParam', [this.setSearchParam()]);
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

			if (res.data.dsBrdListRecv.length > 0) {
				state['selectboxProps']['selVlaBrdNm'].dataset = ComLib.convComboList(res.data.dsBrdListRecv, newScrmObj.constants.select.argument.select);

			} 

			if(res.data.dsMonCTRtop5.length > 0) {
				ComLib.setStateInitRecords(this, "dsMonCTRtop5", res.data.dsMonCTRtop5);
			} else {								
				ComLib.setStateRecords(this, "dsMonCTRtop5", "");						
			}			



			if(res.data.dsMonSCRtop5.length > 0) {
				ComLib.setStateInitRecords(this, "dsMonSCRtop5", res.data.dsMonSCRtop5);
			} else {								
				ComLib.setStateRecords(this, "dsMonSCRtop5", "");						
			}		



			if(res.data.dsMonRCNtop5.length > 0) {
				ComLib.setStateInitRecords(this, "dsMonRCNtop5", res.data.dsMonRCNtop5);
			} else {								
				ComLib.setStateRecords(this, "dsMonRCNtop5", "");						
			}		
			
			break;

		case 'STA010000_R01':		
			state = this.state;

			if (res.data.dsBrdVerListRecv.length > 0) {
				state['selectboxProps']['selVlaBrdVer'].dataset = ComLib.convComboList(res.data.dsBrdVerListRecv, newScrmObj.constants.select.argument.select);
				state['selectboxProps']['selVlaBrdVer'].selected = 0;
				state['selectboxProps']['selVlaBrdVer'].value = ''
			} 
		
			this.setState(state);

			break;

		case 'STA010000_R02':
			const headerData = res.data.dsBrdHeaderRecv[0]
			const secondHeader = this.setSecondHeader();
			const resultRow = this.setResultRow(headerData);

			const dynamicHeader = 
			[
				// {	headerName: '',		field: '',		colId: '',
				// 	children : [
				// 		{headerName: 'No.', field: '_No', colId: '_No', maxWidth: 60, sortable: false, filter: false, resizable: false, lockPosition: true,
				// 		valueGetter: function(params) { return params.node.rowIndex + 1; }},
				// 		{headerName: '센터명',			field: 'CENT_NM',		colId: 'CENT_NM',	},
				// 		{headerName: '팀명',			field: 'TEAM_NM',		colId: 'TEAM_NM',	},
				// 		{headerName: '상담원명',		field: 'USR_NM',		colId: 'USR_NM',	 },
				// 	]
				// },
				// {headerName: 'No.', field: '_No', colId: '_No', maxWidth: 60, sortable: false, filter: false, resizable: false, lockPosition: true,
				// 		valueGetter: function(params) { return params.node.rowIndex + 1; }},
					{headerName: '센터명',			field: 'CENT_NM',		colId: 'CENT_NM',	},
					{headerName: '팀명',			field: 'TEAM_NM',		colId: 'TEAM_NM',	},
					{headerName: '상담원명',		field: 'USR_NM',		colId: 'USR_NM',	 },
				{
					headerName: '계약건수',		field: '',		colId: '',
					children : secondHeader
				},	
				{
					headerName: headerData.VLA_NM,
					children: resultRow
				},
			];
			state['gridSTASearchList']['header'] = dynamicHeader;
			this.setState(state, (data = res.data.dsResultList) => {
				if (data.length > 0) {
					ComLib.setStateInitRecords(this, "dsResultList", data);
					
				} else {
					ComLib.setStateRecords(this, "dsResultList", "");
				}
	
			});
			// this.gridResultGridApi.setColumnDefs(dynamicHeader);
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
					if(this.validation("STA010000_R02")) {

						// let state = this.state;

						// let params = {							

						// 	SEARCH_START : state['rangeCalendarProps']['startDate']	,
						// 	SEARCH_END : state['rangeCalendarProps']['endDate']	,
						// 	SEARCH_BRD_CD : state['selectboxProps']['selVlaBrdNm'].value,
						// 	SEARCH_BRD_CD_VERS : state['selectboxProps']['selVlaBrdVer'].value,
						// 	SEARCH_CENT_CD : state['dsSrch']['records'][0]["CENT_CD"],
						// 	SEARCH_TEAM_CD : state['dsSrch']['records'][0]["TEAM_CD"],
						// 	SEARCH_USR_CD : state['dsSrch']['records'][0]["USR_CD"],
														
						// }
						
						this.transaction("STA010000_R02")
					};
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
				case 'searchRangeCalender' :
					this.setState({...this.state, rangeCalendarProps : {...this.state.rangeCalendarProps, startDate : e.startDate, endDate : e.endDate}});
				break;
				default : break;
				}
			}
		},
		selectbox : {
			onChange : (e) => {

				let state = this.state;
				switch (e.id) {			
				case 'selCenterList':
					ComLib.setStateValue(this, "dsSrch", 0, "CENT_CD", e.target.value);

				break;
				case 'selTeamList':
					ComLib.setStateValue(this, "dsSrch", 0, "TEAM_CD", e.target.value);

				break;
				case 'selUserList':
					ComLib.setStateValue(this, "dsSrch", 0, "USR_CD", e.target.value);

				break;
				case 'selVlaBrdNm':
					state['selectboxProps']['selVlaBrdNm'].selected = e.target.selectedIndex;
					state['selectboxProps']['selVlaBrdNm'].value    = e.target.value;

					

					if (this.validation("STA010000_R01")) {
						this.setState(state, function (){
							this.transaction("STA010000_R01")
						});
					}

					break;

				case 'selVlaBrdVer':
					state['selectboxProps']['selVlaBrdVer'].selected = e.target.selectedIndex;
					state['selectboxProps']['selVlaBrdVer'].value    = e.target.value;

					this.setState(state);

					break;
				

				default : break;
				}
			}
		},
		grid: {

			onGridReady : (e) => {

				switch (e.id) {
				case "gridSTASearchList":
					this.gridResult = e.grid;
					this.gridResultGridApi = e.gridApi;
					
					break;

				default: break
				}
				
			},
		}
	}


	/**
	 * 화면정의 함수
	 * getLastMonth        	지난달의 월을 만들어 주는 fuc(검색조건에서 활용) 
	 * setSecondHeader		계약건수의 헤더 생성
	 * setResultRow  		검색결과를 동적으로 헤더 생성
	 * setSearchParam  		검색 파라미터 설정
	 */

	getLastMonth = (today) => {
		
		const lastMonthDay = DateLib.getAddMonth(DateLib.getToday(), -1);
		return lastMonthDay.substr(0,6);
	}

	setSecondHeader = () => {

		let secondeHeader = [];

		let firstChildrenObject  = {};
		firstChildrenObject.headerName = '합';
		firstChildrenObject.field = 'VS_CNT';
		firstChildrenObject.colID = 'VS_CNT';
		firstChildrenObject.cellStyle = {'text-align' : 'right'};		

		let secondChildrenObject  = {};
		secondChildrenObject.headerName = '자동평가';
		secondChildrenObject.field = 'SUM_AUTO_CNT';
		secondChildrenObject.colID = 'SUM_AUTO_CNT';
		secondChildrenObject.cellStyle = {'text-align' : 'right'};					


		let thirdChildrenObject  = {};
		thirdChildrenObject.headerName = '수동평가';
		thirdChildrenObject.field = 'SUM_PER_CNT';
		thirdChildrenObject.colID = 'SUM_PER_CNT';
		thirdChildrenObject.cellStyle = {'text-align' : 'right'};								

		secondeHeader.push(firstChildrenObject);
		secondeHeader.push(secondChildrenObject);
		secondeHeader.push(thirdChildrenObject)		

		return secondeHeader;
	}

	setResultRow = (headerData) => {

		let headerArray = []

		for( var key in headerData ) {
			let keyArray = key.split("_S")
			if(keyArray[0] === "TOT") {
				if(keyArray[1] !== '0') {
					headerArray.push({key : keyArray[1], headerName : headerData[key]})
				}
			}
		}
		
		headerArray.sort(function(a, b) {
			return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
		});
		
		let resultRow = [];

		let firstChildrenObject  = {};
		firstChildrenObject.headerName = '평균점수';
		firstChildrenObject.field = 'TOT_ALL_SCORE_PER';
		firstChildrenObject.colID = 'TOT_ALL_SCORE_PER';
		firstChildrenObject.cellStyle = {'text-align' : 'right'};		

		resultRow.push(firstChildrenObject);

		for(let i = 0; i < headerArray.length ; i++) {

			let rawObject  = {};
			let chgRow = 'TOT_S' + (i+1);
			rawObject.headerName = headerArray[i].headerName;
			rawObject.field = chgRow
			rawObject.colID = chgRow;
			rawObject.cellStyle = {'text-align' : 'right'};
			resultRow.push(rawObject);

		}
		
		return resultRow;

	}



	setSearchParam = () => {

		let dsSrchParamInfo = {};
		dsSrchParamInfo.SEARCH_START =  this.state.rangeCalendarProps.startDate
		dsSrchParamInfo.SEARCH_END = this.state.rangeCalendarProps.endDate
		dsSrchParamInfo.SEARCH_BRD_CD = this.state.selectboxProps.selVlaBrdNm.value
		dsSrchParamInfo.SEARCH_BRD_CD_VERS = this.state.selectboxProps.selVlaBrdVer.value
		dsSrchParamInfo.SEARCH_CENT_CD = this.state.dsSrch.records[0].CENT_CD
		dsSrchParamInfo.SEARCH_TEAM_CD = this.state.dsSrch.records[0].TEAM_CD
		dsSrchParamInfo.SEARCH_USR_CD =  this.state.dsSrch.records[0].USR_CD
		return dsSrchParamInfo

	}

		


	render () {
		return (
			<React.Fragment>
				<FullPanel>
						<SearchPanel>
						<div style={{alignItems:"center", display:"flow-root"}}>
							<LFloatArea>	
							<FlexPanel>
								<Label value={this.state.rangeCalendarProps.label} req={true}/>
								<RangeInputCalendar
									id = {this.state.rangeCalendarProps.id}
									strtId  = {this.state.rangeCalendarProps.strtId}
									endId  = {this.state.rangeCalendarProps.endId}									
									startDate = {this.state.rangeCalendarProps.startDate}
									endDate = {this.state.rangeCalendarProps.endDate}
									onChange = {this.event.inputcalendar.onChange}
								/>
								<div style={{marginLeft : '10px'}}/>
								<Label value={this.state.selectboxProps.selVlaBrdNm.label} req={true}/>
								<Selectbox
									id       = {this.state.selectboxProps.selVlaBrdNm.id}
									value    = {this.state.selectboxProps.selVlaBrdNm.value}
									dataset  = {this.state.selectboxProps.selVlaBrdNm.dataset}
									width    = {this.state.selectboxProps.selVlaBrdNm.width}
									disabled = {this.state.selectboxProps.selVlaBrdNm.disabled}
									selected = {this.state.selectboxProps.selVlaBrdNm.selected}
									onChange = {this.event.selectbox.onChange}
								/>								
								<div style={{marginLeft : '10px'}}/>
								 <Label value={this.state.selectboxProps.selVlaBrdVer.label} req={true}/>
								<Selectbox
									id       = {this.state.selectboxProps.selVlaBrdVer.id}
									value    = {this.state.selectboxProps.selVlaBrdVer.value}
									dataset  = {this.state.selectboxProps.selVlaBrdVer.dataset}
									width    = {this.state.selectboxProps.selVlaBrdVer.width}
									disabled = {this.state.selectboxProps.selVlaBrdVer.disabled}
									selected = {this.state.selectboxProps.selVlaBrdVer.selected}
									onChange = {this.event.selectbox.onChange}
								/>									
								<div style={{marginLeft : '10px'}}/>
								 <Label value={this.state.selectboxProps.selCenterList.label}/>								  						
								<Selectbox
									id = {this.state.selectboxProps.selCenterList.id}
									dataset = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.all)}
									value = {this.state.dsSrch.records[0]["CENT_CD"]}
									// controlOrgCombo = {'CENT'}
									width = {this.state.selectboxProps.selCenterList.width}
									disabled = {false}
									onChange = {this.event.selectbox.onChange}
								/>
								<div style={{marginLeft : '10px'}}/>
								<Label value={this.state.selectboxProps.selTeamList.label}/>								 								  						
								<Selectbox
									id = {this.state.selectboxProps.selTeamList.id}
									dataset = {ComLib.convComboList(ComLib.getTeamList(this.state.dsSrch), newScrmObj.constants.select.argument.all)}
									value = {this.state.dsSrch.records[0]["TEAM_CD"]}
									controlOrgCombo = {'TEAM'}
									width = {this.state.selectboxProps.selTeamList.width}
									disabled = {false}
									onChange = {this.event.selectbox.onChange}
								/>	
								<div style={{marginLeft : '10px'}}/>
								<Label value={this.state.selectboxProps.selUserList.label}/>								  						
								<Selectbox
									id = {this.state.selectboxProps.selUserList.id}
									dataset = {ComLib.convComboList(ComLib.getUserList(this.state.dsSrch, true).filter(usr => usr.AUTH_LV === 4), newScrmObj.constants.select.argument.all)}
									value = {this.state.dsSrch.records[0]["USR_CD"]}
									controlOrgCombo = {'USER'}
									width = {this.state.selectboxProps.selUserList.width}
									disabled = {false}
									onChange = {this.event.selectbox.onChange}
								/>			
								</FlexPanel>					
								</LFloatArea>
							 	<RFloatArea>
									 <FlexPanel>

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
									</FlexPanel>
								</RFloatArea>																					
						</div>								
						</SearchPanel>
					<SubFullPanel>
						<FlexPanel>
							<ComponentPanel>
							<Grid
									height= "195px"
									areaName = {this.state.gridCtrCountTop5.label}
									data = {this.state.dsMonCTRtop5}
									header = {this.state.gridCtrCountTop5.header}
									addRowBtn			 = {false}
									delRowBtn			 = {false}
									dnlExcelBtn			 = {false}								
								/>	

							</ComponentPanel>
							<ComponentPanel>
								<Grid
									height= "195px"
									data = {this.state.dsMonSCRtop5}
									areaName = {this.state.gridScoreTop5.label}
									header = {this.state.gridScoreTop5.header}

									addRowBtn			 = {false}
									delRowBtn			 = {false}
									dnlExcelBtn			 = {false}								
								/>
							</ComponentPanel>
							<ComponentPanel>
								<Grid
									height= "195px"
									data = {this.state.dsMonRCNtop5}
									areaName = {this.state.gridRcnRtoTop5.label}
									header = {this.state.gridRcnRtoTop5.header}

									addRowBtn			 = {false}
									delRowBtn			 = {false}
									dnlExcelBtn			 = {false}								
								/>
							</ComponentPanel>
						</FlexPanel>
					</SubFullPanel>
					<SubFullPanel>
						<ComponentPanel>
						<Grid
							height= "300px"
							data = {this.state.dsResultList}
							header = {this.state.gridSTASearchList.header}
							areaName = {this.state.gridSTASearchList.label}
							id = {this.state.gridSTASearchList.id}
							addRowBtn			 = {false}
							delRowBtn			 = {false}
							dnlExcelBtn			 = {true}															
							undoRedoCellEditing = {false}
							enableCellChangeFlash = {false}							
							rowNum   = {true}															
							onGridReady = {this.event.grid.onGridReady}								
							
						/>
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
 
export default View;


