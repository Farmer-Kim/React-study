import React from 'react';
import {ComLib, TransManager, StrLib, DataLib, newScrmObj} from 'common';
import {Selectbox, Textfield, LFloatArea, RFloatArea, RelativeGroup, ComponentPanel, FlexPanel, SubFullPanel, BasicButton, Checkbox, Label} from 'components';
import { indexOf } from 'lodash';


const playerConstants = {
	itemBgColor :	{ default : "", selected : 'rgb(233, 233, 233)' },
	listItemDivId :	{ container :'realTime_list_container_id', item : 'realTime_list_item_id' },
	markColor :		{ default : '', marked : '' }
}

class RealTimeViewer extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			dsRealTimeSentence : [],
			csState: "I",
			sttUnq: "",
			timeoutID: null,
			dsKeywordList : [],
			srchText : '',
			searchText : '',
			searchedIndex : [],
			currentIndex : 0,			
			selKeyword : '',
			selKeywordData: [{value : '', name : '선택'}],
			selKeywordType: '',
			typeSelectedIndex: 0,
			listSelectedIndex: 0,
			checkboxProps : {			
				chkAutoScroll : {
					id : 'chkAutoScroll',
					index : 0,
					keyProp : 'scVsCode',
					value : '자동 스크롤',
					checked : 'Y',
					readOnly : false,
					disabled : false
				},
			}
		};		
		this.event.input.onChange = this.event.input.onChange.bind(this);
		this.event.input.onKeyPress = this.event.input.onKeyPress.bind(this);
		this.event.select.onChange = this.event.select.onChange.bind(this);
	}
	static defaultProps = {
		constCd : '_default',
		sttUnq : '_default',
		bodyHeight : '605px'
	}
	componentDidMount () {
		this.handler.initialize();
	}
	componentDidUpdate (prevProps, prevState) {
		// if (prevState === this.state) {
		// 	if (this.props.optionalTime !== undefined && this.props.optionalTime !== null) {
		// 		if (prevProps.optionalTime !== this.props.optionalTime) {
		// 			this.optionalTime = this.props.optionalTime;
		// 			this.handler.setDs('REAL_R01', this.props.callId);
		// 		}
		// 	}
		// }
	}
	componentWillUnmount () {
		clearTimeout(this.state.timeoutID);
	}
	validation = (serviceid) => {
		switch (serviceid) {
		case 'REAL_R00': 

			return true;

		case 'REAL_R01':

			return true;
		default : break;
		}
	}

	transaction = (serviceid) => {
		let transManager = new TransManager();
		switch (serviceid) {
		case 'REAL_R00': 
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.setCallBack(this.callback);

			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid: "STT.R_getKeyword",
				datasetsend:"dsSrchData",
				datasetrecv:"dsKeywordList",
			});

			// transManager.addConfig({
			// 	dao: transManager.constants.dao.base,
			// 	crudh: transManager.constants.crudh.read,
			// 	sqlmapid: "STT.R_getRealTimeSentence",
			// 	datasetsend:"dsSrchData",
			// 	datasetrecv:"dsRealTimeSentence",
			// });

			transManager.addDataset('dsSrchData', [{ EMPTY : "" }]);
			transManager.agent();
			break;

		case 'REAL_R01':
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.realTime);
			transManager.setCallBack(this.callback);

			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.realTime,
				datasetsend:"dsSrchData",
				datasetrecv:"dsRealTimeSentence",
			});
			transManager.addDataset('dsSrchData', [{ CONST_CD : this.props.constCd
				                                   , CONST_NM : this.props.constNm
				                                   , STT_UNQ  : this.props.sttUnq }]);
			transManager.agent();
			break;
		case 'REAL_R02':
			transManager.setTransId(serviceid);
			transManager.setProgress(false);	
			transManager.setTransUrl(transManager.constants.url.realTime);
			transManager.setCallBack(this.callback);

			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.realTime,
				datasetsend:"dsSrchData",
				datasetrecv:"dsRealTimeSentence",
			});

			transManager.addDataset('dsSrchData', [{ CONST_CD : this.props.constCd
													, CONST_NM : this.props.constNm
													, STT_UNQ  : this.state.sttUnq }]);
			transManager.agent();
			break;
		default : break;
		}
		transManager = null;
	}
	callback = (res) => {
		let dsKeywordList = "";
		let dsRealTimeSentence = "";
		let lastSpk   = "none";
		let lastIndex = this.state.lastIndex;
		let sttUnq = "";
		let timeoutID = "";

		switch(res.id) {
		case 'REAL_R00':

			dsKeywordList = res.data.dsKeywordList;

			this.setState({
				dsKeywordList: dsKeywordList,
				selKeywordData: [{value : '', name : '선택'}],
			}, () => {this.transaction("REAL_R01")});	

			break;
		case 'REAL_R01':
			dsKeywordList      = this.state.dsKeywordList;
			dsRealTimeSentence = res.data.dsRealTimeSentence;
			
			for (let i = 0; i < dsKeywordList.length; i ++) {
				let cnt = 0;
				let regexAll = new RegExp(dsKeywordList[i].KWD, "g");
				
				for (let j = 0; j < dsRealTimeSentence.length; j ++) {
					let text = dsRealTimeSentence[j].SENT_CONT
					let results = text.match(regexAll); 

					if (results !== null) {
						cnt += results.length;
					}						
				}
				
				dsKeywordList[i].KWD = dsKeywordList[i].KWD + "(" + cnt + ")";
			}

			timeoutID = setTimeout(() => {
				this.transaction('REAL_R02');
			}, 3000);

			sttUnq = (this.props.sttUnq === res.data.sttUnq ? this.props.sttUnq : res.data.sttUnq);

			this.setState({
				dsKeywordList: dsKeywordList,
				sttUnq: sttUnq,
				timeoutID : timeoutID,
				dsRealTimeSentence : dsRealTimeSentence,
			}, () => { 	if (this.state.checkboxProps.chkAutoScroll.checked === 'Y') {
							if (dsRealTimeSentence.length > 0) {
								this.handler.moveToLastItem();		

							}	
						}							
					});
			
			break;
		case 'REAL_R02':
			dsRealTimeSentence = res.data.dsRealTimeSentence;
			dsKeywordList      = this.state.dsKeywordList;
			
			if (dsRealTimeSentence.length !== this.state.dsRealTimeSentence.length || this.state.sttUnq !== res.data.sttUnq) {
				for (let i = 0; i < dsKeywordList.length; i ++) {
					let cnt = 0;
					let regexAll = new RegExp(dsKeywordList[i].KWD.substring(0, dsKeywordList[i].KWD.indexOf("(")), "g");
					
					for (let j = 0; j < dsRealTimeSentence.length; j ++) {
						let text = dsRealTimeSentence[j].SENT_CONT
						let results = text.match(regexAll); 
	
						if (results !== null) {
							cnt += results.length;
						}							
					}
					
					dsKeywordList[i].KWD = dsKeywordList[i].KWD.substring(0, dsKeywordList[i].KWD.indexOf("(")) + "(" + cnt + ")";
				}
			}			

			sttUnq = this.state.sttUnq === res.data.sttUnq ? this.state.sttUnq : res.data.sttUnq;

			timeoutID = setTimeout(() => {
				this.transaction('REAL_R02');
			}, 3000);

			let selKeywordTypeDataSet = ComLib.convComboList(ComLib.getCommCodeList("STT_SYS_KWD", "KWD_TP"), newScrmObj.constants.select.argument.select);
			let selKeywordData = [{value : '', name : '선택'}].concat(dsKeywordList.map((item) => {	
				if (item.KWD_TP === selKeywordTypeDataSet[this.state.typeSelectedIndex].value) {
					return { value : item['KWD'], name : item['KWD']}
				}
			}))
						
			this.setState({
				dsKeywordList: dsKeywordList,
				sttUnq: sttUnq,
				timeoutID : timeoutID,
				csState: res.data.csState,
				selKeywordData: selKeywordData.filter(item=> item !== null && item !== undefined),
				dsRealTimeSentence : dsRealTimeSentence }, () => { 							
					this.handler.refreshSearch();	
					if (this.state.checkboxProps.chkAutoScroll.checked === 'Y') {
						if (dsRealTimeSentence.length > 0) {
							this.handler.moveToLastItem();		

						}				
					}							
			});

			break;
		default : break;
		}
	}
	event = {
		input : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'iptSrchText' :
					if (this.state.dsKeywordList.filter(item => item['KEY_WORD'] === e.target.value).length === 0) {
						this.setState({srchText : e.target.value});
					} else {
						this.setState({srchText : e.target.value});
					}
					break;
				default : break;
				}
			},
			onKeyPress : (e) => {
				switch (e.target.id) {
				case 'iptSrchText' :
					if (e.key === 'Enter') {
						if (this.state.searchText === this.state.srchText) {
							if (this.state.currentIndex < this.state.searchedIndex.length-1) {
								this.handler.searchText(this.state.srchText, this.state.currentIndex+1);
							} else {
								if (this.state.currentIndex === this.state.searchedIndex.length-1) {
									this.handler.searchText(this.state.srchText, 0);
								}
							}
						} else {
							this.handler.searchText(this.state.srchText, 0);
						}
					}
					break;
				default: break;
				}
			}
		},
		select : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'selKeywordType' :
					if (this.state.playing) {
						ComLib.openDialog('A', 'SYSI0010', ['정지 후 플레이어를 검색하기 바랍니다.']);
						return false;
					} else {
						this.setState({ selKeywordType : e.target.value, typeSelectedIndex: e.target.selectedIndex, selKeywordColor: ComLib.getComCodeCdVal('STT_SYS_KWD', e.target.value, 'KWD_TP')}, () => {
							let keywordList = this.state.dsKeywordList;

							let selKeywordData = [{value : '', name : '선택'}].concat(keywordList.map((item) => {								
								if (!StrLib.isNull(e.target.value)) {									
									if (item.KWD_TP === e.target.value) {
										return { value : item['KWD'], name : item['KWD']}
									}
								}
							}))
										
							this.setState({...this.state, selKeywordData : selKeywordData.filter(item=> item !== null && item !== undefined)})
						})
					}
					break;

				case 'selKewordList' :
					if (this.state.playing) {
						ComLib.openDialog('A', 'SYSI0010', ['정지 후 플레이어를 검색하기 바랍니다.']);
						return false;
					} else {
						let text = e.target.value.substring(0, e.target.value.indexOf('('));

						this.setState({ selKeyword : e.target.value, srchText : text, listSelectedIndex: e.target.selectedIndex}, () => {
							document.getElementById('iptSrchText').focus();
							if (this.state.searchText === this.state.srchText) {
								if (this.state.currentIndex < this.state.searchedIndex.length-1) {
									this.handler.searchText(this.state.srchText, this.state.currentIndex+1);
								} else {
									if (this.state.currentIndex === this.state.searchedIndex.length-1) {
										this.handler.searchText(this.state.srchText, 0);
									}
								}
							} else {
								this.handler.searchText(this.state.srchText, 0);
							}
						})
					}
					break;
				default : break;
				}
			}
		},
		button : {
			onClick : (e) => {
				switch (e.target.id) {
				case 'btnSrchTextUp' :
					if (this.state.searchText === this.state.srchText) {
						if (this.state.currentIndex > 0) {
							this.handler.searchText(this.state.srchText, this.state.currentIndex-1);
						} else {
							if (this.state.currentIndex === 0) {
								this.handler.searchText(this.state.srchText, this.state.searchedIndex.length-1);
							}
						}
					} else {
						this.handler.searchText(this.state.srchText, 0);
					}
					break;
				case 'btnSrchTextDown' :
					if (this.state.searchText === this.state.srchText) {
						if (this.state.currentIndex < this.state.searchedIndex.length-1) {
							this.handler.searchText(this.state.srchText, this.state.currentIndex+1);
						} else {
							if (this.state.currentIndex === this.state.searchedIndex.length-1) {
								this.handler.searchText(this.state.srchText, 0);
							}
						}
					} else {
						this.handler.searchText(this.state.srchText, 0);
					}
					break;
				case 'btnClearText' :
					this.setState({srchText : '', searchText : null, searchedIndex : [], currentIndex: 0});
					break;
				case 'btnCopyAllText' :
					if (this.state.dsRealTimeSentence.length === 0) {
						ComLib.openDialog('A', 'SYSI0010', ['표시된 대화가 없습니다.']);
						return false;
					} else {
						ComLib.copyText(this.state.dsRealTimeSentence.map((item, key) => {
							let text = "";
							text += (item["SPK_TP"] === "C" ? "[상담사]" : "[고객]");
							text += item['SENT_CONT'];
							return text;
						}))

					}
					break;
				case 'btnSaveAllText' :
					if (this.state.dsRealTimeSentence.length === 0) {
						ComLib.openDialog('A', 'SYSI0010', ['표시된 대화가 없습니다.']);
						return false;
					} else {
						ComLib.writeTxtFile(this.state.dsRealTimeSentence.map((item, key) => {
							let text = "";
							text += (item["SPK_TP"] === "C" ? "[상담사]" : "[고객]");
							text += item['SENT_CONT'];
							return text;
						}).join("\r\n"), this.props.constNm + ".txt" )

					}
					break;
				default : break;
				}
			}
		},
		checkbox : {
			onChange : (e) => {
				switch (e.id) {
				case 'chkAutoScroll' :
					if(e.checked) {
						this.setState({...this.state
							, checkboxProps: {...this.state.checkboxProps, chkAutoScroll : {...this.state.checkboxProps.chkAutoScroll,checked : (e.checked) ? 'Y' : 'N'}}

						});

					} else {						
						this.setState({...this.state
							, checkboxProps: {...this.state.checkboxProps, chkAutoScroll : {...this.state.checkboxProps.chkAutoScroll, checked : (e.checked) ? 'Y' : 'N'}}

						});														
										
					}
					break;
				}
			}
		}
	}
	handler = {
		// method zone
		initialize : () => {
			this.transaction('REAL_R00');
		},
		setDs : (serviceid, data) => {
			switch (serviceid) {
			case 'REAL_R01' :
				this.grdPlayerListApi.forEachNode((node, index) => {
					if (StrLib.isNull(data)) {
						if (index === 0) {
							node.setSelected(true);
						}
					} else {
						if (node['data']['CALL_ID'] === data) {
							node.setSelected(true);
						}
					}
				})
				this.transaction('REAL_R01');
				break;
			default : break;
			}
		},
		getContents : (data) => {
			if (data.length === 0) return null;
			return this.handler.getListItem(data);
		},
		getListItem : (item) => {

			return item.map((ele, index) => {
				return (
					<div key={index} id={playerConstants.listItemDivId.item + (index).toString()} className="scrm-player-list-item-container">
						<div className={(ele['SPK_TP'] !== 'A') ?  'scrm-player-list-item-client' : 'scrm-player-list-item-caller'}>
							<div className="scrm-player-list-item-img-div">
								<span><i className="xi-message-o"></i></span>
							</div>
							<div className="scrm-player-list-item-contents">
								{/* <div className="scrm-player-list-item-time-div">
									<span className='scrm-player-list-item-time'>{ this.handler.format(ele.POS_START/100) }</span>
								</div> */}
								<div className="scrm-player-list-item-text-div">
									<span className='scrm-player-list-item-text'>
										{ this.handler.getKewordMark(ele.SENT_CONT) }
									</span>
								</div>
							</div>
						</div>
					</div>
				);
			}) ;
		},
		getSrchMarker : (txt, srchTxt) => {
			let txtArr;
			if (StrLib.isNull(srchTxt)) {
				return txt;
			}
			if (txt.includes(srchTxt)) {
				txtArr = txt.replace(srchTxt, '$' + srchTxt + '$').split('$');
				return ( 
					<React.Fragment>
						{txtArr.map((item, index) => { return ((item === srchTxt) ? <mark key={index} style={{color: 'white', backgroundColor: 'black'}}>{item}</mark> : item);})}
					</React.Fragment>
				);
			} else {
				return txt;
			}
		},
		getKewordMark : (txt) => {
			if (this.state.dsKeywordList.length === 0) return txt;
			let txtArr, tmpText;
	
			tmpText = txt;
			this.state.dsKeywordList.forEach( item => {
				if (tmpText.includes(item['KEY_WORD'])) {
					tmpText = tmpText.replace(item['KEY_WORD'], '$' + item['KEY_WORD'] + '$');
				}
			});
			txtArr = tmpText.split('$');
	
			return txtArr.map(
				text => {
					if (this.state.dsKeywordList.filter(item => item['KEY_WORD'] === text).length > 0) {
						return this.state.dsKeywordList.filter(item => item['KEY_WORD'] === text).map(
							(ele, index) => {
								if (ele['KEY_TYPE'] === 'P') {
									return <font key={index} color="red"> { this.handler.getSrchMarker(text, this.state.searchText) } </font>;
								} else if (ele['KEY_TYPE'] === 'I') {
									return <font key={index} color="gray"> {this.handler.getSrchMarker(text, this.state.searchText)} </font>;
								} else {
									return <font key={index} color="green"> {this.handler.getSrchMarker(text, this.state.searchText)} </font>;
								}
							}
						)
					} else {
						return this.handler.getSrchMarker(text, this.state.searchText);
					}
				}
			)
		},
		getKeywords : () => {
			if (this.state.dsRcvSttJobData.length === 0 )return null;
			if (this.state.dsKeywordList.length === 0) return null;
	
			let kewordList = [];
			JSON.parse(this.state.dsRcvSttJobData[0]['TEXT']).forEach(
				(item) => {
					return this.state.dsKeywordList.forEach(ele => {
						if (item['VALUE'].includes(ele['KEY_WORD'])) {
							kewordList.push({ keyword: ele['KEY_WORD'], type : ele['KEY_TYPE'] });
						}
					})
				}
			);
			return (
				<React.Fragment>{
					kewordList.map(
						(item, index) => {
							switch (item['type']) {
								case "P": return <span key={index} className="scrm-player-kewords-list-item warn"> {item['keyword']} </span>;
								case "I": return <span key={index} className="scrm-player-kewords-list-item issue"> {item['keyword']} </span>;
								default: return <span key={index} className="scrm-player-kewords-list-item default"> {item['keyword']} </span>;
							}
						}
					)
				}</React.Fragment>
			);
		},
		refreshSearch : () => {
			if (StrLib.isNull(this.state.searchText)) {
				return;
			}
			// 선택된 텍스트만 마킹			
			let searched  = this.state.dsRealTimeSentence.filter(item => item['SENT_CONT'].includes(this.state.searchText));
			
			if (searched.length === 0) {
				this.setState({searchedIndex : 0, currentIndex : 0});
				
				return false;
			} else {
				let cntDupSearched = [];

				for (let i = 0; i < searched.length; i ++) {
					let regexAll = new RegExp(this.state.searchText, "g");
					let cnt = searched[i].SENT_CONT.match(regexAll); 

					for (let j = 0; j < cnt.length; j ++) {
						cntDupSearched.push(searched[i]);

					}
				}
				this.setState({searchedIndex : cntDupSearched, currentIndex : ((cntDupSearched.length -1 < this.state.currentIndex) ? cntDupSearched.length : this.state.currentIndex)});
			}
		},
		searchText : (txt, idx) => {
			// if (this.state.checkboxProps.chkAutoScroll.checked === 'Y') {
			// 	ComLib.openDialog('A', 'SYSI0010', ['자동 스크롤 해체후 검색하기 바랍니다.']);
			// 	return false;
			// }
			// 텍스트 초기화
			if (StrLib.isNull(txt)) {
				ComLib.openDialog('A', 'SYSI0010', ['텍스트가 없습니다.']);
				this.setState({ searchText: txt, searchedIndex : 0, currentIndex : 0})
				return false;
			}

			// 선택된 텍스트만 마킹			
			let searched  = this.state.dsRealTimeSentence.filter(item => item['SENT_CONT'].includes(txt));
			
			if (searched.length === 0) {
				this.setState({searchText: txt, searchedIndex : 0, currentIndex : 0});
				ComLib.openDialog('A', 'SYSI0010', ['일치하는 텍스트가 없습니다.']);
				return false;
			} else {
				let cntDupSearched = [];

				for (let i = 0; i < searched.length; i ++) {
					let regexAll = new RegExp(txt, "g");
					let cnt = searched[i].SENT_CONT.match(regexAll); 

					for (let j = 0; j < cnt.length; j ++) {
						cntDupSearched.push(searched[i]);

					}
				}
				this.setState({ searchText: txt, searchedIndex : cntDupSearched, currentIndex : idx }, () => {if (this.state.checkboxProps.chkAutoScroll.checked !== 'Y') {this.handler.moveListItem()}});
			}
		},
		moveListItem : () => {
			let location, item;
			item = document.getElementById(playerConstants.listItemDivId.item + this.state.searchedIndex[this.state.currentIndex]['IDX'].toString());
			location = item.offsetTop - document.getElementById(playerConstants.listItemDivId.container + this.props.constCd).offsetTop - 10;
	
			if (location < 0 ) location = 0;
	
			document.getElementById(playerConstants.listItemDivId.container + this.props.constCd).scrollTop = location;
		},
		moveToLastItem : () => {
			let item = document.getElementById(playerConstants.listItemDivId.item + this.state.dsRealTimeSentence[this.state.dsRealTimeSentence.length - 1]['IDX'].toString());
			// console.log(document.getElementById(playerConstants.listItemDivId.container + this.props.constCd) === null)
			document.getElementById(playerConstants.listItemDivId.container + this.props.constCd).scrollTop = item.offsetTop;
		}
	}
	
	render () {
		return (
			<div>
				<div style={{display: 'flex', width: '100%'}}>
					<div className="scrm-player-wrap" style={{width : '100%'}}>
						<ComponentPanel>
							<SubFullPanel>
								<RelativeGroup>
									<LFloatArea>
										{this.state.csState === 'I' 
											?
												<Label value="통화중"/>
											:
												<Label value="통화 종료"/>
										}
									</LFloatArea>
									<RFloatArea>
										<Checkbox   
											id       = {this.state.checkboxProps.chkAutoScroll.id}
											keyProp  = {this.state.checkboxProps.chkAutoScroll.keyProp}
											value    = {this.state.checkboxProps.chkAutoScroll.value}
											checked  = {this.state.checkboxProps.chkAutoScroll.checked}
											disabled = {this.state.checkboxProps.chkAutoScroll.disabled}
											onChange = {this.event.checkbox.onChange}
										/>
									</RFloatArea>
								</RelativeGroup>
								<RelativeGroup>
									<LFloatArea>
										<FlexPanel>
											<Textfield width={140} id={"iptSrchText"} value={this.state.srchText} onChange={this.event.input.onChange} onKeyPress={this.event.input.onKeyPress}/>
											{ this.state.searchedIndex.length > 0  && ( 
											<div style={{alignItems:"center", display:"flex"}}> {this.state.currentIndex+1} / {this.state.searchedIndex.length} </div> 
											)}

											<div style={{alignSelf : "center"}}>
												<BasicButton id={"btnSrchTextUp"} onClick={this.event.button.onClick} color={"purple"} size="xs" innerImage={true} icon = {'arrowUp'} ml="5px" tooltip={"위로"}/>
												<BasicButton id={"btnSrchTextDown"} onClick={this.event.button.onClick} color={"purple"} size="xs" innerImage={true} icon = {'arrowDn'} ml="5px" tooltip={"아래로"}/>
												<BasicButton id={"btnClearText"} onClick={this.event.button.onClick} color={"red"} size="xs" innerImage={true} icon = {'close'} ml="5px" mr="5px" tooltip={"초기화"}/>
											</div>
											<Selectbox
												id = {'selKeywordType'}
												value = {this.state.selKeywordType}
												dataset = {ComLib.convComboList(ComLib.getCommCodeList("STT_SYS_KWD", "KWD_TP"), newScrmObj.constants.select.argument.select)}
												width = {80}
												selected = {0}
												onChange= {this.event.select.onChange}
											/>
											<Selectbox
												id = {'selKewordList'}
												value = {this.state.selKeyword}
												dataset = {this.state.selKeywordData}
												width = {100}
												selected = {0}
												onChange= {this.event.select.onChange}
												color={this.state.selKeywordColor}

											/>
										</FlexPanel>
									</LFloatArea>
									<RFloatArea>																				
										<BasicButton id={"btnCopyAllText"} onClick={this.event.button.onClick} size="xs" innerImage={true} icon = {'copy'} mt="5px" tooltip={"텍스트 복사"}/>
										<BasicButton id={"btnSaveAllText"} onClick={this.event.button.onClick} size="xs" innerImage={true} icon = {'save'} mt="5px" tooltip={"텍스트 저장"}/>	
									</RFloatArea>
								</RelativeGroup>
							</SubFullPanel>
							<SubFullPanel>
								<div className="scrm-player-body" id={playerConstants.listItemDivId.container + this.props.constCd} style={{height : this.props.bodyHeight, marginTop : '10px'}}>
									{this.handler.getContents(this.state.dsRealTimeSentence)}
								</div>
							</SubFullPanel>
						</ComponentPanel>
					</div>
					{/* {
						(!this.state.openAnswerArea)
						?	null
						:	<div style = {{width : this.props.options.width}}>
								<AnswerArea data = {JSON.parse(this.state.dsRcvSttJobData[0]['TEXT'])}/>
							</div>
					} */}
				</div>
			</div>
		)
	}
}
export default RealTimeViewer;