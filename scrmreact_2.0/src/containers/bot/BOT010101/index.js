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
import {ComLib, DataLib, TransManager, newScrmObj} from 'common';

class BOT010101 extends React.Component {
	constructor(props) {
		super();
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
									{headerName: '키워드',	 field: 'KWD',	colId: 'KWD', width: 200,	editable: true},
									{headerName: '가중치',   field: 'KWD_SCO',	colId: 'KWD_SCO', width: 100,	editable: true},
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
				}
			},
		}
	}
	componentDidMount () {
		let props = this.props.options.param;     
		let state = this.state;
		state['textFieldProps']['iptSnroNm'].value = props.name;
		state['textFieldProps']['iptSnroType'].value = props.snroTp;
		console.log(props)
		this.setState(state);
		this.transaction("BOT010101_R00")	
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {		
		console.log("transaction")
		let serviceid = params[0];
		let transManager = new TransManager();
		
		console.log(serviceid)
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
				
				let props = this.props.options.param;

				transManager.addDataset('dsSearch', [{ND_UUID: props.id, ND_PORT: props.port}]);
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

				ComLib.setStateInitRecords(this, "dsSnroKeywordList", dsSnroKeywordListRecv);
				
				let state = this.state;
				state['textFieldProps']['iptSnroSco'].value = res.data.dsSnroKeywordListRecv[0].REQ_SCO;
				this.setState(state);

			}	

			break;

		default : break;
		}
	}


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