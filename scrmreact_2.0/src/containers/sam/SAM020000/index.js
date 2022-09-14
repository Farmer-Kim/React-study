// 사용자관리
import React from "react";
import { ComponentPanel
	   , FlexPanel
	   , FullPanel
	   , SubFullPanel
	   , LFloatArea
	   , RFloatArea
	   , RelativeGroup
	   , SearchPanel   } from "components";
import { BasicButton as Button
	   , Label
	   , Grid
	   , Textfield 
	   , Selectbox 
	   , TreeSelectbox } from "components";
import { ComLib
	   , DataLib
	   , TransManager
	   , newScrmObj    } from "common";

class SYS020000 extends React.Component {
	constructor(props) {
		super(props);
		this.userGrid = null;

		this.lastEdited = "";
		
		this.grdUserList_header = [
			{headerName: "조직명",		field: "ORG_NM",	colId: "ORG_NM", 	editable: false,	width: 120},
			{headerName: "사용자ID",	field: "USR_CD",	colId: "USR_CD",	editable: false,	width: 100},
			{headerName: "사용자명",	field: "USR_NM",	colId: "USR_NM",	editable: false,	width: 120},
			{headerName: "권한",		field: "AUTH_NM",	colId: "AUTH_NM", 	editable: false,	width: 100},
			{headerName: "사용여부",	field: "USE_YN_NM",	colId: "USE_YN_NM", editable: false,	width: 50, textAlign: "center"},
			{headerName: "등록일시",	field: "REG_DTM",	colId: "REG_DTM", 	editable: false,	width: 80, textAlign: "center", resizable: false},
		]
		this.state = {
			dsSrch            : {ORG_ID: "", AUTH_LV: "", SRCH_DV: "NM", SRCH_VALUE: ""},
			dsUserList        : DataLib.datalist.getInstance(),					
			selAuthCd_dataSet : ComLib.getSession("gdsUserInfo")[0]["AUTH_LV"] !== 1 ? ComLib.convComboList(ComLib.getCommCodeList("AUTH_LV"), newScrmObj.constants.select.argument.select).filter(item => item.value !== "1") : ComLib.convComboList(ComLib.getCommCodeList("AUTH_LV"), newScrmObj.constants.select.argument.select)
		}
	}	
	/*------------------------------------------------------------------------------------------------*/
	// 1) componentDidMount ()
	/*------------------------------------------------------------------------------------------------*/
	componentDidMount () { 
		this.transaction("SYS020000_R01");
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (serviceid) => {
		const transManager = new TransManager();

		transManager.setTransId (serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		transManager.addConfig  ({
			crudh      : transManager.constants.crudh.read,
			sqlmapid   : "SYS.R_getSampleUserList",
			datasetsend: "dsSend",
			datasetrecv: "dsUserList",
		});
		
		const schRecord = this.state.dsSrch;
		const param = [{
			ORG_ID    : schRecord.ORG_ID,
			AUTH_CD   : schRecord.AUTH_CD,
			SRCH_DV   : schRecord.SRCH_DV,
			SRCH_VALUE: schRecord.SRCH_VALUE.trim(),
		}];
		
		transManager.addDataset("dsSend", param);
		transManager.agent();

	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {		
		const dsUserList = res.data.dsUserList;
		ComLib.setStateInitRecords(this, "dsUserList", dsUserList);
		
		if (dsUserList.length > 0 && this.lastEdited !== "") {		
			for (let intA = 0; intA < dsUserList.length; intA ++) {			
				if (this.lastEdited === dsUserList[intA].USR_CD) {
					this.userGrid.moveRow(intA, true);
					break;
				}
			}				
		}		
	}
	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		multiSelectbox: {
			onChange: (e) => {
				this.setState({dsSrch: {...this.state.dsSrch, ORG_ID: e.rowId}});
				
			}
		},
		button: {
			onClick: () => {
				this.transaction("SYS020000_R01");
			}
		},
		grid: {
			onGridReady: (e) => {
				this.userGrid    = e.grid;

			},
			onBeforeInsertRow: (e) => {				
				const param  = {id: "test", records: [{USR_CD: "", USR_NM: "", AUTH_LV: "", CENT_CD: "", TEAM_CD: "", USE_YN: "Y"}], authList: this.state.selAuthCd_dataSet, isNew: true};
				const option = {width: "600px", height: "300px", modaless: false, param: param}
				
				ComLib.openPop("SYS020001", "신규 사용자 등록", option, this.event.grid.afterAddUser)

				return {rtn:false};
			},
			afterAddUser: (e) => {
				this.lastEdited = e.data.USR_CD;

				this.transaction("SYS020000_R01");
			},			
			onRowClicked: (e) => {	
				if (e.node.selected !== true) {
					e.node.setSelected(true);
				}
			},
			onCellDoubleClicked: (e) => {
				const param  = {id: "test", records: [e.data], authList: this.state.selAuthCd_dataSet, isNew: false};
				const option = {width: "600px", height: "300px", modaless: false, param: param}
				ComLib.openPop("SYS020001", "사용자 정보 변경", option, this.event.grid.afterAddUser)
			}
		},
		input: {
			onChange: (e) => {				
				this.setState({dsSrch: {...this.state.dsSrch, SRCH_VALUE: e.target.value}});
			},         
			onKeyPress: (e) => {
				if (e.key === 'Enter') {
					this.transaction("SYS020000_R01")
				} 
			}
		},
		selectbox: {
			onChange: (e) => {
				switch (e.id) {
				case "selSrchCent": 
					this.setState({dsSrch: {...this.state.dsSrch, CENT_CD: e.target.value, TEAM_CD: ""}});

					break;

				case "selSrchTeam":
					this.setState({dsSrch: {...this.state.dsSrch, TEAM_CD: e.target.value}});

					break;

				case "selSrchAuth":
					this.setState({dsSrch: {...this.state.dsSrch, AUTH_LV: e.target.value}});

					break;

				case "selSrchDv":
					this.setState({dsSrch: {...this.state.dsSrch, SRCH_DV: e.target.value}});

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
		const schParm = this.state.dsSrch;		
		const {input, selectbox, button, grid, multiSelectbox} = this.event;
		const {argument} = newScrmObj.constants.select;
		
		return (
			<React.Fragment>
				<FullPanel>
					<SearchPanel>
						<RelativeGroup>
							<LFloatArea>
								<FlexPanel>
									<Label value="조직"/>
									<TreeSelectbox
										id 		 = {"treSelOrg"} 
										data 	 = {ComLib.convOrgList("all")} 
										onChange = {multiSelectbox.onChange}
										placeholder= {"전체"}
										value    = {schParm.ORG_ID}		
									/>
									<Label value="권한"/>
									<Selectbox
										id       = {"selSrchAuth"}
										value    = {schParm.AUTH_LV}
										width    = {"200px"}
										dataset  = {ComLib.convComboList(ComLib.getCommCodeList("AUTH_LV"), argument.all)}
										onChange = {selectbox.onChange}
									/>
									<Label value="사용자"/>
									<Selectbox
										id       = {"selSrchDv"}
										value    = {schParm.SRCH_DV}
										width    = {"200px"}
										dataset  = {[{value: "NM", name: "성명"},{value: "ID", name: "ID"}]}
										onChange = {selectbox.onChange}
									/>
									<Textfield 
										id          = {"iptSrchword"}
										name        = {"iptSrchword"}
										value       = {schParm.SRCH_VALUE}
										width       = {"200px"}
										placeholder = {"성명/ID"}
										minLength   = {1}
										maxLength   = {20}
										onChange    = {input.onChange}
										onKeyPress  = {input.onKeyPress}
									/>
								</FlexPanel>
							</LFloatArea>
							<RFloatArea>
								<Button
									id      = {"btnSearch"}
									mt      = {5}
									icon    = {"srch"}  
									color   = {"blue"} 
									value   = {"조회"}
									fiiled  = {"o"}
									onClick = {button.onClick}
								/>
							</RFloatArea>
						</RelativeGroup>
					</SearchPanel>
					<SubFullPanel>
						<ComponentPanel>
							<Grid
								id        = {"grdUserList"} 
								data      = {this.state.dsUserList}
								header    = {this.grdUserList_header}
								height    = {"620px"} 
								areaName  = {"사용자 목록"}
								rowNum    = {true}		
								delRowBtn = {false}

								onBeforeInsertRow  = {grid.onBeforeInsertRow}
								onGridReady        = {grid.onGridReady}	
								onRowClicked       = {grid.onRowClicked}
								onCellDoubleClicked= {grid.onCellDoubleClicked}
							/>							
						</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}
export default SYS020000;