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
				btnInitLogin : {
					id       : 'btnInitLogin',
					disabled : false,
					value    : '로그인초기화',
					hidden   : false
				},
				btnInitPwd : {
					id       : 'btnInitPwd',
					disabled : false,
					value    : '비밀번호초기화',
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
				cmbSrchAuth : {
					id : 'cmbSrchAuth',
					dataset: [{value : 'ALL', name : '전체'},],
					value : '',
					width : 200,
					selected : 1,
					disabled : false
				},
				cmbSrchDv : {
					id : 'cmbSrchDv',
					dataset : [
						{value : 'NM', name : '성명'},
						{value : 'ID', name : 'ID'}
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
				cmbAuthCd : {
					id : 'cmbAuthCd',
					value : '',
					dataset: [{value : '', name : '선택'},],
					width : 200,
					selected : 1,
					disabled : false
				},
			},
			textFieldProps : {
				textSrchWord : {
					id          : 'iptSrchword',
					name        : 'iptSrchword',
					value       : '',
					placeholder : '성명/ID',
					minLength   : 1,
					maxLength   : 20,
					readOnly    : false,
					disabled    : false
				},
				textUsrCd : {
					id          : 'iptUsrCd',
					name        : 'iptUsrCd',
					value       : '',
					placeholder : '',
					minLength   : 1,
					maxLength   : 20,
					readOnly    : false,
					disabled    : false
				},
				textUsrNm : {
					id          : 'iptUsrNm',
					name        : 'iptUsrNm',
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
				keyProp : 'SYS020000_chkUseYn',
				value : '',
				checked : 'N',
				readOnly : false,
				disabled : false
			},
			gridProps : {
				id : 'grdUserList',
				areaName : '사용자 목록',
				header: [
					{headerName: '센터',		field: 'CENT_NM',		colId: 'CENT_NM', 		editable: false,	width: '120'},
					{headerName: '팀',			field: 'TEAM_NM',		colId: 'TEAM_NM',		editable: false,	width: '120'},
					{headerName: '사용자ID',	field: 'USR_ID',		colId: 'USR_ID',		editable: false,	width: '100'},
					{headerName: '사용자명',	field: 'USR_NM',		colId: 'USR_NM',		editable: false,	width: '120'},
					{headerName: '권한',		field: 'AUTH_NM',	    colId: 'AUTH_NM', 	    editable: false,	width: '100'},
					{headerName: '사용여부',	field: 'USE_FLAG_NM',	colId: 'USE_FLAG_NM', 	editable: false,	width: '50', textAlign: 'center'},
					{headerName: '등록일시',	field: 'REG_DTM',		colId: 'REG_DTM', 		editable: false,	width: '80', textAlign: 'center', resizable: false},
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
		this.transaction("SYS020000_R00");
	}


	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
			case 'SYS020000_R01' :
				break;
			
			case 'SYS020000_H01' :
				// 사용자ID, 성명, 권한, 센터, 팀, 활동여부
				if(StrLib.isNull(this.state.dsUserDetail.getValue(0, 'USR_ID'))) {
					ComLib.openDialog('A', 'COMI0062');
					return false;
				}
				if(StrLib.isNull(this.state.dsUserDetail.getValue(0, 'USR_NM'))) {
					ComLib.openDialog('A', 'SYSI0201');
					return false;
				}
				if(StrLib.isNull(this.state.dsUserDetail.getValue(0, 'AUTH_LV'))) {
					ComLib.openDialog('A', 'SYSI0202');
					return false;
				}
				if(StrLib.isNull(this.state.dsUserDetail.getValue(0, 'CENT_CD'))) {
					ComLib.openDialog('A', 'SYSI0203');
					return false;
				}
				if(StrLib.isNull(this.state.dsUserDetail.getValue(0, 'TEAM_CD'))) {
					ComLib.openDialog('A', 'SYSI0204');
					return false;
				}
				break;
			case 'SYS020000_R03':
			case 'SYS020000_U02':
				// 그리드 데이터 선택
				let usrCd = this.state.dsUserDetail.records[0].USR_ID;

				if(StrLib.isNull(usrCd)) {
					ComLib.openDialog('A', 'SYSI0206');
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
			case "SYS020000_R01" :

				let state = this.state;

				state['gridProps']['paging'].start = 0;
				state['gridProps']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('SYS020000_R01');
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
				case 'SYS020000_R00' :
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

				case 'SYS020000_R01' :
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

				case 'SYS020000_R02' :
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

				case 'SYS020000_R03' :
					transManager.addConfig({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : 'SYS.R_getPwdStndCode',
						datasetsend: 'dsSrch',
						datasetrecv: 'dsPwdStndCd'
					});
					
					let stndParam = {
						CENT_CD: this.state.dsUserDetail.records[0]["CENT_CD"],
					};
					
					transManager.addDataset('dsSrch', [ stndParam ]);
					transManager.agent();

					break;

				case 'SYS020000_R04' : // 신규일 때, 사용자아이디 및 사용자성명 체크 용도
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid: 'SYS.R_getUserCdCheck',
						datasetsend: 'dsSrch',
						datasetrecv: 'dsgetUserCdCheck'
					});
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid: 'SYS.R_getUserNmCheck',
						datasetsend: 'dsSrch',
						datasetrecv: 'dsgetUserNmCheck'
					});	
					transManager.addDataset('dsSrch', this.state.dsUserDetail.getRow(0));
					transManager.agent();
					break;

				case 'SYS020000_R05' : // 수정할 때, 사용자성명 체크 용도
									transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid: 'SYS.R_getUserNmCheck',
						datasetsend: 'dsSrch',
						datasetrecv: 'dsgetUserNmCheck'
					});					
					transManager.addDataset('dsSrch', this.state.dsUserDetail.getRow(0));
					transManager.agent();
					break;

				case 'SYS020000_C01' : 
					// transManager.addConfig({
					// 	dao: transManager.constants.dao.base,
					// 	crudh: transManager.constants.crudh.create,
					// 	sqlmapid: 'SYS.C_setUsrLog',
					// 	datasetsend: 'dsSend',
					// });		

					// transManager.addDataset('dsSend', this.state.dsUserDetail.getRow(0));
					// transManager.agent();

					break;

				case 'SYS020000_H01' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.update,
						sqlmapid   : "SYS.U_setUsrInfo",
						datasetsend: "dsSend",
					});
					
					// 비밀번호 정보 추가 해야함. (기준값 테이블에서 조회한 값으로 셋팅)
					let rowtype = this.state.dsUserDetail.getRow(0)[0].rowtype;
					if(rowtype === 'c') {
						transManager.addConfig({
							crudh: transManager.constants.crudh.passwd,
							datasetsend: 'dsSendPwd',
							columnid: 'INIT_PWD'
						});
						transManager.addConfig  ({
							dao        : transManager.constants.dao.base,
							crudh      : transManager.constants.crudh.create,
							sqlmapid   : "SYS.U_setPwdInit",
							datasetsend: "dsSendPwd",
						});
					}
					
					let dsPwdData = {
						USR_ID: this.state.dsUserDetail.records[0]["USR_ID"],
						INIT_PWD: this.password,
					};
					
					transManager.addDataset('dsSendPwd', [ dsPwdData ] );
					transManager.addDataset('dsSend', this.state.dsUserDetail.getRow(0));
					transManager.agent();

					break;

				case 'SYS020000_U01' :
					transManager.addConfig({
						crudh      : transManager.constants.crudh.passwd,
						datasetsend: 'dsSendPwd',
						columnid   : 'INIT_PWD'
					});
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.update,
						sqlmapid   : "SYS.U_setPwdInit",
						datasetsend: "dsSendPwd",
					});

					dsPwdData = {
						USR_ID: this.state.dsUserDetail.records[0]["USR_ID"],
						INIT_PWD: this.password
					};

					transManager.addDataset('dsSendPwd', [ dsPwdData ] );
					transManager.agent();

					break;

				case 'SYS020000_U02' :
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.update,
						sqlmapid: 'SYS.U_setLoginInit',
						datasetsend: 'dsSend'
					});
					transManager.addDataset('dsSend', this.state.dsUserDetail.getRow(0));
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
			case 'SYS020000_R00': 
				let dsAuthList   = res.data.dsAuthList;
				let authData     = state.selectboxProps.cmbAuthCd.dataset;
				let authSearData = state.selectboxProps.cmbSrchAuth.dataset;

				for (let i = 0; i < dsAuthList.length; i ++) {
					let temp = {};
					temp.value = dsAuthList[i].AUTH_LV;
					temp.name  = dsAuthList[i].AUTH_NM;
					authSearData.push(temp)
					authData.push(temp)

				}
				
				state['selectboxProps']['cmbSrchAuth'].dataset = authSearData;
				state['selectboxProps']['cmbAuthCd'].dataset = authData;
				
				this.setState(state);
				this.transaction('SYS020000_R01');

				break;

			case 'SYS020000_R01':
				if (res.data.dsUserList.length > 0) {
					ComLib.setStateInitRecords(this, "dsUserList", res.data.dsUserList);
				} else {
					ComLib.setStateRecords(this, "dsUserList", []);	
				}
				
				state.dsUserDetail = DataLib.datalist.getInstance([{USR_ID: "", USR_NM: "", AUTH_LV: "", CENT_CD: "", TEAM_CD: "", USE_FLAG: ""}]);
				state['gridProps']['paging'].loading = false;
				
				this.setState(state);

				break; 
			
			case 'SYS020000_R02':
				ComLib.setStateInitRecords(this, "dsUserList", res.data.dsUserList);

				state['gridProps']['paging'].loading = false;
				
				this.setState(state);

				break; 

			case 'SYS020000_R03':
				if(res.data.dsPwdStndCd.length > 0) {
					this.password = res.data.dsPwdStndCd[0].STND_VAL;

					if (this.password === null || this.password === '') {
						// 해당 제휴사의 비밀번호 기준값이 존재하지 않습니다.[!@]\n관리자에게 문의해 주십시오
						ComLib.openDialog('A', 'SYSI0207');
						return false;
					}

					// 버튼 트랜젝션 컨트롤
					this.btnTransactionControl();
				} else {
					// 해당 제휴사의 비밀번호 기준값이 존재하지 않습니다.[!@]\n관리자에게 문의해 주십시오
					ComLib.openDialog('A', 'SYSI0207');
					return false;
				}
				
				break;
			case 'SYS020000_R04': // 신규일 때, 사용자아이디 및 사용자성명 체크 용도
				if (res.data.dsgetUserCdCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0208');
					return false;
				} else if (res.data.dsgetUserNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				}
				else {
					this.transaction("SYS020000_H01");
				}
				break;

			case 'SYS020000_R05': // 수정할 때, 사용자성명 체크 용도
				if (res.data.dsgetUserNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				} else {
					this.transaction("SYS020000_H01");
				}
				break;

			case 'SYS020000_H01':
				ComLib.openDialog("A", "COMI0003");
				// this.transaction("SYS020000_C01");
				this.handler.setDs('SYS020000_R01');

				break;

			case 'SYS020000_U02':
				ComLib.openDialog("A", "SYSI0004");
				break;

			case 'SYS020000_U01':
				ComLib.openDialog("A", "SYSI0003");
				break;
			
			case 'SYS020000_C01':
				this.handler.setDs('SYS020000_R01');
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
						if (this.validation("SYS020000_R01")) this.handler.setDs('SYS020000_R01');
						break;
					case "btnAdd" : 	// 신규
						this.setState({...this.state, radioProps : {...this.state.radioProps, selected : 'A'}});
						this.setState({...this.state, singleCheckProp: {...this.state.singleCheckProp, checked : 'Y'}});
						
						ComLib.setStateRecords(this, "dsUserDetail", [{
							rowtype: "c",
							USR_ID: "", 
							USR_NM: "", 
							AUTH_LV: "4", 
							CENT_CD: "", 
							TEAM_CD: "", 
							USE_FLAG: "Y", 
							REG_ID: ComLib.getSession("gdsUserInfo")[0].USR_ID, 
							CHG_ID: ComLib.getSession("gdsUserInfo")[0].USR_ID}]
						);

						// 신규 버튼을 클릭시 사용자 목록에서 이미 선택되어 있던 인덱스가 선택 해제되도록 하기
						//let records = this.grdUser.gridDataset.getRecords();
						// let rowNum = 0;
						
						if(this.grdUserApi.getSelectedRows().length > 0){
							// for (let i = 0; i < records.length; i ++) {
							// 	if (records[i].USR_ID === this.grdUserApi.getSelectedRows()[0].USR_ID) {
							// 		rowNum = i;
							// 		break;
							// 	}
							// }
					
							if (this.grdUserApi.rowModel.rowsToDisplay.length !== 0) {
								this.grdUserApi.rowModel.rowsToDisplay[this.grdUser.gridDataset.getRecords().findIndex(
									item => item['USR_ID'] === this.grdUserApi.getSelectedRows()[0].USR_ID
								)].setSelected(false);
							}
						}
	
						break;
					case "btnSave" : 	// 저장
						if (this.validation("SYS020000_H01")) {
							// 기준값 조회
							this.transaction('SYS020000_R03');
						}
						break;
					case "btnInitLogin" : 	// 로그인 초기화
						if(this.validation("SYS020000_U02")) this.transaction("SYS020000_U02"); 
						break;
					case "btnInitPwd" : 	// 비밀번호 초기화
						// 기준값 조회
						if(this.validation("SYS020000_R03"))this.transaction("SYS020000_R03");
						break;
					default : break;
				}
			}
		},
		grid: {
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
				ComLib.setStateRecords(this, "dsUserDetail", [this.grdUser.gridDataset.records[e.index]]);
				
				// 상세정보 체크박스 셋팅
				this.setState({...this.state, singleCheckProp: {...this.state.singleCheckProp, checked : e.data.USE_FLAG}});

				if(e.data.CENT_CD === '' || e.data.CENT_CD === null) {
					ComLib.setStateValue(this, "dsUserDetail", 0, "CENT_CD", "");
					ComLib.setStateValue(this, "dsUserDetail", 0, "TEAM_CD", "");
				}

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
						this.transaction("SYS020000_R02");
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
					case 'iptUsrCd' :
						ComLib.setStateValue(this, "dsUserDetail", 0, "USR_ID", e.target.value);
						break;
					case 'iptUsrNm' :
						ComLib.setStateValue(this, "dsUserDetail", 0, "USR_NM", e.target.value);
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
						ComLib.setStateValue(this, "dsUserDetail", 0, "USE_FLAG", (e.checked) ? 'Y' : 'N');
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
					// 상세정보 영역
					case 'cmbCentCd' : 
						ComLib.setStateValue(this, "dsUserDetail", 0, "CENT_CD", e.target.value);
						ComLib.setStateValue(this, "dsUserDetail", 0, "TEAM_CD", "");
						/*
						if(e.target.value !== '') {
							let teamCd = [];
							teamCd = DataLib.datalist.getInstance(ComLib.getTeamList(this.state.dsSrchTemp)).find('CENT_CD', e.target.value);
							ComLib.setStateValue(this, "dsUserDetail", 0, "TEAM_CD", teamCd[0].CODE);
						} else {
							ComLib.setStateValue(this, "dsUserDetail", 0, "TEAM_CD", "");
						}
						*/
						break;
					case 'cmbTeamCd' :
						ComLib.setStateValue(this, "dsUserDetail", 0, "TEAM_CD", e.target.value);
						break;
					case 'cmbAuthCd' :
						ComLib.setStateValue(this, "dsUserDetail", 0, "AUTH_LV", e.target.value);
						break;
					default : break;
				}
			}
		}
	}

	// 버튼 트랜젝션 컨트롤
	btnTransactionControl =() => {
		switch (this.clickBtnId) {
			case 'btnSave' : // 저장
				let rowtype = this.state.dsUserDetail.records[0]["rowtype"];
				if(rowtype === 'c') { // 신규이면 사용자 ID와 사용자성명 중복체크
					this.transaction("SYS020000_R04");
				}else if (rowtype === 'r') { // 수정시 사용자성명 중복체크
					this.transaction("SYS020000_R05");
				}else {
					this.transaction("SYS020000_H01");
				}
				break;
			case 'btnInitPwd':	// 비밀번호 초기화
				this.transaction("SYS020000_U01");
				break;
			default : break;
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
									<Label value="권한"/>
									<Selectbox
										id = {this.state.selectboxProps.cmbSrchAuth.id}
										value = {this.state.dsSrch.records[0]["AUTH_LV"]}
										dataset = {this.state.selectboxProps.cmbSrchAuth.dataset}
										width = {200}
										disabled = {false}
										selected = {this.state.selectboxProps.cmbSrchAuth.selected}
										onChange= {this.event.selectbox.onChange}
									/>
									<Label value="사용자"/>
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
										id = {this.state.textFieldProps.textSrchWord.id}
										name =  {this.state.textFieldProps.textSrchWord.name}
										value =  {this.state.dsSrch.records[0]["SRCH_VALUE"]}
										placeholder =  {this.state.textFieldProps.textSrchWord.placeholder}
										minLength =   {this.state.textFieldProps.textSrchWord.minLength}
										maxLength =   {this.state.textFieldProps.textSrchWord.maxLength}
										readOnly =  {this.state.textFieldProps.textSrchWord.readOnly}
										disabled =  {this.state.textFieldProps.textSrchWord.disabled}
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
								height    = "465px" 
								addRowBtn = {false}
								delRowBtn = {false}
								rowNum    = {true}						
								paging    = {true}
								infinite  = {true}

								data        = {this.state.dsUserList}
								totalRowCnt = {(this.state.dsUserList.getRecords().length === 0) ? 0 : this.state.dsUserList.getValue(0, 'totalcount')}

								onGridReady        = {this.event.grid.onGridReady}	
								onScrollEnd        = {this.event.grid.onScrollEnd}		
								onRowClicked       = {this.event.grid.onRowClicked}
							/>
						</ComponentPanel>
					</SubFullPanel>
					<SubFullPanel>
						<ComponentPanel>
							<FullPanel>
								<FlexPanel>
									<Table  
										id="tblUsrDetInfo" 
										colGrp = {[{width: '10%'}, {width: '15%'}, {width: '10%'}, {width: '15%'}, {width: '10%'}, {width: '15%'}, {width: '10%'}, {width: '15%'} ]}
										tbData = {[
											[   {type : 'T', value : '사용자 ID'},
												{type : 'D', value : <Textfield width='100%' 
																		id = {this.state.textFieldProps.textUsrCd.id}
																		name =  {this.state.textFieldProps.textUsrCd.name}
																		value =  {this.state.dsUserDetail.records[0]["USR_ID"]}
																		placeholder =  {this.state.textFieldProps.textUsrCd.placeholder}
																		minLength =   {this.state.textFieldProps.textUsrCd.minLength}
																		maxLength =   {this.state.textFieldProps.textUsrCd.maxLength}
																		readOnly =  {this.state.textFieldProps.textUsrCd.readOnly}
																		disabled = {this.state.dsUserDetail.records[0]["rowtype"] !== newScrmObj.constants.crud.create ? true : false}
																		onChange={this.event.input.onChange}
																	/>},	
												{type : 'T', value : '사용자 성명'},
												{type : 'D', value : <Textfield width='100%'
																		id = {this.state.textFieldProps.textUsrNm.id}
																		name = {this.state.textFieldProps.textUsrNm.name}
																		value = {this.state.dsUserDetail.records[0]["USR_NM"]}
																		placeholder = {this.state.textFieldProps.textUsrNm.placeholder}
																		minLength = {this.state.textFieldProps.textUsrNm.minLength}
																		maxLength = {this.state.textFieldProps.textUsrNm.maxLength}
																		readOnly = {this.state.textFieldProps.textUsrNm.readOnly}
																		disabled = {this.state.textFieldProps.textUsrNm.disabled}
																		onChange = {this.event.input.onChange}
																	/>},
												{type : 'T', value : '권한'},
												{type : 'D', value : <Selectbox 
																		id = {this.state.selectboxProps.cmbAuthCd.id}
																		value = {this.state.dsUserDetail.records[0]["AUTH_LV"]}
																		dataset = {this.state.selectboxProps.cmbAuthCd.dataset}
																		width ={'100%'}
																		disabled = {false}
																		selected = {this.state.selectboxProps.cmbAuthCd.selected}
																		onChange= {this.event.selectbox.onChange}
																	/>},											
											],
											[   {type : 'T', value : '센터'},
												{type : 'D', value : <Selectbox
																		id = {this.state.selectboxProps.cmbCentCd.id}
																		dataset = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.select)}
																		value = {this.state.dsUserDetail.records[0]["CENT_CD"]}
																		width ={'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : '팀'},
												{type : 'D', value : <Selectbox
																		id = {this.state.selectboxProps.cmbTeamCd.id}
																		dataset = {ComLib.convComboList(ComLib.getTeamList(this.state.dsUserDetail), newScrmObj.constants.select.argument.select)}
																		value = {this.state.dsUserDetail.records[0]["TEAM_CD"]}
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
																	/>}										
											]
										]}
									/>
								</FlexPanel>
							</FullPanel>
							<SubFullPanel>
								<RelativeGroup>
									<LFloatArea>
										<Button
											color= 'purple' fiiled= {true} 
											id = {this.state.btnProps.btnInitLogin.id}
											value = {this.state.btnProps.btnInitLogin.value}
											disabled = {this.state.btnProps.btnInitLogin.disabled}
											hidden = {this.state.btnProps.btnInitLogin.hidden}
											onClick = {this.event.button.onClick}
											ml = {5}
											mr = {5}
										/>
										<Button
											color= 'purple' fiiled= {true} 
											id = {this.state.btnProps.btnInitPwd.id}
											value = {this.state.btnProps.btnInitPwd.value}
											disabled = {this.state.btnProps.btnInitPwd.disabled}
											hidden = {this.state.btnProps.btnInitPwd.hidden}
											onClick = {this.event.button.onClick}
										/>
									</LFloatArea>
									<RFloatArea>
										<Button
											color="green" fiiled= {true} 
											id = {this.state.btnProps.btnAdd.id}
											value = {this.state.btnProps.btnAdd.value}
											disabled = {this.state.btnProps.btnAdd.disabled}
											hidden = {this.state.btnProps.btnAdd.hidden}
											onClick = {this.event.button.onClick}
											mr = {5}
										/>
										<Button
											color="purple" fiiled= {true} 
											id = {this.state.btnProps.btnSave.id}
											value = {this.state.btnProps.btnSave.value}
											disabled = {this.state.btnProps.btnSave.disabled}
											hidden = {this.state.btnProps.btnSave.hidden}
											onClick = {this.event.button.onClick}
											mr = {5}
										/>
									</RFloatArea>
								</RelativeGroup>
							</SubFullPanel>
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default View;