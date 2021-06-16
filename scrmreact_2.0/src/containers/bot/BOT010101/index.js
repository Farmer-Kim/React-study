// 오인식문장관리
import React from 'react';
import {
	ComponentPanel, SearchPanel,
	FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {Textfield} from 'components';
import {Grid} from 'components';
import {ComLib, DataLib, TransManager, newScrmObj, StrLib} from 'common';
import { number } from 'mathjs';

class BOT010101 extends React.Component {
	constructor(props) {
		super();
		this.maxTempCd = 0;
		
		this.snroKeywordGridApi = null;
		this.snroKeywordGrid    = null;

		this.state = {
			dsSnroKeywordList : DataLib.datalist.getInstance(),			
			btnProps : {
				btnKeywordSave : {
					id       : 'btnKeywordSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},
			grdProps : {
				grdSnroKeyword : {
					id       : 'grdSnroKeyword',
					areaName : '추출 키워드',
					height   : '580px',
					header   : [
									{headerName: '키워드',	 field: 'KWD',	colId: 'KWD', width: 200, cellEditor: 'customEditor', maxLength: 30, type:'kor',	editable: true, req: true},
									{headerName: '가중치',   field: 'KWD_SCO',	colId: 'KWD_SCO', width: 100, cellEditor: 'customEditor', maxLength: 3, type:'num',	editable: true, req: true},
									{headerName: '사용여부', field: 'USE_FLAG',	colId: 'USE_FLAG',	editable: true, defaultValue : 'Y', width: 150, req: true, resizable: false, textAlign: 'center', singleClickEdit: true,
										cellEditor: 'agSelectCellEditor',
										cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
										valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')}	
								]
				}
			},	
			textFieldProps : {
				iptSnroNm : {
					id          : 'iptSnroNm',
					name        : 'iptSnroNm',
					value       : '',
					placeholder : '',
				},				
				iptSnroType : {
					id          : 'iptSnroType',
					name        : 'iptSnroType',
					value       : '',
					placeholder : '',
				},
				iptSnroSco : {
					id          : 'iptSnroSco',
					name        : 'iptSnroSco',
					value       : '',
					placeholder : '',
					orgValue    : '',
				}
			},
		}
	}
	componentDidMount () {
		let props = this.props.options.param;     
		let state = this.state;
		state['textFieldProps']['iptSnroNm'].value = props.name;
		state['textFieldProps']['iptSnroType'].value = props.snroTp;

		this.setState(state);
		this.transaction("BOT010101_R00")	
	}

	validation = (...params) => {
		let transId = params[0];
		let chkCnt  = 0;
		let returnVal = -1;

		switch (transId) {
		case 'BOT010101_H01':
			
			if (StrLib.isNull(this.state.textFieldProps.iptSnroSco.value) || Number(this.state.textFieldProps.iptSnroSco.value) <= 0) {
				ComLib.openDialog('A', 'COME0002', ["임계값"]);

				return false;
			}

			let records = this.snroKeywordGrid.gridDataset.records;

			outer : for (let intA = 0; intA < records.length; intA ++) {
				if (records[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}		
				
				let lagHeader = this.state.grdProps.grdSnroKeyword.header;
				
				for (let i = 0; i < lagHeader.length; i ++) {		
					if (lagHeader[i].req === true) {
						if (StrLib.isNull(records[intA][lagHeader[i].field])) {
							let rows = this.snroKeywordGridApi.rowModel.rowsToDisplay;
							let rowNum = 0;
							
							for (let i = 0; i < rows.length; i ++) {
								if (rows[i].data.TEMP_CD === records[intA].TEMP_CD){									
									rowNum = i;

									break;
								}
							}

							ComLib.openDialog('A', 'COME0001', [Number(rowNum + 1) , lagHeader[i].headerName.replace(/\*/g,'')]);
		
							returnVal = intA;

							break outer;
						}
					}
				}			

				for ( let intB = 0; intB < records.length; intB ++ ) {
					if (intA !== intB 
						&& records[intA].KWD === records[intB].KWD) {
							
						let rows = this.snroKeywordGridApi.rowModel.rowsToDisplay;
						let rowNum = 0;
						
						for (let i = 0; i < rows.length; i ++) {
							if (rows[i].data.TEMP_CD === records[intA].TEMP_CD){									
								rowNum = i;

								break;
							}
						}
						
						ComLib.openDialog('A', 'COME0012', [Number(rowNum + 1), Number(intB + 1), '키워드']);
						
						this.snroKeywordGrid.moveRow(intA, true);
			
						return false;
					}
				}
					
			}

			if (returnVal > -1) {
				this.snroKeywordGrid.moveRow(returnVal, true);
				
				return false;
			}	

			if (records.length < 1 || chkCnt === 0) {
				if (this.state.textFieldProps.iptSnroSco.value === this.state.textFieldProps.iptSnroSco.orgValue) {
					ComLib.openDialog('A', 'COME0005');

					return false;
				}
			}
			
			break;
		}
		return true;
	}

	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {		
		let serviceid = params[0];
		let transManager = new TransManager();
		
		let props = this.props.options.param;

		transManager.setTransId(serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);
		try {
			switch (serviceid) {
			case 'BOT010101_R00':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"BOT.R_getSnroKeywordList",
					datasetsend:"dsSearch",
					datasetrecv:"dsSnroKeywordListRecv",
				});
				
				transManager.addDataset('dsSearch', [{ND_UUID: props.id, ND_PORT: props.port}]);
				transManager.agent();

				break;

			case 'BOT010101_H01':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.handle,
					sqlmapid:"BOT.H_handleSnroKeywordList",
					datasetsend:"dsSave",
				});
				
				let records = this.snroKeywordGrid.gridDataset.records;
				for (let i = 0; i < records.length; i ++) {
					records[i].REQ_SCO = Number(this.state.textFieldProps.iptSnroSco.value);
					records[i].ND_UUID = props.id;
					records[i].ND_PORT = props.port;
					if (this.state.textFieldProps.iptSnroSco.value !== this.state.textFieldProps.iptSnroSco.orgValue) {
						if (records[i].rowtype === 'r') {
							records[i].rowtype = 'u';
						}
					}

				}

				transManager.addDataset('dsSave', records);
				transManager.agent();
				break;

			default : break;
			}
		} catch (err) {

		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {		
		console.log(res)
		switch (res.id) {		
		case 'BOT010101_R00':
			if (res.data.dsSnroKeywordListRecv.length > 0) {
				let dsSnroKeywordListRecv = res.data.dsSnroKeywordListRecv;

				let tempCd = 0;

				for (let i = 0; i < dsSnroKeywordListRecv.length; i ++) {
					dsSnroKeywordListRecv[i].TEMP_CD = tempCd;
					tempCd ++;
				}

				this.maxTempCd = tempCd;

				ComLib.setStateInitRecords(this, "dsSnroKeywordList", dsSnroKeywordListRecv);
				
				let state = this.state;
				state['textFieldProps']['iptSnroSco'].value = res.data.dsSnroKeywordListRecv[0].REQ_SCO;
				state['textFieldProps']['iptSnroSco'].orgValue = res.data.dsSnroKeywordListRecv[0].REQ_SCO;
				this.setState(state);

			}	

			break;
		case 'BOT010101_H01':
			ComLib.openDialog("A", "COMI0001", ["키워드"]);
			
			this.transaction("BOT010101_R00");

			break;
		default : break;
		}
	}


	event = {
		// 버튼 이벤트
		button : {
			onClick : (e) => {
				switch (e.target.id) {
				case "btnKeywordSave":
					if (this.validation("BOT010101_H01")) {
						this.transaction("BOT010101_H01");
					}

					break;
						
				default : break;
				}
			}
		},
		grid: {
			onSelectionChanged: (e) => {
				switch (e.id) {
				case "grdSnroKeyword":
						
					break;

				default: break
				}
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdSnroKeyword":
					this.snroKeywordGridApi = e.gridApi;
					this.snroKeywordGrid    = e.grid;
					
					break;
				default: break
				}
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdSnroKeyword":
															 		
					break;

				default: break;
				}
			},
			onCellValueChanged: (e) => {				
				switch (e.id) {
				case "grdSnroKeyword":	
					
					break;
		
				default: break;
				}
			},
			onDeleteRow: (e) => {
				switch (e.id) {
				case "grdSnroKeyword":
					
					break;

				default: break;
				}
			},
			onBeforeInsertRow : (e) => {
				switch (e.id) {
				case "grdSnroKeyword":
					
					break;

		
				default: break;
				}

				return {rtn: true, index: 0};
			},			
			onInsertRow : (e) => {
				switch (e.id) {
				case "grdSnroKeyword":
					let records = this.snroKeywordGrid.gridDataset.records;

					records[e.index].TEMP_CD = this.maxTempCd + 1;

					this.maxTempCd ++;

					this.snroKeywordGrid.gridDataset.setRecords(records);

					this.snroKeywordGridApi.setRowData(this.snroKeywordGrid.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
				
					let rows = this.snroKeywordGridApi.rowModel.rowsToDisplay;
					let row;

					for (let i = 0; i < rows.length; i ++) {
						if (rows[i].data.TEMP_CD === this.maxTempCd){
							row = this.snroKeywordGridApi.rowModel.rowsToDisplay[i];
							this.snroKeywordGridApi.ensureIndexVisible(i, 'middle');
							break;
						}
					}

					if (row.selected !== true) {
						row.setSelected(true);
					}					

					break;

		
				default: break;
				}
				
			}
		},
		input : {
			onChange: (e) => {
				let state = this.state;

				switch (e.target.id) {
				case 'iptSnroSco':
					state['textFieldProps']['iptSnroSco'].value = e.target.value;
	
					this.setState(state);
					
					break;
				default: break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptSnroSco':
					
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


	render () {
		return (
			<React.Fragment>
				<FullPanel>
					<SubFullPanel>
							<SearchPanel>
								<RelativeGroup>
									<LFloatArea>
										<FlexPanel>
											<Label value="시나리오"/>
											<Textfield
												width       = {250}
												id          = {this.state.textFieldProps.iptSnroNm.id}
												name        = {this.state.textFieldProps.iptSnroNm.name}
												value       = {this.state.textFieldProps.iptSnroNm.value}
												readOnly    = {true}
												disabled    = {false}
											/>
											<Label value="임계값" req={true}/>
											<Textfield
												width       = {50}
												id          = {this.state.textFieldProps.iptSnroSco.id}
												name        = {this.state.textFieldProps.iptSnroSco.name}
												value       = {this.state.textFieldProps.iptSnroSco.value}
												placeholder = {this.state.textFieldProps.iptSnroSco.placeholder}
												minLength   = {1}
												maxLength   = {3}
												readOnly    = {false}
												disabled    = {false}
												type        = {"onlyNum"}
												onChange    = {this.event.input.onChange}
												onKeyPress  = {this.event.input.onKeyPress}
											/>
										</FlexPanel>
									</LFloatArea>
								</RelativeGroup>
							</SearchPanel>
							<ComponentPanel>
								<Grid
									id          = {this.state.grdProps.grdSnroKeyword.id} 
									areaName    = {this.state.grdProps.grdSnroKeyword.areaName}
									header      = {this.state.grdProps.grdSnroKeyword.header}
									data        = {this.state.dsSnroKeywordList}
									height      = {this.state.grdProps.grdSnroKeyword.height}
									onGridReady = {this.event.grid.onGridReady}
									onDeleteRow = {this.event.grid.onDeleteRow}
									onInsertRow = {this.event.grid.onInsertRow}

									rowNum      = {true}
									addRowBtn   = {true}
									delRowBtn   = {true}
								/>
								<RelativeGroup>
									<RFloatArea>	
										<Button
											color    = 'purple' 
											fiiled   = "o" 
											id       = {this.state.btnProps.btnKeywordSave.id}
											value    = {this.state.btnProps.btnKeywordSave.value}
											disabled = {this.state.btnProps.btnKeywordSave.disabled}
											hidden   = {this.state.btnProps.btnKeywordSave.hidden}
											onClick  = {this.event.button.onClick}
											mt       = {5}
										/>
									</RFloatArea>
								</RelativeGroup>
							</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default BOT010101;