// 서버관리
import React from 'react';
import {ComponentPanel, FlexPanel, FullPanel, SubFullPanel,SearchPanel, LFloatArea, RFloatArea, RelativeGroup} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {Textfield, Selectbox, Grid} from 'components';
import {ComLib, StrLib, DataLib, newScrmObj, TransManager} from 'common';

class View extends React.Component {
	constructor(props) {
		super();
		this.gridServerApi = null;
		this.gridServer = null;
		
		this.currentRowSvr = '';
		this.state = {
			

			dsSel : DataLib.datalist.getInstance([{USE_FLAG:""}]),
			dsServerList : DataLib.datalist.getInstance(),
			
			btnProps : {
				btnSearch : {
					id       : 'btnSearch',
					disabled : false,
					value    : '조회',
					hidden   : false
				},
				btnSave : {
					id       : 'btnSave',
					disabled : false,
					value    : '저장',
					hidden   : false
				},
			},
			
			textFieldProps : {
				iptServerNm : {
					id          : 'iptServerNm',
					name        : 'iptServerNm',
					value       : '',
					placeholder : '서버호스트/IP',
					minLength   : 1,
					maxLength   : 20,
					readOnly    : false,
					disabled    : false
				}
			},
			gridServer : {
				id : 'gridServer',
				areaName : '서버목록',
				header :
					[
						{headerName: '서버호스트',		field: 'SVR_HST',	colId: 'SVR_HST', cellEditor: 'customEditor', maxLength: 30, type:'code',  editable: true, width :'100', req: true, },
						{headerName: '서버명',		field: 'SVR_CONT',		colId: 'SVR_CONT', cellEditor: 'customEditor',	editable: true, width :'150', req: true, maxLength: 100, },
						{headerName: '서버IP',		field: 'SVR_IP',		colId: 'SVR_IP', cellEditor: 'customEditor',	editable: true, width :'90', req: true, maxLength: 20, },
						{headerName: '사용여부',		field: 'USE_FLAG',		colId: 'USE_FLAG', editable: true, width :'60', req: true,defaultValue : 'Y',textAlign: 'center', singleClickEdit: true,
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')						
						},
						{headerName: '리소스사용여부',		field: 'RESC_USE_FLAG',		colId: 'RESC_USE_FLAG', editable: true, width :'90', req: true,defaultValue : 'Y',textAlign: 'center', singleClickEdit: true,
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')						
						},
						{headerName: '학습사용여부',		field: 'TRN_FLAG',		colId: 'TRN_FLAG', editable: true, width :'80', req: true,defaultValue : 'Y',textAlign: 'center', singleClickEdit: true,
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')						
						},
						// {headerName: '학습고유번호',		field: 'TRN_UNQ',		colId: 'TRN_UNQ', cellEditor: 'customEditor',	editable: true, width :'90', req: true, maxLength: 20, },
						{headerName: '학습여부',		field: 'TRN_STATE',		colId: 'TRN_STATE', editable: false, width :'60', defaultValue : 'N',textAlign: 'center',
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'TRN_STATE')						
						},
						{headerName: '검색사전사용여부',		field: 'SCH_DIC_USE_FLAG',		colId: 'SCH_DIC_USE_FLAG', editable: true, width :'90', req: true,defaultValue : 'Y',textAlign: 'center', singleClickEdit: true,
							cellEditor: 'agSelectCellEditor',
							cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')						
						},
						{headerName: '검색사전적용여부',		field: 'SCH_DIC_STATE',		colId: 'SCH_DIC_STATE', editable: false, width :'90', defaultValue : 'N',textAlign: 'center',
							valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'APY_FLAG')						
						}
					],
					
			},
		}
		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);
		this.event.input.onChange   = this.event.input.onChange.bind(this);
		this.event.grid.onInsertRow = this.event.grid.onInsertRow.bind(this);
	}
	/*------------------------------------------------------------------------------------------------*
		1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
		=> 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	 ------------------------------------------------------------------------------------------------*/
	 componentDidMount () {
		if (this.validation("SUP060000_R01")) this.transaction("SUP060000_R01");
	}
/*------------------------------------------------------------------------------------------------*
		2) componentDidUpdate () => 갱신이 일어나 직후에 호춮 (최초 렌더링 시에는 호출되지 않음)
		=> prevProps와 현재 props를 비교할 수 있음 -> 조건문으로 감싸지 않고 setState를 실행할 시, 무한 반복 가능성 -> 반드시 setState를 쓰려면 조건문으로 작성
	 ------------------------------------------------------------------------------------------------*/
	 componentDidUpdate (prevProps, prevState, snapshot) {
		//console.log("updated!!");
		//console.log(this.state.dsGrp);
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
	validation = (serviceid) => {
		let chkCnt  = 0;
		let returnVal = -1;
		switch(serviceid) {
		case 'SUP060000_R01':
			break;
		case 'SUP060000_H01':
			let serverRecords = this.gridServer.gridDataset.records;

			outer : for ( let intA = 0; intA < serverRecords.length; intA ++ ) {
				if (serverRecords[intA].rowtype !== newScrmObj.constants.crud.read) {
					chkCnt ++;
				}	

				let serverHeader = this.state.gridServer.header.filter(item => item['req'] === true); //filter
				
				for (let i = 0; i < serverHeader.length; i ++) {
					if (StrLib.isNull(serverRecords[intA][serverHeader[i].field])) {
						
						ComLib.openDialog('A', 'COME0001',[Number(intA + 1), serverHeader[i].headerName.replace(/\*/g,'')]);//입력해주기시바랍니다
	
						returnVal = intA;

						break outer;
					}
				}

				for ( let intB = 0; intB < serverRecords.length; intB ++ ) {
					if (intA !== intB && serverRecords[intA].SVR_HST === serverRecords[intB].SVR_HST) {
						//중복되었습니다
						ComLib.openDialog('A', 'COME0012', [Number(intA + 1), Number(intB + 1), '서버호스트']);
						
						this.gridServer.moveRow(intB, true);
			
						return false;
					}
					if (intA !== intB && serverRecords[intA].SVR_IP === serverRecords[intB].SVR_IP) {
						//중복되었습니다
						ComLib.openDialog('A', 'COME0012', [Number(intA + 1), Number(intB + 1), '서버 IP']);
						
						this.gridServer.moveRow(intB, true);
			
						return false;
					}
				}									
			}

			if (returnVal > -1) {
				this.gridServer.moveRow(returnVal, true);
			
				return false;
			}

			if (serverRecords.length < 1 || chkCnt === 0) {
				ComLib.openDialog('A', 'COME0005');//변경된 행이 없습니다

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
	/*------------------------------------------------------------------------------------------------*/
	transaction = (serviceid) => {
		let transManager = new TransManager();
		try  {
			switch (serviceid) {
			case 'SUP060000_R01':
				transManager.setTransId (serviceid);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);
				transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "SUP.R_getServerList",
					datasetsend: "dsSearchParam",
					datasetrecv: "dsServerListRecv",
				});
				transManager.addDataset('dsSearchParam', [{
					"SVR_HST_NAME": this.state.textFieldProps.iptServerNm.value,
					"USE_FLAG": this.state.dsSel.records[0]["USE_FLAG"]}]);
				transManager.agent();
				break;
			case 'SUP060000_H01':
				transManager.setTransId (serviceid);
				transManager.setTransUrl(transManager.constants.url.common);
				transManager.setCallBack(this.callback);
					transManager.addConfig  ({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.handle,
					sqlmapid   : "SUP.H_handleServerList",
					datasetsend: "dsServerList",
				});
				
				transManager.addDataset('dsServerList', this.gridServer.gridDataset.getTransRecords(newScrmObj.constants.rowtype.CREATE_OR_UPDATE));
				transManager.agent();
				break;
			default: break;
			}
		}	catch (err) {
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {
		switch (res.id) {
		case 'SUP060000_R01':
			if(res.data.dsServerListRecv.length > 0) {
				ComLib.setStateInitRecords(this, "dsServerList", res.data.dsServerListRecv);		
			}
			else {
				ComLib.setStateRecords(this, "dsServerList", []);
			}
			break;
		case 'SUP060000_H01':
			ComLib.openDialog('A', 'COMI0001', '서버 리스트');//정상적으로 저장되었습니다
			this.transaction('SUP060000_R01');
			break;
		default: break;
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		button : {
			onClick : (e) => {
				
				switch (e.target.id) {
					case "btnSearch": 
						if(this.validation("SUP060000_R01")) this.transaction("SUP060000_R01");
						break;
					case "btnSave":
						if (this.validation("SUP060000_H01")) this.transaction('SUP060000_H01');	
						break;
					default: break;
	
					}
				}
			
		},

		input : {
			onChange : (e) => {
				switch(e.target.id) {
				case 'iptServerNm':
					let state = this.state;
					state['textFieldProps']['iptServerNm'].value = e.target.value;
					this.setState(state);
					break;
				default: break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptServerNm':
					if (e.key === 'Enter') {
						if (this.validation("SUP060000_R01")) this.transaction("SUP060000_R01");
					}
					
					break;

				default: break;
				}
			}
		},
		grid : {
			onGridReady : (e) => {

				switch(e.id) {
				case "gridServer":
					this.gridServerApi = e.gridApi;
					this.gridServer = e.grid;
					break;
				default: break
				}
			
			},
			onRowClicked: (e) => {
	
			},
			onCellClicked: (e) => {

			},
			onCellDoubleClicked: (e) => {
				
			},
			onCellValueChanged: (e) => {
				if(e.col === "SVR_HST") {
					if(this.gridServer.gridDataset.records[e.index].rowtype !== newScrmObj.constants.crud.create) {
						ComLib.openDialog('A', 'COME0013',['서버 호스트']);//변경할수없습니다

						this.gridServer.gridDataset.setValue(e.index , e.col, e.oldValue);
						this.gridServerApi.setRowData(this.gridServer.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
					}
				}
				
				
			},
			onRowDoubleClicked: (e) => {
	
			},
			onCellEditingStopped: (e) => {
		
			},
			onSelectionChanged: (e) => {
		
			},
			onRowSelected: (e) => {

			},
			onDeleteRow: (e) => {

			},
			onInsertRow : (e) => {
		
			}
		},
		selectbox : {
			onChange : (e) => {
				console.log(e.id);
				switch (e.id) {
				case 'useYn': 
					ComLib.setStateValue(this, "dsSel", 0, "USE_FLAG", e.target.value);
					break;
				default: break;

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
									<Label value="서버호스트/코드명"/>
									<Textfield 
										width={200}
										id = {this.state.textFieldProps.iptServerNm.id}
										name =  {this.state.textFieldProps.iptServerNm.name}
										value =  {this.state.textFieldProps.iptServerNm.value}
										placeholder =  {this.state.textFieldProps.iptServerNm.placeholder}
										minLength =   {this.state.textFieldProps.iptServerNm.minLength}
										maxLength =   {this.state.textFieldProps.iptServerNm.maxLength}
										readOnly =  {this.state.textFieldProps.iptServerNm.readOnly}
										disabled =  {this.state.textFieldProps.iptServerNm.disabled}
										onChange = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>
									<Label value="사용여부"/>
									<Selectbox
										id = {"useYn"}
										dataset = {ComLib.convComboList(ComLib.getCommCodeList('CMN', 'USE_FLAG'), newScrmObj.constants.select.argument.all)}
										value = {this.state.dsSel.records[0]["USE_FLAG"]}
										width = {200}
										disabled = {false}
										onChange = {this.event.selectbox.onChange}
									/>
								</FlexPanel>
							</LFloatArea>
							<RFloatArea>
								<Button 			
										id = {this.state.btnProps.btnSearch.id}
										value = {this.state.btnProps.btnSearch.value}
										disabled = {this.state.btnProps.btnSearch.disabled}
										hidden = {this.state.btnProps.btnSearch.hidden}
										onClick = {this.event.button.onClick}
										color="blue" fiiled="o" innerImage={true} icon = {'srch'} mt="5px"		
								/>
							</RFloatArea>
						</RelativeGroup>
						</SearchPanel>
					<SubFullPanel>
						<ComponentPanel>
							<Grid
								id = {this.state.gridServer.id}
								height= "600px"
								data = {this.state.dsServerList}
								areaName = {this.state.gridServer.areaName}
								header = {this.state.gridServer.header}
								rowNum = {true}
								
								onGridReady = {this.event.grid.onGridReady}
								onRowClicked = {this.event.grid.onRowClicked}
								onCellClicked = {this.event.grid.onCellClicked}
								onCellDoubleClicked = {this.event.grid.onCellDoubleClicked}
								onCellValueChanged = {this.event.grid.onCellValueChanged}
								onRowDoubleClicked = {this.event.grid.onRowDoubleClicked}
								onCellEditingStopped = {this.event.grid.onCellEditingStopped}
								onSelectionChanged = {this.event.grid.onSelectionChanged}
								onRowSelected = {this.event.grid.onRowSelected}
								onDeleteRow = {this.event.grid.onDeleteRow}
								onInsertRow = {this.event.grid.onInsertRow}
							/>
							<RelativeGroup>
								<RFloatArea>								
									<Button 		
										id = {this.state.btnProps.btnSave.id}
										value = {this.state.btnProps.btnSave.value}
										disabled = {this.state.btnProps.btnSave.disabled}
										hidden = {this.state.btnProps.btnSave.hidden}
										onClick = {this.event.button.onClick}
										color="purple" fiiled="o"  mt="5px"
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

export default View;