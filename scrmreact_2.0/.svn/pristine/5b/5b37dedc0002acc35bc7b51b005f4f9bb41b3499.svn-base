// 오인식문장관리
import React from 'react';
import {
	FullPanel, RFloatArea, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {Label} from 'components';
import {Grid} from 'components';
import {ComLib, DataLib, TransManager} from 'common';

class View extends React.Component {
	constructor(props) {
		super();

		this.state = {
			dsTrainHistory : DataLib.datalist.getInstance()
		}
	}
	componentDidMount () {
		this.transaction('STT030003_R01')
		ComLib.setStateInitRecords(this, "dsTrainHistory", this.props.options.dsTrainHistory);
		
		console.log(this.props)
		console.log(this.props.options.dsTrainHistory)
		console.log(this.state.dsTrainHistory)
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
			case 'STT030003_R01':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.read,
					sqlmapid:"STT.R_getTrainHistory",
					datasetsend:"dsSearch",
					datasetrecv:"dsTrainHistory",
				});
					
				let monthRangeArr = ComLib.getCommCodeList('TRAIN_LOG_MONTH');

				transManager.addDataset('dsSearch', [{MONTH_RANGE: monthRangeArr[0].CODE}]);
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
		case 'STT030003_R01':
			let dsTrainHistory = res.data.dsTrainHistory;

			ComLib.setStateInitRecords(this, "dsTrainHistory", dsTrainHistory);

			break;

		default : break;
		}
	}
	render () {
		return (
			<React.Fragment>
				<FullPanel>
					<RelativeGroup>
						<RFloatArea>
							<Label value="최근 3개월 학습 로그만 표시합니다."/>
						</RFloatArea>
					</RelativeGroup>
					<Grid
						areaName = {'학습 로그'}		
						id       = {'grdTrainHistory'}
						height   = "300px"
						data     = {this.state.dsTrainHistory}
						header = {
							[						  		
								{headerName:  '학습일자',	field: 'TRN_DTM',		 colId: 'TRN_DTM',		editable: false}
								,{headerName: '타이틀',	field: 'TRN_TITLE',			colId: 'TRN_TITLE',		editable: false }
								,{headerName: '작업상태',	field: 'TRN_STATE',			colId: 'TRN_STATE',		editable: false,
									cellEditorParams: { values : ComLib.getComCodeValue('STT_TBL_TRAIN', 'TRN_STATE')},
									valueFormatter : (params) => { return ComLib.getComCodeName('STT_TBL_TRAIN', params.value, 'TRN_STATE')}}
							]
						}
						addRowBtn   = {false}
						delRowBtn   = {false}
						dnlExcelBtn = {false}
						rowNum      = {true}	
					/>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;