// 사용자관리
import React from 'react';
import { ComponentPanel
	   , FlexPanel
	   , FullPanel
	   , SubFullPanel
	   , LFloatArea
	   , RFloatArea
	   , RelativeGroup
	   , SearchPanel
	   , Label
	   , Grid
	   , Textfield 
	   , Selectbox 
	   , Checkbox
	   , Table                 } from 'components';
import { BasicButton as Button } from 'components';
import { ComLib
	   , DataLib
	   , StrLib
	   , TransManager
	   , newScrmObj            } from 'common';
class View extends React.Component {
	constructor(props) {
		super(props);

		this.grdUser    = null;
		this.grdUserApi = null;

		this.password   = '';
		this.clickBtnId = '';
		this.state = {
			dsSrch       : DataLib.datalist.getInstance([{CENT_CD: "", TEAM_CD: "", AUTH_LV: "", SRCH_DV: "NM", SRCH_VALUE: ""}]),
			dsUserList   : DataLib.datalist.getInstance(),
			dsUserDetail : DataLib.datalist.getInstance([{USR_ID: "", USR_NM: "", AUTH_LV: "", CENT_CD: "", TEAM_CD: "", USE_FLAG: ""}]),
			lastdsSrch   : null,
			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
			},
			cmbSrchAuth_dataset: [{value : 'ALL', name : '전체'}],
			cmbSrchDv_dataset:[
				{value : 'NM', name : '이름'},
				{value : 'ID', name : '아이디'}
			],			
			gridProps : {
				id : 'grdUserList',
				areaName : '사용자 목록',

				header: [
					{headerName: '센터',		field: 'CENT_NM',		colId: 'CENT_NM', 		width: '120', req: true},
					{headerName: '센터',		field: 'CENT_CD',		colId: 'CENT_CD', 		hide: true},
					{headerName: '팀',			field: 'TEAM_NM',		colId: 'TEAM_NM',		width: '120', req: true},
					{headerName: '권한',		field: 'AUTH_NM',	    colId: 'AUTH_NM', 	    width: '100', req: true},
					{headerName: '아이디',		field: 'USR_ID',		colId: 'USR_ID',		width: '100', req: true},
					{headerName: '이름',		field: 'USR_NM',		colId: 'USR_NM',		width: '120', req: true},
					{headerName: '사용여부',	 field: 'USE_FLAG_NM',	colId: 'USE_FLAG_NM',	width: '50', req: true, textAlign: 'center'},	
					{headerName: '등록일시',	field: 'REG_DTM',		colId: 'REG_DTM', 		width: '80', textAlign: 'center', resizable: false},
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
		this.transaction("SYS010000_R00");
	
	}


	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
			case 'SYS010000_R01' :
				break;
			default :
				break;
		}

		return true;
	}
	handler = {
		setDs : (transId) => {
			switch (transId) {
			case "SYS010000_R01" :

				let state = this.state;

				state['gridProps']['paging'].start = 0;
				state['gridProps']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('SYS010000_R01');
				});
				break;
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
				case 'SYS010000_R00' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "SYS.R_getAuthList",
						datasetsend: "dsSend",
						datasetrecv: "dsAuthList",
					});
					transManager.addDataset('dsSend', [{}]);
					transManager.agent();
					
					break;

				case 'SYS010000_R01' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "SYS.R_getUserList",
						datasetsend: "dsSend",
						datasetrecv: "dsUserList",
					});

					let param = {
						CENT_CD     : state.dsSrch.records[0]["CENT_CD"],
						TEAM_CD     : state.dsSrch.records[0]["TEAM_CD"],
						AUTH_LV     : state.dsSrch.records[0]["AUTH_LV"],
						SRCH_DV     : state.dsSrch.records[0]["SRCH_DV"],
						SRCH_VALUE  : state.dsSrch.records[0]["SRCH_VALUE"].trim(),
						QUERY_START : pageStart,
						QUERY_LIMIT : pageLimit,
					};
				
					state.lastdsSrch = state.dsSrch;

					this.setState(state);

					transManager.addDataset('dsSend', [ param ]);
					transManager.agent();

					break;

				case 'SYS010000_R02' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "SYS.R_getUserList",
						datasetsend: "dsSend",
						datasetrecv: "dsUserList",
					});

					let param2 = {
						CENT_CD     : state.lastdsSrch.records[0]["CENT_CD"],
						TEAM_CD     : state.lastdsSrch.records[0]["TEAM_CD"],
						AUTH_LV     : state.lastdsSrch.records[0]["AUTH_LV"],
						SRCH_DV     : state.lastdsSrch.records[0]["SRCH_DV"],
						SRCH_VALUE  : state.lastdsSrch.records[0]["SRCH_VALUE"].trim(),
						QUERY_START : pageStart,
						QUERY_LIMIT : pageLimit,
					};
				
					transManager.addDataset('dsSend', [ param2 ]);
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
			case 'SYS010000_R00': 
				let dsAuthList   = res.data.dsAuthList;
				let authSearData = state.cmbSrchAuth_dataset;

				for (let i = 0; i < dsAuthList.length; i ++) {
					let temp = {};
					temp.value = dsAuthList[i].AUTH_LV;
					temp.name  = dsAuthList[i].AUTH_NM;
					authSearData.push(temp)

				}
				
				state.cmbSrchAuth_dataset = authSearData;
				
				this.setState(state);
				this.transaction('SYS010000_R01');

				break;

			case 'SYS010000_R01':
				if (res.data.dsUserList.length > 0) {
					ComLib.setStateInitRecords(this, "dsUserList", res.data.dsUserList);
				} else {
					ComLib.setStateRecords(this, "dsUserList", []);	
				}
				
				state.dsUserDetail = DataLib.datalist.getInstance([{USR_ID: "", USR_NM: "", AUTH_LV: "", CENT_CD: "", TEAM_CD: "", USE_FLAG: ""}]);
				state['gridProps']['paging'].loading = false;
				
				this.setState(state);

				break; 
			
			case 'SYS010000_R02':
				ComLib.setStateInitRecords(this, "dsUserList", res.data.dsUserList);

				state['gridProps']['paging'].loading = false;
				
				this.setState(state);

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
						if (this.validation("SYS010000_R01")) this.handler.setDs('SYS010000_R01');
						break;
					default : break;
				}
			}
		},
		grid: {
			onBeforeInsertRow: (e) => {				
				let param = {id: 'test', records: [{USR_ID: "", USR_NM: "", AUTH_LV: "", CENT_CD: "", TEAM_CD: "", USE_FLAG: "Y"}], authList: this.state.cmbSrchAuth_dataset, isNew: true};
				let option2 = { width: '600px', height: '300px', modaless: false, param: param}
				ComLib.openPop('SYS010001', '신규 사용자 등록', option2, this.event.grid.afterAddUser)

				return {rtn:false};
			},
			afterAddUser: (e) => {
				this.handler.setDs('SYS010000_R01');
			},
			onGridReady : (e) => {
				//this.setState({grdMenuApi : e.gridApi, grdMenu : e.grid});
				switch(e.id) {
					case "grdUserList":
						this.grdUserApi = e.gridApi;
						this.grdUser = e.grid;
					break;
					default: break;
				}
			},
			onRowClicked: (e) => {	
				// 클릭을 한 번 더 했을 때 그리드에 선택된 인덱스가 풀리지 않도록 하기
				let userRows = this.grdUserApi.rowModel.rowsToDisplay;
				let userRow;

				for (let i = 0; i < userRows.length; i ++) {
					if (userRows[i].data.USR_ID === e.data.USR_ID){
						userRow = this.grdUserApi.rowModel.rowsToDisplay[i];
						break;
					}
				}
				userRow.setSelected(true);
			},
			onCellDoubleClicked: (e) => {
				let param = {id: 'test', records: [e.data], authList: this.state.cmbSrchAuth_dataset, isNew: false};
				let option2 = { width: '600px', height: '300px', modaless: false, param: param}
				ComLib.openPop('SYS010001', '사용자 정보 변경', option2, this.event.grid.afterAddUser)
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
						this.transaction("SYS010000_R02");
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
					case 'cmbSrchAuth' :
						ComLib.setStateValue(this, "dsSrch", 0, "AUTH_LV", e.target.value);
						break;
					case 'cmbSrchDv' :
						ComLib.setStateValue(this, "dsSrch", 0, "SRCH_DV", e.target.value);
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
										id = {"cmbSrchCent"}
										dataset = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSrch.records[0]["CENT_CD"]}
										width = {200}
										disabled = {false}
										controlOrgCombo = {'CENT'}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value="팀"/>
									<Selectbox
										id = {"cmbSrchTeam"}
										dataset = {ComLib.convComboList(ComLib.getTeamList(this.state.dsSrch), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSrch.records[0]["TEAM_CD"]}
										width = {200}
										disabled = {false}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value="권한"/>
									<Selectbox
										id = {"cmbSrchAuth"}
										value = {this.state.dsSrch.records[0]["AUTH_LV"]}
										dataset = {this.state.cmbSrchAuth_dataset}
										width = {200}
										disabled = {false}
										onChange= {this.event.selectbox.onChange}
									/>
									<Label value="사용자"/>
									<Selectbox
										id = {"cmbSrchDv"}
										value = {this.state.dsSrch.records[0]["SRCH_DV"]}
										dataset = {this.state.cmbSrchDv_dataset}
										width = {200}
										disabled = {false}
										onChange= {this.event.selectbox.onChange}
									/>
									<Textfield 
										id    = {"iptSrchword"}
										name  = {"iptSrchword"}
										value = {this.state.dsSrch.records[0]["SRCH_VALUE"]}
										placeholder = {"이름/아이디"}
										minLength   = {1}
										maxLength   = {20}
										width    = {200}
										readOnly = {false}
										disabled = {false}
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
								id        = {this.state.gridProps.id} 
								ref       = {this.state.gridProps.id} 
								header    = {this.state.gridProps.header}
								areaName  = {this.state.gridProps.areaName}
								height    = "650px" 
								rowNum    = {true}						
								paging    = {true}
								infinite  = {true}
								delRowBtn = {false}

								data        = {this.state.dsUserList}
								totalRowCnt = {(this.state.dsUserList.getRecords().length === 0) ? 0 : this.state.dsUserList.getValue(0, 'totalcount')}
								onBeforeInsertRow  = {this.event.grid.onBeforeInsertRow}
								onGridReady        = {this.event.grid.onGridReady}	
								onScrollEnd        = {this.event.grid.onScrollEnd}		
								onRowClicked       = {this.event.grid.onRowClicked}
								onCellDoubleClicked= {this.event.grid.onCellDoubleClicked}

							/>
						</ComponentPanel>
					</SubFullPanel>
					
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default View;