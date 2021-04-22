// STT 오류 리스트
import React from 'react';
import {
	ComponentPanel, FullPanel, SubFullPanel
} from 'components';
import {Grid} from 'components';
import {ComLib, DataLib, TransManager} from 'common';

class COM010001 extends React.Component {
	constructor(props) {
		super();
		this.state = {
			dsSttErrList : DataLib.datalist.getInstance(),		
			grdProps : {
				grdSttErr : {
					id       : 'grdSttErr',
					areaName : 'STT 오류',
					height   : '400px',
					header   : [
									{headerName: '오류 코드',	 field: 'ERR_CD',	colId: 'ERR_CD', width: 120},
									{headerName: '오류 설명',   field: 'ERR_MSG',	colId: 'ERR_MSG', width: 400},
									{headerName: '오류 횟수',   field: 'ERR_CNT',	colId: 'ERR_CNT', width: 120},
								]
				}
			},	
		}
	}
	componentDidMount () {
		this.transaction("COM010001_R00");
	}
	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (...params) => {		
		let serviceid = params[0];
		let transManager = new TransManager();
		
		transManager.setTransId(serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try {
			switch (serviceid) {
			case 'COM010001_R00':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"COM.R_getSttErr",
					datasetsend:"dsSearch",
					datasetrecv:"dsSttErrListRecv",
				});
				
				transManager.addDataset('dsSearch', [{SVR_HST: this.props.options.params.type}]);
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
		case 'COM010001_R00':
			if (res.data.dsSttErrListRecv.length > 0) {
				let dsSttErrListRecv = res.data.dsSttErrListRecv;

				ComLib.setStateInitRecords(this, "dsSttErrList", dsSttErrListRecv);

			}	

			break;

		default : break;
		}
	}
	render () {
		return (
			<React.Fragment>
				<FullPanel>
					<SubFullPanel>							
							<ComponentPanel>
								<Grid
									id          = {this.state.grdProps.grdSttErr.id} 
									areaName    = {this.state.grdProps.grdSttErr.areaName}
									header      = {this.state.grdProps.grdSttErr.header}
									data        = {this.state.dsSttErrList}
									height      = {this.state.grdProps.grdSttErr.height}
									rowNum      = {true}
									addRowBtn   = {false}
									delRowBtn   = {false}
								/>								
							</ComponentPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default COM010001;