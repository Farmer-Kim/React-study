// 콜봇 시나리오 관리
import React from 'react';
import { ComponentPanel
	   , FlexPanel
	   , FullPanel
	   , SubFullPanel
	   , RelativeGroup
	   , TabPanel
	   , Tabs
	   , Grid             } from 'components';
import { ComLib
	   , DataLib
	   , StrLib
	   , TransManager
	   , newScrmObj            } from 'common';
import BOT010100 from '../BOT010100';
import BOT080200 from '../BOT010200';
import BOT080300 from '../BOT010300';

class View extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dsSnroInitProcessList : DataLib.datalist.getInstance(),
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

		this.event.button.onClick   = this.event.button.onClick.bind(this);
		this.event.input.onChange   = this.event.input.onChange.bind(this);
		
	}
	/*------------------------------------------------------------------------------------------------*
		0) Custom Event Zone 
		rowFinder = 조회후 가장 마지막에 선택되어져 있던 행으로 재 포커싱을 하기 위한 함수
	 ------------------------------------------------------------------------------------------------*/
	rowFinder = (targetRecords, targetColumn, currentRow, secondColumn, secondRow) => {
		let rowNum = 0;

		if (targetRecords === undefined || targetRecords === null) {
			return rowNum;
		}

		if (StrLib.isNull(secondColumn)) {
			if (!StrLib.isNull(currentRow)) {
				for (let i = 0; i < targetRecords.length; i++) {
					if (targetRecords[i][targetColumn] === currentRow) {
						rowNum = i;

						break;
					}
				}
			}
			return rowNum;

		} else {
			if (!StrLib.isNull(secondRow)) {
				for (let i = 0; i < targetRecords.length; i++) {
					if (targetRecords[i][targetColumn] === currentRow && targetRecords[i][secondColumn] === secondRow) {
						rowNum = i;

						break;
					}
				}
			}
			return rowNum;
		}
	}
	/*------------------------------------------------------------------------------------------------*
		1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
		=> 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	 ------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		this.transaction("SYS080000_R00")
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
	// SYS010000_R01 : 대분류 코드 조회
	// SYS010000_R02 : 소분류 코드 조회
	// SYS010000_H01 : 대분류 코드 저장
	// SYS010000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	validation = (...params) => {
		let transId = params[0];
		let chkCnt  = 0;
		let returnVal = -1;

		switch (transId) {
		case 'SYS010000_R01':

			break;
		default: break;
		}

		return true;
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	// SYS010000_R01 : 대분류 코드 조회
	// SYS010000_R02 : 소분류 코드 조회
	// SYS010000_H01 : 대분류 코드 저장
	// SYS010000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {
		let transId = params[0];

		let transManager = new TransManager();

		transManager.setTransId (transId);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try  {
			switch (transId) {
			case 'SYS080000_R00':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getSnroInitProcess",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroInitProcessListRecv"
				});

				transManager.addDataset('dsEmpty', [{}]);
				transManager.agent();

				break;			
			case 'SYS080000_R01':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getSnroList",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroListRecv"
				});

				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getSnroTtsList",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroTtsListRecv"
				});
				
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getInterList",
					datasetsend: "dsEmpty",
					datasetrecv: "dsInterListRecv"
				});

				transManager.addDataset('dsEmpty', [{}]);
				transManager.agent();

				break
			default: break;
			}
		} catch (err) {

		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	// SYS010000_R01 : 대분류 코드 조회
	// SYS010000_R02 : 소분류 코드 조회
	// SYS010000_H01 : 대분류 코드 저장
	// SYS010000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {	

		switch (res.id) {
		case 'SYS080000_R00':
			if (res.data.dsSnroInitProcessListRecv.length > 0) {
				let dsSnroInitProcessListRecv = res.data.dsSnroInitProcessListRecv;

				ComLib.setStateInitRecords(this, "dsSnroInitProcessList", dsSnroInitProcessListRecv);

			} else {
				ComLib.setStateInitRecords(this, "dsSnroInitProcessList", []);

			}
			break;
			
		case 'SYS080000_R01':	
			let params = this.state.actionData;
			let option1 = { width: '1200px', height: '830px', modaless: false, params, dsSnroTts: res.data.dsSnroTtsListRecv, dsSnro:res.data.dsSnroListRecv, dsInter: res.data.dsInterListRecv}
			ComLib.openPop('SYS080001', '시나리오 프로세스 관리', option1);

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
				case "btnSearch":
					if (this.validation("SYS010000_R01")) this.transaction("SYS010000_R01");
				
					break;

				case "btnBigSave":
					if (this.validation("SYS010000_H01")) this.transaction("SYS010000_H01");

					break;

				case "btnSmlSave":
					if (this.validation("SYS010000_H02")) this.transaction("SYS010000_H02");
					
					break;	
						
				default : break;
				}
			}
		},
		grid: {
			onGridReady: (e) => {
				switch (e.id) {
				case "grdSnroInitProcess":
					this.snroInitProcessGridApi = e.gridApi;
					this.snroInitProcessGrid    = e.grid;
					
					break;

				default: break
				}
			},
			onActionCellClicked : (e) => {				
				switch (e.id) {
				case "grdSnroInitProcess":	
					switch (e.col) {
					case "PROCESS":
						this.setState({...this.state, actionData: e.data}, this.transaction('SYS080000_R01'))
						break;

					default: break;
					}

					break;

				default: break;
				}
			}
		},
		input : {
			onChange: (e) => {
				switch (e.target.id) {
				case 'iptBigCdNm':
					let state = this.state;

					state['textFieldProps']['iptBigCdNm'].value = e.target.value;
	
					this.setState(state);
					
					break;

				default: break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptBigCdNm':
					if (e.key === 'Enter') {
						if (this.validation("SYS010000_R01")) this.transaction("SYS010000_R01");
					}
					
					break;

				default: break;
				}

			}
		},
		selectbox: {
			onChange: (e) => {
				let state = this.state;

				state['selectboxProps'][e.target.id].selected = e.target.selectedIndex;
				state['selectboxProps'][e.target.id].value    = e.target.value;

				this.setState(state);

			}
		},
		tab : {
			onClick : (e) => {
				console.log('onClick');
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
				<SubFullPanel>	
					<FlexPanel>
						<ComponentPanel>
							<RelativeGroup>									
								<Tabs tabWidth='100px' onClick = {this.event.tab.onClick}>
									<TabPanel id = {'BOT010100'} index={0} label={'시나리오 관리'}>
										{/* <BOT010100 cmpWordList={this.state.cmpWordList}/> */}
										
										<BOT010100/>
									</TabPanel>
									<TabPanel id = {'BOT080200'} index={1} label={'TTS 관리'}>
										<BOT080200/>
									</TabPanel>
									<TabPanel id = {'BOT080300'} index={2} label={'인터페이스 관리'}>
										<BOT080300/>
									</TabPanel>									
								</Tabs>		
							</RelativeGroup>
						</ComponentPanel>		
						<ComponentPanel>
							<Grid
								id        = {this.state.grdProps.grdSnroInitProcess.id} 
								areaName  = {this.state.grdProps.grdSnroInitProcess.areaName}
								header    = {this.state.grdProps.grdSnroInitProcess.header}
								data      = {this.state.dsSnroInitProcessList}
								height    = {this.state.grdProps.grdSnroInitProcess.height}
								rowNum    = {true}
								addRowBtn = {false}
								delRowBtn = {false}

								onGridReady        = {this.event.grid.onGridReady}
								onActionCellClicked= {this.event.grid.onActionCellClicked}
												
							/>
						</ComponentPanel>
					</FlexPanel>
					</SubFullPanel>	
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default View;