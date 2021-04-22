// 키워드관리
import React from 'react';
import {
	ComponentPanel, SearchPanel, FullPanel, SubFullPanel, Table, RFloatArea, RelativeGroup
} from 'components';
import {BasicButton as Button, Label} from 'components';
import {RangeInputCalendar, Selectbox} from 'components';
import { Grid} from 'components';
import { ComLib, DataLib, newScrmObj, TransManager, StrLib, DateLib } from 'common';

class View extends React.Component {

/*------------------------------------------------------------------------------------------------*/
	// [1. Default State Zone]
	/*------------------------------------------------------------------------------------------------*/
	constructor(props){

		super();

		this.keywordGrid    = null;
		this.keywordGridApi = null;
		this.state = {
			dsKeywordList : DataLib.datalist.getInstance(),			

			selectboxProps : {
				selKeyType : {
					id : 'selKeyType',
					label : '키워드 타입',
					width : 200,
					selected : 1,
					disabled : false
				},				
				selUseYn : {
					id       : 'selUseYn',
					value    : '',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList('CMN', 'USE_FLAG'), newScrmObj.constants.select.argument.all),
					width    : 80,
					selected : 0,
					disabled : false
				}
			},   

			btnSearchProps : {
				id : 'btnSearch',				
				value : '조회'
			},
			
			gridProps : {
				id : 'keywordGrid',
				header: [
					{headerName: '키워드',		field: 'KWD',	colId: 'KWD',	editable: true,	req: true},
					{headerName: '키워드 타입',	field: 'KWD_TP',	colId: 'KWD_TP',	editable: true,	req: true,	textAlign: 'center', singleClickEdit: true,
						cellEditor: 'agSelectCellEditor',
						cellEditorParams: { values : ComLib.getComCodeValue('STT_SYS_KWD', 'KWD_TP')},
						valueFormatter : (param) => ComLib.getComCodeName('STT_SYS_KWD', param.value, 'KWD_TP')         
					},
					{headerName: '등록자',		field: 'REG_USR_ID', colId: 'REG_USR_ID', 	defaultValue : ComLib.getSession("gdsUserInfo")[0]["USR_NM"],	textAlign: 'center',},
					{headerName: '등록일자',	field: 'REG_DTM',	 colId: 'REG_DTM',	defaultValue : StrLib.setFormatData(DateLib.getTodayTime()),	textAlign: 'center', },
					{headerName: '사용여부',	field: 'USE_FLAG',	 colId: 'USE_FLAG',	editable: true,	defaultValue : 'Y',	width: 90,	resizable: false,	textAlign: 'center', singleClickEdit: true,
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
									valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')},
				],
				paging : {
					start: 0,
					size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
					page : 1
				},
			},				

			rangeCalendarProps : {
				label : '등록날짜',
				id : 'iptRangeCal',
				stId : 'iptRangeCalStrt',
				endId : 'iptRangeCalEnd',
				startDate : null,
				endDate : null,
				focusedInput : null
			},

			paging : {
				start: 0,
				size : 40,
				page : 1
			},
	}
	this.event.inputcalendar.onChange = this.event.inputcalendar.onChange.bind(this);
	this.event.button.onClick = this.event.button.onClick.bind(this);
	
}
	
	/*------------------------------------------------------------------------------------------------*/
	// [2. OnLoad Event Zone]
	/*------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		
	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		let record;
	
		switch (serviceid) {
		case 'SYS050000_R01':
			if(this.state.rangeCalendarProps.startDate > this.state.rangeCalendarProps.endDate){
				ComLib.openDialog('A', 'SYSI0010', ['검색시작일자가 검색종료일보다 클 수 없습니다.']);					
				return false;
			}

			break;

		case 'SYS050000_H01':			
			record = this.keywordGrid.gridDataset.records;
			for ( let intA = 0; intA < record.length; intA ++ ) {
				
				let stnScrtHeader = this.state.gridProps.header;
				for (let i = 0; i < stnScrtHeader.length; i ++) {						
					if (stnScrtHeader[i].field === 'KWD' || stnScrtHeader[i].field === 'KWD_TP') {
						if (StrLib.isNull(record[intA][stnScrtHeader[i].field])) {
							ComLib.openDialog('A', 'COME0001', [Number(intA + 1) , stnScrtHeader[i].headerName.replace(/\*/g,'')]);
							
							return false;
						}
					}
				}			
			}
			
			if (record.filter(item => item['rowtype'] === 'c').length === 0 && record.filter(item => item['rowtype'] === 'u').length === 0) {
				ComLib.openDialog('A', 'COME0005');
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
			case "SYS050000_R01" :
				console.log("hander exuted")
				let state = this.state;

				state['gridProps']['paging'].start = 0;
				state['gridProps']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('SYS050000_R01');
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
		
		transManager.setTransId(serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);
		
		let state = this.state;
		
		let pageStart   = state['gridProps']['paging'].start;
		let pageLimit   = state['gridProps']['paging'].size;

		try {
			switch (serviceid) {	
			case 'SYS050000_R01':				
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getKeywordList",
					datasetsend: "dsKeyword",
					datasetrecv: "dsRst",
				});
				  				
				transManager.addDataset('dsKeyword', [{
					  START_DATE : state.rangeCalendarProps.startDate
					, END_DATE   : state.rangeCalendarProps.endDate 
					, KWD_TP     : state.selectboxProps.selKeyType.value	
					, USE_FLAG   : state.selectboxProps.selUseYn.value
					, QUERY_START: pageStart
					, QUERY_LIMIT: pageLimit}]);

				transManager.agent();

				break;

			case 'SYS050000_R02':					
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getKeywordList",
					datasetsend: "dsKeyword",
					datasetrecv: "dsRst",
				});
				  				
				transManager.addDataset('dsKeyword', [{
					  START_DATE : state.lastStartDate
					, END_DATE   : state.lastEndDate
					, KWD_TP     : state.lastkeyType	
					, USE_FLAG   : state.slastUseYn
					, QUERY_START: pageStart
					, QUERY_LIMIT: pageLimit}]);
					
				transManager.agent();

				break;
			case 'SYS050000_H01': 
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "SYS.H_handleKeyword", 
					datasetsend: "dsKeywordList",
				});		
				transManager.addDataset('dsKeywordList', this.keywordGrid.gridDataset.getTransRecords(newScrmObj.constants.rowtype.CREATE_OR_UPDATE));				
				transManager.agent();
				break;
				
			default: break;

			}
		} catch (err) {
			console.log(err)
		}
	}
/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {	
		let state = this.state;
		switch (res.id) {
		case 'SYS050000_R01':	
			if(res.data.dsRst.length > 0) {
				ComLib.setStateInitRecords(this, "dsKeywordList", res.data.dsRst);
									
				state.lastStartDate = state['rangeCalendarProps'].startDate;
				state.lastEndDate   = state['rangeCalendarProps'].endDate;					
				state.lastkeyType   = state['selectboxProps']['selKeyType'].value;					
				state.lastUseYn     = state['selectboxProps']['selUseYn'].value;

				state['gridProps']['paging'].loading = false;

				this.setState(state);
				
			} else {								
				ComLib.setStateRecords(this, "dsKeywordList", "");

			}

			break;	

		case 'SYS050000_R02':
			ComLib.setStateInitRecords(this, "dsKeywordList", res.data.dsRst);

			state['gridProps']['paging'].loading = false;

			this.setState(state);

			break;
			
		case 'SYS050000_H01':			
			ComLib.openDialog("A", "COMI0001", ["키워드"]);

			this.transaction("SYS050000_R01");

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
				console.log("btn Search Clicked")				
				if (this.validation("SYS050000_R01")) this.handler.setDs('SYS050000_R01');
				break;				
			case 'btnSave':								
				if (this.validation("SYS050000_H01")) this.transaction("SYS050000_H01");
				break;
			default : break;
			}
			}
		},
		grid: {				
			onGridReady : (e) => {
				switch (e.id) {
				case "keywordGrid":
					this.keywordGrid = e.grid;						
					this.keywordGridApi = e.gridApi;
					break;
				default: break;
				}
			},
			onScrollEnd: (e) => {
				let state = this.state;
				if (!state['gridProps']['paging'].loading) {
					state['gridProps']['paging'].start = state['gridProps']['paging'].start + state['gridProps']['paging'].size;
					state['gridProps']['paging'].page  = state['gridProps']['paging'].page + 1;
					state['gridProps']['paging'].loading = true;

					this.setState(state, () => {
						this.transaction("SYS050000_R02");
					});
				}
			},
		},

		inputcalendar : {		
			onChange : (e) => {					
				switch (e.target.id) {									
				case 'iptRangeCal' :							
					this.setState({...this.state, rangeCalendarProps : {...this.state.rangeCalendarProps, startDate : e.startDate, endDate : e.endDate}});
					break;
				default : break;
				}				
			},
			onFocusChange : (e) => {
				switch (e.target.id) {
				case 'iptRangeCal' :
					this.setState({...this.state, rangeCalendarProps : {...this.state.rangeCalendarProps, focusedInput : e.focusedInput}});
					break;
				default : break;
				}
			}
		},

		selectbox : {
			onChange : (e) => {	
				let state = this.state;

				state['selectboxProps'][e.id].selected = e.target.selectedIndex;
				state['selectboxProps'][e.id].value    = e.target.value;
				
				//this.setState(state);
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
							colGrp = {[{width: '4%'}, {width: '15%'}, {width: '5%'}, {width: '15%'}, {width: '5%'}, {width: '25%'},{width: '10%'}]}
							tbData = {[
								[  	
									{type : 'D', value : <div style={{marginTop:'-9px'}}><Label value={this.state.rangeCalendarProps.label}/></div>},
									{type : 'D', value :
									<RangeInputCalendar
										id = {this.state.rangeCalendarProps.id}
										strtId  = {this.state.rangeCalendarProps.stId}
										endId  = {this.state.rangeCalendarProps.endId}
										startDate = {this.state.rangeCalendarProps.startDate}
										endDate = {this.state.rangeCalendarProps.endDate}
										onChange = {this.event.inputcalendar.onChange}
									/>},	

									{type : 'D', value : <div style={{marginTop:'-9px'}}><Label value={this.state.selectboxProps.selKeyType.label}/></div> },
									{type : 'D', value : 
									<Selectbox
										 id = {this.state.selectboxProps.selKeyType.id}
										 dataset = {ComLib.convComboList(ComLib.getCommCodeList('STT_SYS_KWD', 'KWD_TP'), newScrmObj.constants.select.argument.all)}								
										 width = {this.state.selectboxProps.selKeyType.width}
										 disabled = {this.state.selectboxProps.selKeyType.disabled}
										 selected = {this.state.selectboxProps.selKeyType.selected}
										 onChange= {this.event.selectbox.onChange}
									/> },	
									{type : 'D', value : <div style={{marginTop:'-9px'}}><Label value="사용여부"/></div> },
									{type : 'D', value : 
									<Selectbox
										id       = {this.state.selectboxProps.selUseYn.id}
										value    = {this.state.selectboxProps.selUseYn.value}
										dataset  = {this.state.selectboxProps.selUseYn.dataset}
										width    = {this.state.selectboxProps.selUseYn.width}
										disabled = {this.state.selectboxProps.selUseYn.disabled}
										selected = {this.state.selectboxProps.selUseYn.selected}
										onChange = {this.event.selectbox.onChange}
									/> },
									{type : 'D', value : 
									<RFloatArea>
									<Button 
										id = {this.state.btnSearchProps.id}
										color = 'blue' 
										fiiled = "o"
										innerImage = {true} 
										icon = {'srch'} 
										mt  = {5}
										value = {this.state.btnSearchProps.value}								
										onClick = {this.event.button.onClick}										
									/>
									</RFloatArea>									
										},	
								],								
							]}
						/>		
						</SearchPanel>
					<SubFullPanel>
						<ComponentPanel>
							<Grid
								id={this.state.gridProps.id} ref={this.state.gridProps.id}
								areaName = {"키워드 목록"}
								height= {600}
								header = {this.state.gridProps.header}
								rowNum = {true}					
								paging      = {true}
								infinite    = {true}

								data = {this.state.dsKeywordList} 
								totalRowCnt = {(this.state.dsKeywordList.getRecords().length === 0) ? 0 : this.state.dsKeywordList.getValue(0, 'totalcount')}

								onGridReady = {this.event.grid.onGridReady}	
								onScrollEnd = {this.event.grid.onScrollEnd}		
							/>
							<RelativeGroup>
								<RFloatArea>									
									<Button
										id = "btnSave" 
										value = {"저장"} 
										onClick = {this.event.button.onClick} 										
										color="purple" 
										fiiled="o"
										mt={5}
									/>
								</RFloatArea>
							</RelativeGroup>
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;