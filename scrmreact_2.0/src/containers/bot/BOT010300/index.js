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
			dsInterList : DataLib.datalist.getInstance(),
			btnProps : {
				btnSnroSave : {
					id       : 'btnSnroSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},
			grdProps : {
				grdInterMng : {
					id : 'grdInterMng',
					areaName : '인터페이스 관리',
					header: [	
								{headerName: '코드'   , field: 'ITF_CD',	    colId: 'ITF_CD', 	editable: true, width: 260, maxLength: 30, req: true},
								{headerName: '명칭'   , field: 'ITF_NM',	    colId: 'ITF_NM', 	editable: true, width: 260, maxLength: 30, req: true},
								{headerName: '경로'   , field: 'URL',	        colId: 'URL', 	editable: true, width: 260, maxLength: 30, req: true}
							],
					height: '620px'
				},	
			},
		}

	}

	componentDidMount () {
		this.transaction("SYS080300_R00")
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
			case 'SYS080300_R00':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getInterList",
					datasetsend: "dsEmpty",
					datasetrecv: "dsInterListRecv"
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
		case 'SYS080300_R00':
			if (res.data.dsInterListRecv.length > 0) {
				let dsInterListRecv = res.data.dsInterListRecv;

				let tempIdx = 1;

				for (let i = 0; i < dsInterListRecv.length; i ++) {
					dsInterListRecv[i].tempIdx = tempIdx;
					tempIdx ++;
				}

				this.tempIdx = tempIdx;

				ComLib.setStateInitRecords(this, "dsInterList", dsInterListRecv);

				console.log(dsInterListRecv)

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
				case "grdInterMng":
						
					break;
				default: break
				}
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdInterMng":
					this.snroMngGridApi = e.gridApi;
					this.snroMngGrid    = e.grid;
					
					break;

				default: break
				}
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdInterMng":									 		
					break;

				default: break;
				}
			},
			onCellValueChanged: (e) => {				
				switch (e.id) {
				case "grdInterMng":	
					

					break;		
				default: break;
				}
			},
			onDeleteRow: (e) => {
				switch (e.id) {
				case "grdInterMng":
					

					break;

		
				default: break;
				}
			},
			onBeforeInsertRow : (e) => {
				switch (e.id) {
				case "grdInterMng":
					
					break;

		
				default: break;
				}

				return {rtn: true, index: 0};
			},			
			onInsertRow : (e) => {
				switch (e.id) {
				case "grdInterMng":
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
				case "grdInterMng":	

				default: break;
				}
			}
		},
	}
		
	render () {
		return (
			<React.Fragment>
				<Grid
					id       = {this.state.grdProps.grdInterMng.id} 
					areaName = {this.state.grdProps.grdInterMng.areaName}
					header   = {this.state.grdProps.grdInterMng.header}
					data     = {this.state.dsInterList}
					height   = {this.state.grdProps.grdInterMng.height}
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