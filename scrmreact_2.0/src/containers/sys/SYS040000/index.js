//STT 결과조회
import React from 'react';

import {
	ComponentPanel, FullPanel,  RFloatArea, LFloatArea, SearchPanel, FlexPanel, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {Textfield, RangeInputCalendar, Selectbox} from 'components';
import {Grid} from 'components';
import {StrLib, TransManager, ComLib, DataLib, newScrmObj, DateLib} from 'common';


class View extends React.Component {
	constructor(props) {
		super();
			
		this.missSentGridApi = null;
		this.missSentGrid    = null;
		this.state = {			
			dsMissSentList : DataLib.datalist.getInstance(),			
			lastStartDate: '',
			lastEndDate: '', 
			lastRegIdNm: '',
			lastAppYn: '',
			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
				btnSave : {
					id       : 'btnSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},
			gridProps : {
				gridMissSentList : {
					areaName : '오인식 문장',
					id : 'gridMissSentList',
					header : 
					[	
						
						{headerName: '콜 UUID',	       field: 'STT_UNQ',		  colId: 'STT_UNQ',		  editable: false },
						{headerName: '오인식 상담 원문',field: 'MIS_SENT_CONT',	   colId: 'MIS_SENT_CONT', editable: false},
						{headerName: '작성문장',		field: 'ANS_SENT_CONT',	  colId: 'ANS_SENT_CONT', editable: false},
						{headerName: '오인식 타입',		field: 'ACT_TP',	  colId: 'ACT_TP', editable: false, textAlign: 'center',
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'ACT_TP')},
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'ACT_TP')},
						{headerName: '등록시간',	    field: 'REG_DTM',	      colId: 'REG_DTM',	      editable: false},
						{headerName: '등록자',	        field: 'REG_USR_NM',	  colId: 'REG_USR_NM',	  editable: false, textAlign: 'center'},
						{headerName: '학습적용여부',	field: 'TRN_APY_FLAG',	  colId: 'TRN_APY_FLAG',  editable: true, singleClickEdit: true, textAlign: 'center',
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'APY_FLAG')},
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'APY_FLAG')}
					],
					paging : {
						start: 0,
						size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
						page : 1
					},
				}
			},		
			rangeCalendarProps : {
				rgcRecDate : {
					label : '녹취일',
					id : 'rgcRecDate',
					strtId : 'rgcRecDateStart',
					endId : 'rgcRecDateEnd',
					startDate : DateLib.getAddMonth(DateLib.getToday(), -3),
					endDate : DateLib.getToday(),
				},
			},
			selectboxProps : {
				selAppYn : {
					id       : 'selAppYn',
					value    : '',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList('CMN', 'APY_FLAG'), newScrmObj.constants.select.argument.all),
					width    : 80,
					selected : 0,
					disabled : false
				}
			},
			textFieldProps : {
				iptRegIdNm : {
					id          : 'iptRegIdNm',
					name        : 'iptRegIdNm',
					value       : '',
					placeholder : '등록자 아이디/등록자 명',
					minLength   : 1,
					maxLength   : 15,
					readOnly    : false,
					disabled    : false
				}
			},
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
		if (this.validation("SYS040000_R01")) this.transaction("SYS040000_R01");

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
			case 'SYS040000_R01' :
				if(StrLib.isNull(this.state.rangeCalendarProps.rgcRecDate.startDate) || StrLib.isNull(this.state.rangeCalendarProps.rgcRecDate.endDate) )  {
					ComLib.openDialog('A', 'COME0004', ['시작일자', '종료일자']);
					return false;
				}
				if(this.state.rangeCalendarProps.rgcRecDate.startDate > this.state.rangeCalendarProps.rgcRecDate.endDate ) {
					ComLib.openDialog('A', 'SYSI0010', ['검색 시작일자가 종료일자보다 클 수 없습니다.']);
					return false;
				}
				break;

			case 'SYS040000_U01' :
				let chkCnt  = 0;
				let records = this.missSentGrid.gridDataset.records;

				for (let intA = 0; intA < records.length; intA ++) {
					if (records[intA].rowtype !== newScrmObj.constants.crud.read) {
						chkCnt ++;
					}	
				}

				if (records.length < 1 || chkCnt === 0) {
					ComLib.openDialog('A', 'COME0005');

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
			case "SYS040000_R01" :

				let state = this.state;

				state['gridProps']['gridMissSentList']['paging'].start = 0;
				state['gridProps']['gridMissSentList']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('SYS040000_R01');
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
		
		let pageStart   = state['gridProps']['gridMissSentList']['paging'].start;
		let pageLimit   = state['gridProps']['gridMissSentList']['paging'].size;

		try {
			switch (transId) {
			case 'SYS040000_R01':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"SYS.R_getMissSentMngList",
					datasetsend:"dsSrchParamInfo",
					datasetrecv:"dsMissSentList",
				})

				transManager.addDataset('dsSrchParamInfo', [{ 
					  START_DATE  : this.state.rangeCalendarProps.rgcRecDate.startDate
					, END_DATE    : this.state.rangeCalendarProps.rgcRecDate.endDate 
					, REG_USR_ID  : this.state.textFieldProps.iptRegIdNm.value
					, APP_YN      : this.state.selectboxProps.selAppYn.value
					, QUERY_START : pageStart
					, QUERY_LIMIT : pageLimit
				}]);
				
				break;

			case 'SYS040000_R02':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"SYS.R_getMissSentMngList",
					datasetsend:"dsSrchParamInfo",
					datasetrecv:"dsMissSentList",
				});
				transManager.addDataset('dsSrchParamInfo', [{ 
					  START_DATE  : this.state.lastStartDate
					, END_DATE    : this.state.lastEndDate 
					, REG_USR_ID  : this.state.lastRegIdNm
					, APP_YN      : this.state.lastAppYn
					, QUERY_START : pageStart
					, QUERY_LIMIT : pageLimit
				}]);

				break;
				
			case 'SYS040000_U01' :
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.handle,
					sqlmapid:"SYS.U_SetMissSentApy",
					datasetsend:"dsMissSent",
					datasetrecv:"",
				});										

				transManager.addDataset('dsMissSent', this.missSentGrid.gridDataset.records.filter((item) => item.rowtype !== newScrmObj.constants.crud.read));
				
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
		case 'SYS040000_R01':			
			if(res.data.dsMissSentList.length > 0) {
				ComLib.setStateInitRecords(this, "dsMissSentList", res.data.dsMissSentList);
									
				
				state.lastAppYn     = state['selectboxProps']['selAppYn'].value;
				state.lastRegIdNm   = state['textFieldProps']['iptRegIdNm'].value;
				state.lastStartDate = state['rangeCalendarProps']['rgcRecDate'].startDate;
				state.lastEndDate   = state['rangeCalendarProps']['rgcRecDate'].endDate;
				state['gridProps']['gridMissSentList']['paging'].loading = false;
				this.setState(state);
				
			} else {								
				ComLib.setStateRecords(this, "dsMissSentList", "");	
			}
			break;

		case 'SYS040000_R02':
			ComLib.setStateInitRecords(this, "dsMissSentList", res.data.dsMissSentList);
			
			state['gridProps']['gridMissSentList']['paging'].loading = false;
			this.setState(state);
			
			break;
		
		case 'SYS040000_U01':
			
			
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
				case "btnSearch" :
					if (this.validation("SYS040000_R01")) this.handler.setDs('SYS040000_R01');	

					break;
				case "btnSave" :
					if (this.validation("SYS040000_U01")) this.transaction('SYS040000_U01');	
					break;
				default : break;
				}
			}
		}, 
		inputcalendar : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'rgcRecDate':
					
					this.setState({...this.state, 
							rangeCalendarProps : {...this.state.rangeCalendarProps
													, rgcRecDate : 
														{...this.state.rangeCalendarProps.rgcRecDate, startDate : e.startDate, endDate : e.endDate}
												}});
				break; 
				default : break;
				}
			}
		},
		grid: {
			onGridReady : (e) => {
				switch (e.id) {
				case "gridMissSentList":					
					this.missSentGridApi = e.gridApi;
					this.missSentGrid    = e.grid;

					break;

				default: break
				}
			},
			onScrollEnd: (e) => {
				let state = this.state;
				if (!state['gridProps']['gridMissSentList']['paging'].loading) {
					state['gridProps']['gridMissSentList']['paging'].start = state['gridProps']['gridMissSentList']['paging'].start + state['gridProps']['gridMissSentList']['paging'].size;
					state['gridProps']['gridMissSentList']['paging'].page  = state['gridProps']['gridMissSentList']['paging'].page + 1;
					state['gridProps']['gridMissSentList']['paging'].loading = true;

					this.setState(state, () => {
						this.transaction("SYS040000_R02");
					});
				}
			},
		},
		input : {
			onChange : (e) => {
				let state = this.state;

				state['textFieldProps'][e.target.id].value = e.target.value;

				this.setState(state);
			}
		},
		selectbox: {
			onChange: (e) => {
				let state = this.state;

				state['selectboxProps'][e.target.id].selected = e.target.selectedIndex;
				state['selectboxProps'][e.target.id].value    = e.target.value;

				this.setState(state);
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
									<Label value={this.state.rangeCalendarProps.rgcRecDate.label} req={true}/>
									<RangeInputCalendar
										id = {this.state.rangeCalendarProps.rgcRecDate.id}
										strtId  = {this.state.rangeCalendarProps.rgcRecDate.strtId}
										endId  = {this.state.rangeCalendarProps.rgcRecDate.endId}	
										startDate = {this.state.rangeCalendarProps.rgcRecDate.startDate}
										endDate = {this.state.rangeCalendarProps.rgcRecDate.endDate}
										onChange = {this.event.inputcalendar.onChange}
									/>									
									<Label value="오인식 문장 등록자"/>
									<Textfield
										width       = {300}
										id          = {this.state.textFieldProps.iptRegIdNm.id}
										name        = {this.state.textFieldProps.iptRegIdNm.name}
										value       = {this.state.textFieldProps.iptRegIdNm.value}
										placeholder = {this.state.textFieldProps.iptRegIdNm.placeholder}
										minLength   = {this.state.textFieldProps.iptRegIdNm.minLength}
										maxLength   = {this.state.textFieldProps.iptRegIdNm.maxLength}
										readOnly    = {this.state.textFieldProps.iptRegIdNm.readOnly}
										disabled    = {this.state.textFieldProps.iptRegIdNm.disabled}
										onChange    = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>
									<Label value="학습 적용 여부"/>
									<Selectbox
										id       = {this.state.selectboxProps.selAppYn.id}
										value    = {this.state.selectboxProps.selAppYn.value}
										dataset  = {this.state.selectboxProps.selAppYn.dataset}
										width    = {this.state.selectboxProps.selAppYn.width}
										disabled = {this.state.selectboxProps.selAppYn.disabled}
										selected = {this.state.selectboxProps.selAppYn.selected}
										onChange = {this.event.selectbox.onChange}
									/>
								</FlexPanel>
							</LFloatArea>
							<RFloatArea>
								<Button
									color= 'blue' fiiled= {true} innerImage={true} icon = {'srch'}
									id = {this.state.btnProps.btnSearch.id}
									value = {this.state.btnProps.btnSearch.value}
									disabled = {this.state.btnProps.btnSearch.disabled}
									hidden = {this.state.btnProps.btnSearch.hidden}
									onClick = {this.event.button.onClick}
									mt = {5}
								/>
							</RFloatArea>
						</RelativeGroup>
					</SearchPanel>
					<ComponentPanel>
						<Grid
							areaName = {this.state.gridProps.gridMissSentList.areaName}
							id       = {this.state.gridProps.gridMissSentList.id}
							height   = "600px"
							header   = {this.state.gridProps.gridMissSentList.header}
							data     = {this.state.dsMissSentList}			

							rowNum   = {true}
							addRowBtn   = {false}
							delRowBtn   = {false}
							dnlExcelBtn = {true}						
							paging      = {true}
							infinite    = {true}
							suppressRowClickSelection = {true}

							totalRowCnt = {(this.state.dsMissSentList.getRecords().length === 0) ? 0 : this.state.dsMissSentList.getValue(0, 'totalcount')}

							onGridReady        = {this.event.grid.onGridReady}	
							onScrollEnd        = {this.event.grid.onScrollEnd}	

						/>
						<RelativeGroup>
							<RFloatArea>
								<Button
									color    = 'purple' 
									fiiled   = "o" 
									id       = {this.state.btnProps.btnSave.id}
									value    = {this.state.btnProps.btnSave.value}
									disabled = {this.state.btnProps.btnSave.disabled}
									hidden   = {this.state.btnProps.btnSave.hidden}
									onClick  = {this.event.button.onClick}
									mt       = {5}
								/>
							</RFloatArea>
						</RelativeGroup>
					</ComponentPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;