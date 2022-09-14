// STT 학습
import React from 'react';
import {ComponentPanel, FlexPanel, FullPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup} from 'components';
import {BasicButton as Button} from 'components';
import {Grid, Tabs, TabPanel} from 'components';
import {ComLib, DataLib, ExcelLib, TransManager, newScrmObj, StrLib} from 'common';

import ReactFileReader from 'react-file-reader';

import STT050100 from '../STT050100';
import STT050200 from '../STT050200';
import * as excel           from 'xlsx';

class View extends React.Component {
	constructor(props) {
		super();
		this.trainListGridApi = null;
		this.trainListGrid    = null;

		this.state = {
			dsTrainList    : DataLib.datalist.getInstance(),
			dsWordList     : DataLib.datalist.getInstance(),
			dsSentenceList : DataLib.datalist.getInstance(),
			dsTrainHistory : DataLib.datalist.getInstance(),
			activeTab : 0,
			buttonProps : {
				btnDataDownload : {
					id : 'btnDataDownload',
					disabled : false,
					value : '데이터 다운로드',
					hidden : false,
					color : 'green',
				},
				btnExcelUpload : {
					id : 'btnExcelUpload',
					disabled : false,
					value : '파일업로드',
					hidden : false,
					color : 'green',
				},
				btnExecuteLearning : {
					id : 'btnExecuteLearning',
					disabled : false,
					value : '학습진행',
					hidden : false,
					color : 'purple',
				},
				btnOpenLearningHist : {
					id : 'btnOpenLearningHist',
					disabled : false,
					value : '학습로그',
					hidden : false,
					color : 'blue',
				},				
			},
			gridProps : {
				grdTrainList : {
					areaName : '학습 목록',
					id : 'grdTrainList',
					header : 
					[						  		
						{headerName:  '학습일자',	field: 'TRN_DTM',		 colId: 'TRN_DTM',		}
						,{headerName: '제목',	field: 'TRN_TIT',			colId: 'TRN_TIT',		editable: false }
						,{headerName: '작업상태',	field: 'TRN_STATE',			colId: 'TRN_STATE',		editable: false,
							cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'TRN_STATE')},
							valueFormatter : (params) => { return ComLib.getComCodeName('CMN', params.value, 'TRN_STATE')}}
					],				
					paging : {
						start: 0,
						size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
						page : 1,
						loading: false
					},					
				},
			},				
			fileName: '',
			exportFileFlag: false,
			updateFlag: false // 변경금지 DS 변경할떄 리엑트 인식 못하는 경우 버그 잡기용
		}
		this.event.tab.onClick		= this.event.tab.onClick.bind(this);
		this.event.button.onClick	= this.event.button.onClick.bind(this);
	}
	
	/*------------------------------------------------------------------------------------------------*/
	// [2. OnLoad Event Zone]
	/*------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		this.transaction("STT050000_R01");
		
	}

	componentDidUpdate() {

	}
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STT050000_R01':
			break;
		
		case 'executeLearning':
			if (!this.state.dsWordList.isUpdated() && !this.state.dsSentenceList.isUpdated()) {
				ComLib.openDialog('A', 'SYSI0010', '변경 항목 없음');	

				return false;
			}
			

			break;
		default : break;
		}
		return true;
	}
	handler = {
		setDs : (transId) => {
			switch (transId) {
			case "STT050000_R01" :
				let state = this.state;

				state['gridProps']['grdTrainList']['paging'].start = 0;
				state['gridProps']['grdTrainList']['paging'].page = 1;


				this.setState(state, () => {
					this.transaction('STT050000_R01');
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
	transaction = (...params) => {		
		let serviceid = params[0];
		let transManager = new TransManager();
		
		transManager.setTransId(serviceid);
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);
		
		let state       = this.state;	
		
		let pageStart   = state['gridProps']['grdTrainList']['paging'].start;
		let pageLimit   = state['gridProps']['grdTrainList']['paging'].size;

		try {
			switch (serviceid) {	
			case 'STT050000_R01':					
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_getTrainList",
					datasetsend: "dsPaging",
					datasetrecv: "dsTrainList",
				});
				
				transManager.addDataset('dsPaging', [{QUERY_START : pageStart,
													  QUERY_LIMIT : pageLimit}]);
				transManager.agent();

				break;

			case 'STT050000_R02':					
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_getTrainList",
					datasetsend: "dsPaging",
					datasetrecv: "dsTrainList",
				});
				
				transManager.addDataset('dsPaging', [{QUERY_START : pageStart,
													  QUERY_LIMIT : pageLimit}]);
				transManager.agent();

				break;

			case 'STT050000_R03':
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_getTrainStateChk",
					datasetsend: "dsEmpty",
					datasetrecv: "dsTrainState",
				});
	
				transManager.addDataset('dsEmpty', [{}]);
				transManager.agent();

				break;

			// case 'STT050000_R03':
			// 	transManager.addConfig({
			// 		dao: transManager.constants.dao.base,
			// 		crudh: transManager.constants.crudh.read,
			// 		sqlmapid:"STT.R_getTrainHistory",
			// 		datasetsend:"dsSearch",
			// 		datasetrecv:"dsTrainHistory",
			// 	});
					
			// 	let monthRangeArr = ComLib.getCommCodeList('TRAIN_LOG_MONTH');

			// 	transManager.addDataset('dsSearch', [{MONTH_RANGE: monthRangeArr[0].CODE}]);
			// 	transManager.agent();

			// 	break;
				  
			case 'STT050000_C01':			
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.create,
					sqlmapid:"STT.C_setTrainSchedule",
					datasetsend:"dsTrainSchedule",
				});
				
				let wordDs     = this.state.dsWordList.getRecords();
				let sentenceDs = this.state.dsSentenceList.getRecords();
				let combinedWordList = "";
				let sentenceList     = "";

				for(let i = 0; i < wordDs.length; i ++) {
					if (wordDs[i].rowtype !== newScrmObj.constants.crud.remove) {
						combinedWordList += wordDs[i].word;

						if (i + 1 !== wordDs.length) {
							combinedWordList += ',';
						}
					}					
				}

				for(let i = 0; i < sentenceDs.length; i ++) {
					if (sentenceDs[i].rowtype !== newScrmObj.constants.crud.remove) {	
						sentenceList += sentenceDs[i].sentence;
	
						if (i + 1 !== sentenceDs.length) {
							sentenceList += ',';
						}
					}
				}	
				
				

				transManager.addDataset('dsTrainSchedule', [{TRN_TIT: params[3], TRN_DTM: params[1] + ComLib.getComCodeCdVal("CMN_SET", params[2]  ,"STT_TRN_LST") + '0000', TRN_WORD: combinedWordList, TRN_SENT: sentenceList, TRN_TP: 'R' }]);
				transManager.agent();
				break;

			case 'STT050000_U01':
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.update,
					sqlmapid:"STT.U_setTrainDelete",
					datasetsend:"dsIndex",
				});
	
				transManager.addDataset('dsIndex', [{TRN_UNQ :params[1] }]);
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
		
		let state = this.state;

		switch (res.id) {
			case 'STT050000_R01':	
			let dsTrainList = res.data.dsTrainList;
			let wordList     = dsTrainList[0].TRN_WORD.split(",");
			let sentenceList = dsTrainList[0].TRN_SENT.split(",");
			let dsWordList     = [];
			let dsSentenceList = [];

			for (let i = 0; i < wordList.length; i ++) {
				dsWordList.push({word: wordList[i]})
				
			}

			for (let i = 0; i < sentenceList.length; i ++) {
				dsSentenceList.push({sentence: sentenceList[i]})
				
			}

			ComLib.setStateInitRecords(this, "dsTrainList", dsTrainList);
			ComLib.setStateInitRecords(this, "dsWordList", dsWordList);
			ComLib.setStateInitRecords(this, "dsSentenceList", dsSentenceList);
			
			let rows = this.trainListGridApi.rowModel.rowsToDisplay;
			rows[0].setSelected(true);

			state['gridProps']['grdTrainList']['paging'].loading = false;
			
			this.setState(state);

			break;

		case 'STT050000_R02':				
			ComLib.setStateInitRecords(this, "dsTrainList", res.data.dsTrainList);
			
			if (this.state.gridProps.grdTrainList.paging.excelLoadAll) {
				this.setState({...this.state
					, gridProps: {...this.state.gridProps, 
						grdTrainList : { ...this.state.grdTrainList
							, paging : { ...this.state.grdTrainList.paging
								, loading : false
								, excelLoadAll: false
							}
						}
					}
				}, () => {
						this.trainListGrid.downExcelData();

				});
				
			} else {
				this.setState({...this.state
					, gridProps: {...this.state.gridProps, 
						grdTrainList : { ...this.state.gridProps.grdTrainList
							, paging : { ...this.state.gridProps.grdTrainList.paging
								, loading : false
								, excelLoadAll: false
							}
						}
					}
				});
			}

			break;	

		case 'STT050000_R03':
			let stateChk = res.data.dsTrainState;
			
			if(stateChk[0].TrainUse_YN === 'X'){
				ComLib.openDialog('A', 'SYSI0010', '이미 등록된 학습이 있습니다. \n학습 완료 후 진행해주세요.');	

				return;
		 
			} else {
				let option = { width: '500px', height: '400px', modaless: false, callback :  () => {return;}}

				ComLib.openPop('STT050001', '학습진행', option, this.event.addNewTrainList);
			}

			break;

		// case 'STT050000_R03':
		// 	let dsTrainHistory = res.data.dsTrainHistory;

		// 	ComLib.setStateInitRecords(this, "dsTrainHistory", dsTrainHistory);

			

		// 	break;

		case 'STT050000_C01':	
			if (this.validation("STT050000_R01")) this.handler.setDs('STT050000_R01');

			break;

		case 'STT050000_U01':
			ComLib.openDialog('A', 'SYSI0010', '삭제 되엇습니다.');	

			if (this.validation("STT050000_R01")) this.handler.setDs('STT050000_R01');

			break;

		default : break;
		}
	}

	event = {
		tab : {
			onClick : (e) => {
				this.setState({...this.state, activeTab : e});
			}
		},
		button : {
			onClick : (e) => {
				switch (e.target.id) {
				case "btnDataDownload":
					this.onExelDownLoad();

					break;

				case "btnExcelUpload":
					
					break;

				case "btnExecuteLearning":
					if (this.validation('executeLearning')) {						
						this.transaction('STT050000_R03')

					}
					
					break;
				// case "btnMisSenMan":
				// 	option1 = { width: '1200px', height: '600px', modaless: false, callback : () => {} }
				// 	ComLib.openPop('STT050002', '오인식문장관리', option1);
				// 	break;

				case "btnStudyLog":
					let option = { width: '600px', height: '480px', modaless: false,callback : () => {} }

					ComLib.openPop('STT050003', '학습로그', option);
					
					break;
				default: break;
				}
			}
		},
		grid: {
			onScrollEnd: (e) => {
				if (!this.state.gridProps.grdTrainList.paging.loading) {
					this.setState({...this.state
						, gridProps : {...this.state.gridProps
							, gridSttResultList : { ...this.state.gridProps.grdTrainList
								, paging : { ...this.state.gridProps.grdTrainList.paging
									, start : this.state.gridProps.grdTrainList.paging.start + this.state.gridProps.grdTrainList.paging.size
									, loading : true
									, excelLoadAll : e.excelLoadAll
								}
							}
						}
					}, () => {
						this.transaction("STT050000_R02");
					});
				} 
			},
			onGridReady: (e) => {
				switch (e.id) {
				case "grdTrainList":
					this.trainListGridApi = e.gridApi;
					this.trainListGrid    = e.grid;
					
					break;
				default: break
				}
			},
			onRowClicked: (e) => {
				switch (e.id) {
				case "grdTrainList":
					let selectedRow = this.trainListGrid.getSelectedRows();
					
					let rows = this.trainListGridApi.rowModel.rowsToDisplay;
					let row;

					for (let i = 0; i < rows.length; i ++) {
						if (rows[i].data.TRN_UNQ === e.data.TRN_UNQ){
							row = this.trainListGridApi.rowModel.rowsToDisplay[i];
							break;
						}
					}

					if (row.selected !== true) {
						row.setSelected(true);

					} else {
						let wordList     = selectedRow[0].TRN_WORD.split(",");
						let sentenceList = selectedRow[0].TRN_SENT.split(",");
						let dsWordList     = [];
						let dsSentenceList = [];

						for (let i = 0; i < wordList.length; i ++) {
							dsWordList.push({word: wordList[i]})
							
						}

						for (let i = 0; i < sentenceList.length; i ++) {
							dsSentenceList.push({sentence: sentenceList[i]})
							
						}

						ComLib.setStateInitRecords(this, "dsWordList", dsWordList);
						ComLib.setStateInitRecords(this, "dsSentenceList", dsSentenceList);

					}

					break;
				default: break;
				}
			},
			onBeforeDeleteRow: () => {
				let trnState  = this.trainListGrid.getSelectedRows()[0].TRN_STATE;
				if (trnState === 'S' || trnState === 'Y') {
					ComLib.openDialog('A', 'SYSI0010', '학습 진행중 이거나 적용중인 내역은 삭제 불가능');	

					return false;

				} else {	
					ComLib.openDialog('C', 'SYSI0010', '정말 삭제하시겠습니까?'
						, confirm => { 
							if (confirm) {
								let TRN_UNQ  = this.trainListGrid.getSelectedRows()[0].TRN_UNQ;

								this.transaction("STT050000_U01" , TRN_UNQ);
							}
						}
					);
					
					return false;
				}
			}
		},
		addNewTrainList: (e) => {
			if (this.validation('STT050000_C01')) {				
				this.transaction('STT050000_C01', e.date, e.time, e.title )
			} 
		},
		addCombineWord : (e) => {
			let wordList = this.state.dsWordList;
			let newTargetList = e.targetWord;

			let newWordList = JSON.parse(JSON.stringify(wordList.records))

			let chkCnt = 0;

			for (let i = 0; i < newTargetList.length; i ++) {
				let newWord = newTargetList[i];
				
				let index = wordList.indexOf('word', newTargetList[i]);

				if (!StrLib.isNull(newWord)) {

					if (index === -1) {					
						newWordList.push({recid:newWordList.length, rowtype: newScrmObj.constants.crud.create, word: newWord})
						chkCnt ++;

					} else {	
						let filteredOrgRecord = wordList.orgrecords.filter( row => (
							row.word === newWord
						))
		
						if (filteredOrgRecord.length > 0) {
							if (newWordList[index]['rowtype'] !== newScrmObj.constants.crud.read) {
								newWordList[index]['rowtype'] = newScrmObj.constants.crud.read;
								chkCnt ++;
							}	
						} else {
							newWordList[index]['rowtype'] = newScrmObj.constants.crud.create;
							chkCnt ++;
						}	
					}
				}
			}

			if (chkCnt > 0) {
				ComLib.setStateRecords(this, "dsWordList", newWordList)
				this.setState({...this.state, updateFlag: !this.state.updateFlag})

			} else {
				ComLib.openDialog('A', 'SYSI0010', '이미 추가된 복합명사(들) 입니다.');
			}
	
		},
		delCombineWord : (e) => {
			let wordList = this.state.dsWordList;
			let index = wordList.indexOf('word', e.targetWord);
			let newWordList = JSON.parse(JSON.stringify(wordList.records))

			newWordList[index]['rowtype'] = newScrmObj.constants.crud.remove;
			
			ComLib.setStateRecords(this, "dsWordList", newWordList)

			//this.setState({...this.state, cmpWordList: this.state.dsWordList.getRecords()})

		},
		addSentence : (e) => {
			let sentenceList = this.state.dsSentenceList;
			let newTargetList = e.targetSentence;
			let newSentanceList = JSON.parse(JSON.stringify(sentenceList.records))
		
			let chkCnt = 0;

			for (let i = 0; i < newTargetList.length; i ++) {
				let newSentance = newTargetList[i];
				let index = sentenceList.indexOf('word', newTargetList[i]);
				if (!StrLib.isNull(newSentance)) {
					if (index === -1) {					
						newSentanceList.push({recid:newSentanceList.length, rowtype: newScrmObj.constants.crud.create, sentence: newSentance})
						chkCnt ++;
	
					} else {	
						let filteredOrgRecord = sentenceList.orgrecords.filter( row => (
							row.sentence === newSentance
						))
		
						if (filteredOrgRecord.length > 0) {
							if (newSentanceList[index]['rowtype'] !== newScrmObj.constants.crud.read) {
								newSentanceList[index]['rowtype'] = newScrmObj.constants.crud.read;
								chkCnt ++;
							}	
						} else {
							newSentanceList[index]['rowtype'] = newScrmObj.constants.crud.create;
							chkCnt ++;
						}	
					}
				}				
			}
			
			if (chkCnt > 0) {
				ComLib.setStateRecords(this, "dsSentenceList", newSentanceList)
				this.setState({...this.state, updateFlag: !this.state.updateFlag})

			} else {
				ComLib.openDialog('A', 'SYSI0010', '이미 추가된 문장(들) 입니다.');
			}

		},
		delSentence : (e) => {
			let sentenceList = this.state.dsSentenceList;
			let index = sentenceList.indexOf('sentence', e.targetSentence);
			let newSentenceList = JSON.parse(JSON.stringify(sentenceList.records))

			newSentenceList[index]['rowtype'] = newScrmObj.constants.crud.remove;
			
			ComLib.setStateRecords(this, "dsSentenceList", newSentenceList)
		}
	}
	
	onUploadFiles = async(files) => {
		const targetFile = files[0];

		/// 파일 확장자 확인
		const targetFileName = targetFile.name;
		if ( targetFileName.substring(targetFileName.lastIndexOf('.'), targetFileName.length) !== '.xlsx' ) {
			ComLib.openDialog('A', 'SYSI0010', '업로드 가능한 파일 확장자는 xlsx 입니다.');	
			return;
		}

		// read excel
		const reader = new FileReader();
		reader.onload = (e) => {
		  try {
			/* Parse data */
			const bstr = e.target.result;
			const wb = excel.read(bstr, {type:'array'});
	
			/// 복합명사 시트 (첫번째 시트)
			const sheetNm1 = wb.SheetNames[0];
			if(sheetNm1) {
			  const ws1 = wb.Sheets[sheetNm1];

				if(ws1.A1) {
					const cmpData = excel.utils.sheet_to_json(ws1, {header:1});
					let dsWordList     = [];
					for (let i = 1; i < cmpData.length; i ++) {
						if(!StrLib.isNull(cmpData[i])) {
							dsWordList.push({word: cmpData[i]})

						}
					}

				ComLib.setStateInitRecords(this, "dsWordList", dsWordList);

			  	}
			}
		
			/////////////////////////////////////
			/// 문장 시트 (두번째 시트)
			const sheetNm2 = wb.SheetNames[1];
	
			if(sheetNm2) {
				const ws2 = wb.Sheets[sheetNm2];
		
				if(ws2.A1) {
					const srtData = excel.utils.sheet_to_json(ws2, {header:1});
					
					let dsSentenceList = [];
					
					for (let i = 1; i < srtData.length; i ++) {
						if(!StrLib.isNull(srtData[i])) {
							dsSentenceList.push({sentence: srtData[i]})

						}					
					}
					ComLib.setStateInitRecords(this, "dsSentenceList", dsSentenceList);
				}
			}
		  } catch(err) {
			ComLib.openDialog('A', 'SYSI0010', '파일 업로드를 실패하였습니다.\n파일을 확인해 주세요.');	
		  } finally {
			ComLib.openDialog('A', 'SYSI0010', '파일 업로드를 성공하였습니다.');	
		  }
		};
		reader.readAsArrayBuffer(targetFile);
	
		// let req = new TransManager();
	
		// req.setTransUrl(CommonConstants.url.common);
		// req.addConfig({
		//   dao        : CommonConstants.dao.base,
		//   crudh      : CommonConstants.crudh.read_one,
		//   sqlmapid   : 'COM.P_proc_stt_set_log', 
		//   datasetsend: 'reqInfo',
		// });
	
		// let actUsr = sessionStorage.getItem("usrCd");
		// let selectedTrnList = this.props.selectedTrnList;
	
		// req.addDataset('reqInfo', { TABLE: "TRAIN", KEY: selectedTrnList[0].TRN_UNQ, TYPE:"UE", ACT_USR: actUsr, ETC:''});
		// req.agent();
	
	}
	
	onExelDownLoad = async() => {	
		if (this.state.activeTab === 0) {
			let header = [{headerName:  '학습_복합명사',	field: 'word', colId: 'word'}]
			ExcelLib.exportToExcel(header, this.state.dsWordList.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy), true, "복합명사", this.props.tray.MNU_ID);
			
		} else {
			let header = [{headerName:  '학습_문장',	field: 'sentence', colId: 'sentence'}]
			ExcelLib.exportToExcel(header, this.state.dsSentenceList.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy), true, "문장", this.props.tray.MNU_ID);
			

		}
	}
	render () {
		return (
			<React.Fragment>
			<FullPanel>
				<SubFullPanel>
					<FlexPanel>
						<ComponentPanel>
							<Tabs tabWidth='100px' onClick = {this.event.tab.onClick}>
								<TabPanel id = {'STT050100'} index={0} label={'복합명사'}>
									<STT050100 
										cmpWordList   = {this.state.dsWordList.getRecords()}
										addCombineWord= {this.event.addCombineWord}
										delCombineWord= {this.event.delCombineWord}
										orgColor      = {'purple'}
										newColor      = {'green'}
									/>
								</TabPanel>
								<TabPanel id = {'STT050200'} index={1} label={'문장'}>
									<STT050200
										sentenceList= {this.state.dsSentenceList.getRecords()}
										addSentence = {this.event.addSentence}
										delSentence = {this.event.delSentence}
										orgColor    = {'purple'}
										newColor    = {'green'}
									/>
								</TabPanel>
							</Tabs>
							<RelativeGroup>
								<LFloatArea>
									<FlexPanel>
										<ReactFileReader  fileTypes={['.xlsx']} handleFiles={this.onUploadFiles}>											
											<Button 
												id    = {this.state.buttonProps.btnExcelUpload.id} 
												color = {this.state.buttonProps.btnExcelUpload.color} 
												value = {this.state.buttonProps.btnExcelUpload.value}	
												onClick= {this.event.button.onClick}
												ml     = {4}
												fiiled= {true} 										
											/>
										</ReactFileReader>										
										<Button 
											id     = {this.state.buttonProps.btnDataDownload.id} 
											color  = {this.state.buttonProps.btnDataDownload.color} 
											value  = {this.state.buttonProps.btnDataDownload.value}
											onClick= {this.event.button.onClick}	
											ml     = {10}
											fiiled = {true} 										
										/>	
									</FlexPanel>	
								</LFloatArea>	
								<RFloatArea>	
									<FlexPanel>												
										<Button 
											id     = {this.state.buttonProps.btnExecuteLearning.id} 
											color  = {this.state.buttonProps.btnExecuteLearning.color} 
											value  = {this.state.buttonProps.btnExecuteLearning.value}
											onClick= {this.event.button.onClick}	
											mr     = {7}
											fiiled = {true} 										
										/>
									</FlexPanel>		
								</RFloatArea>
							</RelativeGroup>
						</ComponentPanel>
						<ComponentPanel>
							<Grid
								areaName = {this.state.gridProps.grdTrainList.areaName}		
								id       = {this.state.gridProps.grdTrainList.id}									
								height   = "650px"
								data     = {this.state.dsTrainList}
								header   = {this.state.gridProps.grdTrainList.header}

								addRowBtn   = {false}
								delRowBtn   = {false}
								dnlExcelBtn = {true}
								rowNum      = {true}	
								
								paging   = {true}
								infinite = {true}

								totalRowCnt = {(this.state.dsTrainList.getRecords().length === 0) ? 0 : this.state.dsTrainList.getValue(0, 'totalcount')}
								
								onScrollEnd       = {this.event.grid.onScrollEnd}
								onGridReady       = {this.event.grid.onGridReady}			
								onRowClicked      = {this.event.grid.onRowClicked}
								onBeforeDeleteRow = {this.event.grid.onBeforeDeleteRow}
								orgMenu = {this.props.tray.MNU_ID}		
							/>
							{/* <RelativeGroup>
								<RFloatArea>
									<Button 
										id="btnStudyLog" 
										mt="10px" 
										color="blue"   
										value="학습로그" 
										onClick = {this.event.button.onClick}
										fiiled = {true} 						
									/>
								</RFloatArea>
							</RelativeGroup> */}
						</ComponentPanel>
					
							</FlexPanel>
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;