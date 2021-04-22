// 결함 담당자 검색
import React from 'react';
import {
   ComponentPanel, FlexPanel, FullPanel, RelativeGroup
} from 'components';
import {BasicButton as Button, Label} from 'components';
import {Textfield, RFloatArea, LFloatArea} from 'components';
import {Grid} from 'components';
import {ComLib, DataLib, TransManager} from 'common';

class View extends React.Component {
	/*------------------------------------------------------------------------------------------------*/
	// [1. Default State Zone]
	/*------------------------------------------------------------------------------------------------*/
	constructor(props) {
		super(props);
		
		this.userGridApi    = null;
		this.userChkGridApi = null;

		this.userGrid   = null;
		this.userChkrid = null;

		this.state = {	
			dsUserList   : DataLib.datalist.getInstance(),
			dsUserChkList: DataLib.datalist.getInstance(),

			textFieldProps : {
				iptUser : {
					id          : 'iptUser',
					name        : 'iptUser',
					value       : '',
					placeholder : '성명/사번',
					minLength   : 1,
					maxLength   : 10,
					readOnly    : false,
					disabled    : false
				},
			},

			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
				btnConfrim : {
					id       : 'btnConfrim',
					disabled : false,
					value    : '확인',
					hidden   : false
				},
			},			

			grdProps : {
				grdUser : {
					id : 'grdUser',
					areaName : '사용자',
					header: [
						{headerName: '사번'   ,	field: 'CODE',	        colId: 'CODE',       editable: false, width: 400},
						{headerName: '성명'   ,	field: 'CODE_NM',		colId: 'CODE_NM',	 editable: false, width: 400},
						{headerName: '센터'   ,	field: 'CENT_CD',		colId: 'CENT_CD',	 editable: false, width: 400},
						{headerName: '직책'  ,	field: 'AUTH_LV',		colId: 'AUTH_LV',	 editable: false, width: 400, resizable: false},
					],
				},
				grdUserChk : {
					id : 'grdUserChk',
					areaName : '선택된 사용자',
					header: [
						{headerName: '사번'   ,	field: 'CODE',	        colId: 'CODE',       editable: false, width: 400},
						{headerName: '성명'   ,	field: 'CODE_NM',		colId: 'CODE_NM',	 editable: false, width: 400},
						{headerName: '센터'   ,	field: 'CENT_CD',		colId: 'CENT_CD',	 editable: false, width: 400},
						{headerName: '직책'  ,	field: 'AUTH_LV',		colId: 'AUTH_LV',	 editable: false, width: 400, resizable: false},
					],
				},
			}
		}
   }
   /*------------------------------------------------------------------------------------------------*/
   // [2. OnLoad Event Zone]
   /*------------------------------------------------------------------------------------------------*/
	componentDidMount () {

	}

   /*------------------------------------------------------------------------------------------------*/
   // [3. validation Event Zone]
   //  - validation 관련 정의
   /*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STA020000_R01':
			
			break;
		
		default : break;
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

		try {
			switch (serviceid) {
			case 'STA020000_R01' :
				transManager.setTransId(serviceid);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STA.R_getQAVlaStaCode",
					datasetsend:"dsSrchStaCode",
					datasetrecv:"dsSvrStatCodeInfo"
				});
				
				transManager.addDataset('dsSrchStaCode', [{}]);					
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
		
		switch (res.id) {
		case 'STA020000_R01':

			break;
	
		default : break;
		}
	}

   /*------------------------------------------------------------------------------------------------*/
   // [6. event Zone]
   //  - 각 Component의 event 처리
   /*------------------------------------------------------------------------------------------------*/
	event = {
		button: {
			onClick: (e) => {
				


				switch (e.target.id) {
				case 'btnSearch':
					let arrInitUser = [];
					let sessionUser = ComLib.getSession("gdsUserList");
					let sessionCent = ComLib.getSession("gdsCentList");

					ComLib.setStateInitRecords(this, "dsUserList", sessionUser);

					break;

				case 'btnConfrim':
					this.props.onClose('TEST');
					
					break;
					
				default : break;
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
		grid: {
			onGridReady : (e) => {
				switch (e.id) {
				case "grdUser":
					this.userGridApi = e.gridApi;
					this.userGrid    = e.grid;

					break;

				case "grdUserChk":
					this.userChkGridApi = e.gridApi;
					this.userChkGrid    = e.grid;;

					break;

				default: break
				}
				
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case 'grdVlaItem':
					break;
							
				default: break;
				}
			},
			onRowSelected: (e) => {				
				let userRecords    = this.userGrid.gridDataset.records;				
				let userChkRecords = this.userChkGrid.gridDataset.records;
				switch (e.id) {
				case "grdUser":
					userChkRecords.push(e.data)

					ComLib.setStateInitRecords(this, "dsUserChkList", userChkRecords);

					break;

				case "grdUserChk":
					console.log(this.userChkGrid.gridDataset.records[e.index])
					 
					break;

				default: break
				}				
			}
		}
	}

   /*------------------------------------------------------------------------------------------------*/
   // [7. render Zone]
   //  - 화면 관련 내용 작성
   /*------------------------------------------------------------------------------------------------*/

	render () {	
		let { type } = this.props.options;			
		return (
			<React.Fragment>
				<FullPanel>
					<ComponentPanel>
						<RelativeGroup>
							<LFloatArea>
								<FlexPanel>
									<Label value="성명/사번"/>
									<Textfield
										width       = {300}
										id          = {this.state.textFieldProps.iptUser.id}
										name        = {this.state.textFieldProps.iptUser.name}
										value       = {this.state.textFieldProps.iptUser.value}
										placeholder = {this.state.textFieldProps.iptUser.placeholder}
										minLength   = {this.state.textFieldProps.iptUser.minLength}
										maxLength   = {this.state.textFieldProps.iptUser.maxLength}
										readOnly    = {this.state.textFieldProps.iptUser.readOnly}
										disabled    = {this.state.textFieldProps.iptUser.disabled}
										onChange    = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>
									<Button
										id       = {this.state.btnProps.btnSearch.id}
										value    = {this.state.btnProps.btnSearch.value}
										disabled = {this.state.btnProps.btnSearch.disabled}
										hidden   = {this.state.btnProps.btnSearch.hidden}
										onClick  = {this.event.button.onClick}
										mr       = {20}
									/>
								</FlexPanel>
							</LFloatArea>							
						</RelativeGroup>	
					</ComponentPanel>
						<ComponentPanel>
							<RelativeGroup>
								<Grid						
									id        = {this.state.grdProps.grdUser.id} 
									areaName  = {type === 'searchUser' ? "사용자" : "개발자"}
									header    = {this.state.grdProps.grdUser.header}
									data      = {this.state.dsUserList}
									height    = {type === 'searchUser' || type === 'searchDev' ? "250px" : "500px"}
									addRowBtn = {false}
									delRowBtn = {false}
									infoCheckBox = {{use : true}}
									onGridReady  = {this.event.grid.onGridReady}
									onRowClicked = {this.event.grid.onRowClicked}
									onRowSelected = {this.event.grid.onRowSelected}
									suppressRowClickSelection = { type === 'searchUser' || type === 'searchDev' ? true :false}
									rowSelection = { type === 'searchUser' || type === 'searchDev' ? 'multiple' :'single'}
								/>

								{ type === 'searchUser' || type === 'searchDev' ? 
									<Grid						
										id        = {this.state.grdProps.grdUserChk.id} 
										areaName  = {type === 'searchUser' ? "선택된 사용자" : "선택된 개발자"}
										header    = {this.state.grdProps.grdUserChk.header}
										data      = {this.state.dsUserChkList}
										height    = "250px"
										addRowBtn = {false}
										delRowBtn = {false}
										infoCheckBox = {{use : true}}
										onGridReady  = {this.event.grid.onGridReady}
										onRowClicked = {this.event.grid.onRowClicked}
										onRowSelected = {this.event.grid.onRowSelected}
									/>
									:
									null
								}
								<RFloatArea>	
									<Button
										id       = {this.state.btnProps.btnConfrim.id}
										value    = {this.state.btnProps.btnConfrim.value}
										disabled = {this.state.btnProps.btnConfrim.disabled}
										hidden   = {this.state.btnProps.btnConfrim.hidden}
										onClick  = {this.event.button.onClick}
										mr       = {20}
									/>
								</RFloatArea>	
							</RelativeGroup>
						</ComponentPanel>			
				</FullPanel>
			</React.Fragment>
			)
	}
}

export default View;