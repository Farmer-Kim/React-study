// 권한관리
import React from "react";
import { ComponentPanel
	   , FlexPanel
	   , FullPanel
	   , RFloatArea
	   , RelativeGroup } from "components";
import { BasicButton as Button
	   , Grid          } from "components";
import { ComLib
	   , DataLib
	   , TransManager 
	   , newScrmObj
	   , StrLib } from "common";


class SYS040000 extends React.Component {
	constructor(props) {
		super(props);
		this.authGrid    = null;
		this.authGridApi = null;

		this.prgmGrid    = null;
		this.prgmGridApi = null;

		this.funcGrid    = null;
		this.funcGridApi = null;

		this.currntRowAuth = "";

		this.components = { 
			treeRenderer: this.treeRenderer(this),
			treeTitleRenderer: this.treeTitleRenderer()
		}

		this.grdAuthList_header = [
			{headerName: "사용자권한", field: "AUTH_NM", colId: "AUTH_NM", editable: true, req: true},
			{headerName: "권한레벨"  , field: "AUTH_CD", colId: "AUTH_CD", editable: true, req: true, resizable: false, cellEditor: "customEditor", maxLength: 3, inputType: "num"}
		]
		this.grdPrgmInfo_header = [
			{headerName: "권한명"    , field: "MNU_NM"     , colId: "MNU_NM", cellRenderer: "treeTitleRenderer"},
			// {headerName: "권한ID"    , field: "MNU_ID"     , colId: "MNU_ID"},
			{headerName: "상위메뉴ID", field: "PARE_MNU_ID", colId: "PARE_MNU_ID"},
			{headerName: "권한유형"  , field: "MNU_KND_NM" , colId: "MNU_KND_NM", resizable: false}
		]
		this.state = {
			dsAuthInfo: DataLib.datalist.getInstance(),
			dsPrgmInfo: DataLib.datalist.getInstance()
		}

		this.event.button.onClick = this.event.button.onClick.bind(this);
	}
	/*------------------------------------------------------------------------------------------------*
	1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
	=> 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		this.transaction("SYS040000_R01");
	}
	treeTitleRenderer() {
		class ShowCellRenderer {
			constructor() { }
			init(params) {
				let left = 0;
				let data = "";

				if (params["data"]["LEVEL"] !== "1") {
					data = "└ ";
					left = 20 * (Number(params["data"]["LEVEL"]) - 1);
				}

				data += params["data"]["MNU_NM"];

				this.ui = document.createElement('div');
				this.ui.innerHTML = '<div style="padding-left: ' + left + 'px">' + data + '</div>';
			}
			getGui() {
				return this.ui;
			}
		}
		return ShowCellRenderer;
	}

	treeRenderer(props) {
		class ShowCellRenderer {
			constructor() { }
			init(params) {
				let rtnVal = "";
				const data   = params.data;
				const dsPrgmInfo = props.state.dsPrgmInfo;

				if (data.childCNT > 0) {	
					let color = "blue";
					
					if (params.node.selected) {		
						const childRows = dsPrgmInfo.records.filter(row => row.PARENT_ID === data.ID);
						const selectedChildRows = childRows.filter(row => row.CHK === "Y");
						
						if (selectedChildRows.length !== data.childCNT) {
							color = "blue-o";

						} else if (data.LEVEL === "1") {

							for (let i = 0; i < childRows.length; i ++) {
								const grandChildRows = dsPrgmInfo.records.filter(row => row.PARENT_ID === childRows[i].ID);
								if (grandChildRows.length > 0) {
									const selectedGrandChildRows = grandChildRows.filter(row => row.CHK === "Y");	
									if (grandChildRows.length !== selectedGrandChildRows.length) {
										color = "blue-o";
										break;
									}
								}
							}
						}
					} else {
						color = "grey-o";

					}

					if (data.EXPAND) {
						rtnVal += `<button class="scrm-btn xs ` + color + ` i"><i class="xi-minus xi-x"></i></button>`;
					} else {
						rtnVal += `<button class="scrm-btn xs ` + color + ` i"><i class="xi-plus xi-x"></i></button>`;
					}
				}

				this.ui = document.createElement('div');
				this.ui.innerHTML = '<div>' + rtnVal + '</div>';
			}
			getGui() {
				return this.ui;
			}
		}
		return ShowCellRenderer;
	}
	validation = (...params) => {
		let chkCnt = 0;

		switch (params[0]) {
		case "SYS040000_H01":	
			const authRecord = this.authGrid.gridDataset.records;
			const authHeader = this.grdAuthList_header.filter(item => item["req"] === true);				

			for (let intA = 0; intA < authRecord.length; intA ++) {
				if (authRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;

					for (let intB = 0; intB < authHeader.length; intB ++) {	
						if (StrLib.isNull(authRecord[intA][authHeader[intB].field])) {							
							ComLib.openDialog("A", "COME0001", [intA + 1, authHeader[intB].headerName.replace(/\*/g,"")]);
				
							this.authGrid.moveRow(intA, true);
					
							return false;
						}
					}

					for (let intB = 0; intB < authRecord.length; intB ++) {
						if (intA !== intB && authRecord[intA].AUTH_NM === authRecord[intB].AUTH_NM) {	
							ComLib.openDialog("A", "COME0012", [intA + 1, intB + 1, "사용자권한(이)"]);
							
							this.authGrid.moveRow(intA, true);

							return false;

						}
					}
					for (let intB = 0; intB < authRecord.length; intB ++) {
						if (intA !== intB && authRecord[intA].AUTH_CD === authRecord[intB].AUTH_CD) {		
							ComLib.openDialog("A", "COME0012", [intA + 1, intB + 1, "권한레벨(이)"]);
							
							this.authGrid.moveRow(intA, true);	

							return false;
						}
					}
				}		
			}

			if (authRecord.length < 1 || chkCnt === 0) {
				ComLib.openDialog("A", "COME0005");

				return false;
			}

			break;

		case "SYS040000_H02":	
			// const prgmRecord = this.prgmGrid.gridDataset.records;			

			// for (let intA = 0; intA < prgmRecord.length; intA ++) {
			// 	if (prgmRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
			// 		chkCnt ++;
			// 	}		
			// }

			// if (prgmRecord.length < 1 || chkCnt === 0) {
			// 	ComLib.openDialog("A", "COME0005");

			// 	return false;
			// }

			break;	

		default: break;
		}

		return true;
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	// SYS040000_R01 : 권한목록 조회
	// SYS040000_R02 : 프로그램목록 조회
	// SYS040000_H02 : 프로그램목록 수정
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {
		const transId = params[0];

		const transManager = new TransManager();
		
		transManager.setTransId (transId);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		switch (transId) {
		case "SYS040000_R01":
			transManager.addConfig({
				crudh      : transManager.constants.crudh.read,
				sqlmapid   : "SYS.R_getAuthListSample",
				datasetsend: "dsSend",
				datasetrecv: "dsAuthRecv",
			});
			transManager.addDataset("dsSend", [{}]);
			transManager.agent();

			break;

		case "SYS040000_R02":
			transManager.addConfig({
				crudh      : transManager.constants.crudh.read,
				sqlmapid   : "SYS.R_getPrgmListSample",
				datasetsend: "dsSend",
				datasetrecv: "dsPrgmRecv",
			});
			transManager.addConfig({
				crudh      : transManager.constants.crudh.read,
				sqlmapid   : "SYS.R_getFuncListSample",
				datasetsend: "dsSend",
				datasetrecv: "dsFuncRecv",
			});
			
			transManager.addDataset("dsSend", [{"AUTH_CD": params[1]}]);
			transManager.agent();
			
			break;
			
		case "SYS040000_H01":
			transManager.addConfig  ({
				crudh      : transManager.constants.crudh.handle,
				sqlmapid   : "SYS.H_handleAuthList",
				datasetsend: "dsAuthList"
			});

			transManager.addDataset("dsAuthList", this.authGrid.gridDataset.records);
			// transManager.agent();
		
			break;
			 
		case "SYS040000_H02":
			transManager.addConfig({
				crudh      : transManager.constants.crudh.destroy,
				sqlmapid   : "SYS.D_delPrgmList",
				datasetsend: "dsPrgmInfoDel",
			}); 
			transManager.addConfig({
				crudh      : transManager.constants.crudh.create,
				sqlmapid   : "SYS.C_setPrgmList",
				datasetsend: "dsPrgmInfoInst",
			});
			transManager.addConfig({
				crudh      : transManager.constants.crudh.destroy,
				sqlmapid   : "SYS.D_delFuncList",
				datasetsend: "dsFuncInfoDel",
			}); 
			transManager.addConfig({
				crudh      : transManager.constants.crudh.create,
				sqlmapid   : "SYS.C_setFuncList",
				datasetsend: "dsFuncInfoInst",
			});

			let dsPrgmInfoInst = [];
			let dsFuncInfoInst = [];

			const selectedPrgmInfo = this.state.dsPrgmInfo.records.filter(item => item.CHK === "Y");
			
			for (let i = 0; i < selectedPrgmInfo.length; i++) {
				if (selectedPrgmInfo[i].MNU_KND_NM !== '기능') {
					dsPrgmInfoInst.push({ 
						AUTH_CD: this.authGridApi.getSelectedRows()[0].AUTH_CD, 
						MNU_ID : selectedPrgmInfo[i].MNU_ID
					});
				} else {
					dsFuncInfoInst.push({ 
						AUTH_CD: this.authGridApi.getSelectedRows()[0].AUTH_CD, 
						FUNC_ID : selectedPrgmInfo[i].MNU_ID
					});					
				}
			}

			transManager.addDataset("dsPrgmInfoDel" , [{"AUTH_CD": this.authGridApi.getSelectedRows()[0].AUTH_CD}]);
			transManager.addDataset("dsPrgmInfoInst", dsPrgmInfoInst);
			transManager.addDataset("dsFuncInfoDel" , [{"AUTH_CD": this.authGridApi.getSelectedRows()[0].AUTH_CD}]);
			transManager.addDataset("dsFuncInfoInst", dsFuncInfoInst);

			// transManager.agent();
			
			break;

		default: break;
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	// SYS040000_R01 : 권한목록 조회
	// SYS040000_R02 : 프로그램목록 조회
	// SYS040000_H02 : 프로그램목록 수정
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {	
		switch (res.id) {
		case "SYS040000_R01":
			ComLib.setStateInitRecords(this, "dsAuthInfo", res.data.dsAuthRecv);
			
			this.authGridApi.rowModel.rowsToDisplay[0].setSelected(true);
		
			this.transaction("SYS040000_R02", this.state.dsAuthInfo.records[0].AUTH_CD);

			break;
			
		case "SYS040000_R02":
			const dsPrgmRecv     = res.data.dsPrgmRecv;			
			const dsFuncRecv     = res.data.dsFuncRecv;
			
			let dsPrgmInfo = [];

			for (let i = 0; i < dsPrgmRecv.length; i ++) {
				dsPrgmInfo.push(dsPrgmRecv[i]);

				for (let j = 0; j < dsFuncRecv.length; j ++) {
					if (dsPrgmRecv[i].MNU_ID === dsFuncRecv[j].PARE_MNU_ID) {
						dsPrgmInfo.push(dsFuncRecv[j]);
					}
				}
			}
						
			ComLib.setStateInitRecords(this, "dsPrgmInfo", dsPrgmInfo);

			this.prgmGridApi.forEachNode((node) => { 
				if (node.data.CHK === 'Y') { 
					node.setSelected(true); 
				}
			});
			
			break;
			
		case "SYS040000_H01":   
			ComLib.openDialog("A", "COMI0003");      
   
			this.transaction("SYS040000_R01");
			   
			break;

		case "SYS040000_H02":
			ComLib.openDialog("A", "COMI0003");
			
			this.transaction("SYS040000_R02", this.authGrid.getSelectedRows()[0].AUTH_CD);
				// (this.prgmGridApi.getSelectedNodes().length > 0 
				// 	? this.state.dsAuthInfo.records[Number(this.authGridApi.getSelectedNodes()[0]["id"])].AUTH_CD
				// 	: this.state.dsAuthInfo.records[0].AUTH_CD
				// )
			

			break;

		default: break;
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		button: {
			onClick: () => {
				if (this.validation("SYS040000_H02")) { 
					this.transaction("SYS040000_H02");
				}
			}
		},		
		grid: {
			onGridReady: (e) => {
				switch(e.id) {
				case "grdAuthList": 
					this.authGrid    = e.grid;
					this.authGridApi = e.gridApi;

					break;

				case "grdPrgmInfo":
					this.prgmGrid    = e.grid;
					this.prgmGridApi = e.gridApi;

					break;

				default: break;
				}
			},
			onCellClicked: (e) => {
				if (e.col === "_TREE") {
					
					return;
				}

				let dsPrgmInfo   = this.state.dsPrgmInfo;
				let refreshNodes = [];
				
				const newSelected = !e.node.isSelected();
				const newChk      = newSelected ? "Y" : "N";

				e.node.setSelected(newSelected);

				dsPrgmInfo.setValue(dsPrgmInfo.indexOf('recid', e.data.recid), "CHK", newChk);
	
				let childNodeIdArr  = [];
				let parentNodeIdArr = [];

				if (e.data.LEVEL === "1") {
					refreshNodes.push(e.node);
					
					if (e.data.childCNT > 0) {
						const childRows = dsPrgmInfo.records.filter(row => row.PARE_MNU_ID === e.data.MNU_ID);

						for (let i = 0; i < childRows.length; i ++) {
							dsPrgmInfo.setValue(childRows[i].recid - 1, "CHK", newChk);

							childNodeIdArr.push(childRows[i].MNU_ID);

							const grandChildRows = dsPrgmInfo.records.filter(row => row.PARE_MNU_ID === childRows[i].MNU_ID);

							for (let j = 0; j < grandChildRows.length; j ++) {
								dsPrgmInfo.setValue(grandChildRows[j].recid - 1, "CHK", newChk);
								childNodeIdArr.push(grandChildRows[j].MNU_ID);

							}
						}
					}
				} else if (e.data.LEVEL === "2") {
					refreshNodes.push(e.node);

					if (e.data.childCNT > 0) {
						const childRows = dsPrgmInfo.records.filter(row => row.PARE_MNU_ID === e.data.MNU_ID);

						for (let i = 0; i < childRows.length; i ++) {
							dsPrgmInfo.setValue(childRows[i].recid - 1, "CHK", newChk);

							childNodeIdArr.push(childRows[i].MNU_ID)	;
						}
					}

					const parentRow = dsPrgmInfo.records.filter(row => row.MNU_ID === e.data.PARE_MNU_ID)[0];

					parentNodeIdArr.push(parentRow.MNU_ID);
										
				} else {
					const parentRow      = dsPrgmInfo.records.filter(row => row.MNU_ID === e.data.PARE_MNU_ID)[0];
					const grandParentRow = dsPrgmInfo.records.filter(row => row.MNU_ID === parentRow.PARE_MNU_ID)[0];

					parentNodeIdArr.push(parentRow.MNU_ID);
					parentNodeIdArr.push(grandParentRow.MNU_ID);					
				}
				
				this.prgmGridApi.forEachNode((node) => {
					for (let i = 0; i < childNodeIdArr.length; i ++) {
						if (childNodeIdArr[i] === node.data.MNU_ID) {
							node.setSelected(newSelected);
							if (node.data.childCNT > 0) {
								refreshNodes.push(node);
							}
						}
					}
					for (let i = 0; i < parentNodeIdArr.length; i ++) {
						if (parentNodeIdArr[i] === node.data.MNU_ID) {
							refreshNodes.push(node);

							if (newSelected && !node.isSelected()) {
								node.setSelected(newSelected);
								dsPrgmInfo.setValue(node.rowIndex, "CHK", newChk);
		
							}
						}
					}
				})

				this.prgmGridApi.rowModel.getRowNode(e.node.id);

				ComLib.setStateInitRecords(this, "dsPrgmInfo", dsPrgmInfo);

				this.prgmGridApi.refreshCells({force: true, suppressFlash: true, rowNodes: refreshNodes, columns:["_TREE"]});
			},
			onRowClicked: (e) => {
				switch(e.id) {
				case "grdAuthList": 
					if (e.node.selected !== true) {
				 		e.node.setSelected(true);
	
						if (this.validation("SYS040000_R02", e.data.AUTH_CD)) {
							this.transaction("SYS040000_R02", e.data.AUTH_CD);
						}
					} 
													 
					break;

				case "grdPrgmInfo":	
					

					break;

				default: break;
				}
			},
			onCellValueChanged: (e) => {
				
			},
			onInsertRow : () => {
				ComLib.setStateInitRecords(this, "dsPrgmInfo", this.prgmGrid.gridDataset.records);
				this.currntRowAuth = "";
			},
			onDeleteRow: () => {
				const {crud}  = newScrmObj.constants;

				const newSelRow = this.authGridApi.getSelectedRows()[0];
				const authCd    = newSelRow.AUTH_CD;
				const rowType   = newSelRow.rowtype;

				if ((rowType === crud.read || rowType === crud.update) && this.currntRowAuth !== authCd) {
					this.transaction("SYS040000_R02", authCd);
						
				} else {
					ComLib.setStateInitRecords(this, "dsPrgmInfo", []);

				}
				
				this.currntRowAuth = authCd;
			},		
		}
	}

	/*------------------------------------------------------------------------------------------------*/
	// [7. render Zone]
	//  - 화면 관련 내용 작성
	/*------------------------------------------------------------------------------------------------*/

	/*------------------------------------------------------------------------------------------------*/
	// this.funcAuthEdit = ComLib.getFuncAuth("QAM010000_01");
	// 기능별 권한 조회해와서 각각의 컴포넌트의 기능 여부를 줄수 있게 만들어놈

	// <Grid
	// 	id        = {"grdVlaItem"}
	// 	areaName  = {"평가항목"}
	// 	data      = {this.state.dsVlaItemList}
	// 	header    = {this.grdVlaItem_header}
	// 	height    = {235}
	// 	rowNum    = {true}
		
	// 	delRowBtn	 = {this.funcAuthEdit}
	// 	addRowBtn	 = {this.funcAuthEdit}

	// 	onGridReady       = {grid.onGridReady}
	// 	onRowClicked      = {grid.onRowClicked}
	// 	onDeleteRow       = {grid.onDeleteRow}
	// 	onInsertRow       = {grid.onInsertRow}
	// 	suppressRowClickSelection = {true}
	// />
	/*------------------------------------------------------------------------------------------------*/
	render () {
		const {button, grid} = this.event;
		const {dsAuthInfo, dsPrgmInfo} = this.state;
		
		return (
			<React.Fragment>
				<FullPanel>
					<FlexPanel>
						<ComponentPanel width={"30%"}>
							<Grid
								id        = {"grdAuthList"} 
								data      = {dsAuthInfo}
								header    = {this.grdAuthList_header}
								height    = {675} 
								areaName  = {"권한목록"}
								sort      = {false}
								rowNum    = {true}
								onGridReady	 = {grid.onGridReady}
								onRowClicked = {grid.onRowClicked}
                        		onDeleteRow  = {grid.onDeleteRow}
                       		 	onInsertRow  = {grid.onInsertRow} 
								
                        		onCellValueChanged = {grid.onCellValueChanged}
								suppressRowClickSelection = {true}
							/>
						</ComponentPanel>
						<ComponentPanel width={"70%"}>
							<Grid
								id        = {"grdPrgmInfo"} 
								data      = {dsPrgmInfo}
								header    = {this.grdPrgmInfo_header}
								height    = {625} 
								areaName  = {"프로그램목록"}
								sort      = {false}
								addRowBtn = {false}
								delRowBtn = {false}
								rowSelection = {"multiple"} 
								onGridReady        = {grid.onGridReady}
								onCellClicked      = {grid.onCellClicked}
								suppressRowClickSelection = {true}
								tree = {{isTree : true, headerName:'권한', stndCol: ['MNU_ID', 'PARE_MNU_ID'], open : true}}
								components = {this.components}
							/>							
							<RelativeGroup>
								<RFloatArea>
									<Button
										id      = {"btnSave"}
										mt 		= {5}
										value   = {"저장"}
										color   = {"purple"} 
										fiiled  = {true} 
										onClick = {button.onClick}
									/>
								</RFloatArea>
							</RelativeGroup>	
						</ComponentPanel>
					</FlexPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default SYS040000;