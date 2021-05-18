// 상담원관리
import React from 'react';
import {ComponentPanel, FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup, SearchPanel} from 'components'; //버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {Checkbox, Textfield, Selectbox} from 'components';
import {Grid, Table} from 'components';
import {ComLib, DataLib, newScrmObj, TransManager, StrLib} from 'common';

class View extends React.Component {
	constructor(props) {
		super(props);

		this.csGrid = null;
		this.csGridApi = null;
		this.password = '';
		this.clickBtnId = '';
		this.state = {
			dsSrch: DataLib.datalist.getInstance([{CENT_CD: ComLib.setOrgComboValue("CENT_CD"), TEAM_CD: "", SRCH_DV: "NM", SRCH_VALUE: ""}]),
			dsConstList : DataLib.datalist.getInstance(),
			dsConstDetail : DataLib.datalist.getInstance([{CONST_CD: "", CONST_NM: "", CENT_CD: "", TEAM_CD: "", USE_FLAG: ""}]),
			
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
				btnAdd : {
					id       : 'btnAdd',
					disabled : false,
					value    : '신규',
					hidden   : false
				},
			},
			selectboxProps : {
				cmbSrchCent : {
					id : 'cmbSrchCent',
					value : '',
					width : 200,
					selected : 1,
					disabled : false
				},
				cmbSrchTeam : {
					id : 'cmbSrchTeam',
					value : '',
					width : 200,
					selected : 1,
					disabled : false
				},
				cmbSrchDv : {
					id : 'cmbSrchDv',
					dataset : [
						{value : 'NM', name : '성명'},
						{value : 'CD', name : 'CD'}
					],
					//value : '',
					width : 200,
					selected : 1,
					disabled : false
				},
				// 상세정보 영역
				cmbCentCd : {
					id : 'cmbCentCd',
					value : '',
					width : 200,
					selected : 1,
					disabled : false
				},
				cmbTeamCd : {
					id : 'cmbTeamCd',
					value : '',
					width : 200,
					selected : 1,
					disabled : false
				},
			},
			textFieldProps : {
				iptSrchword : {
					id          : 'iptSrchword',
					name        : 'iptSrchword',
					value       : '',
					placeholder : '성명/CD',
					minLength   : 1,
					maxLength   : 20,
					readOnly    : false,
					disabled    : false
				},
				iptConstCd : {
					id          : 'iptConstCd',
					name        : 'iptConstCd',
					value       : '',
					placeholder : '',
					minLength   : 1,
					maxLength   : 20,
					readOnly    : false,
					disabled    : false
				},
				iptConstNm : {
					id          : 'iptConstNm',
					name        : 'iptConstNm',
					value       : '',
					placeholder : '',
					minLength   : 1,
					maxLength   : 20,
					readOnly    : false,
					disabled    : false
				},
			},
			singleCheckProp : {
				id : 'chkUseYn',
				index : 0,
				keyProp : 'SYS090000_chkUseYn',
				value : '',
				checked : 'N',
				readOnly : false,
				disabled : false
			},
			gridProps : {
				id : 'grdCsList',
				areaName : '상당원 목록',
				header: [
					{headerName: '센터',		field: 'CENT_NM',		colId: 'CENT_NM', 		editable: false,	width: 100},
					{headerName: '팀',			field: 'TEAM_NM',		colId: 'TEAM_NM',		editable: false,	width: 100},
					{headerName: '상담원CD',	field: 'CONST_CD',		colId: 'CONST_CD',		editable: false,	width: 100},
					{headerName: '상담원명',	field: 'CONST_NM',		colId: 'CONST_NM',		editable: false,	width: 100, textAlign: 'center'},
					{headerName: '사용여부',	field: 'USE_FLAG_NM',	colId: 'USE_FLAG_NM', 	editable: false,	width: 50, textAlign: 'center'},
					{headerName: '등록/수정자',	field: 'REG_USR_ID',	colId: 'REG_USR_ID', 	editable: false,	width: 100, textAlign: 'center'},
					{headerName: '등록/수정 일시',	field: 'REG_DTM',	 colId: 'REG_DTM', 	    editable: false,	width: 100, textAlign: 'center'},
				],				
				paging : {
					start: 0,
					size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
					page : 1,
					loading: false
				},
			}
		}

		// 이벤트 바인딩
		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);
	}
	
	/*------------------------------------------------------------------------------------------------*/
	// 1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
	// => 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	/*------------------------------------------------------------------------------------------------*/
	componentDidMount () { // 조회
		if(this.validation("SYS090000_R01")) this.transaction("SYS090000_R01");
	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
			case 'SYS090000_R01' :
				break;
			
			case 'SYS090000_H01' :
				// 상담원ID, 성명, 센터, 팀
				if(StrLib.isNull(this.state.dsConstDetail.getValue(0, 'CONST_CD'))) {
					ComLib.openDialog('A', 'COMI0062');
					return false;
				}
				if(StrLib.isNull(this.state.dsConstDetail.getValue(0, 'CONST_NM'))) {
					ComLib.openDialog('A', 'SYSI0201');
					return false;
				}
				if(StrLib.isNull(this.state.dsConstDetail.getValue(0, 'CENT_CD'))) {
					ComLib.openDialog('A', 'SYSI0203');
					return false;
				}
				if(StrLib.isNull(this.state.dsConstDetail.getValue(0, 'TEAM_CD'))) {
					ComLib.openDialog('A', 'SYSI0204');
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
			case "SYS090000_R01" :
				let state = this.state;

				state['gridProps']['paging'].start = 0;
				state['gridProps']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('SYS090000_R01');
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

		transManager.setTransId (serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);
		
		let state       = this.state;	
		
		let pageStart   = state['gridProps']['paging'].start;
		let pageLimit   = state['gridProps']['paging'].size;

		try  {
			switch (serviceid) {
				case 'SYS090000_R01' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "SYS.R_getConstList",
						datasetsend: "dsSend",
						datasetrecv: "dsConstList",
					});

					let param = {
						CENT_CD    : state.dsSrch.records[0]["CENT_CD"],
						TEAM_CD    : state.dsSrch.records[0]["TEAM_CD"],
						SRCH_DV    : state.dsSrch.records[0]["SRCH_DV"],
						SRCH_VALUE : state.dsSrch.records[0]["SRCH_VALUE"].trim(),						
						QUERY_START: pageStart,
						QUERY_LIMIT: pageLimit,
					};

					state.lastdsSrch = state.dsSrch;

					this.setState(state);

					transManager.addDataset('dsSend', [ param ]);
					transManager.agent();

					break;

				case 'SYS090000_R02' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "SYS.R_getConstList",
						datasetsend: "dsSend",
						datasetrecv: "dsConstList",
					});

					let param2 = {
						CENT_CD    : state.lastdsSrch.records[0]["CENT_CD"],
						TEAM_CD    : state.lastdsSrch.records[0]["TEAM_CD"],
						SRCH_DV    : state.lastdsSrch.records[0]["SRCH_DV"],
						SRCH_VALUE : state.lastdsSrch.records[0]["SRCH_VALUE"].trim(),						
						QUERY_START: pageStart,
						QUERY_LIMIT: pageLimit,
					};

					transManager.addDataset('dsSend', [ param2 ]);
					transManager.agent();

					break;

				case 'SYS090000_R03' : // 신규일 때, 상담원아이디 및 상담원성명 체크 용도
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid: 'SYS.R_getConstCdCheck',
						datasetsend: 'dsSrch',
						datasetrecv: 'dsConstCdCheck'
					});
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid: 'SYS.R_getConstNmCheck',
						datasetsend: 'dsSrch',
						datasetrecv: 'dsConstNmCheck'
					});	
					transManager.addDataset('dsSrch', this.state.dsConstDetail.getRow(0));
					transManager.agent();

					break;

				case 'SYS090000_R04' : // 수정할 때, 상담원성명 체크 용도
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid: 'SYS.R_getConstNmCheck',
						datasetsend: 'dsSrch',
						datasetrecv: 'dsConstNmCheck'
					});					
					transManager.addDataset('dsSrch', this.state.dsConstDetail.getRow(0));
					transManager.agent();

					break;

				case 'SYS090000_H01' :
					transManager.addConfig ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.create,
						sqlmapid   : "SYS.C_setConstInfo",
						datasetsend: "dsSend",
					});
										
					transManager.addDataset('dsSend', this.state.dsConstDetail.getRow(0));
					transManager.agent();

					break;

				default :
					break;
			}
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
			case 'SYS090000_R01':
				if (res.data.dsConstList.length > 0) {
					ComLib.setStateInitRecords(this, "dsConstList", res.data.dsConstList);
				} else {
					ComLib.setStateRecords(this, "dsConstList", []);	
				}
				
				state.dsConstDetail = DataLib.datalist.getInstance([{CONST_CD: "", CONST_NM: "", CENT_CD: "", TEAM_CD: "", USE_FLAG: ""}]);
				state['gridProps']['paging'].loading = false;
				
				this.setState(state);

				break; 

			case 'SYS090000_R02':				
				ComLib.setStateInitRecords(this, "dsConstList", res.data.dsConstList);

				state['gridProps']['paging'].loading = false;
				
				this.setState(state);


				break; 
				
			case 'SYS090000_R03': // 신규일 때, 상담원아이디 및 상담원성명 체크 용도
				if (res.data.dsConstCdCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0208');
					return false;
				} else if (res.data.dsConstNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				}
				else {
					this.transaction("SYS090000_H01");
				}
				break;
			case 'SYS090000_R04': // 수정할 때, 상담원성명 체크 용도
				if (res.data.dsConstNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				} else {
					this.transaction("SYS090000_H01");
				}
				break;
			case 'SYS090000_H01':
				ComLib.openDialog("A", "COMI0003");
				this.transaction("SYS090000_R01");
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
				this.clickBtnId = e.target.id;
				switch (e.target.id) {
					case "btnSearch" :	// 조회
						if(this.validation("SYS090000_R01")) this.handler.setDs('SYS090000_R01');
						break;
					case "btnAdd" : 	// 신규
						this.setState({...this.state, radioProps : {...this.state.radioProps, selected : 'A'}});
						this.setState({...this.state, singleCheckProp: {...this.state.singleCheckProp, checked : 'Y'}});
						
						ComLib.setStateRecords(this, "dsConstDetail", [{
							rowtype: "c",
							CONST_CD: "", 
							CONST_NM: "", 
							CENT_CD: "", 
							TEAM_CD: "", 
							USE_FLAG: "Y", 
							REG_ID: ComLib.getSession("gdsUserInfo")[0].USR_ID, 
							CHG_ID: ComLib.getSession("gdsUserInfo")[0].USR_ID}]
						);

						if(this.csGridApi.getSelectedRows().length > 0){
							if (this.csGridApi.rowModel.rowsToDisplay.length !== 0) {
								this.csGridApi.rowModel.rowsToDisplay[this.csGrid.gridDataset.getRecords().findIndex(
									item => item['CONST_CD'] === this.csGridApi.getSelectedRows()[0].CONST_CD
								)].setSelected(false);
							}
						}
	
						break;
					case "btnSave" : 	// 저장
						if (this.validation("SYS090000_H01")) {
							// 기준값 조회
							let rowtype = this.state.dsConstDetail.records[0]["rowtype"];
							if(rowtype === 'c') { // 신규이면 사용자 ID와 사용자성명 중복체크
								this.transaction("SYS090000_R03");
							}else if (rowtype === 'r') { // 수정시 사용자성명 중복체크
								this.transaction("SYS090000_R04");
							}
						}
						break;
					default : break;
				}
			}
		},
		grid: {
			onGridReady : (e) => {
				//this.setState({grdMenuApi : e.gridApi, grdMenu : e.grid});
				switch(e.id) {
					case "grdCsList":
						this.csGridApi = e.gridApi;
						this.csGrid = e.grid;
					break;
					default: break;
				}
			},
			onRowClicked: (e) => {
				ComLib.setStateRecords(this, "dsConstDetail", [this.csGrid.gridDataset.records[e.index]]);
				
				// 상세정보 체크박스 셋팅
				this.setState({...this.state, singleCheckProp: {...this.state.singleCheckProp, checked : e.data.USE_FLAG}});

				if(e.data.CENT_CD === '' || e.data.CENT_CD === null) {
					ComLib.setStateValue(this, "dsConstDetail", 0, "CENT_CD", "");
					ComLib.setStateValue(this, "dsConstDetail", 0, "TEAM_CD", "");
				}

				// 클릭을 한 번 더 했을 때 그리드에 선택된 인덱스가 풀리지 않도록 하기
				let constRows = this.csGridApi.rowModel.rowsToDisplay;
				let constRow;

				for (let i = 0; i < constRows.length; i ++) {
					if (constRows[i].data.CONST_CD === e.data.CONST_CD){
						constRow = this.csGridApi.rowModel.rowsToDisplay[i];
						break;
					}
				}
				constRow.setSelected(true);
			},
			onScrollEnd: (e) => {
				if (!this.state.gridProps.paging.loading) {
					this.setState({...this.state
						, gridProps : { ...this.state.gridProps
							, paging : { ...this.state.gridProps.paging
								, start : this.state.gridProps.paging.start + this.state.gridProps.paging.size
								, page : this.state.gridProps.paging.page + 1
								, loading : true
							}
						}
					}, () => {
						this.transaction("SYS090000_R02");
					});
				}
			},
		},
		input : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'iptSrchword' :
					ComLib.setStateValue(this, "dsSrch", 0, "SRCH_VALUE", e.target.value);

					break;

				case 'iptConstCd':
					ComLib.setStateValue(this, "dsConstDetail", 0, "CONST_CD", e.target.value);

					break;

				case 'iptConstNm':
					ComLib.setStateValue(this, "dsConstDetail", 0, "CONST_NM", e.target.value);
					
					break;

				default : break;
				}
			}
		},
		checkbox : {
			onChange : (e) => {
				switch (e.id) {
					case 'chkUseYn' :
						this.setState({...this.state, singleCheckProp: {...this.state.singleCheckProp, checked : (e.checked) ? 'Y' : 'N'}});
						ComLib.setStateValue(this, "dsConstDetail", 0, "USE_FLAG", (e.checked) ? 'Y' : 'N');
						break;
					default : break;
				}
			}
		},
		selectbox: {
			onChange: (e) => {
				switch (e.id) {
				case 'cmbSrchCent' : 
					ComLib.setStateValue(this, "dsSrch", 0, "CENT_CD", e.target.value);
					ComLib.setStateValue(this, "dsSrch", 0, "TEAM_CD", "");

					break;
				case 'cmbSrchTeam' :
					ComLib.setStateValue(this, "dsSrch", 0, "TEAM_CD", e.target.value);

					break;
					
				case 'cmbSrchDv' :
					ComLib.setStateValue(this, "dsSrch", 0, "SRCH_DV", e.target.value);
					break;
					// 상세정보 영역
				case 'cmbCentCd' : 
					ComLib.setStateValue(this, "dsConstDetail", 0, "CENT_CD", e.target.value);
					ComLib.setStateValue(this, "dsConstDetail", 0, "TEAM_CD", "");
					
					break;
				case 'cmbTeamCd' :
					ComLib.setStateValue(this, "dsConstDetail", 0, "TEAM_CD", e.target.value);
					break;
				default : break;
				}
			}
		}
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
									<Label value="센터"/>
									<Selectbox
										id = {this.state.selectboxProps.cmbSrchCent.id}
										dataset = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSrch.records[0]["CENT_CD"]}
										width = {200}
										disabled = {false}
										controlOrgCombo = {'CENT'}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value="팀"/>
									<Selectbox
										id = {this.state.selectboxProps.cmbSrchTeam.id}
										dataset = {ComLib.convComboList(ComLib.getTeamList(this.state.dsSrch), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSrch.records[0]["TEAM_CD"]}
										width = {200}
										disabled = {false}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value="상담원"/>
									<Selectbox
										id = {this.state.selectboxProps.cmbSrchDv.id}
										value = {this.state.dsSrch.records[0]["SRCH_DV"]}
										dataset = {this.state.selectboxProps.cmbSrchDv.dataset}
										width = {200}
										disabled = {false}
										selected = {this.state.selectboxProps.cmbSrchDv.selected}
										onChange= {this.event.selectbox.onChange}
									/>
									<Textfield 
										width={200}
										id = {this.state.textFieldProps.iptSrchword.id}
										name =  {this.state.textFieldProps.iptSrchword.name}
										value =  {this.state.dsSrch.records[0]["SRCH_VALUE"]}
										placeholder =  {this.state.textFieldProps.iptSrchword.placeholder}
										minLength =   {this.state.textFieldProps.iptSrchword.minLength}
										maxLength =   {this.state.textFieldProps.iptSrchword.maxLength}
										readOnly =  {this.state.textFieldProps.iptSrchword.readOnly}
										disabled =  {this.state.textFieldProps.iptSrchword.disabled}
										onChange = {this.event.input.onChange}
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
					<SubFullPanel>
						<ComponentPanel>
							<Grid
								id      = {this.state.gridProps.id} 
								ref     = {this.state.gridProps.id} 
								header  = {this.state.gridProps.header}
								areaName= {this.state.gridProps.areaName}
								height  = "465px"

								addRowBtn = {false}
								delRowBtn = {false}
								rowNum    = {true}
								paging    = {true}
								infinite  = {true}

								data = {this.state.dsConstList}
								totalRowCnt = {(this.state.dsConstList.getRecords().length === 0) ? 0 : this.state.dsConstList.getValue(0, 'totalcount')}

								onGridReady  = {this.event.grid.onGridReady}
								onRowClicked = {this.event.grid.onRowClicked}
								onScrollEnd  = {this.event.grid.onScrollEnd}	
							/>									
						</ComponentPanel>
					</SubFullPanel>
					<SubFullPanel>
						<ComponentPanel>
							<FullPanel>
								<FlexPanel>
									<Table  
										id="tblUsrDetInfo" 
										colGrp = {[{width: '8%'}, {width: '12%'}, {width: '8%'}, {width: '12%'}, {width: '8%'}, {width: '12%'}, {width: '8%'}, {width: '8%'}, {width: '8%'}, {width: '8%'}, {width: '4%'}, {width: '4%'} ]}
										tbData = {[
											[   {type : 'T', value : '상담원 CD'},
												{type : 'D', value : <Textfield width='100%' 
																		id = {this.state.textFieldProps.iptConstCd.id}
																		name =  {this.state.textFieldProps.iptConstCd.name}
																		value =  {this.state.dsConstDetail.records[0]["CONST_CD"]}
																		placeholder =  {this.state.textFieldProps.iptConstCd.placeholder}
																		minLength =   {this.state.textFieldProps.iptConstCd.minLength}
																		maxLength =   {this.state.textFieldProps.iptConstCd.maxLength}
																		readOnly =  {this.state.textFieldProps.iptConstCd.readOnly}
																		disabled = {this.state.dsConstDetail.records[0]["rowtype"] !== newScrmObj.constants.crud.create ? true : false}
																		onChange={this.event.input.onChange}
																	/>},	
												{type : 'T', value : '상담원 성명'},
												{type : 'D', value : <Textfield width='100%'
																		id = {this.state.textFieldProps.iptConstNm.id}
																		name = {this.state.textFieldProps.iptConstNm.name}
																		value = {this.state.dsConstDetail.records[0]["CONST_NM"]}
																		placeholder = {this.state.textFieldProps.iptConstNm.placeholder}
																		minLength = {this.state.textFieldProps.iptConstNm.minLength}
																		maxLength = {this.state.textFieldProps.iptConstNm.maxLength}
																		readOnly = {this.state.textFieldProps.iptConstNm.readOnly}
																		disabled = {this.state.textFieldProps.iptConstNm.disabled}
																		onChange = {this.event.input.onChange}
																	/>},											
											    {type : 'T', value : '센터'},
												{type : 'D', value : <Selectbox
																		id = {this.state.selectboxProps.cmbCentCd.id}
																		dataset = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.select)}
																		value = {this.state.dsConstDetail.records[0]["CENT_CD"]}
																		width ={'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : '팀'},
												{type : 'D', value : <Selectbox
																		id = {this.state.selectboxProps.cmbTeamCd.id}
																		dataset = {ComLib.convComboList(ComLib.getTeamList(this.state.dsConstDetail), newScrmObj.constants.select.argument.select)}
																		value = {this.state.dsConstDetail.records[0]["TEAM_CD"]}
																		width ={'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : '사용여부'},
												{type : 'D', value : <Checkbox
																		id = {this.state.singleCheckProp.id}
																		keyProp = {this.state.singleCheckProp.keyProp}
																		value = {this.state.singleCheckProp.value}
																		checked = {this.state.singleCheckProp.checked}
																		disabled = {this.state.singleCheckProp.disabled}
																		onChange = {this.event.checkbox.onChange}
																	/>},
												{type : 'D', value :<Button
																		color="green" fiiled= {true} 
																		id = {this.state.btnProps.btnAdd.id}
																		value = {this.state.btnProps.btnAdd.value}
																		disabled = {this.state.btnProps.btnAdd.disabled}
																		hidden = {this.state.btnProps.btnAdd.hidden}
																		onClick = {this.event.button.onClick}
																		mr = {5}
																	/>},
												{type : 'D', value :<Button
																		color="purple" fiiled= {true} 
																		id = {this.state.btnProps.btnSave.id}
																		value = {this.state.btnProps.btnSave.value}
																		disabled = {this.state.btnProps.btnSave.disabled}
																		hidden = {this.state.btnProps.btnSave.hidden}
																		onClick = {this.event.button.onClick}
																		mr = {5}
																	/>}										
											]
										]}
									/>
								</FlexPanel>
							</FullPanel>
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default View;