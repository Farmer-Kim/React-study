// 상담원 관리 팝업
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
const testTeamGetter = (centcd) => {
	let teamList = ComLib.getSession("gdsTeamList");
	return teamList.filter(item => item.CENT_CD === centcd).map(item => {return item.CODE_NM})
}
class View extends React.Component {
	constructor(props) {
		super(props);
		this.password = '';
		this.state = {			
			dsConstDetail : DataLib.datalist.getInstance([{CONST_CD  : this.props.options.param.records[0].CONST_CD
				                                        , CONST_NM  : this.props.options.param.records[0].CONST_NM
														, CENT_CD : this.props.options.param.records[0].CENT_CD
														, TEAM_CD : this.props.options.param.records[0].TEAM_CD
														, EXT_NUM : this.props.options.param.records[0].EXT_NUM
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
			case 'SYS030001_H01' :
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
				if(StrLib.isNull(this.state.dsConstDetail.getValue(0, 'EXT_NUM'))) {
					ComLib.openDialog('A', 'SYSI0210');
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
				case 'SYS030001_R01' : // 신규일 때, 상담원아이디 및 상담원성명 체크 용도
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

				case 'SYS030001_R02' : // 수정할 때, 상담원성명 체크 용도
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
		
				case 'SYS030001_H01' :
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
		switch (res.id) {

			case 'SYS030001_R01': // 신규일 때, 상담원아이디 및 상담원성명 체크 용도
				if (res.data.dsConstCdCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0208');
					return false;
				} else if (res.data.dsConstNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				}
				else {
					this.transaction("SYS030001_H01");
				}
				
				break;
			case 'SYS030001_R02': // 수정할 때, 상담원성명 체크 용도
				if (res.data.dsConstNmCheck[0].CHK_CNT > 0) {
					ComLib.openDialog('A', 'SYSI0209');
					return false;
				} else {
					this.transaction("SYS030001_H01");
				}
				break;

			case 'SYS030001_H01':
				ComLib.openDialog("A", "COMI0003");
				this.props.onCallbackFunc({date: this.state.dsConstDetail});
				this.props.onClose();

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
					if (this.validation("SYS030001_H01")) {							
						let isNew = this.props.options.param.isNew;
						if (isNew) { // 신규이면 상담원 ID/성명 중복체크
							this.transaction('SYS030001_R01');
						} else { // 수정시 상담원 성명 중복체크
							this.transaction("SYS030001_R02");
						}						
					}
					break;
				default : break;
				}
			}
		},
		input : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'iptConstCd' :
					ComLib.setStateValue(this, "dsConstDetail", 0, "CONST_CD", e.target.value);
					break;
				case 'iptConstNm' :
					ComLib.setStateValue(this, "dsConstDetail", 0, "CONST_NM", e.target.value);
					break;
				case 'iptPhoneNb' :
					ComLib.setStateValue(this, "dsConstDetail", 0, "EXT_NUM", e.target.value);
					break;
					
				default : break;
				}
			}
		},
		checkbox : {
			onChange : (e) => {
				switch (e.id) {
					case 'chkUseFlag' :
						ComLib.setStateValue(this, "dsConstDetail", 0, "USE_FLAG", (e.checked) ? 'Y' : 'N');
						break;
					default : break;
				}
			}
		},
		selectbox: {
			onChange: (e) => {
				switch (e.id) {
					case 'selCentCd' : 
						ComLib.setStateValue(this, "dsConstDetail", 0, "CENT_CD", e.target.value);
						ComLib.setStateValue(this, "dsConstDetail", 0, "TEAM_CD", "");
						break;
					case 'selTeamCd' :
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
					<SubFullPanel>
						<ComponentPanel>
							<FullPanel>
								<FlexPanel>
									<Table  
										id="tblUsrDetInfo" 
										colGrp = {[{width: '15%'}, {width: '35%'}, {width: '15%'}, {width: '35%'}]}
										tbData = {[
											[   {type : 'T', value : '상담원 아이디'},
												{type : 'D', value : <Textfield 
																		width       = {"100%"} 
																		id          = {"iptConstCd"}
																		name        = {"iptConstCd"}
																		value       = {this.state.dsConstDetail.records[0]["CONST_CD"]}
																		minLength   = {1}
																		maxLength   = {20}
																		readOnly    = {false}
																		placeholder = {"상담원 아이디"}
																		disabled    = {this.props.options.param.isNew ? false : true}
																		onChange    = {this.event.input.onChange}
																	/>},	
												{type : 'T', value : '상담원 이름'},
												{type : 'D', value : <Textfield 
																		width       = {"100%"} 
																		id          = {"iptConstNm"}
																		name        = {"iptConstNm"}
																		value       = {this.state.dsConstDetail.records[0]["CONST_NM"]}
																		minLength   = {1}
																		maxLength   = {20}
																		readOnly    = {false}
																		placeholder = {"상담원 이름"}
																		disabled    = {false}
																		onChange    = {this.event.input.onChange}
																	/>},											
											],
											[   {type : 'T', value : '센터'},
												{type : 'D', value : <Selectbox
																		id       = {"selCentCd"}
																		dataset  = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.select)}
																		value    = {this.state.dsConstDetail.records[0]["CENT_CD"]}
																		width    = {'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
												{type : 'T', value : '팀'},
												{type : 'D', value : <Selectbox
																		id       = {"selTeamCd"}
																		dataset  = {ComLib.convComboList(ComLib.getTeamList(this.state.dsConstDetail), newScrmObj.constants.select.argument.select)}
																		value    = {this.state.dsConstDetail.records[0]["TEAM_CD"]}
																		width    = {'100%'}
																		disabled = {false}
																		onChange = {this.event.selectbox.onChange}
																	/>},
											],
											[	
												{type : 'T', value : '내선번호'},
												{type : 'D', value : <Textfield width='100%'
																		id = {"iptPhoneNb"}
																		name = {"iptPhoneNb"}
																		value = {this.state.dsConstDetail.records[0]["EXT_NUM"]}
																		placeholder = {""}
																		minLength = {1}
																		maxLength = {20}
																		readOnly = {false}
																		disabled = {false}
																		onChange = {this.event.input.onChange}
																		type     = {"onlyNum"}
																	/>},
												{type : 'T', value : '사용여부'},
												{type : 'D', value : <LFloatArea>
																		<Checkbox
																			id       = {"chkUseFlag"}
																			keyProp  = {"SYS030001_chkUseYn"}
																			value    = {""}
																			checked  = {this.state.dsConstDetail.records[0]["USE_FLAG"]}
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