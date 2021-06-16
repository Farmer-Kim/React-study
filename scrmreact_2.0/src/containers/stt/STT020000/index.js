//STT 결과조회
import React from 'react';

import {
	ComponentPanel, FullPanel,  RFloatArea, LFloatArea, SearchPanel, FlexPanel, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button, Label} from 'components';
import {Textfield, RangeInputCalendar, Selectbox} from 'components';
import {Grid} from 'components';
import {StrLib, TransManager, ComLib, DataLib, newScrmObj} from 'common';

class View extends React.Component {
	constructor(props) {
		super();
			
		this.sttGrdApi = null;
		this.sttGrd    = null;
		this.state = {
			resultTotal: 0,
			newTransaction : true,
			btnProps : {
				btnSearchProps : {
					id : 'btnJobFileSearchList',
					disabled : false,
					value : '조회',
					hidden : false
				},
			},
			gridSttResultList : {
				areaName : 'STT결과검색',
				id : 'gridSttResultList',
				header : 				
				[					
					 {headerName: '콜아이디',	 field: 'call_id',		colId: 'call_id',  editable: true, width : '200' }
					,{headerName: '콜구분',	field: 'call_tp',		 colId: 'call_tp', editable: false, width : '100', textAlign: 'center', 
						valueFormatter : (params) => { return ComLib.getComCodeName('CMN', params.value,'CALL_TP')}
					}
					,{headerName: '등록일시',	field: 'reg_dtm',	    colId: 'reg_dtm',	editable: false,	width: '120', textAlign: 'left'}	
					,{headerName: '파일 사이즈',field: 'file_size',		colId: 'file_size',	editable: false,	width: '90', textAlign: 'right'}
					,{headerName: '녹취길이',	field: 'rec_tm',	colId: 'rec_length',	editable: false,	width: '90', textAlign: 'right'}
					,{headerName: '상담원',  	field: 'const_cd',	colId: 'const_cd',	editable: false,	width: '90', textAlign: 'center', 
						valueFormatter : (params) => { 
							let constList = ComLib.getSession("gdsConstList").filter(item => item.CODE === params.value);
							if (constList[0] === undefined) {
								return "";
							}
							return constList[0].CODE_NM;
						}
					}
					,{headerName: '검출 결과',	field: 'highlight',   	colId: 'highlight',	editable: false,	width: '200', 					
						cellRenderer : (params) => { 
							let text = params.value;
							if (text === undefined) {
								return null;
							}

							text = text.replaceAll('<strong>', '<strong style="color: red;">')							

							return text 	
						}
					}
					,{headerName: '상담내용',	    field: 'ACTION_ICON',	colId: 'ACTION_ICON',	width: 100, 
						cellRenderer: 'actionButton', 
						fiiled: true,
						color: 'blue'
					},
				],
				paging : {
					start: 0,
					size : Number(ComLib.getCentStndVl('00012','STND_VAL')),
					excelLoadAll : false
				},	
			},
			rangeCalendarProps : {
				rgcSearchJob : {
					label : '등록일시',
					id : 'searchJobDateCalender',
					strtId : 'searchJobDateCalenderStart',
					endId : 'searchJobDateCalenderEnd',
					startDate : null,
					endDate : null,
					disabled : false
				},
			},
			selectboxProps : {
				selCallTP : {
					id : 'selCallTP',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('CMN', 'CALL_TP'), newScrmObj.constants.select.argument.all),
					width : 120,
					selected : 0,
					disabled : false,
					label : "콜구분"
				},
				selSearchType: {
					id : 'selSearchType',
					dataset : ComLib.convComboList(ComLib.getCommCodeList('STT_JOB_INFO', 'SCH_TP')),
					width : 120,
					value :'WORD',
					selected : 0,
					disabled : false,
				},
			},
			textFieldProps : {
				iptSearch : {
					id : 'iptSearch',
					name : 'iptSearch',
					value : '',
					placeholder : '',
					minLength : 1,
					maxLength : 40,
					readOnly : false,
					disabled : false,
					label : '검색어',
					
				}
			},
			dsSttResultInfo : DataLib.datalist.getInstance(),
		}
		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.inputcalendar.onChange = this.event.inputcalendar.onChange.bind(this);
		this.event.input.onChange   = this.event.input.onChange.bind(this);
	}
	
	/*------------------------------------------------------------------------------------------------*/
		// [2. React Lifecycle Method Zone] ==> 리액트 컴포넌트 생명주기 메소드
		// 참고 site : https://ko.reactjs.org/docs/react-component.html#constructor
	/*------------------------------------------------------------------------------------------------*/
	/*------------------------------------------------------------------------------------------------*
		1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
		=> 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
	 ------------------------------------------------------------------------------------------------*/
	 componentDidMount () {
		this.axiosTransaction();
	}
	/*------------------------------------------------------------------------------------------------*
		2) componentDidUpdate () => 갱신이 일어나 직후에 호춮 (최초 렌더링 시에는 호출되지 않음)
		=> prevProps와 현재 props를 비교할 수 있음 -> 조건문으로 감싸지 않고 setState를 실행할 시, 무한 반복 가능성 -> 반드시 setState를 쓰려면 조건문으로 작성
	 ------------------------------------------------------------------------------------------------*/
	componentDidUpdate (prevProps, prevState, snapshot) {
		
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
	setTransDate = (New) => {
		let dsSrchParamInfo;
		let start = this.state.gridSttResultList.paging.start;
		let size  = this.state.gridSttResultList.paging.size;
		let excelLoadAll = this.state.gridSttResultList.paging.excelLoadAll;
		let searchTP = ""
		
		if (New) {
			searchTP = this.state.selectboxProps.selSearchType.value;
		} else {
			searchTP = this.state.lastSearchType;
		}
			
		if (excelLoadAll) {
			if (searchTP === 'WORD') {
				dsSrchParamInfo = {"sort":[{"reg_dtm":"desc"}],"from": start,"size": this.state.resultTotal - start,"query":{"bool":{"must":[]}},"highlight": {"fields": {"stt_rslt.mlf": {}},"pre_tags": [`<strong>`],"post_tags": ["</strong>"]}};
		
			} else {
				dsSrchParamInfo = {"sort":[{"reg_dtm":"desc"}],"from": start,"size": this.state.resultTotal - start,"query":{"bool":{"must":[]}}};
		
			}
			
		} else {
			if (searchTP === 'WORD') {
				dsSrchParamInfo = {"sort":[{"reg_dtm":"desc"}],"from": start,"size": size,"query":{"bool":{"must":[]}},"highlight": {"fields": {"stt_rslt.mlf": {}},"pre_tags": [`<strong>`],"post_tags": ["</strong>"]}};
		
			} else {
				dsSrchParamInfo = {"sort":[{"reg_dtm":"desc"}],"from": start,"size": size,"query":{"bool":{"must":[]}}};
		

			}
			
		}

		let must = [];
		let searchTxt = this.state.textFieldProps.iptSearch.value; 
		let startDate = "";
		let endDate   = "";
		let callTp    = "";
		let user      = "";
		let searchTp  = "";
		
		if (New) {
			startDate = this.state.rangeCalendarProps.rgcSearchJob.startDate;
			endDate   = this.state.rangeCalendarProps.rgcSearchJob.endDate;
			callTp    = this.state.selectboxProps.selCallTP.value;
			searchTp  = this.state.selectboxProps.selSearchType.value;
			this.setState({...this.state, lastSearchTxt: searchTxt, lastStartDate: startDate, lastEndDate: endDate, lastCallTp: callTp, lastSearchType: searchTp})

		} else {
			searchTxt = this.state.lastSearchTxt;
			startDate = this.state.lastStartDate;
			endDate   = this.state.lastEndDate;
			callTp    = this.state.lastCallTp;
			
		}	
		
		if (searchTP !== 'WORD') {
			if (searchTP !== 'UUID') {
				if (New) {
					must.push({"match":{"call_id": searchTxt}});
					
				} else {
					must.push({"match":{"call_id": this.state.lastSearchTxt}});
				}
								
			} else {
				if (New) {
					must.push({"match":{"_id": searchTxt}});
				} else {
					must.push({"match":{"_id": this.state.lastSearchTxt}});
				}

			}
		} else {	
			if (!StrLib.isNull(searchTxt)) {
				if (searchTxt.search(/\s/) !== -1) { 
					must.push({"match":{"stt_rslt.mlf": {"query": searchTxt, "operator":"and"}}});
		
				} else { 
					must.push({"match":{"stt_rslt.mlf": searchTxt}});
		
				}
			}	

			if (!StrLib.isNull(startDate)) {
				must.push({"range":{"reg_dtm":{"gte":startDate,"lte":endDate,"format": "yyyyMMdd"}}});

			}
			if (!StrLib.isNull(callTp)) {
				must.push({"match":{"call_tp":{"query":callTp}}});

			}
			if (!StrLib.isNull(user)) {
				must.push({"match":{"const_cd":{"query":user}}});

			}
						
			must.push({"match":{"job_tp":"R"}});
		}
		
		dsSrchParamInfo.query.bool.must = must;		

		return dsSrchParamInfo;
	}

	validation = (transId) => {
		switch (transId) {
			case 'STT020000_R01':
				var pattern_num = /[0-9]/;

				var pattern_eng = /[a-zA-Z]/;

				var pattern_spc = /[~!@#$%^&*()+|<>?:{}"'\]\[/\'\"\\\']/;

				var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

				let searchTP = this.state.selectboxProps.selSearchType.value;
				let searchIpt  = this.state.textFieldProps.iptSearch.value;

				if(this.state.rangeCalendarProps.rgcSearchJob.startDate > this.state.rangeCalendarProps.rgcSearchJob.endDate ) {
					ComLib.openDialog('A', 'SYSI0010', ['검색 시작일자가 종료일자보다 클 수 없습니다.']);
					return false;
				}
				if (!StrLib.isNull(searchIpt) && searchIpt.length < 2 && searchTP === 'WORD') {
					ComLib.openDialog('A', 'SYSI0010', ['검색어는 두글자 이상 필수 입니다.']);
					return false;
				} 
				if (!StrLib.isNull(searchIpt) && searchTP === 'WORD'
					&& (pattern_num.test(searchIpt) || pattern_spc.test(searchIpt) || pattern_eng.test(searchIpt))) {
						ComLib.openDialog('A', 'SYSI0010', ['검색어는 한글만 입력 가능 합니다.']);
					return false;
				}
				if (!StrLib.isNull(searchIpt) && (searchTP === 'UUID' || searchTP === 'CALL_ID')
					&& (pattern_spc.test(searchIpt) || pattern_kor.test(searchIpt))) {
						ComLib.openDialog('A', 'SYSI0010', ['아이디 검색은 `-`, `_` 를 제외한 특수문자와 한글이 입력 불가능 합니다.']);
					return false;
				}

				if (!StrLib.isNull(searchIpt) && (searchTP === 'UUID' || searchTP === 'CALL_ID')
					&& searchIpt.search(/\s/) !== -1) {
						ComLib.openDialog('A', 'SYSI0010', ['아이디 검색시 공백을 포함할수 없습니다.']);
					return false;
				}
				
				if (StrLib.isNull(searchIpt) && (searchTP === 'UUID' || searchTP === 'CALL_ID')) {
						ComLib.openDialog('A', 'SYSI0010', ['아이디 입력은 필수 입니다.']);
					return false;
				}

				break;
			default :
				break;
		}
		return true;
	}
	handler = {
		setDs : (transId) => {
			switch (transId) {
			case "STT020000_R01" :

				// let state = this.state;

				// state['gridSttResultList']['paging'].start = 0;
				// state['gridSttResultList']['paging'].page = 1;

				this.setState({...this.state, gridSttResultList : {...this.state.gridSttResultList
					                                               , paging: {
																	   ...this.state.gridSttResultList.paging
																	   , start : 0
																	   , page  : 1
																   }
				
						}}, () => {
					this.axiosTransaction();
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
	axiosTransaction = async() => {	
		let isNew = this.state.newTransaction;
		let transdata = JSON.stringify(this.setTransDate(isNew))
		let data = transdata.replace(/%/g, '％').replace(/=/g, '＝').replace(/&amp;/g, '＆').replace(/&/g, '＆');

		let transManager = new TransManager();
		try {				
			transManager.setTransId("test");
			transManager.setTransUrl(transManager.constants.url.sttSearch);
			transManager.setCallBack(this.callback);
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.sttSearch,
				datasetsend:"data",
				datasetrecv:"dsSttSearch",
			});
				
			transManager.addDataset('data', data);
			transManager.agent();
		} catch (err) {

		}		
	}
	/*------------------------------------------------------------------------------------------------*/
	// [5. Callback Event Zone]
	//  - Callback 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	callback = (res) => {
		let resData = JSON.parse(res.data.dsSttSearch);		
		let orgData = resData.hits.hits;
		let total   = resData.hits.total.value;
		let gridData = [];
		let cnt = Number(this.state.gridSttResultList.paging.start);
		let excelLoadAll = this.state.gridSttResultList.paging.excelLoadAll;		
		let isNew = this.state.newTransaction;
		let searchChar = "";
		
		if (isNew) {
			searchChar = this.state.textFieldProps.iptSearch.value; 
		} else {
			searchChar = this.state.lastSearchTxt;
		}
		
		console.log(resData)
		for (let i = 0; i < orgData.length; i ++) {
			gridData.push({});
		 
			let highlight = "";
			
			if (orgData[i].highlight !== undefined) {
				highlight = orgData[i].highlight['stt_rslt.mlf'][0];

			} else {
				highlight = orgData[i]._source.stt_rslt.substring(0, 20); 

			}

			let strCnt = highlight.substring(0, highlight.indexOf('@'));

			highlight = highlight.substring(highlight.indexOf('@') + 1, highlight.length); 

			let start = highlight.indexOf('<strong') - 10;	

			if (start < 0) {
				start = 0;
			}

			highlight = highlight.substring(start); 
									
			let end = highlight.lastIndexOf('</strong>') + 20;

			if (end > highlight.length) {
				end = highlight.length;
			}
														
			highlight = highlight.substring(0, end); 
			highlight = (start === 0 ? "" : "...") + highlight + "..."; 
			
			gridData[i].highlight = highlight;

			gridData[i].ACTION_ICON = 'message';

			let time = orgData[i]._source.rec_tm;

			let dtm = orgData[i]._source.reg_dtm;
			let reg_dtm = dtm.substring(0, 10) + " " + dtm.substring(11, 19)
							
			let secs = time % 60;
			time = (time - secs) / 60;
			let mins = time % 60;
			let hrs = (time - mins) / 60;
			let rec_tm = (hrs > 0 ? hrs + "시간 " : "") + mins + "분 " + secs + "초";
			
			let size = orgData[i]._source.file_size;
			let b = size % 1000;
			size = (size - b) / 1000;
			let kb = size % 1000;
			size = (size - kb) / 1000;

			let file_size = size + "." + kb + " MB"

			gridData[i].reg_dtm   = reg_dtm;  

			gridData[i].job_tp    = orgData[i]._source.job_tp;
			gridData[i].stt_unq   = orgData[i]._source.stt_unq; 
			gridData[i].rec_tm    = rec_tm;   
			gridData[i].call_tp   = orgData[i]._source.call_tp; 
			gridData[i].const_cd  = orgData[i]._source.const_cd;
			gridData[i].stt_rslt  = orgData[i]._source.stt_rslt; 
			gridData[i].call_id   = orgData[i]._source.call_id;  
			gridData[i].uuid      = orgData[i]._id
			gridData[i].file_size = file_size;  
			gridData[i].rowtype   = 'r';
			gridData[i].recid     = cnt;
			gridData[i].searchTxt = searchChar;

			cnt ++;			

		}
		
		if (total !== this.state.resultTotal) {
			this.setState({...this.state, resultTotal: Number(total)});
		}
		
		ComLib.setStateInitRecords(this, "dsSttResultInfo", gridData);

		
		if (excelLoadAll) {
			this.setState({...this.state
				, gridSttResultList : { ...this.state.gridSttResultList
					, paging : { ...this.state.gridSttResultList.paging
						, loading : false
						, excelLoadAll: false
					}
				}
			}, () => {
					this.sttGrd.downExcelData();

			});
			
		} else {
			this.setState({...this.state
				, gridSttResultList : { ...this.state.gridSttResultList
					, paging : { ...this.state.gridSttResultList.paging
						, loading : false
					}
				}
			});
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
				switch (e.target.id) {
				case "btnJobFileSearchList" :
					if (this.validation("STT020000_R01")) {
						this.setState({...this.state
							,  newTransaction : true
						}, () => {
							this.handler.setDs('STT020000_R01');
						});							
					}
					break;
				default : break;
				}
			}
		}, 
		inputcalendar : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'searchJobDateCalender':					
					this.setState({...this.state, 
							rangeCalendarProps : {...this.state.rangeCalendarProps
													, rgcSearchJob : 
														{...this.state.rangeCalendarProps.rgcSearchJob, startDate : e.startDate, endDate : e.endDate}
												}});
					break; 
				default : break;
				}
			}
		},
		selectbox: {
			onChange: (e) => {
				switch (e.id) {
				case 'selSearchType':
					let disabled = (e.target.value === "WORD" ? false : true);
					this.setState({...this.state, 
						selectboxProps : {...this.state.selectboxProps
												, selSearchType : 
													{...this.state.selectboxProps.selSearchType, selected : e.target.selectedIndex, value : e.target.value}
												, selCallTP : 
													{...this.state.selectboxProps.selCallTP, disabled: disabled}
												, selJobStateSearch : 
													{...this.state.selectboxProps.selJobStateSearch, disabled: disabled}
										},
						rangeCalendarProps : {...this.state.rangeCalendarProps
												, rgcSearchJob :	
													{...this.state.rangeCalendarProps.rgcSearchJob, disabled: disabled}									
						}});

					break;

				case 'selCallTP':
					this.setState({...this.state, 
						selectboxProps : {...this.state.selectboxProps
												, selCallTP : 
													{...this.state.selectboxProps.selCallTP, selected : e.target.selectedIndex, value : e.target.value}
										}});
					
					break;

				default : break;
				}
			},
		},
		grid: {
			onInsertRow : (e) => {

			},
			onActionCellClicked : (e) => {
				let option = { width: '600px', height: '740px', modaless: true, UUID : e.data.uuid, useUuid: true, JOB_TP: e.data.JOB_TP, srchText: this.state.lastSearchType === "WORD" ? e.data.searchTxt : null}
				ComLib.openPlayer(option);
				
			},
			onGridReady : (e) => {
				this.sttGrdApi = e.gridApi;
				this.sttGrd = e.grid;
			},
			onCellValueChanged: (e) => {
				this.sttGrd.gridDataset.setValue(e.index , e.col, e.oldValue);
				this.sttGrdApi.setRowData(this.sttGrd.gridDataset.getRecords());
			},
			//스크롤이 필요한가에 대한 검토 현재는 미적용
			onScrollEnd: (e) => {
				if (!this.state.gridSttResultList.paging.loading) {
					this.setState({...this.state
						, gridSttResultList : { ...this.state.gridSttResultList
							, paging : { ...this.state.gridSttResultList.paging
								, start : this.state.gridSttResultList.paging.start + this.state.gridSttResultList.paging.size
								, loading : true
								, excelLoadAll : e.excelLoadAll
							}
						}
						,  newTransaction : false
					}, () => {
						this.axiosTransaction();
					});
				} 
			},
		},
		input : {
			onChange : (e) => {
				switch (e.target.id) {
					case 'iptSearch' :
						this.setState({...this.state
							, textFieldProps : { ...this.state.textFieldProps
								,iptSearch : { ...this.state.textFieldProps.iptSearch, value : e.target.value }
							}});
					break;
					default : break;
				}
			},
			onKeyPress: (e) => {
				switch (e.target.id) {
				case 'iptSearch' :
					if (e.key === 'Enter') {
						if (this.validation("STT020000_R01")) {
							this.setState({...this.state
								,  newTransaction : true
							}, () => {
								this.handler.setDs('STT020000_R01');
							});							
						}
					}
					break;
				default: break;
				}
			},
		},
	}	

	render () {
		return (
			<React.Fragment>
				<FullPanel>					
					<SearchPanel>
						<RelativeGroup>
							<LFloatArea>
								<FlexPanel>
									<Label value="검색조건"/>
									<Selectbox
										id       = {this.state.selectboxProps.selSearchType.id}
										dataset  = {this.state.selectboxProps.selSearchType.dataset}
										value    = {this.state.selectboxProps.selSearchType.value}
										width    = {this.state.selectboxProps.selSearchType.width}
										disabled = {this.state.selectboxProps.selSearchType.disabled}
										onChange = {this.event.selectbox.onChange}
									/>
									<Textfield
										width       = {300}
										id          = {this.state.textFieldProps.iptSearch.id}
										name        = {this.state.textFieldProps.iptSearch.name}
										value       = {this.state.textFieldProps.iptSearch.value}
										placeholder = {this.state.textFieldProps.iptSearch.placeholder}
										minLength   = {this.state.textFieldProps.iptSearch.minLength}
										maxLength   = {this.state.textFieldProps.iptSearch.maxLength}
										readOnly    = {this.state.textFieldProps.iptSearch.readOnly}
										disabled    = {this.state.textFieldProps.iptSearch.disabled}
										onChange    = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>
									<Label value={this.state.rangeCalendarProps.rgcSearchJob.label}/>
									<RangeInputCalendar
										id        = {this.state.rangeCalendarProps.rgcSearchJob.id}
										strtId    = {this.state.rangeCalendarProps.rgcSearchJob.strtId}
										endId     = {this.state.rangeCalendarProps.rgcSearchJob.endId}	
										startDate = {this.state.rangeCalendarProps.rgcSearchJob.startDate}
										endDate   = {this.state.rangeCalendarProps.rgcSearchJob.endDate}
										disabled  = {this.state.rangeCalendarProps.rgcSearchJob.disabled}
										onChange  = {this.event.inputcalendar.onChange}
									/>	
									<Label value={this.state.selectboxProps.selCallTP.label}/>
									<Selectbox
										id       = {this.state.selectboxProps.selCallTP.id}
										value    = {this.state.selectboxProps.selCallTP.value}
										dataset  = {this.state.selectboxProps.selCallTP.dataset}
										width    = {this.state.selectboxProps.selCallTP.width}
										disabled = {this.state.selectboxProps.selCallTP.disabled}
										selected = {this.state.selectboxProps.selCallTP.selected}
										onChange = {this.event.selectbox.onChange}
									/>
								</FlexPanel>
							</LFloatArea>
							<RFloatArea>
								<Button
									color= 'blue' fiiled= {true} innerImage={true} icon = {'srch'}
									id = {this.state.btnProps.btnSearchProps.id}
									value = {this.state.btnProps.btnSearchProps.value}
									disabled = {this.state.btnProps.btnSearchProps.disabled}
									hidden = {this.state.btnProps.btnSearchProps.hidden}
									onClick = {this.event.button.onClick}
									mt = {5}
								/>
							</RFloatArea>
						</RelativeGroup>
					</SearchPanel>
					<ComponentPanel>
						<Grid
							areaName = {this.state.gridSttResultList.areaName}
							id       = {this.state.gridSttResultList.id}
							height   = "600px"
							header   = {this.state.gridSttResultList.header}
							data     = {this.state.dsSttResultInfo}			

							addRowBtn   = {false}
							delRowBtn   = {false}
							dnlExcelBtn = {true}
							rowNum      = {true}							
							paging      = {true}
							infinite    = {true}
							suppressRowClickSelection = {true}

							totalRowCnt = {this.state.resultTotal}

							onCellValueChanged = {this.event.grid.onCellValueChanged}
							onGridReady        = {this.event.grid.onGridReady}	
							onScrollEnd        = {this.event.grid.onScrollEnd}			
							onActionCellClicked= {this.event.grid.onActionCellClicked}			

						/>
					</ComponentPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;