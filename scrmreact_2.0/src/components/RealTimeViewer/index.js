import React from 'react';
import {ComLib, TransManager, StrLib, DataLib} from 'common';
import {Selectbox, Textfield, LFloatArea, RFloatArea, RelativeGroup, ComponentPanel, FlexPanel, SubFullPanel, BasicButton, Checkbox} from 'components';
import { Howl } from 'howler';

const playerConstants = {
	itemBgColor :	{ default : "", selected : 'rgb(233, 233, 233)' },
	listItemDivId :	{ container :'player_list_container_id', item : 'player_list_item_id' },
	markColor :		{ default : '', marked : '' }
}

class RealTimeViewer extends React.Component {
	constructor (props) {
		super(props);
		this.howler = null;
		this.grdPlayerList = null;
		this.grdPlayerListApi = null;
		this.state = {
			dsRcvSttData : [],
			dsRcvSttJobData : [],
			dsKeywordList : [],
			src : '',
			seek : 0,
			srchText : '',
			searchText : '',
			searchedIndex : [],
			currentIndex : 0,
			selKewword : '',
			loadingBuffer : true,
			dsRcvCallList : DataLib.datalist.getInstance(),
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
		ctrNo : '_default',
		callId : '_default',
		bodyHeight : '405px'
	}
	componentDidMount () {
		this.handler.initialize();
	}
	componentDidUpdate (prevProps, prevState) {
		// if (prevState === this.state) {
		// 	if (this.props.optionalTime !== undefined && this.props.optionalTime !== null) {
		// 		if (prevProps.optionalTime !== this.props.optionalTime) {
		// 			this.optionalTime = this.props.optionalTime;
		// 			this.handler.setDs('PLAYER_R01', this.props.callId);
		// 		}
		// 	}
		// }
	}
	componentWillUnmount () {
		if (this.howler) {
			this.howler.stop();
			this.howler = null;
		}
	}
	validation = (serviceid) => {
		switch (serviceid) {
		case 'PLAYER_R00': 
			if (StrLib.isNull(this.props.ctrNo)) {
				ComLib.openDialog('A', 'SYSI0010', ['계약번호가 존재하지 않습니다.']);
				return false;
			}
			return true;
		case 'PLAYER_R01':
			if (StrLib.isNull(this.state.dsRcvCallList.getValue(0, 'CALL_ID')) || this.state.dsRcvCallList.size() < 1) {
				ComLib.openDialog('A', 'SYSI0010', ['계약번호에 대한 콜데이터가 존재하지 않습니다.']);
				return false;
			}
			return true;
		default : break;
		}
	}

	transaction = (serviceid) => {
		let transManager = new TransManager();
		switch (serviceid) {
		case 'PLAYER_R00': 
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.setCallBack(this.callback);
			// 계약번호에 대한 Call list 가져오기
			// transManager.addConfig({
			// 	dao: transManager.constants.dao.base,
			// 	crudh: transManager.constants.crudh.read,
			// 	sqlmapid: "STT.R_Keyword",
			// 	datasetsend:"dsSrchData",
			// 	datasetrecv:"dsKeywordList",
			// });
			// 키워드 리스트 가져오기
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid: "STT.R_CtrCallList",
				datasetsend:"dsSrchData",
				datasetrecv:"dsRcvCallList",
			});
			transManager.addDataset('dsSrchData', [{ CTR_NO : this.props.ctrNo }]);
			transManager.agent();
			break;
		case 'PLAYER_R01':
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.setCallBack(this.callback);
			// CallId에 대한 STT Job Data 가져오기
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid:  "STT.R_getSttJobData",
				datasetsend:"dsSrchData",
				datasetrecv:"dsRcvSttJobData",
			});

			transManager.addDataset('dsSrchData', [{ CALL_ID : this.grdPlayerListApi.getSelectedRows()[0]['CALL_ID'] }]);
			transManager.agent();
			break;
		default : break;
		}
		transManager = null;
	}
	callback = (res) => {
		switch(res.id) {
		case 'PLAYER_R00':
			if (res.data.dsRcvCallList.length < 1) {
				ComLib.openDialog('A', 'SYSI0010', ['계약번호에 대한 콜데이터가 존재하지 않습니다.']);
				return false;
			}
			this.setState({ dsKeywordList : res.data.dsKeywordList });
			ComLib.setStateRecords(this, "dsRcvCallList", res.data.dsRcvCallList, function (obj) {
				if (obj.validation('PLAYER_R01')) {
					obj.handler.setDs('PLAYER_R01', obj.props.callId); 
				}
			});
			break;
		case 'PLAYER_R01':
			if (res.data.dsRcvSttJobData.length > 0) {
				if (this.state.checkboxProps.chkAutoScroll.checked === 'Y') {
					this.howler.stop();
					this.howler = null;
				}
				this.setState({
						//howler : sound
					// 	dsKeywordList : res.data.dsKeywordList
					// ,	dsRcvSttData : res.data.dsRcvSttData
					playable : false,
					playing : false,
					dsRcvSttJobData : res.data.dsRcvSttJobData
				}, () => {
					this.howler = new Howl({
						src : [res.data.dsRcvSttJobData[0].PATH_NM],
						format : ['mp3', 'wav', 'mp4'],
						// html5: true,
						// preload : true,
						onplay : this.event.player.onPlay,
						onload : this.event.player.onLoad,
						onloaderror  : this.event.player.onLoadError,
						onpause: this.event.player.onPause,
						onend: this.event.player.onEnd,
						onstop : this.event.player.onStop
					});
				});
			}
			// this.setWaveForm(res.data.dsRcvSttData[0].PATH_NM);
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
						this.setState({srchText : e.target.value , selKewword : ''});
					} else {
						this.setState({srchText : e.target.value , selKewword : e.target.value});
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
				case 'selVolume' :
					if (!this.howler) return;
					this.setState({rate : e.target.value}, () => this.howler.rate(this.state.rate));
					break;
				case 'selKewordList' :
					if (this.state.checkboxProps.chkAutoScroll.checked === 'Y') {
						ComLib.openDialog('A', 'SYSI0010', ['자동 스크롤 해체후 검색하기 바랍니다.']);
						return false;
					} else {
						this.setState({ selKewword : e.target.value, srchText : e.target.value }, () => {
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
					if (this.state.dsRcvSttJobData.length === 0) {
						ComLib.openDialog('A', 'SYSI0010', ['표시된 대화가 없습니다.']);
						return false;
					} else {
						let txtArr = this.state.dsRcvSttJobData[0]['TEXT'];
						if (txtArr === undefined || txtArr.length === 0) return false;
						ComLib.copyText(JSON.parse(txtArr).map(item => item['VALUE']));
					}
					break;
				case 'btnSaveAllText' :
					if (this.state.dsRcvSttJobData.length === 0) {
						ComLib.openDialog('A', 'SYSI0010', ['표시된 대화가 없습니다.']);
						return false;
					} else {
						let txtArr = this.state.dsRcvSttJobData[0]['TEXT'];
						if (txtArr === undefined || txtArr.length === 0) return false;
						// 이한울
						ComLib.writeTxtFile(JSON.parse(txtArr).map(item => item['VALUE']).join("\r\n"), this.props.ctrNo + ".txt");
					}
					break;
				case 'btnOpenGrid' :
					this.setState({ listOpen : !this.state.listOpen });
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
			// if (StrLib.isNull(this.props.ctrNo)) {
			// 	ComLib.openDialog('A', 'SYSI0010', ['계약번호가 존재하지 않습니다.']);
			// 	return false;
			// }
			// this.transaction('PLAYER_R00');
		},
		setDs : (serviceid, data) => {
			switch (serviceid) {
			case 'PLAYER_R01' :
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
				this.transaction('PLAYER_R01');
				break;
			default : break;
			}
		},
		pad : (string) => { return ('0' + string).slice(-2); },
		getContents : (data) => {
			if (data.length === 0) return null;
			return this.handler.getListItem(data[0].TEXT);
		},
		getListItem : (item) => {
			return JSON.parse(item).map((ele, index) => {
				return (
					<div key={index} id={playerConstants.listItemDivId.item + (index+1).toString()} className="scrm-player-list-item-container">
						<div className={(ele['SPK'] === 'N') ?  'scrm-player-list-item-client' : 'scrm-player-list-item-caller'}>
							<div className="scrm-player-list-item-img-div">
								<span><i className="xi-message-o"></i></span>
							</div>
							<div className="scrm-player-list-item-contents">
								{/* <div className="scrm-player-list-item-time-div">
									<span className='scrm-player-list-item-time'>{ this.handler.format(ele.POS_START/100) }</span>
								</div> */}
								<div className="scrm-player-list-item-text-div">
									<span className='scrm-player-list-item-text'>
										{ this.handler.getKewordMark(ele.VALUE) }
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
		searchText : (txt, idx) => {
			if (this.state.checkboxProps.chkAutoScroll.checked === 'Y') {
				ComLib.openDialog('A', 'SYSI0010', ['자동 스크롤 해체후 검색하기 바랍니다.']);
				return false;
			}
			// 텍스트 초기화
			if (StrLib.isNull(txt)) {
				ComLib.openDialog('A', 'SYSI0010', ['텍스트가 없습니다.']);
				return false;
			}
			// 선택된 텍스트만 마킹
			let searched  = JSON.parse(this.state.dsRcvSttJobData[0]['TEXT']).filter(item => item['VALUE'].includes(txt));
			if (searched.length === 0) {
				this.setState({searchText: txt, searchedIndex : 0, currentIndex : 0});
				ComLib.openDialog('A', 'SYSI0010', ['일치하는 텍스트가 없습니다.']);
				return false;
			} else {
				this.setState({ searchText: txt, searchedIndex : searched, currentIndex : idx }, () => this.handler.moveListItem());
			}
		},
		moveListItem : () => {
			let location, item;
			item = document.getElementById(playerConstants.listItemDivId.item + this.state.searchedIndex[this.state.currentIndex]['IDX'].toString());
			location = item.offsetTop - document.getElementById(playerConstants.listItemDivId.container + this.props.ctrNo).offsetTop - 10;
	
			if (location < 0 ) location = 0;
	
			document.getElementById(playerConstants.listItemDivId.container + this.props.ctrNo).scrollTop = location;
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
												id = {'selKewordList'}
												value = {this.state.selKewword}
												dataset = {[{value : '', name : '전체'}].concat(this.state.dsKeywordList.map((item) => {
													return { value : item['KEY_WORD'], name : item['KEY_WORD']}
												}))}
												width = {100}
												selected = {0}
												onChange= {this.event.select.onChange}
											/>
										</FlexPanel>
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
										<BasicButton id={"btnCopyAllText"} onClick={this.event.button.onClick} size="xs" innerImage={true} icon = {'copy'} mt="5px" tooltip={"텍스트 복사"}/>
										<BasicButton id={"btnSaveAllText"} onClick={this.event.button.onClick} size="xs" innerImage={true} icon = {'save'} mt="5px" tooltip={"텍스트 저장"}/>	
									</RFloatArea>
								</RelativeGroup>
							</SubFullPanel>
							<SubFullPanel>
								<div className="scrm-player-body" id={playerConstants.listItemDivId.container + this.props.ctrNo} style={{height : parseInt(this.props.bodyHeight.split('px')[0]) + ((this.state.listOpen) ? 0 : 255) + 'px', marginTop : '10px'}}>
									{this.handler.getContents(this.state.dsRcvSttJobData)}
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