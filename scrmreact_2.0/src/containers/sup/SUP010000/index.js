// 코드관리
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
	   , Selectbox             } from 'components';
import { BasicButton as Button } from 'components';
import { ComLib
	   , DataLib
	   , StrLib
	   , TransManager
	   , newScrmObj            } from 'common';

class View extends React.Component {
	constructor(props) {
		super(props);
		this.lagCdGridApi = null;
		this.smlCdGridApi = null;

		this.maxTempLagCd = 0;
		this.maxTempSmlCd = 0; 

		this.lagCdGrid = null;
		this.smlCdGrid = null;

		this.currentRowLag = '';
		this.currentRowSml = '';
		this.currentRowMdm = ''; 

		this.lastEditedLag = '';
		this.lastEditedMdm = '';

		this.state = {
			dsLagCdList : DataLib.datalist.getInstance(),
			dsSmlCdList : DataLib.datalist.getInstance(),

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
				grdLagCd : {
					id : 'grdLagCd',
					areaName : '대분류 코드',
					header: [
								{headerName: '대분류코드',	 field: 'LAG_CD',	colId: 'LAG_CD', 	editable: true, width: 170, cellEditor: 'customEditor', maxLength: 30, type:'code', req: true},
								{headerName: '대분류코드명', field: 'LAG_NM',	colId: 'LAG_NM',	editable: true, width: 200, cellEditor: 'customEditor', maxLength: 31, req: true},
								{headerName: '중분류코드',	 field: 'MDM_CD',	colId: 'MDM_CD', 	editable: true, width: 110, cellEditor: 'customEditor', maxLength: 30, type:'code', req: true},
								{headerName: '중분류코드명', field: 'MDM_NM',	colId: 'MDM_NM',	editable: true, width: 110, cellEditor: 'customEditor', maxLength: 31},
								{headerName: '사용여부',	 field: 'USE_FLAG',	colId: 'USE_FLAG',	editable: true, defaultValue : 'Y', width: 90, req: true, resizable: false, textAlign: 'center', singleClickEdit: true,
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
									valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')},					
							],
					height: '610px'
				},			
				grdSmlCd : {
					id : 'grdSmlCd',
					areaName : '소분류 코드',
					header: [						
								{headerName: '소분류코드',	field: 'SML_CD',	colId: 'SML_CD',	editable: true, width: 110, cellEditor: 'customEditor', maxLength: 30, type:'code', req: true},
								{headerName: '코드명',		field: 'SML_NM',	colId: 'SML_NM',	editable: true, width: 180, cellEditor: 'customEditor', maxLength: 63, req: true},
								{headerName: '코드',		field: 'CD_VAL',	colId: 'CD_VAL',	editable: true, width: 80 , cellEditor: 'customEditor', maxLength: 10, type:'code'},
								{headerName: '정렬순서',	field: 'SORT_ORD',	colId: 'SORT_ORD',	editable: true, width: 90 , cellEditor: 'customEditor', maxLength: 3, type: 'num', req: true, textAlign: 'center',},
								{headerName: '사용여부',	field: 'USE_FLAG',	colId: 'USE_FLAG',	editable: true, defaultValue : 'Y', width: 90 , req: true, resizable: false, textAlign: 'center',
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
									valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')},
							],
					height: '610px'
				},
			},
			selectboxProps : {
				selUseYn : {
					id       : 'selUseYn',
					value    : '',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList('CMN', 'USE_FLAG'), newScrmObj.constants.select.argument.all),
					width    : 80,
					selected : 0,
					disabled : false
				}
			},			
			textFieldProps : {
				iptLagCdNm : {
					id          : 'iptLagCdNm',
					name        : 'iptLagCdNm',
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
		if (this.validation("SUP010000_R01")) this.transaction("SUP010000_R01");
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
	// SUP010000_R01 : 대분류 코드 조회
	// SUP010000_R02 : 소분류 코드 조회
	// SUP010000_H01 : 대분류 코드 저장
	// SUP010000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	validation = (...params) => {
		let transId = params[0];
		let chkCnt  = 0;
		let returnVal = -1;

		switch (transId) {
		case 'SUP010000_R01':

			break;

		case 'SUP010000_R02':	
			
			break;

		case 'SUP010000_H01':	
			let lagRecord = this.lagCdGrid.gridDataset.records;

			outer : for (let intA = 0; intA < lagRecord.length; intA ++) {
				if (lagRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}		
				
				let lagHeader = this.state.grdProps.grdLagCd.header;
				
				for (let i = 0; i < lagHeader.length; i ++) {		
					if (lagHeader[i].req === true) {
						if (StrLib.isNull(lagRecord[intA][lagHeader[i].field])) {
							let lagRows = this.lagCdGridApi.rowModel.rowsToDisplay;
							let lagNum = 0;
							
							for (let i = 0; i < lagRows.length; i ++) {
								if (lagRows[i].data.TEMP_CD === lagRecord[intA].TEMP_CD){									
									lagNum = i;

									break;
								}
							}

							ComLib.openDialog('A', 'COME0001', [Number(lagNum + 1) , lagHeader[i].headerName.replace(/\*/g,'')]);
		
							returnVal = intA;

							break outer;
						}
					}
				}			

				for ( let intB = 0; intB < lagRecord.length; intB ++ ) {
					if (intA !== intB 
						&& lagRecord[intA].LAG_CD === lagRecord[intB].LAG_CD 
						&& lagRecord[intA].MDM_CD === lagRecord[intB].MDM_CD) {
							
						let lagRows = this.lagCdGridApi.rowModel.rowsToDisplay;
						let lagNum = 0;
						
						for (let i = 0; i < lagRows.length; i ++) {
							if (lagRows[i].data.TEMP_CD === lagRecord[intA].TEMP_CD){									
								lagNum = i;

								break;
							}
						}
						
						ComLib.openDialog('A', 'COME0012', [Number(lagNum + 1), Number(intB + 1), '대분류코드와 중분류코드']);
						
						this.lagCdGrid.moveRow(intA, true);
			
						return false;
					}
				}
					
			}

			if (returnVal > -1) {
				this.lagCdGrid.moveRow(returnVal, true);
				
				return false;
			}	

			if (lagRecord.length < 1 || chkCnt === 0) {
				ComLib.openDialog('A', 'COME0005');

				return false;
			}

			break;

		case 'SUP010000_H02':
			let smlRecord = this.smlCdGrid.gridDataset.records;

			outer : for ( let intA = 0; intA < smlRecord.length; intA ++ ) {
				if (smlRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}	

				let smlHeader = this.state.grdProps.grdSmlCd.header;
				
				for (let i = 0; i < smlHeader.length; i ++) {		
					if (smlHeader[i].req === true) {
						if (StrLib.isNull(smlRecord[intA][smlHeader[i].field])) {
							let smlRows = this.smlCdGridApi.rowModel.rowsToDisplay;
							let smlNum = 0;
							
							for (let i = 0; i < smlRows.length; i ++) {
								if (smlRows[i].data.TEMP_CD === smlRecord[intA].TEMP_CD){									
									smlNum = i;

									break;
								}
							}

							ComLib.openDialog('A', 'COME0001', [Number(smlNum + 1) , smlHeader[i].headerName.replace(/\*/g,'')]);
		
							returnVal = intA;

							break outer;
						}
					}
				}

				for ( let intB = 0; intB < smlRecord.length; intB ++ ) {
					if (intA !== intB && smlRecord[intA].SML_CD === smlRecord[intB].SML_CD) {
						let smlRows = this.smlCdGridApi.rowModel.rowsToDisplay;
						let smlNumA = 0;
						let smlNumB = 0;
						for (let i = 0; i < smlRows.length; i ++) {
							if (smlRows[i].data.TEMP_CD === smlRecord[intA].TEMP_CD){									
								smlNumA = i;

							} else if (smlRows[i].data.TEMP_CD === smlRecord[intB].TEMP_CD){									
								smlNumB = i;

							}
						}

						ComLib.openDialog('A', 'COME0012', [Number(smlNumA + 1), Number(smlNumB + 1), '소분류 코드']);
						
						this.smlCdGrid.moveRow(intB, true);
			
						return false;
					}
				}									
			}

			if (returnVal > -1) {
				this.smlCdGrid.moveRow(returnVal, true);
			
				return false;
			}

			if (smlRecord.length < 1 || chkCnt === 0) {
				ComLib.openDialog('A', 'COME0005');

				return false;
			}

			break;

		default: break;
		}

		return true;
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	// SUP010000_R01 : 대분류 코드 조회
	// SUP010000_R02 : 소분류 코드 조회
	// SUP010000_H01 : 대분류 코드 저장
	// SUP010000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {
		let transId = params[0];

		let transManager = new TransManager();

		transManager.setTransId (transId);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try  {
			switch (transId) {
			case 'SUP010000_R01':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SUP.R_getLagCdList",
					datasetsend: "dsUser",
					datasetrecv: "dsBigCdRecv"
				});

				transManager.addDataset('dsUser', [{"LAG_CD_NM": this.state.textFieldProps.iptLagCdNm.value.trim(), "USE_FLAG": this.state.selectboxProps.selUseYn.value}]);
				transManager.agent();

				break;

			case 'SUP010000_R02':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SUP.R_getSmlCdList",
					datasetsend: "dsUser",
					datasetrecv: "dsSmlCdRecv"
				});

				transManager.addDataset('dsUser', [{"LAG_CD": params[1], "MDM_CD": params[2]}]);
				transManager.agent();

				break

			case 'SUP010000_H01':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "SUP.H_handleLagCdList",
					datasetsend: "dsLagCdList"
				});

				transManager.addDataset('dsLagCdList', this.lagCdGrid.gridDataset.records);
				transManager.agent();
			
				break;

			case 'SUP010000_H02':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "SUP.H_handleSmlCdList",
					datasetsend: "dsSmlCdList"
				});

				let smlRecord = this.smlCdGrid.gridDataset.records;

				for (let intA = 0; intA < smlRecord.length; intA ++) {
					if (StrLib.isNull(smlRecord[intA]["LAG_CD"]) || StrLib.isNull(smlRecord[intA]["MDM_CD"])) {
						smlRecord[intA]["LAG_CD"] = this.lagCdGridApi.getSelectedRows()[0].LAG_CD;
						smlRecord[intA]["MDM_CD"] = this.lagCdGridApi.getSelectedRows()[0].MDM_CD;
					}					
				}
				
				transManager.addDataset('dsSmlCdList', smlRecord);
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
	// SUP010000_R01 : 대분류 코드 조회
	// SUP010000_R02 : 소분류 코드 조회
	// SUP010000_H01 : 대분류 코드 저장
	// SUP010000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {	
		let lagRows, smlRows;
		let lagRow, smlRow;		

		switch (res.id) {
		case 'SUP010000_R01':
			if (res.data.dsBigCdRecv.length > 0) {
				let dsBigCd = res.data.dsBigCdRecv;
				let tempLagCd = 0;

				for (let i = 0; i < dsBigCd.length; i ++) {
					dsBigCd[i].TEMP_CD = tempLagCd;
					tempLagCd ++;
				}

				this.maxTempLagCd = tempLagCd;

				ComLib.setStateInitRecords(this, "dsLagCdList", dsBigCd);

				lagRows = this.lagCdGridApi.rowModel.rowsToDisplay;
				
				let bigCd;
				let mdlCd;

				for (let i = 0; i < lagRows.length; i ++) {
					if (lagRows[i].data.LAG_CD ===  this.lastEditedLag && lagRows[i].data.MDM_CD === this.lastEditedMdm){
						lagRow = this.lagCdGridApi.rowModel.rowsToDisplay[i];
						bigCd  = this.lagCdGridApi.rowModel.rowsToDisplay[i].data.LAG_CD;
						mdlCd  = this.lagCdGridApi.rowModel.rowsToDisplay[i].data.MDM_CD;
						
						this.lagCdGridApi.ensureIndexVisible(i, 'middle');

						break;
					}
				}
				if (lagRow === undefined) {
					lagRow = this.lagCdGridApi.rowModel.rowsToDisplay[0];					
					bigCd  = this.lagCdGridApi.rowModel.rowsToDisplay[0].data.LAG_CD;
					mdlCd  = this.lagCdGridApi.rowModel.rowsToDisplay[0].data.MDM_CD;
					this.lagCdGridApi.ensureIndexVisible(0, 'middle');
				}

				if (lagRow !== undefined && lagRow.selected !== true) {
					lagRow.setSelected(true);
				}

				this.currentRowLag = bigCd;
				this.currentRowMdm = mdlCd;

				if (this.validation("SUP010000_R02")) this.transaction("SUP010000_R02", bigCd, mdlCd);

			} else {
				ComLib.setStateInitRecords(this, "dsLagCdList", []);
				ComLib.setStateInitRecords(this, "dsSmlCdList", []);

			}
			
			break;

		case 'SUP010000_R02':	
			let dsSmlCd = res.data.dsSmlCdRecv;
			let tempSmlCd = 0;

			for (let i = 0; i < dsSmlCd.length; i ++) {
				dsSmlCd[i].TEMP_CD = tempSmlCd;
				tempSmlCd ++;
			}

			this.maxTempSmlCd = tempSmlCd;


			ComLib.setStateInitRecords(this, "dsSmlCdList", res.data.dsSmlCdRecv);

			smlRows = this.smlCdGridApi.rowModel.rowsToDisplay;

			for (let i = 0; i < smlRows.length; i ++) {
				if (smlRows[i].data.TEMP_CD === this.currentRowSml){
					smlRow = this.smlCdGridApi.rowModel.rowsToDisplay[i];
					this.smlCdGridApi.ensureIndexVisible(i, 'middle');						
					break;
				}
			}

			if (smlRow === undefined) {
				smlRow = this.smlCdGridApi.rowModel.rowsToDisplay[0];
			}

			if (smlRow !== undefined && smlRow.selected !== true) {
				smlRow.setSelected(true);
			}
			
			break;

		case 'SUP010000_H01':
			ComLib.openDialog("A", "COMI0001", ["대분류 코드"]);
			
			this.transaction("SUP010000_R01");
			
			break;

		case 'SUP010000_H02':
			ComLib.openDialog("A", "COMI0001", ["소분류 코드"]);
			
			let bigCd = this.lagCdGrid.getSelectedRows()[0].LAG_CD;
			let mdlCd = this.lagCdGrid.getSelectedRows()[0].MDM_CD;

			this.transaction("SUP010000_R02", bigCd, mdlCd);

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
					if (this.validation("SUP010000_R01")) this.transaction("SUP010000_R01");
				
					break;

				case "btnBigSave":
					if (this.validation("SUP010000_H01")) this.transaction("SUP010000_H01");

					break;

				case "btnSmlSave":
					if (this.validation("SUP010000_H02")) this.transaction("SUP010000_H02");
					
					break;	
						
				default : break;
				}
			}
		},
		grid: {
			onSelectionChanged: (e) => {
				switch (e.id) {
				case "grdLagCd":
					let lagRow = this.lagCdGrid.getSelectedRows()[0]	

					let bigCd   = lagRow.LAG_CD;
					let rowType = lagRow.rowtype;
					let mdlCd   = lagRow.MDM_CD;					

					if ((rowType === 'r' || rowType === 'u') && (this.currentRowLag !== bigCd || this.currentRowMdm !== mdlCd)) {
						if (this.validation("SUP010000_R02")) this.transaction("SUP010000_R02", bigCd, mdlCd);
						

					} else if (rowType === 'c'){
						ComLib.setStateInitRecords(this, "dsSmlCdList", []);

					}

					this.currentRowLag = this.lagCdGridApi.getSelectedRows()[0].LAG_CD;
					this.currentRowMdm = this.lagCdGridApi.getSelectedRows()[0].MDM_CD;
						
					break;

				case "grdSmlCd":

					break;

				default: break
				}
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdLagCd":
					this.lagCdGridApi = e.gridApi;
					this.lagCdGrid    = e.grid;
					
					break;

				case "grdSmlCd":
					this.smlCdGridApi = e.gridApi;
					this.smlCdGrid    = e.grid;
					
					break;

				default: break
				}
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdLagCd":
					let lagRows = this.lagCdGridApi.rowModel.rowsToDisplay;
					let lagRow;

					for (let i = 0; i < lagRows.length; i ++) {
						if (lagRows[i].data.TEMP_CD === e.data.TEMP_CD){
							lagRow = this.lagCdGridApi.rowModel.rowsToDisplay[i];
							break;
						}
					}

					if (lagRow.selected !== true) {
						lagRow.setSelected(true);
					}
															 		
					break;

				case "grdSmlCd":
					let smlRows = this.smlCdGridApi.rowModel.rowsToDisplay;
					let smlRow;

					for (let i = 0; i < smlRows.length; i ++) {
						if (smlRows[i].data.TEMP_CD === e.data.TEMP_CD){
							smlRow = this.smlCdGridApi.rowModel.rowsToDisplay[i];
							break;
						}
					}


					if (smlRow.selected !== true) {
						smlRow.setSelected(true);
					}

					break;

				default: break;
				}
			},
			onCellValueChanged: (e) => {				
				switch (e.id) {
				case "grdLagCd":	
					if (e.col === "LAG_CD" || e.col === "MDM_CD" ) {
						if (this.lagCdGrid.gridDataset.records[e.index].rowtype !== newScrmObj.constants.crud.create) {
							ComLib.openDialog('A', 'COME0013', [(e.col === "LAG_CD" ? '대' : '중') + '분류 코드']);
						
							this.lagCdGrid.gridDataset.setValue(e.index , e.col, e.oldValue);
							this.lagCdGridApi.setRowData(this.lagCdGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
						}
					}	

					let lagRows = this.lagCdGridApi.rowModel.rowsToDisplay;
					let lagRow;

					for (let i = 0; i < lagRows.length; i ++) {
						if (lagRows[i].data.TEMP_CD === e.data[e.index].TEMP_CD){
							lagRow = this.lagCdGridApi.rowModel.rowsToDisplay[i];							
							break;
						}
					}

					
					if (lagRow.selected !== true) {
						lagRow.setSelected(true);
					}

					this.currentRowLag = lagRow.data.LAG_CD;
					this.currentRowMdm = lagRow.data.MDM_CD;

					this.lastEditedLag = lagRow.data.LAG_CD;
					this.lastEditedMdm = lagRow.data.MDM_CD;

					break;

				case "grdSmlCd" :		
					if (e.col === "SML_CD") {
						if (this.smlCdGrid.gridDataset.records[e.index].rowtype !== newScrmObj.constants.crud.create) {
							ComLib.openDialog('A', 'COME0013', ['소분류 코드']);
						
							this.smlCdGrid.gridDataset.setValue(e.index , e.col, e.oldValue);
							this.smlCdGridApi.setRowData(this.smlCdGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
						}
					}	
					
					let smlRows = this.lagCdGridApi.rowModel.rowsToDisplay;
					let smlRow;

					
					smlRow = this.smlCdGridApi.rowModel.rowsToDisplay[e.index];
					this.smlCdGridApi.ensureIndexVisible(e.index, 'middle');		

					// for (let i = 0; i < smlRows.length; i ++) {
					// 	if (smlRows[i].data.TEMP_CD === e.data[e.index].TEMP_CD){				
					// 		break;
					// 	}
					// }
						
					if (smlRow.selected !== true) {
						smlRow.setSelected(true);
					}

					this.currentRowLag = this.lagCdGridApi.getSelectedRows()[0].LAG_CD;
					this.currentRowMdm = this.lagCdGridApi.getSelectedRows()[0].MDM_CD;
					this.currentRowSml = smlRow !== undefined ? smlRow.data.SML_CD : '';
					
					this.lastEditedLag = this.currentRowLag;
					this.lastEditedMdm = this.currentRowMdm;

					break;
		
				default: break;
				}
			},
			onDeleteRow: (e) => {
				switch (e.id) {
				case "grdLagCd":
					let bigCd   = this.lagCdGridApi.getSelectedRows()[0].LAG_CD
					let mdlCd   = this.lagCdGridApi.getSelectedRows()[0].MDM_CD
					let rowType = this.lagCdGridApi.getSelectedRows()[0].rowtype;					

					if ((rowType === 'r' || rowType === 'u') && (this.currentRowLag !== bigCd || this.currentRowMdm !== mdlCd)) {
						if (this.validation("SUP010000_R02")) this.transaction("SUP010000_R02", bigCd, mdlCd);
							
					} else {
						ComLib.setStateInitRecords(this, "dsSmlCdList", []);

					}
					
					this.currentRowLag = this.lagCdGridApi.getSelectedRows()[0].LAG_CD;
					this.currentRowMdm = this.lagCdGridApi.getSelectedRows()[0].MDM_CD;

					break;

				case "grdSmlCd":
					if (this.smlCdGridApi.getSelectedRows().length > 0) {
						this.currentRowSml = this.smlCdGridApi.getSelectedRows()[0].SML_CD;

					} else {
						this.currentRowSml = '';

					}
					
					break;
		
				default: break;
				}
			},
			onBeforeInsertRow : (e) => {
				switch (e.id) {
				case "grdLagCd":
					
					break;

				case "grdSmlCd":
					if (this.lagCdGridApi.getSelectedRows().length < 1) {	
						ComLib.openDialog('A', 'COME0006', ['대분류 코드', '선택']);	
						
						return {rtn: false};

					} else if (this.lagCdGridApi.getSelectedRows()[0].rowtype !== 'r') {
						ComLib.openDialog('A', 'COME0006', ['대분류 코드', '저장']);

						return {rtn: false};
					} 

					break;
		
				default: break;
				}

				return {rtn: true, index: 0};
			},			
			onInsertRow : (e) => {
				switch (e.id) {
				case "grdLagCd":
					let bigCdRecords = this.lagCdGrid.gridDataset.records;

					bigCdRecords[e.index].TEMP_CD = this.maxTempLagCd + 1;

					this.maxTempLagCd ++;

					this.lagCdGrid.gridDataset.setRecords(bigCdRecords);

					this.lagCdGridApi.setRowData(this.lagCdGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
				
					let lagRows = this.lagCdGridApi.rowModel.rowsToDisplay;
					let lagRow;

					for (let i = 0; i < lagRows.length; i ++) {
						if (lagRows[i].data.TEMP_CD === this.maxTempLagCd){
							lagRow = this.lagCdGridApi.rowModel.rowsToDisplay[i];
							this.lagCdGridApi.ensureIndexVisible(i, 'middle');
							break;
						}
					}

					if (lagRow.selected !== true) {
						lagRow.setSelected(true);
					}					

					ComLib.setStateInitRecords(this, "dsSmlCdList", []);
					
					this.currentRowLag = '';
					this.currentRowMdm = '';

					break;

				case "grdSmlCd":				

					break;
		
				default: break;
				}
				
			}
		},
		input : {
			onChange: (e) => {
				switch (e.target.id) {
				case 'iptLagCdNm':
					let state = this.state;

					state['textFieldProps']['iptLagCdNm'].value = e.target.value;
	
					this.setState(state);
					
					break;

				default: break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptLagCdNm':
					if (e.key === 'Enter') {
						if (this.validation("SUP010000_R01")) this.transaction("SUP010000_R01");
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
									<Label value="대분류코드/코드명"/>
									<Textfield
										width       = {300}
										id          = {this.state.textFieldProps.iptLagCdNm.id}
										name        = {this.state.textFieldProps.iptLagCdNm.name}
										value       = {this.state.textFieldProps.iptLagCdNm.value}
										placeholder = {this.state.textFieldProps.iptLagCdNm.placeholder}
										minLength   = {this.state.textFieldProps.iptLagCdNm.minLength}
										maxLength   = {this.state.textFieldProps.iptLagCdNm.maxLength}
										readOnly    = {this.state.textFieldProps.iptLagCdNm.readOnly}
										disabled    = {this.state.textFieldProps.iptLagCdNm.disabled}
										onChange    = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>
									<Label value="대분류코드 사용여부"/>
									<Selectbox
										id       = {this.state.selectboxProps.selUseYn.id}
										value    = {this.state.selectboxProps.selUseYn.value}
										dataset  = {this.state.selectboxProps.selUseYn.dataset}
										width    = {this.state.selectboxProps.selUseYn.width}
										disabled = {this.state.selectboxProps.selUseYn.disabled}
										selected = {this.state.selectboxProps.selUseYn.selected}
										onChange = {this.event.selectbox.onChange}
									/>
								</FlexPanel>
							</LFloatArea>
							<RFloatArea>
								<Button
									color      = 'blue' 
									fiiled	   = "o"
									innerImage = {true} 
									icon	   = {'srch'}  
									id         = {this.state.btnProps.btnSearch.id}
									value      = {this.state.btnProps.btnSearch.value}
									disabled   = {this.state.btnProps.btnSearch.disabled}
									hidden     = {this.state.btnProps.btnSearch.hidden}
									onClick    = {this.event.button.onClick}
									mt         = {5}
								/>
							</RFloatArea>
						</RelativeGroup>
					</SearchPanel>						
					<SubFullPanel>
						<FlexPanel>
							<ComponentPanel>
								<Grid
									id       = {this.state.grdProps.grdLagCd.id} 
									areaName = {this.state.grdProps.grdLagCd.areaName}
									header   = {this.state.grdProps.grdLagCd.header}
									data     = {this.state.dsLagCdList}
									height   = {this.state.grdProps.grdLagCd.height}
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
											id       = {this.state.btnProps.btnBigSave.id}
											value    = {this.state.btnProps.btnBigSave.value}
											disabled = {this.state.btnProps.btnBigSave.disabled}
											hidden   = {this.state.btnProps.btnBigSave.hidden}
											onClick  = {this.event.button.onClick}
											mt       = {5}
										/>
									</RFloatArea>
								</RelativeGroup>
							</ComponentPanel>
							<ComponentPanel width={'85%'}>
								<Grid
									id       = {this.state.grdProps.grdSmlCd.id} 
									areaName = {this.state.grdProps.grdSmlCd.areaName}
									header   = {this.state.grdProps.grdSmlCd.header}
									data     = {this.state.dsSmlCdList}
									height   = {this.state.grdProps.grdSmlCd.height}
									rowNum   = {true}

									onGridReady        = {this.event.grid.onGridReady}
									onRowClicked       = {this.event.grid.onRowClicked}
									onCellValueChanged = {this.event.grid.onCellValueChanged}
									onDeleteRow        = {this.event.grid.onDeleteRow}
									onInsertRow        = {this.event.grid.onInsertRow}
									onBeforeInsertRow  = {this.event.grid.onBeforeInsertRow}
									onSelectionChanged = {this.event.grid.onSelectionChanged}							
								/>
								<RelativeGroup>
									<RFloatArea>
										<Button
											color    = 'purple' 
											fiiled   = "o" 
											id       = {this.state.btnProps.btnSmlSave.id}
											value    = {this.state.btnProps.btnSmlSave.value}
											disabled = {this.state.btnProps.btnSmlSave.disabled}
											hidden   = {this.state.btnProps.btnSmlSave.hidden}
											onClick  = {this.event.button.onClick}
											mt       = {5}
										/>
									</RFloatArea>
								</RelativeGroup>
							</ComponentPanel>
						</FlexPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default View;