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
		this.password = '';
		this.state = {
			dsUserDetail : DataLib.datalist.getInstance([{USR_ID  : this.props.options.param.records[0].USR_ID
				                                        , USR_NM  : this.props.options.param.records[0].USR_NM
														, AUTH_LV : this.props.options.param.records[0].AUTH_LV
														, CENT_CD : this.props.options.param.records[0].CENT_CD
														, TEAM_CD : this.props.options.param.records[0].TEAM_CD
														, USE_FLAG: this.props.options.param.records[0].USE_FLAG}]),
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
	}


	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
			case 'SYS010001_H01' :
				// 사용자ID, 이름, 권한, 센터, 팀, 활동여부
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
		
		transManager.setTransId (serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try  {
			switch (serviceid) {				
				case 'SYS010001_R01' :
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

				case 'SYS010001_R02' : // 신규일 때, 사용자아이디 및 사용자이름 체크 용도
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

				case 'SYS010001_R03' : // 수정할 때, 사용자이름 체크 용도
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

				case 'SYS010001_H01' :
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

				case 'SYS010001_U01' :
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

				case 'SYS010001_U02' :
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
		switch (res.id) {

			case 'SYS010001_R01':
				if(res.data.dsPwdStndCd.length > 0) {
					this.password = res.data.dsPwdStndCd[0].STND_VAL;

					if (this.password === null || this.password === '') {
						// 해당 제휴사의 비밀번호 기준값이 존재하지 않습니다.[!@]\n관리자에게 문의해 주십시오
						ComLib.openDialog('A', 'SYSI0207');
						return false;
					}

					this.transaction("SYS010001_R02");
				} else {
					// 해당 제휴사의 비밀번호 기준값이 존재하지 않습니다.[!@]\n관리자에게 문의해 주십시오
					ComLib.openDialog('A', 'SYSI0207');
					return false;
				}
				
				break;
			case 'SYS010001_R02': // 신규일 때, 사용자아이디 및 사용자이름 체크 용도
				if (res.data.dsgetUserCdCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0208');
					return false;
				} else if (res.data.dsgetUserNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				}
				else {
					this.transaction("SYS010001_H01");
				}
				break;

			case 'SYS010001_R03': // 수정할 때, 사용자이름 체크 용도
				if (res.data.dsgetUserNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				} else {
					this.transaction("SYS010001_H01");
				}
				break;

			case 'SYS010001_H01':
				ComLib.openDialog("A", "COMI0003");
				
				this.props.onCallbackFunc({date: this.state.dsUserDetail});
				this.props.onClose();

				break;

			case 'SYS010001_R04':
				if(res.data.dsPwdStndCd.length > 0) {
					this.password = res.data.dsPwdStndCd[0].STND_VAL;

					if (this.password === null || this.password === '') {
						// 해당 제휴사의 비밀번호 기준값이 존재하지 않습니다.[!@]\n관리자에게 문의해 주십시오
						ComLib.openDialog('A', 'SYSI0207');
						return false;
					}

					this.transaction("SYS010001_U02");
				} else {
					// 해당 제휴사의 비밀번호 기준값이 존재하지 않습니다.[!@]\n관리자에게 문의해 주십시오
					ComLib.openDialog('A', 'SYSI0207');
					return false;
				}
				
				break;
				
			case 'SYS010000_U01':
				ComLib.openDialog("A", "SYSI0003");
				break;

			case 'SYS010000_U02':
				ComLib.openDialog("A", "SYSI0004");
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
				case "btnSave" : 	// 저장
					if (this.validation("SYS010001_H01")) {							
						let isNew = this.props.options.param.isNew;
						if (isNew) { // 신규이면 센터 기준 암호 조회 후 사용자 아이디와 사용자이름 중복체크
							this.transaction('SYS010001_R01');
							// this.transaction("SYS010001_R02");
						} else { // 수정시 사용자이름 중복체크
							this.transaction("SYS010001_R03");
						}						
					}
					break;
					
				case "btnInitLogin" : 	// 로그인 초기화
					this.transaction("SYS010001_U01"); 
					break;
				case "btnInitPwd" : 	// 비밀번호 초기화
					// 기준값 조회
					this.transaction("SYS010001_R04");
					break;

				default : break;
				}
			}
		},
		input : {
			onChange : (e) => {
				switch (e.target.id) {
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
						this.setState({...this.state, chkUseFlag: {...this.state.chkUseFlag, checked : (e.checked) ? 'Y' : 'N'}});
						ComLib.setStateValue(this, "dsUserDetail", 0, "USE_FLAG", (e.checked) ? 'Y' : 'N');
						break;
					default : break;
				}
			}
		},
		selectbox: {
			onChange: (e) => {
				switch (e.id) {
					case 'selCentCd' : 
						ComLib.setStateValue(this, "dsUserDetail", 0, "CENT_CD", e.target.value);
						ComLib.setStateValue(this, "dsUserDetail", 0, "TEAM_CD", "");
						break;
					case 'selTeamCd' :
						ComLib.setStateValue(this, "dsUserDetail", 0, "TEAM_CD", e.target.value);
						break;
					case 'selAuthCd' :
						ComLib.setStateValue(this, "dsUserDetail", 0, "AUTH_LV", e.target.value);
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
					<SubFullPanel>
						<ComponentPanel>
							<FullPanel>
								<FlexPanel>
									<Table  
										id="tblUsrDetInfo" 
										colGrp = {[{width: '15%'}, {width: '35%'}, {width: '15%'}, {width: '35%'}]}
										tbData = {[
											[   {type : 'T', value : '사용자 아이디'},
												{type : 'D', value : <Textfield 
																		width       = {"100%"} 
																		id          = {"iptUsrCd"}
																		name        = {"iptUsrCd"}
																		value       = {this.state.dsUserDetail.records[0]["USR_ID"]}
																		minLength   = {1}
																		maxLength   = {20}
																		readOnly    = {false}
																		placeholder = {"사용자 아이디"}
																		disabled    = {this.props.options.param.isNew ? false : true}
																		onChange    = {this.event.input.onChange}
																	/>},	
												{type : 'T', value : '사용자 이름'},
												{type : 'D', value : <Textfield 
																		width       = {"100%"} 
																		id          = {"iptUsrNm"}
																		name        = {"iptUsrNm"}
																		value       = {this.state.dsUserDetail.records[0]["USR_NM"]}
																		minLength   = {1}
																		maxLength   = {20}
																		readOnly    = {false}
																		placeholder = {"사용자 이름"}
																		disabled    = {false}
																		onChange    = {this.event.input.onChange}
																	/>},											
											],
											[   {type : 'T', value : '센터'},
												{type : 'D', value : <Selectbox
																		id       = {"selCentCd"}
																		dataset  = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.select)}
																		value    = {this.state.dsUserDetail.records[0]["CENT_CD"]}
																		width    = {'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : '팀'},
												{type : 'D', value : <Selectbox
																		id       = {"selTeamCd"}
																		dataset  = {ComLib.convComboList(ComLib.getTeamList(this.state.dsUserDetail), newScrmObj.constants.select.argument.select)}
																		value    = {this.state.dsUserDetail.records[0]["TEAM_CD"]}
																		width    = {'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
											],
											[
												{type : 'T', value : '권한'},
												{type : 'D', value : <Selectbox 
																		id       = {"selAuthCd"}
																		dataset  = {this.props.options.param.authList}
																		value    = {this.state.dsUserDetail.records[0]["AUTH_LV"]}
																		width    = {'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : '사용여부'},
												{type : 'D', value : <LFloatArea>
																		<Checkbox
																			id       = {"chkUseFlag"}
																			keyProp  = {"SYS010001_chkUseYn"}
																			value    = {""}
																			checked  = {this.state.dsUserDetail.records[0]["USE_FLAG"]}
																			disabled = {false}
																			onChange = {this.event.checkbox.onChange}
																		/>
																	</LFloatArea>}										
											]											
										]}
									/>
								</FlexPanel>
							</FullPanel>
							<SubFullPanel>
								<RelativeGroup>
									{this.props.options.param.isNew ? 									
										null
									 	: 									
										<LFloatArea>
											<Button
												color    = 'purple' 
												fiiled   = {true} 
												id       = {"btnInitLogin"}
												value    = {"로그인초기화"}
												disabled = {false}
												onClick  = {this.event.button.onClick}
												ml = {5}
												mr = {5}
											/>
											<Button
												color    = 'purple' 
												fiiled   = {true} 
												id       = {"btnInitPwd"}
												value    = {"비밀번호초기화"}
												disabled = {false}
												onClick  = {this.event.button.onClick}
											/>
										</LFloatArea>									
									}
									<RFloatArea>
										<Button
											color = {"purple"} 
											fiiled= {true} 
											id    = {"btnSave"}
											value = {"저장"}
											disabled = {false}
											onClick  = {this.event.button.onClick}
											mr = {7}
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