// 상담원관리
import React from 'react';
import {ComponentPanel, FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup, SearchPanel} from 'components'; //버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {Checkbox, Textfield, Selectbox} from 'components';
import {Grid, Table} from 'components';
import {ComLib, DataLib, newScrmObj, TransManager, StrLib} from 'common';

class View extends React.Component {
	constructor(props) {
		super(props);

		this.csGrid = null;
		this.csGridApi = null;
		this.password = '';
		this.clickBtnId = '';
		this.state = {
			dsSrch: DataLib.datalist.getInstance([{CENT_CD: ComLib.setOrgComboValue("CENT_CD"), TEAM_CD: "", SRCH_DV: "NM", SRCH_VALUE: ""}]),
			dsConstList : DataLib.datalist.getInstance(),
			
			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
			},
			cmbSrchDv_dataset : [
				{value : 'NM', name : '성명'},
				{value : 'CD', name : 'CD'}
			],
			textFieldProps : {
				iptSrchword : {
					id          : 'iptSrchword',
					name        : 'iptSrchword',
					value       : '',
					placeholder : '성명/CD',
					minLength   : 1,
					maxLength   : 20,
					readOnly    : false,
					disabled    : false
				},
			},
			gridProps : {
				id : 'grdCsList',
				areaName : '상당원 목록',
				header: [
					{headerName: '센터',		field: 'CENT_NM',		colId: 'CENT_NM', 		editable: false,	width: 100},
					{headerName: '팀',			field: 'TEAM_NM',		colId: 'TEAM_NM',		editable: false,	width: 100},
					{headerName: '상담원CD',	field: 'CONST_CD',		colId: 'CONST_CD',		editable: false,	width: 100},
					{headerName: '상담원명',	field: 'CONST_NM',		colId: 'CONST_NM',		editable: false,	width: 100, textAlign: 'center'},
					{headerName: '내선번호',	field: 'EXT_NUM',		colId: 'EXT_NUM',		editable: false,	width: 100},
					{headerName: '사용여부',	field: 'USE_FLAG_NM',	colId: 'USE_FLAG_NM', 	editable: false,	width: 50, textAlign: 'center'},
					{headerName: '등록/수정자',	field: 'REG_USR_ID',	colId: 'REG_USR_ID', 	editable: false,	width: 100, textAlign: 'center'},
					{headerName: '등록/수정 일시',	field: 'REG_DTM',	 colId: 'REG_DTM', 	    editable: false,	width: 100, textAlign: 'center'},
				],				
				paging : {
					start: 0,
					size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
					page : 1,
					loading: false
				},
			}
		}

		// 이벤트 바인딩
		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);
	}
	
	/*------------------------------------------------------------------------------------------------*/
	// 1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
	// => 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	/*------------------------------------------------------------------------------------------------*/
	componentDidMount () { // 조회
		if(this.validation("SYS030000_R01")) this.transaction("SYS030000_R01");
	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
			case 'SYS030000_R01' :
				break;
			default :
				break;
		}

		return true;
	}
	handler = {
		setDs : (transId) => {
			switch (transId) {
			case "SYS030000_R01" :
				let state = this.state;

				state['gridProps']['paging'].start = 0;
				state['gridProps']['paging'].page = 1;

				this.setState(state, () => {
					this.transaction('SYS030000_R01');
				});
				break;
			default: break;
			}
		}
	}

	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (serviceid) => {
		let transManager = new TransManager();

		transManager.setTransId (serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);
		
		let state       = this.state;	
		
		let pageStart   = state['gridProps']['paging'].start;
		let pageLimit   = state['gridProps']['paging'].size;

		try  {
			switch (serviceid) {
				case 'SYS030000_R01' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "SYS.R_getConstList",
						datasetsend: "dsSend",
						datasetrecv: "dsConstList",
					});

					let param = {
						CENT_CD    : state.dsSrch.records[0]["CENT_CD"],
						TEAM_CD    : state.dsSrch.records[0]["TEAM_CD"],
						SRCH_DV    : state.dsSrch.records[0]["SRCH_DV"],
						SRCH_VALUE : state.dsSrch.records[0]["SRCH_VALUE"].trim(),						
						QUERY_START: pageStart,
						QUERY_LIMIT: pageLimit,
					};

					state.lastdsSrch = state.dsSrch;

					this.setState(state);

					transManager.addDataset('dsSend', [ param ]);
					transManager.agent();

					break;

				case 'SYS030000_R02' :
					transManager.addConfig  ({
						dao        : transManager.constants.dao.base,
						crudh      : transManager.constants.crudh.read,
						sqlmapid   : "SYS.R_getConstList",
						datasetsend: "dsSend",
						datasetrecv: "dsConstList",
					});

					let param2 = {
						CENT_CD    : state.lastdsSrch.records[0]["CENT_CD"],
						TEAM_CD    : state.lastdsSrch.records[0]["TEAM_CD"],
						SRCH_DV    : state.lastdsSrch.records[0]["SRCH_DV"],
						SRCH_VALUE : state.lastdsSrch.records[0]["SRCH_VALUE"].trim(),						
						QUERY_START: pageStart,
						QUERY_LIMIT: pageLimit,
					};

					transManager.addDataset('dsSend', [ param2 ]);
					transManager.agent();

					break;

				default :
					break;
			}
		} catch (err) {

		}
	}

	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {
		let state = this.state;
		switch (res.id) {
			case 'SYS030000_R01':
				if (res.data.dsConstList.length > 0) {
					ComLib.setStateInitRecords(this, "dsConstList", res.data.dsConstList);
				} else {
					ComLib.setStateRecords(this, "dsConstList", []);	
				}
				
				state['gridProps']['paging'].loading = false;
				
				this.setState(state);

				break; 

			case 'SYS030000_R02':				
				ComLib.setStateInitRecords(this, "dsConstList", res.data.dsConstList);

				state['gridProps']['paging'].loading = false;
				
				this.setState(state);


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
				this.clickBtnId = e.target.id;
				switch (e.target.id) {
					case "btnSearch" :	// 조회
						if(this.validation("SYS030000_R01")) this.handler.setDs('SYS030000_R01');
						break;
					default : break;
				}
			}
		},
		grid: {
			onBeforeInsertRow: (e) => {				
				let param = {id: 'test', records: [{CONST_CD: "", CONST_NM: "", EXT_NUM: "", CENT_CD: "", TEAM_CD: "", USE_FLAG: "Y"}], isNew: true};
				let option2 = { width: '600px', height: '300px', modaless: false, param: param}
				ComLib.openPop('SYS030001', '신규 상담원 등록', option2, this.event.grid.afterAddCus)

				return {rtn:false};
			},
			afterAddCus: (e) => {
				this.handler.setDs('SYS030000_R01');
			},
			onGridReady : (e) => {
				//this.setState({grdMenuApi : e.gridApi, grdMenu : e.grid});
				switch(e.id) {
					case "grdCsList":
						this.csGridApi = e.gridApi;
						this.csGrid = e.grid;
					break;
					default: break;
				}
			},
			onRowClicked: (e) => {
				// 클릭을 한 번 더 했을 때 그리드에 선택된 인덱스가 풀리지 않도록 하기
				let constRows = this.csGridApi.rowModel.rowsToDisplay;
				let constRow;

				for (let i = 0; i < constRows.length; i ++) {
					if (constRows[i].data.CONST_CD === e.data.CONST_CD){
						constRow = this.csGridApi.rowModel.rowsToDisplay[i];
						break;
					}
				}
				constRow.setSelected(true);
			},
			onCellDoubleClicked: (e) => {
				let param = {id: 'test', records: [e.data], isNew: false};
				let option2 = { width: '600px', height: '300px', modaless: false, param: param}
				ComLib.openPop('SYS030001', '상담원 정보 변경', option2, this.event.grid.afterAddCus)
			},
			onScrollEnd: (e) => {
				if (!this.state.gridProps.paging.loading) {
					this.setState({...this.state
						, gridProps : { ...this.state.gridProps
							, paging : { ...this.state.gridProps.paging
								, start : this.state.gridProps.paging.start + this.state.gridProps.paging.size
								, page : this.state.gridProps.paging.page + 1
								, loading : true
							}
						}
					}, () => {
						this.transaction("SYS030000_R02");
					});
				}
			},
		},
		input : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'iptSrchword' :
					ComLib.setStateValue(this, "dsSrch", 0, "SRCH_VALUE", e.target.value);

					break;


				default : break;
				}
			}
		},
		selectbox: {
			onChange: (e) => {
				switch (e.id) {
				case 'cmbSrchCent' : 
					ComLib.setStateValue(this, "dsSrch", 0, "CENT_CD", e.target.value);
					ComLib.setStateValue(this, "dsSrch", 0, "TEAM_CD", "");

					break;
				case 'cmbSrchTeam' :
					ComLib.setStateValue(this, "dsSrch", 0, "TEAM_CD", e.target.value);

					break;
					
				case 'cmbSrchDv' :
					ComLib.setStateValue(this, "dsSrch", 0, "SRCH_DV", e.target.value);
					break;
				default : break;
				}
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
									<Label value="센터"/>
									<Selectbox
										id = {"cmbSrchCent"}
										dataset = {ComLib.convComboList(ComLib.getCentList(), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSrch.records[0]["CENT_CD"]}
										width = {200}
										disabled = {false}
										controlOrgCombo = {'CENT'}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value="팀"/>
									<Selectbox
										id = {"cmbSrchTeam"}
										dataset = {ComLib.convComboList(ComLib.getTeamList(this.state.dsSrch), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSrch.records[0]["TEAM_CD"]}
										width = {200}
										disabled = {false}
										onChange = {this.event.selectbox.onChange}
									/>
									<Label value="상담원"/>
									<Selectbox
										id = {"cmbSrchDv"}
										value = {this.state.dsSrch.records[0]["SRCH_DV"]}
										dataset = {this.state.cmbSrchDv_dataset}
										width = {200}
										disabled = {false}
										onChange= {this.event.selectbox.onChange}
									/>
									<Textfield 
										id    = {"iptSrchword"}
										name  = {"iptSrchword"}
										value = {this.state.dsSrch.records[0]["SRCH_VALUE"]}
										placeholder = {"이름/아이디"}
										minLength   = {1}
										maxLength   = {20}
										width    = {200}
										readOnly = {false}
										disabled = {false}
										onChange = {this.event.input.onChange}
									/>
								</FlexPanel>
							</LFloatArea>
							<RFloatArea>
								<Button
									color= 'blue' fiiled= {true} innerImage={true} icon = {'srch'}
									id = {this.state.btnProps.btnSearch.id}
									value = {this.state.btnProps.btnSearch.value}
									disabled = {this.state.btnProps.btnSearch.disabled}
									hidden = {this.state.btnProps.btnSearch.hidden}
									onClick = {this.event.button.onClick}
									mt = {5}
								/>
							</RFloatArea>
						</RelativeGroup>
					</SearchPanel>
					<SubFullPanel>
						<ComponentPanel>
							<Grid
								id      = {this.state.gridProps.id} 
								ref     = {this.state.gridProps.id} 
								header  = {this.state.gridProps.header}
								areaName= {this.state.gridProps.areaName}
								height  = "650px"
								delRowBtn = {false}
								rowNum    = {true}				
								paging    = {true}
								infinite  = {true}

								data = {this.state.dsConstList}
								totalRowCnt = {(this.state.dsConstList.getRecords().length === 0) ? 0 : this.state.dsConstList.getValue(0, 'totalcount')}
								
								onBeforeInsertRow  = {this.event.grid.onBeforeInsertRow}
								onGridReady        = {this.event.grid.onGridReady}
								onRowClicked       = {this.event.grid.onRowClicked}
								onScrollEnd        = {this.event.grid.onScrollEnd}
								onCellDoubleClicked= {this.event.grid.onCellDoubleClicked}	
							/>									
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default View;