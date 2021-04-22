// STT 학습
import React from 'react';
import {
	AppPanel, HeadPanel, MiddlePanel, SidePanel, MainPanel, ComponentPanel, FooterPanel,
	FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup,Grid
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button} from 'components';
import {Textfield} from 'components';
import {StrLib, ComLib, DataLib, newScrmObj, TransManager} from 'common';
import styled from 'styled-components';


//임시로 가운데 버튼 하드코딩
// const wordStyle =
// styled.div`

// border-width: 2px 4px;
// border-radius: 40px;
// background: gold;
// border: ridge gold;
// `

class View extends React.Component {
	constructor(props) {
		super();
		this.state = {
			dsSnroTtsList : DataLib.datalist.getInstance(),

			btnProps : {
				btnSave : {
					id       : 'btnSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},
			grdProps : {
				grdTtsMng : {
					id : 'grdTtsMng',
					areaName : 'TTS 관리',
					header: [
								{headerName: 'TTS 코드', field: 'SNRO_TTS_CD',	colId: 'SNRO_TTS_CD', 	editable: true, width: 100, cellEditor: 'customEditor', maxLength: 30, type:'code', req: true},
								{headerName: 'TTS 명',	 field: 'SNRO_TTS_EXPL',colId: 'SNRO_TTS_EXPL', editable: true, width: 200, maxLength: 30, type:'code', req: true},
								{headerName: 'TTS TEXT', field: 'SNRO_TTS_TEXT',colId: 'SNRO_TTS_TEXT',	editable: true, width: 300, maxLength: 31, req: true},
								{headerName: '사용여부',  field: 'USE_FLAG',	colId: 'USE_FLAG',	editable: true, defaultValue : 'Y', width: 100, req: true, resizable: false, textAlign: 'center', singleClickEdit: true,
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
		this.transaction("SYS080200_R00")
	}


	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/	
	validation = (...params) => {

		let transId = params[0];

		switch (transId) {
			case 'checkCompWord' :

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
			case 'SYS080200_R00':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getSnroTtsList",
					datasetsend: "dsEmpty",
					datasetrecv: "dsSnroTtsListRecv"
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
		case 'SYS080200_R00':
			if (res.data.dsSnroTtsListRecv.length > 0) {
				let dsSnroTtsListRecv = res.data.dsSnroTtsListRecv;

				ComLib.setStateInitRecords(this, "dsSnroTtsList", dsSnroTtsListRecv);

				console.log(dsSnroTtsListRecv)

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
				case "btnSearch":
					if (this.validation("SYS010000_R01")) this.transaction("SYS010000_R01");
				
					break;

				default : break;
				}
			}
		},
		grid: {
			onSelectionChanged: (e) => {
				switch (e.id) {
				case "grdTtsMng":
					let bigRow = this.bigCdGrid.getSelectedRows()[0]	

					let bigCd   = bigRow.BIG_CD;
					let rowType = bigRow.rowtype;
					let mdlCd   = bigRow.MDL_CD;					

					if ((rowType === 'r' || rowType === 'u') && (this.currentRowBig !== bigCd || this.currentRowMdl !== mdlCd)) {
						if (this.validation("SYS010000_R02")) this.transaction("SYS010000_R02", bigCd, mdlCd);
						

					} else if (rowType === 'c'){
						ComLib.setStateInitRecords(this, "dsSmlCdList", []);

					}

					this.currentRowBig = this.bigCdGridApi.getSelectedRows()[0].BIG_CD;
					this.currentRowMdl = this.bigCdGridApi.getSelectedRows()[0].MDL_CD;
						
					break;

				default: break
				}
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdTtsMng":
					this.bigCdGridApi = e.gridApi;
					this.bigCdGrid    = e.grid;
					
					break;

				default: break
				}
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdTtsMng":
					let bigRows = this.bigCdGridApi.rowModel.rowsToDisplay;
					let bigRow;

					for (let i = 0; i < bigRows.length; i ++) {
						if (bigRows[i].data.TEMP_CD === e.data.TEMP_CD){
							bigRow = this.bigCdGridApi.rowModel.rowsToDisplay[i];
							break;
						}
					}

					if (bigRow.selected !== true) {
						bigRow.setSelected(true);
					}
															 		
					break;

				default: break;
				}
			},
			onCellValueChanged: (e) => {				
				switch (e.id) {
				case "grdTtsMng":	
					if (e.col === "BIG_CD" || e.col === "MDL_CD" ) {
						if (this.bigCdGrid.gridDataset.records[e.index].rowtype !== newScrmObj.constants.crud.create) {
							ComLib.openDialog('A', 'COME0013', [(e.col === "BIG_CD" ? '대' : '중') + '분류 코드']);
						
							this.bigCdGrid.gridDataset.setValue(e.index , e.col, e.oldValue);
							this.bigCdGridApi.setRowData(this.bigCdGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
						}
					}	

					let bigRows = this.bigCdGridApi.rowModel.rowsToDisplay;
					let bigRow;

					for (let i = 0; i < bigRows.length; i ++) {
						if (bigRows[i].data.TEMP_CD === e.data[e.index].TEMP_CD){
							bigRow = this.bigCdGridApi.rowModel.rowsToDisplay[i];							
							break;
						}
					}

					this.currentRowBig = bigRow.data.BIG_CD;
					this.currentRowMdl = bigRow.data.MDL_CD;

					this.lastEditedBig = bigRow.data.BIG_CD;
					this.lastEditedMdl = bigRow.data.MDL_CD;

					break;
		
				default: break;
				}
			},
			onDeleteRow: (e) => {
				switch (e.id) {
				case "grdTtsMng":
					let bigCd   = this.bigCdGridApi.getSelectedRows()[0].BIG_CD
					let mdlCd   = this.bigCdGridApi.getSelectedRows()[0].MDL_CD
					let rowType = this.bigCdGridApi.getSelectedRows()[0].rowtype;					

					if ((rowType === 'r' || rowType === 'u') && (this.currentRowBig !== bigCd || this.currentRowMdl !== mdlCd)) {
						if (this.validation("SYS010000_R02")) this.transaction("SYS010000_R02", bigCd, mdlCd);
							
					} else {
						ComLib.setStateInitRecords(this, "dsSmlCdList", []);

					}
					
					this.currentRowBig = this.bigCdGridApi.getSelectedRows()[0].BIG_CD;
					this.currentRowMdl = this.bigCdGridApi.getSelectedRows()[0].MDL_CD;

					break;
		
				default: break;
				}
			},
			onBeforeInsertRow : (e) => {
				switch (e.id) {
				case "grdTtsMng":
					
					break;
		
				default: break;
				}

				return {rtn: true, index: 0};
			},			
			onInsertRow : (e) => {
				switch (e.id) {
				case "grdTtsMng":
					let bigCdRecords = this.bigCdGrid.gridDataset.records;

					bigCdRecords[e.index].TEMP_CD = this.maxTempBigCd + 1;

					this.maxTempBigCd ++;

					this.bigCdGrid.gridDataset.setRecords(bigCdRecords);

					this.bigCdGridApi.setRowData(this.bigCdGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
				
					let bigRows = this.bigCdGridApi.rowModel.rowsToDisplay;
					let bigRow;

					for (let i = 0; i < bigRows.length; i ++) {
						if (bigRows[i].data.TEMP_CD === this.maxTempBigCd){
							bigRow = this.bigCdGridApi.rowModel.rowsToDisplay[i];
							this.bigCdGridApi.ensureIndexVisible(i, 'middle');
							break;
						}
					}

					if (bigRow.selected !== true) {
						bigRow.setSelected(true);
					}					

					ComLib.setStateInitRecords(this, "dsSmlCdList", []);
					
					this.currentRowBig = '';
					this.currentRowMdl = '';

					break;
		
				default: break;
				}
				
			}
		}
	}
		
	render () {
		return (
			<React.Fragment>
				<Grid
					id       = {this.state.grdProps.grdTtsMng.id} 
					areaName = {this.state.grdProps.grdTtsMng.areaName}
					header   = {this.state.grdProps.grdTtsMng.header}
					data     = {this.state.dsSnroTtsList}
					height   = {this.state.grdProps.grdTtsMng.height}
					rowNum   = {true}

					onGridReady        = {this.event.grid.onGridReady}
					onRowClicked       = {this.event.grid.onRowClicked}
					onCellValueChanged = {this.event.grid.onCellValueChanged}
					onDeleteRow        = {this.event.grid.onDeleteRow}
					onInsertRow        = {this.event.grid.onInsertRow}
					onSelectionChanged = {this.event.grid.onSelectionChanged}
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
			</React.Fragment>
		)
	}
}

export default View;