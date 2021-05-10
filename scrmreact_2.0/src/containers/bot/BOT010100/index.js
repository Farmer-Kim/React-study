// STT 학습
import React from 'react';
import {
	AppPanel, HeadPanel, MiddlePanel, SidePanel, MainPanel, ComponentPanel, FooterPanel,
	FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup, Grid
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button} from 'components';
import {Textfield} from 'components';
import {StrLib, ComLib, DataLib, newScrmObj, TransManager} from 'common';
import styled from 'styled-components';

class View extends React.Component {
	constructor(props) {
		super();
		
		this.snroMngGridApi = null;
		this.snroMngGrid    = null;

		this.tempIdx = 0;

		this.state = {
			dsSnroList : DataLib.datalist.getInstance(),
			btnProps : {
				btnSnroSave : {
					id       : 'btnSnroSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},
			textFieldProps : {
				label : ' ',
				id : 'createInputStd',
				name : 'createInputStd',
				value : '',
				placeholder : '',
				readOnly : false,
				disabled : false,
			},
			addCombineWord : '',
			addCombineWordList : [],

			grdProps : {
				grdSnroMng : {
					id : 'grdSnroMng',
					areaName : '시나리오 관리',
					header: [	
								{headerName: '코드'       , field: 'SNRO_CD',	    colId: 'SNRO_CD', cellEditor: 'customEditor', maxLength: 30, type:'code', ditable: true, width: 120, req: true},
								{headerName: '시나리오'   , field: 'SNRO_EXPL',	    colId: 'SNRO_EXPL', 	editable: true, width: 260, maxLength: 30, req: true},
								{headerName: '타입'       , field: 'TYPE_FLAG' ,	colId: 'TYPE_FLAG',	    editable: true, width: 170, defaultValue : '', req: true, singleClickEdit: true,
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('CALLBOT_SNRO', 'SNRO_TYPE')},
									valueFormatter : (param) => ComLib.getComCodeName('CALLBOT_SNRO', param.value, 'SNRO_TYPE')},
								{headerName: '추출 키워드', field: 'KEYWORD'   ,	colId: 'KEYWORD'   ,	editable: true, width: 170,
									cellRenderer: 'actionButton', 
									fiiled: true,
									color: 'blue'},
								{headerName: '사용여부',	 field: 'USE_FLAG',	colId: 'USE_FLAG',	editable: true, defaultValue : 'Y', width: 120, req: true, resizable: false, textAlign: 'center', singleClickEdit: true,
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
									valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')}	
							],
					height: '620px'
				},	
			},
		}

	}

	componentDidMount () {
		// this.transaction("SYS080100_R00")
	}
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/	
	validation = (...params) => {

		let transId = params[0];

		switch (transId) {
			case 'checkCompWord' :
				let targetParams = params[1]

				if(StrLib.isNull(targetParams))  {
					ComLib.openDialog('A', '추가하실 복합명사를 입력해주세요.');					
					return false;
				}
				console.log(targetParams);

				if(!StrLib.isKor(targetParams)) {
					ComLib.openDialog('A', '한글만 입력해주세요.');					
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
	transaction = (...params) => {
		let transId = params[0];

		let transManager = new TransManager();

		transManager.setTransId (transId);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try  {
			switch (transId) {
			case 'SYS080100_R00':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getSnroList",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroListRecv"
				});

				transManager.addDataset('dsEmpty', [{}]);
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
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {	
		switch (res.id) {
		case 'SYS080100_R00':
			if (res.data.dsSnroListRecv.length > 0) {
				let dsSnroListRecv = res.data.dsSnroListRecv;

				let tempIdx = 1;

				for (let i = 0; i < dsSnroListRecv.length; i ++) {
					dsSnroListRecv[i].tempIdx = tempIdx;
					tempIdx ++;
				}

				this.tempIdx = tempIdx;

				ComLib.setStateInitRecords(this, "dsSnroList", dsSnroListRecv);

				console.log(dsSnroListRecv)

			}	
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

				case "btnSnroSave":				

					break;
						
				default : break;
				}
			}
		},
		grid: {
			onSelectionChanged: (e) => {
				switch (e.id) {
				case "grdSnroMng":
						
					break;
				default: break
				}
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdSnroMng":
					this.snroMngGridApi = e.gridApi;
					this.snroMngGrid    = e.grid;
					
					break;

				default: break
				}
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdSnroMng":									 		
					break;

				default: break;
				}
			},
			onCellValueChanged: (e) => {				
				switch (e.id) {
				case "grdSnroMng":	
					

					break;		
				default: break;
				}
			},
			onDeleteRow: (e) => {
				switch (e.id) {
				case "grdSnroMng":
					

					break;

		
				default: break;
				}
			},
			onBeforeInsertRow : (e) => {
				switch (e.id) {
				case "grdSnroMng":
					
					break;

		
				default: break;
				}

				return {rtn: true, index: 0};
			},			
			onInsertRow : (e) => {
				switch (e.id) {
				case "grdSnroMng":
					let snroMngRecords = this.snroMngGrid.gridDataset.records;

					snroMngRecords[e.index].KEYWORD = 'fileFolder';
					snroMngRecords[e.index].tempIdx = this.tempIdx;
					
					this.snroMngGrid.gridDataset.setRecords(snroMngRecords);

					this.snroMngGridApi.setRowData(this.snroMngGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
				
					let snroRows = this.snroMngGridApi.rowModel.rowsToDisplay;
					let snroRow;

					for (let i = 0; i < snroRows.length; i ++) {
						if (snroRows[i].data.tempIdx === this.tempIdx){
							snroRow = this.snroMngGridApi.rowModel.rowsToDisplay[i];
							this.snroMngGridApi.ensureIndexVisible(i, 'middle');
							break;
						}
					}

					if (snroRow.selected !== true) {
						snroRow.setSelected(true);
					}			

					this.tempIdx += 1;

					break;

				default: break;
				}
				
			},
			onActionCellClicked : (e) => {				
				switch (e.id) {
				case "grdSnroMng":	
					switch (e.col) {
					case "KEYWORD":
						if (e.data.rowtype !== 'r') {
							ComLib.openDialog('A', 'SYSI0010', ['저장후 사용 하실수 있습니다.']);	

						} else if (e.data.TYPE_FLAG !== 'INIT' && e.data.TYPE_FLAG !== 'K') {
							ComLib.openDialog('A', 'SYSI0010', ['고객 초기 발화 또는 키워드 추출만 사용 가능합니다.']);	

						} else {
							let params = e.data;
							let option1 = { width: '700px', height: '830px', modaless: false, params}
							ComLib.openPop('SYS080101', '검출 키워드 관리', option1);

						}
						break;

					default: break;
					}

					break;

				default: break;
				}
			}
		},
	}
		
	render () {
		return (
			<React.Fragment>
				<Grid
					id       = {this.state.grdProps.grdSnroMng.id} 
					areaName = {this.state.grdProps.grdSnroMng.areaName}
					header   = {this.state.grdProps.grdSnroMng.header}
					data     = {this.state.dsSnroList}
					height   = {this.state.grdProps.grdSnroMng.height}
					rowNum   = {true}

					onGridReady        = {this.event.grid.onGridReady}
					onRowClicked       = {this.event.grid.onRowClicked}
					onCellValueChanged = {this.event.grid.onCellValueChanged}
					onDeleteRow        = {this.event.grid.onDeleteRow}
					onInsertRow        = {this.event.grid.onInsertRow}
					onSelectionChanged = {this.event.grid.onSelectionChanged}
					onActionCellClicked= {this.event.grid.onActionCellClicked}	
				/>
				<RelativeGroup>
					<RFloatArea>	
						<Button
							color    = 'purple' 
							fiiled   = "o" 
							id       = {this.state.btnProps.btnSnroSave.id}
							value    = {this.state.btnProps.btnSnroSave.value}
							disabled = {this.state.btnProps.btnSnroSave.disabled}
							hidden   = {this.state.btnProps.btnSnroSave.hidden}
							onClick  = {this.event.button.onClick}
							mt       = {5}
						/>
					</RFloatArea>
				</RelativeGroup>				
			</React.Fragment>
		)
	}
}

export default View;