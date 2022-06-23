import React from 'react';
import {ComLib, StrLib, TransManager, DataLib} from 'common';
import {Table} from 'components';
/*------------------------------------------------------------------------------------------------*/
//  화면 ID     : userChg
//  화면명      : 비밀번호 변경
//  화면 종류   : 팝업
//  작성자      : 
//  작성일자    : 
/*------------------------------------------------------------------------------------------------*/
class userChg extends React.Component {
	/*******************************************************************
	 * Constructor
	 *******************************************************************/
	constructor(props){
		super();
		this.state = {
			open: false,
			dsPwdInfo: DataLib.datalist.getInstance([{USR_ID: '', CUR_PWD: '', NEW_PWD: '', CON_PWD: '', AUTH_NM: '', CENT_NM: '', USR_NM: ''}]),
		}

		// 이벤트 바인딩
		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.input.onChange = this.event.input.onChange.bind(this)
	}

	/*******************************************************************
	 * Event
	 *******************************************************************/
	componentDidMount() {
		ComLib.setStateInitRecords(this, "dsPwdInfo", this.props.options.param);
		
		console.log(this.props.options.param)
		console.log(this.state.dsPwdInfo.records)
	}

	event = {
		input: {
			onChange: (e) => {
				switch (e.target.id) {
				case 'iptUsrNm':
					ComLib.setStateValue(this, 'dsPwdInfo', 0, "USR_NM", e.target.value);
					break;
				case 'iptCurPwd':
					ComLib.setStateValue(this, 'dsPwdInfo', 0, "CUR_PWD", e.target.value);
					break;
				case 'iptNewPwd':
					ComLib.setStateValue(this, 'dsPwdInfo', 0, "NEW_PWD", e.target.value);
					break;
				case 'iptConPwd':
					ComLib.setStateValue(this, 'dsPwdInfo', 0, "CON_PWD", e.target.value);
					break;
				default: break;
				}
			},
		},
		button: {
			onClick: (e) => {
				switch (e.target.id) {
				case 'btnuserChgConfirm':
					if (this.validation('userChg_R01')) this.transaction('userChg_R01');
					break;
				case 'btnuserChgCancel':
					//window.location = '/';
					document.getElementById(this.props.popupdivid).remove();
					break;
				default: break;
				}
			}
		},
	}

	/*******************************************************************
	 * Validation
	 * userChg_R01 : 인증 / 신규 비밀번호 체크
	 * userChg_C01 : 신규 비밀번호 등록
	 *******************************************************************/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'userChg_R01':
			if (StrLib.isNull(this.state.dsPwdInfo.getValue(0, "USR_NM"))) {
				ComLib.openDialog('A', 'SYSI0010', ['이름 입력해 주세요.']);
				return false;
			}
			if (StrLib.isNull(this.state.dsPwdInfo.getValue(0, "CUR_PWD"))) {
				ComLib.openDialog('A', 'SYSI0010', ['현재 비밀번호를 입력해 주세요.']);
				return false;
			}
			if (StrLib.isNull(this.state.dsPwdInfo.getValue(0, "NEW_PWD"))) {
				ComLib.openDialog('A', 'SYSI0010', ['새로운 비밀번호를 입력해 주세요.']);
				return false;
			}
			if (this.state.dsPwdInfo.getValue(0, "CUR_PWD") === this.state.dsPwdInfo.getValue(0, "NEW_PWD")) {
				ComLib.openDialog('A', 'SYSI0010', ['현재 비밀번호와 신규 비밀번호가 같습니다.']);
				return false;
			}

			if (this.state.dsPwdInfo.getValue(0, "NEW_PWD").length < 4) {
				ComLib.openDialog('A', 'SYSI0010', ['최소 4자리 이상 입력해 주세요']);
				return false;
			}
			if (this.state.dsPwdInfo.getValue(0, "NEW_PWD").length > 14) {
				ComLib.openDialog('A', 'SYSI0010', ['최대 14자리 까지 입력해 주세요']);
				return false;
			}
			if (this.state.dsPwdInfo.getValue(0, "NEW_PWD") === this.state.dsPwdInfo.getValue(0, "USR_ID")) {
				ComLib.openDialog('A', 'SYSI0010', ['사용자 ID와 비밀번호가 동일합니다.']);
				return false;
			}
			if (!StrLib.isAlpha(this.state.dsPwdInfo.getValue(0, "NEW_PWD").substr(0, 1))) {
				ComLib.openDialog('A', 'SYSI0010', ['비밀번호는 영문자로 시작해야 합니다.']);
				return false;
			}
			if (!/[_!@#$%^&*()_+=-]/.test(this.state.dsPwdInfo.getValue(0, "NEW_PWD"))) {
				ComLib.openDialog('A', 'SYSI0010', ['특수문자가 포함되어야 합니다.']);
				return false;
			}

			if (StrLib.isNull(this.state.dsPwdInfo.getValue(0, "CON_PWD"))) {
				ComLib.openDialog('A', 'SYSI0010', ['신규 비밀번호를 재 입력해 주세요.']);
				return false;
			}
			if (this.state.dsPwdInfo.getValue(0, "NEW_PWD") !== this.state.dsPwdInfo.getValue(0, "CON_PWD")) {
				ComLib.openDialog('A', 'SYSI0010', ['신규 비밀번호와 재입력된 비밀번호가 다릅니다.']);
				return false;
			}
			break;
		case 'userChg_C01':
			break;
		default: break;
		}

		this.setdata(serviceid);

		return true;
	}

	/*******************************************************************
	 * Sen data
	 *******************************************************************/
	setdata = (serviceid) => {
		switch (serviceid) {
		case 'userChg_R01':
			break;
		case 'userChg_C01':
			break;
		default: break;
		}
	}

	/*******************************************************************
	 * transaction
	 *******************************************************************/
	transaction = (serviceid) => {
		let transManager = new TransManager();
		try  {
			switch (serviceid) {
			case 'userChg_R01':
				transManager.setTransId(serviceid);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.passwd,
					datasetsend: "dsPwdInfo",
					columnid: "CUR_PWD"
				});
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.passwd,
					datasetsend: "dsPwdInfo",
					columnid: "NEW_PWD"
				});
				transManager.addConfig({
					 dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"COM.R_chkCurUsrPwd",
					datasetsend:"dsPwdInfo",
					datasetrecv:"dsChkCurPwdRst",
				});
				transManager.addConfig({
					 dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"COM.R_chkNewPwd",
					datasetsend:"dsPwdInfo",
					datasetrecv:"dsChkNewPwdRst",
				});
				transManager.addDataset('dsPwdInfo', this.state.dsPwdInfo.getTransRecords());
				transManager.agent();
				break;
			case 'userChg_C01':
				transManager.setTransId(serviceid);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.passwd,
					datasetsend: "dsPwdInfo",
					columnid: "CUR_PWD"
				});
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.passwd,
					datasetsend: "dsPwdInfo",
					columnid: "NEW_PWD"
				});
				transManager.addConfig({
					 dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"COM.U_setUsrPwd",
					datasetsend:"dsPwdInfo",
				});
				let transRecords = this.state.dsPwdInfo.getTransRecords();

				if (transRecords[0].orgdata.USR_NM !== transRecords[0].USR_NM ) {
					transManager.addConfig({
						dao: transManager.constants.dao.base,
					   crudh: transManager.constants.crudh.read,
					   sqlmapid:"COM.U_setUsrNm",
					   datasetsend:"dsPwdInfo",
				   });
				}
				transManager.addDataset('dsPwdInfo', transRecords);
				
				//transManager.agent();
				break;
			default: break;
			}
		} catch (err) {
			console.log(err);
		}
	}

	/*******************************************************************
	 * callback
	 *******************************************************************/
	callback = (res) => {
		try {
			switch (res.id) {
			case 'userChg_R01':
				if (res.data.dsChkCurPwdRst[0]["MAT_YN"] === 'USR') {
					ComLib.openDialog('A', 'SYSI0010', ['아이디가 없습니다.']);
				} else if (res.data.dsChkCurPwdRst[0]["MAT_YN"] === 'N') {
					ComLib.openDialog('A', 'SYSI0010', ['비밀번호 오류 입니다.']);
				} else if (res.data.dsChkCurPwdRst[0]["MAT_YN"] === 'Y') {
					if (res.data.dsChkNewPwdRst[0]["DUP_YN"] === 'Y') {
						ComLib.openDialog('A', 'SYSI0010', ['최근 6개월 이내 사용된 비밀번호 입니다.']);
					} else if (res.data.dsChkNewPwdRst[0]["DUP_YN"] === 'N') {
						if (this.validation('userChg_C01')) this.transaction('userChg_C01');
					}
				}
				break;
			case 'userChg_C01':
				ComLib.openDialog('A', 'SYSI0010', ['비밀번호가 변경되었습니다. 다시 로그인 해주세요']);
				//ComLib.openDialog('A', '비밀번호가 변경되었습니다.');
				//window.location = '/';
				document.getElementById('_btnClose').click();
				break;
			default: break;
			}
		} catch (err) {
			console.log(err);
		}
	}

	/*******************************************************************
	 * render
	 *******************************************************************/
	render () {

		// USR_ID: '', CUR_PWD: '', NEW_PWD: '', CON_PWD: '', AUTH_LV: '', CENT_NM: '', USR_NM: ''

		return (
			<div className = {'scrm-login-pop'}>
				<div className = "scrm-login-div">
					<Table
						id="tblUsrInfo" 
						colGrp = {[{width: '15%'}, {width: '30%'}, {width: '20%'}, {width: '35%'}]}
						tbData = {[
							[   	
								{type : 'T', value : '아이디'},
								{type : 'T', value : this.state.dsPwdInfo.records[0]["USR_ID"]},
								{type : 'D', value : <div style={{height: "35px"}}>※ 8~16 영문, 숫자, 특수문자 입력</div>, colSpan: 2},											
							],
							[   	
								{type : 'T', value : '이름'},
								{type : 'T', value : this.state.dsPwdInfo.records[0]["USR_NM"]},		
								{type : 'T', value : '현재 비밀번호'},
								{type : 'D', value : <input 
														style = {{width: '100%'}} 
														type  = {"password"} 
														id    = 'iptCurPwd' 
														value = {this.state.dsPwdInfo.records[0]["CUR_PWD"]} 
														placeholder = {'현재 비밀번호를 입력하세요.'} 
														onChange = {this.event.input.onChange}
													/>},	
																
							],
							[   	
								{type : 'T', value : '센터/팀'},
								{type : 'T', value : this.state.dsPwdInfo.records[0]["CENT_NM"]},		
								{type : 'T', value : '신규 비밀번호'},
								{type : 'D', value : <input 
														style = {{width: '100%'}} 
														type  = {"password"} 
														id    = 'iptNewPwd' 
														value = {this.state.dsPwdInfo.records[0]["NEW_PWD"]} 
														placeholder = {'신규 비밀번호를 입력하세요.'} 
														onChange = {this.event.input.onChange}
													/>},									
							],
							[   	
								{type : 'T', value : '권한'},
								{type : 'T', value : this.state.dsPwdInfo.records[0]["AUTH_NM"]},	
								{type : 'T', value : '비밀번호 확인'},
								{type : 'D', value : <input 
														style = {{width: '100%'}} 
														type  = {"password"} 
														id    = 'iptConPwd' 
														value = {this.state.dsPwdInfo.records[0]["CON_PWD"]} 
														placeholder = {'신규 비밀번호를 재입력하세요.'} 
														onChange = {this.event.input.onChange}
													/>},								
							]
						]}
					/>
					
				</div>
				
				<div className = "scrm-login-div">
					<div className = 'scrm-login-btn-div gr-wrap'>
						<div className = 'scrm-login-btn gr-6'><button id = 'btnuserChgConfirm' className='btn md purple w100' onClick = {this.event.button.onClick}>{'확인'}</button></div>
						<div className = 'scrm-login-btn gr-6'><button id = 'btnuserChgCancel' className='btn md purple-o w100' onClick = {this.event.button.onClick}>{'취소'}</button></div>
					</div>
				</div>
			</div>
		);
	}
}
export default userChg;