import React from 'react';
import {SubFullPanel, HtmlEditor, CustomSlide as Slide} from 'components';
import {Grid} from 'components';
import {ComLib, DateLib, DataLib, StrLib, TransManager} from 'common';

class View extends React.Component {
	/*------------------------------------------------------------------------------------------------*/
	// [1. Default State Zone] 
	/*------------------------------------------------------------------------------------------------*/
	constructor(props) {
		super(props);
		this.state = {
			srchFileParam : '',
			dsNoteInfo : [],
			dsNoteFileInfo : [],
			dsModifyInfo : { BORD_MNG_NO: '', TITLE: '', VALD_DT : DateLib.getToday(), CONT: '', CONT_DV: '', REG_CENT: '', DEL_YN : '', REG_DTM : '', REG_ID : '' , CHG_ID: '', CHG_DTM: ''}
		}
		this.event.grid.onRowClicked = this.event.grid.onRowClicked.bind(this);
	}
	/*------------------------------------------------------------------------------------------------*/
	// [2. OnLoad Event Zone]
	/*------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		this.transaction('COM010010_R01');
	}
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (id) => {
		switch (id) {
			case 'COM010010_R01' :
				this.transaction('COM010010_R01');
				break;
			default :
				break;
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (transId) => {
		let transManager = new TransManager();
		try  {
			switch (transId) {
				case 'COM010010_R01' :
					transManager.setTransId(transId);
					transManager.setTransId(transId);
					transManager.setTransUrl(transManager.constants.url.common);
					transManager.setCallBack(this.callback);
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid:"COM.R_getNoteInfo",
						datasetsend:"dsSrchNoteInfo",
						datasetrecv:"dsNoteInfo"
					});
					transManager.addDataset('dsSrchNoteInfo', [{ SRCH_YN : 'Y' }]);
					transManager.agent();
					break;
					
				case 'COM010010_R02' :
					transManager.setTransId(transId);
					transManager.setTransUrl(transManager.constants.url.common);
					transManager.setCallBack(this.callback);
					transManager.addConfig({
						dao: transManager.constants.dao.base,
						crudh: transManager.constants.crudh.read,
						sqlmapid:"COM.R_getNoteFileInfo",
						datasetsend:"dsSrchNoteFileInfo",
						datasetrecv:"dsNoteFileInfo"
					});
					transManager.addDataset('dsSrchNoteFileInfo', [{BORD_MNG_NO : this.state.srchFileParam}]);
					transManager.agent();
					break;
				default :
					break;
			}
		} catch (err) {
			console.log(err);
			alert(err);
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {
		switch (res.id) {
			case 'COM010010_R01' : 
				this.setState({
						...this.state,
						dsNoteInfo : res.data.dsNoteInfo,
						dsNoteFileInfo : [],
						dsModifyInfo : { TITLE: '', VALD_DT : DateLib.getToday(), CONT: '', CONT_DV: '', DEL_YN : '', REG_DT : '', REG_USR : '' , MFY_ER: '', MFY_DT: ''}
				});
				break;
			case 'COM010010_R02' : 
				this.setState({...this.state, dsNoteFileInfo : res.data.dsNoteFileInfo});
				break;
			default :  break;
		}
	}
	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		grid : {
			onRowClicked  : (e) => {
				switch (e.id) {
					case 'grdNoteInfo' :
						this.setState({ 
							...this.state
							,   dsModifyInfo : Object.assign(this.state.dsModifyInfo, DataLib.getRowJSON(e.index, this.state.dsNoteInfo))
							,   srchFileParam : e.data.BORD_MNG_NO
						}, () => this.transaction('COM010010_R02'));
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
				<SubFullPanel>
					<Grid   id = 'grdNoteInfo' ref='grdNoteInfo' height="200px"
							header = {[
								{   headerName : 'No',          field : 'BORD_MNG_NO',  colId : 'BORD_MNG_NO',  width: 80      },
								{   headerName : '등록일자',    field : 'REG_DTM',      colId : 'REG_DTM',      width: 120,
									valueFormatter : (param) =>  StrLib.getFormatterDate(param.value)                           },
								{   headerName : '유효일자',    field : 'VALD_DT',      colId : 'VALD_DT',      width: 120,        
									valueFormatter : (param) =>  StrLib.getFormatterDate(param.value)                           },
								{   headerName : '제목',        field : 'TITLE',        colId : 'TITLE',        width: 200      },
								{   headerName : '내용구분',    field : 'CONT_DV',      colId : 'CONT_DV',      width: 120,
									cellEditor: 'agSelectCellEditor', 
									cellEditorParams: { values : ComLib.setGridComCodeComboCellVal('106') },
									valueFormatter : (param) => ComLib.setGridComCodeComboCellNm(param.value, '106')            },
								{   headerName : '등록센터',    field : 'CENT_NM',      colId : 'CENT_NM',     width: 120       },
								{   headerName : '등록자',      field : 'REG_ID',       colId : 'REG_ID',      width: 110       }
							]}
							data = {this.state.dsNoteInfo}
							onRowClicked = {this.event.grid.onRowClicked}
					/>
				</SubFullPanel>
				<SubFullPanel>
					<HtmlEditor id="iptNoteCont"  value={this.state.dsModifyInfo.CONT} readOnly={true} toolbarHidden={true} height={320}/>
				</SubFullPanel>
				<SubFullPanel>
					{(this.state.dsNoteFileInfo.length !== 0) ? <Slide data={this.state.dsNoteFileInfo} height={150}></Slide> : <span>{'조회된 파일 없습니다.'}</span> }
				</SubFullPanel>
			</React.Fragment>
		);
	}
}
export default View;