// 콜봇 시나리오 관리
import React from 'react';
import { ComponentPanel
	   , FlexPanel
	   , FullPanel
	   , SubFullPanel
	   , RelativeGroup
	   , SearchPanel
	   , LFloatArea
	   , Grid 
	   , Diagram            } from 'components';
import {BasicButton as Button} from 'components';
import { ComLib
	   , DataLib
	   , StrLib
	   , TransManager
	   , newScrmObj            } from 'common';
import BOT010100 from '../BOT010100';

class View extends React.Component {
	constructor(props) {
		super(props);
		
		this.saveNode = null;
		this.saveLink = null;

		this.state = {
			dsSnroInitTTSList: DataLib.datalist.getInstance(),
			dsSnroNodeList   : DataLib.datalist.getInstance(),
			dsSnroLinkList   : DataLib.datalist.getInstance(),
			
			dsSnroNode: [],
			dsSnroLink: [],

			dsSnroList : [],
			actionData : [],
			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
				btnBigSave : {
					id       : 'btnBigSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
	
				btnSmlSave : {
					id       : 'btnSmlSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},	
			
			grdProps : {		
				grdSnroInitProcess : {
					id : 'grdSnroInitProcess',
					areaName : '시나리오 프로세스',
					header: [						
								{headerName: '코드',field: 'SNRO_CD',	       colId: 'SNRO_CD',		editable: false, width: 80 },
								{headerName: '타입',field: 'PROCESS_TP_NM',    colId: 'PROCESS_TP_NM',	editable: false, width: 100},
								{headerName: '시나리오 명',	field: 'SNRO_EXPL',	colId: 'SNRO_EXPL',	    editable: false, width: 300 },
								{headerName: '프로세스', field: 'PROCESS'   ,	colId: 'PROCESS'   ,	editable: true, width: 90,
									cellRenderer: 'actionButton', 
									fiiled: true,
									color: 'blue'},
							],
					height: '670px'
				},
			},
			selectboxProps : {
				selUseYn : {
					id       : 'selUseYn',
					value    : '',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList("USE_FLAG"), newScrmObj.constants.select.argument.all),
					width    : 80,
					selected : 0,
					disabled : false
				}
			},			
			textFieldProps : {
				iptBigCdNm : {
					id          : 'iptBigCdNm',
					name        : 'iptBigCdNm',
					value       : '',
					placeholder : '대분류코드/코드명',
					minLength   : 1,
					maxLength   : 12,
					readOnly    : false,
					disabled    : false
				}
			},
		}
	}
	/*------------------------------------------------------------------------------------------------*
		0) Custom Event Zone 

	 ------------------------------------------------------------------------------------------------*/

	/*------------------------------------------------------------------------------------------------*
		1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
		=> 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	 ------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		this.transaction("BOT010000_R00")
	}
	/*------------------------------------------------------------------------------------------------*
		2) componentDidUpdate () => 갱신이 일어나 직후에 호춮 (최초 렌더링 시에는 호출되지 않음)
		=> prevProps와 현재 props를 비교할 수 있음 -> 조건문으로 감싸지 않고 setState를 실행할 시, 무한 반복 가능성 -> 반드시 setState를 쓰려면 조건문으로 작성
	 ------------------------------------------------------------------------------------------------*/
	componentDidUpdate (prevProps, prevState, snapshot) {
		// console.log("updated!!");
		// console.log(this.state.dsGrp);
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
	validation = (...params) => {
		let transId = params[0];
		switch (transId) {
		case 'BOT010000_R01':

			break;
		case 'BOT010000_H01':

			let orgNode = this.state.dsSnroNodeList.records;
			let saveNode = [];

			for (let i = 0; i < orgNode.length; i ++) {
				let isExist = false;
				for (let j = 0; j < params[1].length; j ++) {
					if (params[1][j].ND_UUID === orgNode[i].ND_UUID) {
						isExist = true;
						break;
					}
				}
				if (!isExist) {
					saveNode.push({EXTRAS    : {}
								 , ND_COLOR  : orgNode[i].ND_COLOR
								 , ND_KWD_SCO: orgNode[i].ND_KWD_SCO
								 , ND_NM     : orgNode[i].ND_NM
								 , ND_PORTS  : orgNode[i].ND_PORTS
								 , ND_TP     : orgNode[i].ND_TP
								 , ND_TTS_ID : orgNode[i].ND_TTS_ID
								 , ND_UUID   : orgNode[i].ND_UUID
								 , ND_X      : orgNode[i].ND_X
								 , ND_Y      : orgNode[i].ND_Y
								 , rowtype   : "d"})
				}
			}
			for (let j = 0; j < params[1].length; j ++) {
				saveNode.push(params[1][j])
			}
			
			let orgLink = this.state.dsSnroLinkList.records;
			let saveLink = [];

			for (let i = 0; i < orgLink.length; i ++) {
				let isExist = false;
				for (let j = 0; j < params[2].length; j ++) {
					if (params[2][j].LK_UUID === orgLink[i].LK_UUID) {
						isExist = true;
						break;
					}
				}
  

				if (!isExist) {
					saveLink.push({LK_EN_ND     : orgLink[i].LK_EN_ND
						         , LK_EN_ND_PORT: orgLink[i].LK_EN_ND_PORT
						         , LK_POINT     : orgLink[i].LK_POINT
						         , LK_ST_ND     : orgLink[i].LK_ST_ND
						         , LK_ST_ND_PORT: orgLink[i].LK_ST_ND_PORT
						         , LK_TP        : orgLink[i].LK_TP
						         , LK_UUID      : orgLink[i].LK_UUID
								 , rowtype      : "d"})
				}
			}

			for (let j = 0; j < params[2].length; j ++) {
				if (params[2][j].rowtype !== "r") {
					saveLink.push(params[2][j])
				} else {					
					for (let i = 0; i < orgLink.length; i ++) {
						if (orgLink[i].LK_UUID === params[2][j].LK_UUID) {
							saveLink.push({LK_EN_ND     : params[2][j].LK_EN_ND
										 , LK_EN_ND_PORT: params[2][j].LK_EN_ND_PORT
										 , LK_POINT     : params[2][j].LK_POINT
										 , LK_ST_ND     : params[2][j].LK_ST_ND
										 , LK_ST_ND_PORT: params[2][j].LK_ST_ND_PORT
										 , LK_TP        : params[2][j].LK_TP
										 , LK_UUID      : params[2][j].LK_UUID
										 , rowtype      : params[2][j].LK_POINT === orgLink[i].LK_POINT ? 'r' : 'u'})
										
							break;
						}
					}
				}				
			}

			this.saveNode = saveNode;
			this.saveLink = saveLink;

			
			console.log(orgNode)
			console.log(orgLink)

			console.log(this.saveNode)
			console.log(this.saveLink)
			break;
		default: break;
		}

		return true;
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {
		let transId = params[0];

		let transManager = new TransManager();

		transManager.setTransId (transId);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try  {
			switch (transId) {
			case 'BOT010000_R00':
		
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "BOT.R_getSnroTTS",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroInitTTSListRecv"
				});

				transManager.addDataset('dsEmpty', [{}]);
				transManager.agent();

				break;			
			case 'BOT010000_R01':

				// transManager.setTransId("test");
				// transManager.setTransUrl(transManager.constants.url.sftp);
				// transManager.setCallBack(this.callback);
				// transManager.addConfig({
				// 	dao: transManager.constants.dao.base,
				// 	crudh: transManager.constants.crudh.sttSearch,
				// 	datasetsend: "test",
				// });
					
				// transManager.addDataset('test', [{path:"test/eere/eer", svrIp: "1.1.1.1"}]);
				// transManager.agent();

				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "BOT.R_getSnroNode",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroNodeListRecv"
				});

				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "BOT.R_getSnroLink",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroLinkListRecv"
				});

				transManager.addDataset('dsEmpty', [{}]);
				transManager.agent();

				break
			case 'BOT010000_H01':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "BOT.H_handleSnroLink",
					datasetsend: "dsLinkList",
				});

				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "BOT.H_handleSnroNode",
					datasetsend: "dsNodeList"
				});

				transManager.addDataset('dsLinkList', this.saveLink);
				transManager.addDataset('dsNodeList', this.saveNode);

				transManager.agent();

				break;
			default: break;
			}
		} catch (err) {

		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	// BOT010000_R01 : 대분류 코드 조회
	// BOT010000_R02 : 소분류 코드 조회
	// BOT010000_H01 : 대분류 코드 저장
	// BOT010000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {	

		switch (res.id) {
		case 'BOT010000_R00':
			if (res.data.dsSnroInitTTSListRecv.length > 0) {
				let dsSnroInitTTSListRecv = res.data.dsSnroInitTTSListRecv;

				let addSelect = [];

				addSelect.push({CODE: "0", CD_VAL: "TTS를 선택해 주세요", CODE_NM: "선택", recid: 0, rowtype: "r", CODE_TP: 'N'});
				for (let i = 0; i < dsSnroInitTTSListRecv.length; i ++) {
					addSelect.push(dsSnroInitTTSListRecv[i]);

				}

				ComLib.setStateInitRecords(this, "dsSnroInitTTSList", addSelect);
				
			} else {
				ComLib.setStateInitRecords(this, "dsSnroInitTTSList", []);

			}
			break;
			
		case 'BOT010000_R01':	
			if (res.data.dsSnroNodeListRecv.length > 0) {
				let { dsSnroNodeListRecv, dsSnroLinkListRecv } = res.data;
				ComLib.setStateInitRecords(this, "dsSnroNodeList", dsSnroNodeListRecv);
				ComLib.setStateInitRecords(this, "dsSnroLinkList", dsSnroLinkListRecv);
				

				// react diagram npm 자체 오류로 2번 로딩 해줘야함 
				// 한번만 로딩시 링크 생성 안됨 추후 수정 요망
				// 노드와 링크를 따로 props 로 던져 줘서 componet 내부에서 2번 랜더링을 하는 방법을 시도 해 봐야 겟음
				this.setState({...this.state, dsSnroNode: dsSnroNodeListRecv});
				this.setState({...this.state, dsSnroLink: dsSnroLinkListRecv});
		

			} else {
				ComLib.setStateInitRecords(this, "dsSnroNodeList", []);
				ComLib.setStateInitRecords(this, "dsSnroLinkList", []);

				this.setState({...this.state, dsSnroNode: []});
				this.setState({...this.state, dsSnroLink: []});
			}
			break;

		case 'BOT010000_H01':
			this.transaction('BOT010000_R01');
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
				case "btnDiagramSrch":
					if (this.validation("BOT010000_R01")) this.transaction("BOT010000_R01");
				
					break;

				case "btnDiagramSave":
					this.refs.refDiagram.serializationSave();
					break;

				case "btnSmlSave":
					if (this.validation("BOT010000_H02")) this.transaction("BOT010000_H02");
					
					break;	
						
				default : break;
				}
			}
		},
		diagram : {
			onSave : (e) => {
				let transNode = e.node;
				let transLink = e.link;
				if (this.validation("BOT010000_H01", transNode, transLink)) this.transaction("BOT010000_H01");
				
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
									<Button
										color='purple' 
										size ='md'
										fiiled= {true}
										id = {"btnDiagramSrch"}
										value = {"조회"}
										disabled = {false}
										hidden = {false}
										onClick = {this.event.button.onClick}
										ml = {5}
									/>
									<Button
										color='purple' 
										size ='md'
										fiiled= {true}
										id = {"btnDiagramSave"}
										value = {"저장 테스트"}
										disabled = {false}
										hidden = {false}
										onClick = {this.event.button.onClick}
										ml = {5}
									/>
								</FlexPanel>
							</LFloatArea>
						</RelativeGroup>
					</SearchPanel>											
					<SubFullPanel>				
						<Diagram
							height     = "650px"
							tts        = {this.state.dsSnroInitTTSList.records}
							onSave     = {this.event.diagram.onSave}
							dsSnroNode = {this.state.dsSnroNode}
							dsSnroLink = {this.state.dsSnroLink}
							ref = "refDiagram"							
						/>		
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default View;