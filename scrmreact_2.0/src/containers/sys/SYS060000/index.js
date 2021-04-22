// 검색 사전 관리
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
		this.dictionaryGridApi = null;
		this.similarGridApi = null;

		this.dictionaryGrid = null;
		this.similarGrid = null;

		this.currentRowDic = '';
		this.currentRowSil = '';

		this.lastEditedDic = '';

		this.state = {
			dsDictionaryList : DataLib.datalist.getInstance(),
			dsSimilarList : DataLib.datalist.getInstance(),

			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
				btnDictionarySave : {
					id       : 'btnDictionarySave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},	
				btnSimilarSave : {
					id       : 'btnSimilarSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},	
				btnDistribute : {
					id       : 'btnDistribute',
					disabled : false,
					value    : '배포',
					hidden   : false
				},
			},				
			grdProps : {
				grdDictionary : {
					id : 'grdDictionary',
					areaName : '검색 단어 사전',
					header: [
								{headerName: '단어구분',	 field: 'WORD_TP',	colId: 'WORD_TP',	editable: true, defaultValue : 'W', width: 200, req: true, textAlign: 'center', singleClickEdit: true,
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('STT_JOB_SCH_DIC', 'WORD_TP')},
									valueFormatter : (param) => ComLib.getComCodeName('STT_JOB_SCH_DIC', param.value, 'WORD_TP')},		
								{headerName: '단어이름',     field: 'WORD_NM',	colId: 'WORD_NM',	editable: true, width: 120, cellEditor: 'customEditor', maxLength: 25, req: true},
								{headerName: '단어내용',	 field: 'WORD_CONT',colId: 'WORD_CONT', editable: true, width: 200, cellEditor: 'customEditor', maxLength: 100, req: true},
								{headerName: '사용여부',	 field: 'USE_FLAG',	colId: 'USE_FLAG',	editable: true, defaultValue : 'Y', width: 120, req: true, textAlign: 'center', singleClickEdit: true,
									cellEditor: 'agSelectCellEditor',
									cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
									valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')},	
								{headerName: '유의어', field: 'SNM_NM',	colId: 'SNM_NM',	editable: false, width: 400, resizable: false},
												
							],
					height: '610px'
				},			
				grdSilmilar : {
					id : 'grdSilmilar',
					areaName : '유의어',
					header: [						
								{headerName: '유의어 이름',	field: 'SNM_NM',	colId: 'SNM_NM',	editable: true, width: 110, cellEditor: 'customEditor', maxLength: 25, req: true},
								{headerName: '유의어 내용',	field: 'SNM_CONT',	colId: 'SNM_CONT',	editable: true, width: 180, cellEditor: 'customEditor', maxLength: 100, req: true},
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
				},
				selWordTp : {
					id       : 'selWordTp',
					value    : '',
					dataset  : ComLib.convComboList(ComLib.getCommCodeList('STT_JOB_SCH_DIC', 'WORD_TP'), newScrmObj.constants.select.argument.all),
					width    : 80,
					selected : 0,
					disabled : false
				}
			},			
			textFieldProps : {
				iptWordNm : {
					id          : 'iptWordNm',
					name        : 'iptWordNm',
					value       : '',
					placeholder : '단어',
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
		1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
		=> 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	 ------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		if (this.validation("SYS060000_R01")) this.transaction("SYS060000_R01");
	}
	/*------------------------------------------------------------------------------------------------*
		2) componentDidUpdate () => 갱신이 일어나 직후에 호춮 (최초 렌더링 시에는 호출되지 않음)
		=> prevProps와 현재 props를 비교할 수 있음 -> 조건문으로 감싸지 않고 setState를 실행할 시, 무한 반복 가능성 -> 반드시 setState를 쓰려면 조건문으로 작성
	 ------------------------------------------------------------------------------------------------*/
	componentDidUpdate (prevProps, prevState, snapshot) {

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
		let chkCnt  = 0;
		let returnVal = -1;

		switch (transId) {
		case 'SYS060000_R01':

			break;

		case 'SYS060000_R02':	
			
			break;

		case 'SYS060000_H01':	
			let dictionaryRecord = this.dictionaryGrid.gridDataset.records;

			outer : for (let intA = 0; intA < dictionaryRecord.length; intA ++) {
				if (dictionaryRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}		
				
				let dictionaryHeader = this.state.grdProps.grdDictionary.header;
				
				for (let i = 0; i < dictionaryHeader.length; i ++) {		
					if (dictionaryHeader[i].req === true) {
						if (StrLib.isNull(dictionaryRecord[intA][dictionaryHeader[i].field])) {
							let dictionaryRows = this.dictionaryGridApi.rowModel.rowsToDisplay;
							let dictionaryNum = 0;
							
							for (let i = 0; i < dictionaryRows.length; i ++) {
								if (dictionaryRows[i].data.TEMP_CD === dictionaryRecord[intA].TEMP_CD){									
									dictionaryNum = i;

									break;
								}
							}

							ComLib.openDialog('A', 'COME0001', [Number(dictionaryNum + 1) , dictionaryHeader[i].headerName.replace(/\*/g,'')]);
		
							returnVal = intA;

							break outer;
						}
					}
				}			

				for ( let intB = 0; intB < dictionaryRecord.length; intB ++ ) {
					if (intA !== intB 
						&& dictionaryRecord[intA].WORD_NM === dictionaryRecord[intB].WORD_NM) {
							
						let dictionaryRows = this.dictionaryGridApi.rowModel.rowsToDisplay;
						let dictionaryNum = 0;
						
						for (let i = 0; i < dictionaryRows.length; i ++) {
							if (dictionaryRows[i].data.TEMP_CD === dictionaryRecord[intA].TEMP_CD){									
								dictionaryNum = i;

								break;
							}
						}
						
						ComLib.openDialog('A', 'COME0012', [Number(dictionaryNum + 1), Number(intB + 1), '단어이름']);
						
						this.dictionaryGrid.moveRow(intA, true);
			
						return false;
					}
				}
					
			}

			if (returnVal > -1) {
				this.dictionaryGrid.moveRow(returnVal, true);
				
				return false;
			}	

			if (dictionaryRecord.length < 1 || chkCnt === 0) {
				ComLib.openDialog('A', 'COME0005');

				return false;
			}

			break;

		case 'SYS060000_H02':
			let similarRecord = this.similarGrid.gridDataset.records;

			outer : for ( let intA = 0; intA < similarRecord.length; intA ++ ) {
				if (similarRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}	

				let similarHeader = this.state.grdProps.grdSilmilar.header;
				
				for (let i = 0; i < similarHeader.length; i ++) {		
					if (similarHeader[i].req === true) {
						if (StrLib.isNull(similarRecord[intA][similarHeader[i].field])) {
							let similarRows = this.similarGridApi.rowModel.rowsToDisplay;
							let similarNum = 0;
							
							for (let i = 0; i < similarRows.length; i ++) {
								if (similarRows[i].data.TEMP_CD === similarRecord[intA].TEMP_CD){									
									similarNum = i;

									break;
								}
							}

							ComLib.openDialog('A', 'COME0001', [Number(similarNum + 1) , similarHeader[i].headerName.replace(/\*/g,'')]);
		
							returnVal = intA;

							break outer;
						}
					}
				}

				for ( let intB = 0; intB < similarRecord.length; intB ++ ) {
					if (intA !== intB && similarRecord[intA].SNM_NM === similarRecord[intB].SNM_NM) {
						let similarRows = this.similarGridApi.rowModel.rowsToDisplay;
						let similarNumA = 0;
						let similarNumB = 0;
						for (let i = 0; i < similarRows.length; i ++) {
							if (similarRows[i].data.TEMP_CD === similarRecord[intA].TEMP_CD){									
								similarNumA = i;

							} else if (similarRows[i].data.TEMP_CD === similarRecord[intB].TEMP_CD){									
								similarNumB = i;

							}
						}

						ComLib.openDialog('A', 'COME0012', [Number(similarNumA + 1), Number(similarNumB + 1), '유의어 이름']);
						
						this.similarGrid.moveRow(intB, true);
			
						return false;
					}
				}									
			}

			if (returnVal > -1) {
				this.similarGrid.moveRow(returnVal, true);
			
				return false;
			}

			if (similarRecord.length < 1 || chkCnt === 0) {
				ComLib.openDialog('A', 'COME0005');

				return false;
			}

			break;
		case 'SYS060000_U01':
			let dicRecord = this.dictionaryGrid.gridDataset.records;
			let simRecord = this.similarGrid.gridDataset.records;

			for (let intA = 0; intA < dicRecord.length; intA ++) {
				if (dicRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}	
			}

			for ( let intA = 0; intA < simRecord.length; intA ++ ) {
				if (simRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}	
			}

			if (chkCnt > 0) {
				ComLib.openDialog('A', 'COME0006', ['수정항목', '저장']);

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
	// SYS060000_R01 : 대분류 코드 조회
	// SYS060000_R02 : 소분류 코드 조회
	// SYS060000_H01 : 대분류 코드 저장
	// SYS060000_H02 : 소분류 코드 저장
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {
		let transId = params[0];

		let transManager = new TransManager();

		transManager.setTransId (transId);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try  {
			switch (transId) {
			case 'SYS060000_R01':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getDictionaryList",
					datasetsend: "dsUser",
					datasetrecv: "dsDictionaryRecv"
				});

				transManager.addDataset('dsUser', [{"WORD_NM" : this.state.textFieldProps.iptWordNm.value.trim()
				                                  , "USE_FLAG": this.state.selectboxProps.selUseYn.value
												  , "WORD_TP" : this.state.selectboxProps.selWordTp.value}]);
				transManager.agent();

				break;

			case 'SYS060000_R02':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SYS.R_getSimilarList",
					datasetsend: "dsUser",
					datasetrecv: "dsSimilarRecv"
				});

				transManager.addDataset('dsUser', [{"WORD_UNQ": params[1]}]);
				transManager.agent();

				break

			case 'SYS060000_H01':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "SYS.H_handleDictionaryList",
					datasetsend: "dsDictionaryList"
				});

				transManager.addDataset('dsDictionaryList', this.dictionaryGrid.gridDataset.records);
				transManager.agent();
			
				break;

			case 'SYS060000_H02':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "SYS.H_handleSimilarList",
					datasetsend: "dsSimilarList"
				});

				let similarRecord = this.similarGrid.gridDataset.records;

				for (let intA = 0; intA < similarRecord.length; intA ++) {
					if (StrLib.isNull(similarRecord[intA]["WORD_UNQ"])) {
						similarRecord[intA]["WORD_UNQ"] = this.dictionaryGridApi.getSelectedRows()[0].WORD_UNQ;
					}					
				}
				
				transManager.addDataset('dsSimilarList', similarRecord);
				transManager.agent();
			
				break;					
			case 'SYS060000_U01':
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.update,
					sqlmapid   : "SYS.U_setDictionarySvr",
					datasetsend: "empty"
				});

				transManager.addDataset('empty', [{}]);
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
		let dictionaryRows, similarRows;
		let dictionaryRow, silmilarRow;		

		switch (res.id) {
		case 'SYS060000_R01':
			if (res.data.dsDictionaryRecv.length > 0) {
				let dsDictionary = res.data.dsDictionaryRecv;
				let tempDicCd = 0;

				for (let i = 0; i < dsDictionary.length; i ++) {
					dsDictionary[i].TEMP_CD = tempDicCd;
					tempDicCd ++;
				}

				this.maxtempDicCd = tempDicCd;

				ComLib.setStateInitRecords(this, "dsDictionaryList", dsDictionary);

				dictionaryRows = this.dictionaryGridApi.rowModel.rowsToDisplay;
				
				let wordUnq;

				for (let i = 0; i < dictionaryRows.length; i ++) {
					if (dictionaryRows[i].data.WORD_NM ===  this.lastEditedDic){
						dictionaryRow = this.dictionaryGridApi.rowModel.rowsToDisplay[i];
						wordUnq  = this.dictionaryGridApi.rowModel.rowsToDisplay[i].data.WORD_UNQ;
						
						this.dictionaryGridApi.ensureIndexVisible(i, 'middle');

						break;
					}
				}

				if (dictionaryRow === undefined) {
					dictionaryRow = this.dictionaryGridApi.rowModel.rowsToDisplay[0];					
					wordUnq  = this.dictionaryGridApi.rowModel.rowsToDisplay[0].data.WORD_UNQ;
					this.dictionaryGridApi.ensureIndexVisible(0, 'middle');
				}

				if (dictionaryRow !== undefined && dictionaryRow.selected !== true) {
					dictionaryRow.setSelected(true);
				}

				this.currentRowDic = wordUnq;

				if (this.validation("SYS060000_R02")) this.transaction("SYS060000_R02", wordUnq);

			} else {
				ComLib.setStateInitRecords(this, "dsDictionaryList", []);
				ComLib.setStateInitRecords(this, "dsSimilarList", []);

			}
			
			break;

		case 'SYS060000_R02':	
			let dsSimilar = res.data.dsSimilarRecv;
			let tempSimilar = 0;

			for (let i = 0; i < dsSimilar.length; i ++) {
				dsSimilar[i].TEMP_CD = tempSimilar;
				tempSimilar ++;
			}

			this.maxtempSimilar = tempSimilar;

			ComLib.setStateInitRecords(this, "dsSimilarList", res.data.dsSimilarRecv);

			similarRows = this.similarGridApi.rowModel.rowsToDisplay;

			for (let i = 0; i < similarRows.length; i ++) {
				if (similarRows[i].data.SNM_NM === this.currentRowSil){
					silmilarRow = this.similarGridApi.rowModel.rowsToDisplay[i];
					this.similarGridApi.ensureIndexVisible(i, 'middle');						
					break;
				}
			}

			if (silmilarRow === undefined) {
				silmilarRow = this.similarGridApi.rowModel.rowsToDisplay[0];
			}

			if (silmilarRow !== undefined && silmilarRow.selected !== true) {
				silmilarRow.setSelected(true);
			}
			
			break;

		case 'SYS060000_H01':
			ComLib.openDialog("A", "COMI0001", ["검색 단어 사전"]);
			
			this.transaction("SYS060000_R01");
			
			break;

		case 'SYS060000_H02':
			ComLib.openDialog("A", "COMI0001", ["유의어 사전"]);
			
			let wordUnq = this.dictionaryGrid.getSelectedRows()[0].WORD_UNQ;

			this.transaction("SYS060000_R01", wordUnq);

			break;	
		case 'SYS060000_U01':
			ComLib.openDialog("A", "SYSI0010", ["배포 되엇습니다. 금일 자정부터 적용 됩니다."]);

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
					if (this.validation("SYS060000_R01")) this.transaction("SYS060000_R01");
				
					break;

				case "btnDictionarySave":
					if (this.validation("SYS060000_H01")) this.transaction("SYS060000_H01");

					break;

				case "btnSimilarSave":
					if (this.validation("SYS060000_H02")) this.transaction("SYS060000_H02");
					
					break;	
				
				case "btnDistribute":
					if (this.validation("SYS060000_U01")) this.transaction("SYS060000_U01");
					
					break;

				default : break;
				}
			}
		},
		grid: {
			onSelectionChanged: (e) => {
				switch (e.id) {
				case "grdDictionary":
					let dictionaryRow = this.dictionaryGrid.getSelectedRows()[0]	

					let wordUnq   = dictionaryRow.WORD_UNQ;
					let rowType = dictionaryRow.rowtype;			

					if ((rowType === 'r' || rowType === 'u') && (this.currentRowDic !== wordUnq)) {
						if (this.validation("SYS060000_R02")) this.transaction("SYS060000_R02", wordUnq);
						

					} else if (rowType === 'c'){
						ComLib.setStateInitRecords(this, "dsSimilarList", []);

					}

					this.currentRowDic = this.dictionaryGridApi.getSelectedRows()[0].WORD_UNQ;
						
					break;

				case "grdSilmilar":

					break;

				default: break
				}
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdDictionary":
					this.dictionaryGridApi = e.gridApi;
					this.dictionaryGrid    = e.grid;
					
					break;

				case "grdSilmilar":
					this.similarGridApi = e.gridApi;
					this.similarGrid    = e.grid;
					
					break;

				default: break
				}
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdDictionary":
					let dictionaryRows = this.dictionaryGridApi.rowModel.rowsToDisplay;
					let dictionaryRow;

					for (let i = 0; i < dictionaryRows.length; i ++) {
						if (dictionaryRows[i].data.TEMP_CD === e.data.TEMP_CD){
							dictionaryRow = this.dictionaryGridApi.rowModel.rowsToDisplay[i];
							break;
						}
					}

					if (dictionaryRow.selected !== true) {
						dictionaryRow.setSelected(true);
					}
															 		
					break;

				case "grdSilmilar":
					let similarRows = this.similarGridApi.rowModel.rowsToDisplay;
					let silmilarRow;

					for (let i = 0; i < similarRows.length; i ++) {
						if (similarRows[i].data.TEMP_CD === e.data.TEMP_CD){
							silmilarRow = this.similarGridApi.rowModel.rowsToDisplay[i];
							break;
						}
					}


					if (silmilarRow.selected !== true) {
						silmilarRow.setSelected(true);
					}

					break;

				default: break;
				}
			},
			onCellValueChanged: (e) => {				
				switch (e.id) {
				case "grdDictionary":	
					if (e.col === "WORD_NM") {
						if (this.dictionaryGrid.gridDataset.records[e.index].rowtype !== newScrmObj.constants.crud.create) {
							ComLib.openDialog('A', 'COME0013', ['단어이름']);
						
							this.dictionaryGrid.gridDataset.setValue(e.index , e.col, e.oldValue);
							this.dictionaryGridApi.setRowData(this.dictionaryGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
							
						}
					}	

					let dictionaryRows = this.dictionaryGridApi.rowModel.rowsToDisplay;
					let dictionaryRow;

					for (let i = 0; i < dictionaryRows.length; i ++) {
						if (dictionaryRows[i].data.TEMP_CD === e.data[e.index].TEMP_CD){
							dictionaryRow = this.dictionaryGridApi.rowModel.rowsToDisplay[i];							
							break;
						}
					}

					if (dictionaryRow.selected !== true) {
						dictionaryRow.setSelected(true);
					}


					this.currentRowDic = dictionaryRow.data.WORD_NM;

					this.lastEditedDic = dictionaryRow.data.WORD_NM;

					break;

				case "grdSilmilar" :		
					if (e.col === "SNM_NM") {
						if (this.similarGrid.gridDataset.records[e.index].rowtype !== newScrmObj.constants.crud.create) {
							ComLib.openDialog('A', 'COME0013', ['유의어이름']);
						
							this.similarGrid.gridDataset.setValue(e.index , e.col, e.oldValue);
							this.similarGridApi.setRowData(this.similarGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
						}
					}	
					
					let similarRows = this.similarGridApi.rowModel.rowsToDisplay;
					let silmilarRow;

					for (let i = 0; i < similarRows.length; i ++) {
						if (similarRows[i].data.TEMP_CD === e.data[e.index].TEMP_CD){
							silmilarRow = this.similarGridApi.rowModel.rowsToDisplay[i];
							this.similarGridApi.ensureIndexVisible(i, 'middle');						
							break;
						}
					}
								
					
					if (silmilarRow.selected !== true) {
						silmilarRow.setSelected(true);
					}

					this.currentRowDic = this.dictionaryGridApi.getSelectedRows()[0].WORD_NM;
					this.currentRowSil = silmilarRow !== undefined ? silmilarRow.data.SNM_NM : '';
					
					this.lastEditedDic = this.currentRowDic;

					break;
		
				default: break;
				}
			},
			onDeleteRow: (e) => {
				switch (e.id) {
				case "grdDictionary":
					let wordUnq   = this.dictionaryGridApi.getSelectedRows()[0].WORD_UNQ
					let rowType = this.dictionaryGridApi.getSelectedRows()[0].rowtype;					

					if ((rowType === 'r' || rowType === 'u') && (this.currentRowDic !== wordUnq)) {
						if (this.validation("SYS060000_R02")) this.transaction("SYS060000_R02", wordUnq);
							
					} else {
						ComLib.setStateInitRecords(this, "dsSimilarList", []);

					}
					
					this.currentRowDic = this.dictionaryGridApi.getSelectedRows()[0].WORD_UNQ;

					break;

				case "grdSilmilar":
					if (this.similarGridApi.getSelectedRows().length > 0) {
						this.currentRowSil = this.similarGridApi.getSelectedRows()[0].SNM_NM;

					} else {
						this.currentRowSil = '';

					}
					
					break;
		
				default: break;
				}
			},
			onBeforeInsertRow : (e) => {
				switch (e.id) {
				case "grdDictionary":
					
					break;

				case "grdSilmilar":
					if (this.dictionaryGridApi.getSelectedRows().length < 1) {	
						ComLib.openDialog('A', 'COME0006', ['검색 단어 사전', '선택']);	
						
						return {rtn: false};

					} else if (this.dictionaryGridApi.getSelectedRows()[0].rowtype !== 'r') {
						ComLib.openDialog('A', 'COME0006', ['검색 단어 사전', '저장']);

						return {rtn: false};
					} 

					break;
		
				default: break;
				}

				return {rtn: true, index: 0};
			},			
			onInsertRow : (e) => {
				switch (e.id) {
				case "grdDictionary":
					let bigCdRecords = this.dictionaryGrid.gridDataset.records;

					bigCdRecords[e.index].TEMP_CD = this.maxtempDicCd + 1;

					this.maxtempDicCd ++;

					this.dictionaryGrid.gridDataset.setRecords(bigCdRecords);

					this.dictionaryGridApi.setRowData(this.dictionaryGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
				
					let dictionaryRows = this.dictionaryGridApi.rowModel.rowsToDisplay;
					let dictionaryRow;

					for (let i = 0; i < dictionaryRows.length; i ++) {
						if (dictionaryRows[i].data.TEMP_CD === this.maxtempDicCd){
							dictionaryRow = this.dictionaryGridApi.rowModel.rowsToDisplay[i];
							this.dictionaryGridApi.ensureIndexVisible(i, 'middle');
							break;
						}
					}

					if (dictionaryRow.selected !== true) {
						dictionaryRow.setSelected(true);
					}					

					ComLib.setStateInitRecords(this, "dsSimilarList", []);
					
					this.currentRowDic = '';
					this.currentRowMdm = '';

					break;

				case "grdSilmilar":				

					break;
		
				default: break;
				}
				
			}
		},
		input : {
			onChange: (e) => {
				switch (e.target.id) {
				case 'iptWordNm':
					let state = this.state;

					state['textFieldProps']['iptWordNm'].value = e.target.value;
	
					this.setState(state);
					
					break;

				default: break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptWordNm':
					if (e.key === 'Enter') {
						if (this.validation("SYS060000_R01")) this.transaction("SYS060000_R01");
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
									<Label value="검색 단어"/>
									<Textfield
										width       = {300}
										id          = {this.state.textFieldProps.iptWordNm.id}
										name        = {this.state.textFieldProps.iptWordNm.name}
										value       = {this.state.textFieldProps.iptWordNm.value}
										placeholder = {this.state.textFieldProps.iptWordNm.placeholder}
										minLength   = {this.state.textFieldProps.iptWordNm.minLength}
										maxLength   = {this.state.textFieldProps.iptWordNm.maxLength}
										readOnly    = {this.state.textFieldProps.iptWordNm.readOnly}
										disabled    = {this.state.textFieldProps.iptWordNm.disabled}
										onChange    = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>
									<Label value="사용여부"/>
									<Selectbox
										id       = {this.state.selectboxProps.selUseYn.id}
										value    = {this.state.selectboxProps.selUseYn.value}
										dataset  = {this.state.selectboxProps.selUseYn.dataset}
										width    = {this.state.selectboxProps.selUseYn.width}
										disabled = {this.state.selectboxProps.selUseYn.disabled}
										selected = {this.state.selectboxProps.selUseYn.selected}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value="단어구분"/>
									<Selectbox
										id       = {this.state.selectboxProps.selWordTp.id}
										value    = {this.state.selectboxProps.selWordTp.value}
										dataset  = {this.state.selectboxProps.selWordTp.dataset}
										width    = {this.state.selectboxProps.selWordTp.width}
										disabled = {this.state.selectboxProps.selWordTp.disabled}
										selected = {this.state.selectboxProps.selWordTp.selected}
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
								<Button
									color      = 'blue' 
									fiiled	   = "o"
									innerImage = {true} 
									icon	   = {'check'}  
									id         = {this.state.btnProps.btnDistribute.id}
									value      = {this.state.btnProps.btnDistribute.value}
									disabled   = {this.state.btnProps.btnDistribute.disabled}
									hidden     = {this.state.btnProps.btnDistribute.hidden}
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
									id       = {this.state.grdProps.grdDictionary.id} 
									areaName = {this.state.grdProps.grdDictionary.areaName}
									header   = {this.state.grdProps.grdDictionary.header}
									data     = {this.state.dsDictionaryList}
									height   = {this.state.grdProps.grdDictionary.height}
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
											id       = {this.state.btnProps.btnDictionarySave.id}
											value    = {this.state.btnProps.btnDictionarySave.value}
											disabled = {this.state.btnProps.btnDictionarySave.disabled}
											hidden   = {this.state.btnProps.btnDictionarySave.hidden}
											onClick  = {this.event.button.onClick}
											mt       = {5}
										/>
									</RFloatArea>
								</RelativeGroup>
							</ComponentPanel>
							<ComponentPanel width={'55%'}>
								<Grid
									id       = {this.state.grdProps.grdSilmilar.id} 
									areaName = {this.state.grdProps.grdSilmilar.areaName}
									header   = {this.state.grdProps.grdSilmilar.header}
									data     = {this.state.dsSimilarList}
									height   = {this.state.grdProps.grdSilmilar.height}
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
											id       = {this.state.btnProps.btnSimilarSave.id}
											value    = {this.state.btnProps.btnSimilarSave.value}
											disabled = {this.state.btnProps.btnSimilarSave.disabled}
											hidden   = {this.state.btnProps.btnSimilarSave.hidden}
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