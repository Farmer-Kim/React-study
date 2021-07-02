import React from 'react';
import {ComLib, TransManager, StrLib, DataLib, newScrmObj} from 'common';
import {Selectbox, Textfield, Textarea, LFloatArea, RFloatArea, RelativeGroup, ComponentPanel, FlexPanel, SubFullPanel, BasicButton, Grid, Switch} from 'components';
import { Howl } from 'howler';

const playerConstants = {
	itemBgColor :	{ default : "", selected : 'rgb(233, 233, 233)' },
	listItemDivId :	{ container :'player_list_container_id', container2 :'player_list_container_id2', item : 'player_list_item_id', ans :'player_list_ans_id' },
	markColor :		{ default : '', marked : '' }
}

class Player extends React.Component {
	constructor (props) {
		super(props);
		this.howler = null;
		this.grdPlayerList = null;
		this.grdPlayerListApi = null;
		this.state = {
			howler : null,
			listOpen : false,
			dsRcvSttData : [],
			dsRcvSttJobData : [],
			dsRcvSttAnsData : [],
			dsRcvSttAnsDataOrg : [],
			dsNewMissSen : [],
			dsUpdateMissSen : [],
			dsDeleteMissSen : [],
			dsKeywordList : [],
			src : '',
			playing : false,
			buffer : null,
			playable : false,
			volume: '0.5',
			rate : 1,
			seek : 0,
			duration : 0,
			srchText : '',
			searchText : '',
			searchedIndex : [],
			currentIndex : 0,
			selKeyword : '',
			selKeywordData: [{value : '', name : '선택'}],
			selKeywordType: '',
			openId: '',
			openAnswerArea : false,
			loadingBuffer : true,
			missSenEdited : false,
			dsRcvCallList : DataLib.datalist.getInstance(),
			newPath: ""
		};
		this.event.player.onLoad = this.event.player.onLoad.bind(this);
		this.event.player.onLoadError = this.event.player.onLoadError.bind(this);
		this.event.player.onPlay = this.event.player.onPlay.bind(this);
		this.event.player.onPause = this.event.player.onPause.bind(this);
		this.event.player.onStop = this.event.player.onStop.bind(this);
		this.event.player.onEnd = this.event.player.onEnd.bind(this);
		this.event.player.onClickListTime = this.event.player.onClickListTime.bind(this);
		this.event.input.onChange = this.event.input.onChange.bind(this);
		this.event.input.onKeyPress = this.event.input.onKeyPress.bind(this);
		this.event.select.onChange = this.event.select.onChange.bind(this);
		this.event.button.onClick = this.event.button.onClick.bind(this);
		this.event.switch.onChange = this.event.switch.onChange.bind(this);
		this.event.waveform.onChange = this.event.waveform.onChange.bind(this);
	}
	static defaultProps = {
		ctrNo : '_default',
		callId : '_default',
		bodyHeight : '405px',
	}
	componentDidMount () {		
		this.handler.initialize();
	}
	componentDidUpdate (prevProps, prevState) {
		if (prevState === this.state) {
			if (this.props.optionalTime !== undefined && this.props.optionalTime !== null) {
				if (prevProps.optionalTime !== this.props.optionalTime) {
					this.optionalTime = this.props.optionalTime;
					this.handler.setDs('PLAYER_R01', this.props.callId);
				}
			}
		}
	}
	componentWillUnmount () {
		if (this.howler) {
			this.howler.stop();
			this.howler.unload();
			this.howler = null;
		}
		
		// 데모 시연용 실시간도 24 번 서버에 올라가있음 
		// if (this.props.options.JOB_TP === 'C') {
		if (this.props.options.JOB_TP === 'C' || this.props.options.JOB_TP === 'R' ) {
			this.transaction("PLAYER_D01");
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
			if (!this.props.options.useUuid) {
				if (StrLib.isNull(this.state.dsRcvCallList.getValue(0, 'STT_UNQ')) || this.state.dsRcvCallList.size() < 1) {
					ComLib.openDialog('A', 'SYSI0010', ['콜데이터가 존재하지 않습니다.']);
					return false;
				}
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
			
			// call_id에 대한 Call list 가져오기
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid: "STT.R_getCallList",
				datasetsend:"dsSrchData",
				datasetrecv:"dsRcvCallList",
			});
			
			transManager.addDataset('dsSrchData', [{ CALL_ID : this.props.callId }]);
			transManager.agent();
			break;
		case 'PLAYER_R01':
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.setCallBack(this.callback);
			// UUID 대한 STT Job Data 가져오기
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid:  "STT.R_getSttJobData",
				datasetsend:"dsSrchData",
				datasetrecv:"dsRcvSttJobData",
			});

			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid:  "STT.R_getMissSenData",
				datasetsend:"dsSrchData",
				datasetrecv:"dsRcvMissSenData",
			});

			// 키워드 리스트 가져오기
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid: "STT.R_getKeyword",
				datasetsend:"dsSrchData",
				datasetrecv:"dsKeywordList",
			});

			if (!this.props.options.useUuid) {
				transManager.addDataset('dsSrchData', [{ UUID : this.grdPlayerListApi.getSelectedRows()[0]['STT_UNQ'] }]);
			} else {
				transManager.addDataset('dsSrchData', [{ UUID : this.props.options.UUID }]);
			}

			transManager.agent();

			break;

		case 'PLAYER_C01':
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.setCallBack(this.callback);

			let newMS    = this.state.dsNewMissSen;
			let updateMS = this.state.dsUpdateMissSen;
			let deleteMS = this.state.dsDeleteMissSen;
			
			if (newMS.length > 0) {
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.create,
					sqlmapid:  "STT.C_setMissSenData",
					datasetsend:"dsNewMissSen",
				});
	
				transManager.addDataset('dsNewMissSen', newMS);
			}
			if (updateMS.length > 0) {
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.create,
					sqlmapid:  "STT.U_setMissSenData",
					datasetsend:"dsUpdateMissSen",
				});
	
				transManager.addDataset('dsUpdateMissSen', updateMS);
			}
			if (deleteMS.length > 0) {
				transManager.addConfig({
					dao: transManager.constants.dao.base,
					crudh: transManager.constants.crudh.create,
					sqlmapid:  "STT.D_delMissSenData",
					datasetsend:"dsDeleteMissSen",
				});
	
				transManager.addDataset('dsDeleteMissSen', deleteMS);
			}

			transManager.agent();

			break;

		case 'PLAYER_R02':
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.sftp);
			transManager.setCallBack(this.callback);
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.sttSearch,
				datasetsend: "dsInfo",
				datasetrecv:"newPath",
			});

			transManager.addDataset('dsInfo', [{PATH: this.state.dsRcvSttJobData[0].FILE_PATH, USR_ID: ComLib.getSession("gdsUserInfo")[0].USR_ID, ACT_TP: "DOWNLOAD"}]);
			transManager.agent();
			break;
		case 'PLAYER_D01':
			transManager.setTransId(serviceid);
			transManager.setTransUrl(transManager.constants.url.sftp);
			transManager.setCallBack(this.callback);
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.sttSearch,
				datasetsend: "dsInfo",
			});
			transManager.addDataset('dsInfo', [{PATH: this.state.newPath, USR_ID: ComLib.getSession("gdsUserInfo")[0].USR_ID, ACT_TP: "D"}]);
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
				ComLib.openDialog('A', 'SYSI0010', ['콜데이터가 존재하지 않습니다.']);
				return false;
			}				
						
			ComLib.setStateRecords(this, "dsRcvCallList", res.data.dsRcvCallList, function (obj) {
				let dsRcvCallList = res.data.dsRcvCallList;
				let uuid = '';
				for (let i = 0; i < dsRcvCallList.length; i ++) {
					if (dsRcvCallList[i].CALL_ID === obj.props.callId) {
						uuid = dsRcvCallList[i].STT_UNQ;
						break;
					}
				}

				if (obj.validation('PLAYER_R01')) {
					obj.handler.setDs('PLAYER_R01', uuid); 
				}
			});	
			
			break;
		case 'PLAYER_R01':
			if (res.data.dsRcvSttJobData.length < 1) {
				ComLib.openDialog('A', 'SYSI0010', ['콜데이터가 존재하지 않습니다.']);
				return false;
			}

			if (res.data.dsRcvSttJobData.length > 0) {
				if (this.state.playing) {
					this.howler.stop();
					this.howler = null;
				}
				let srchText = "";

				if (!StrLib.isNull(this.props.options.srchText)) {
					srchText = this.props.options.srchText.split(" ")[0];
				}

				let dsRcvSttAnsData = JSON.parse(res.data.dsRcvSttJobData[0].STT_RSLT);
				let maxIndex = 0;
				let dsRcvMissSenData = res.data.dsRcvMissSenData
				
				if (StrLib.isNull(dsRcvSttAnsData)) {
					dsRcvSttAnsData= [];
				}
				
				for (let i = 0; i < dsRcvSttAnsData.length; i ++) {
					dsRcvSttAnsData[i].ACT_TP    = 'r';
					dsRcvSttAnsData[i].NEW_VALUE = "";
					dsRcvSttAnsData[i].NEW_SPK   = "";
					dsRcvSttAnsData[i].STT_UNQ   = res.data.dsRcvSttJobData[0].STT_UNQ;
					if (dsRcvSttAnsData[i].IDX > maxIndex ) {
						maxIndex = dsRcvSttAnsData[i].IDX;

					}
					}
				

				for (let j = 0; j < dsRcvMissSenData.length; j ++) {					
					let rcvMissMatched = false;
					let rcvMiss = dsRcvMissSenData[j];

					for (let i = 0; i < dsRcvSttAnsData.length; i ++) {
						if (dsRcvSttAnsData[i].IDX === rcvMiss.SORT_ORD) {
							dsRcvSttAnsData[i].NEW_VALUE = rcvMiss.ANS_SENT_CONT;								
							dsRcvSttAnsData[i].NEW_SPK   = rcvMiss.ANS_SPK_TP;
							dsRcvSttAnsData[i].ACT_TP    = rcvMiss.ACT_TP;
							dsRcvSttAnsData[i].UNQ       = rcvMiss.UNQ;

							rcvMissMatched = true;

							break;
						}
					}
					if (!rcvMissMatched) {
						let missStartLocation = rcvMiss.SENT_ST_TM;
						let missIndex = 0

						for (let i = 0; i < dsRcvSttAnsData.length; i ++) {
							if (dsRcvSttAnsData[i].POS_START > missStartLocation) {
								missIndex = i;

								break;
							}
						}

						dsRcvSttAnsData.splice(missIndex, 0, {UNQ: rcvMiss.UNQ, IDX: rcvMiss.SORT_ORD, VALUE: '',NEW_VALUE: rcvMiss.ANS_SENT_CONT, ACT_TP: rcvMiss.ACT_TP, POS_START: rcvMiss.SENT_ST_TM, POS_END: rcvMiss.SENT_ED_TM, SPK:'', NEW_SPK: rcvMiss.ANS_SPK_TP, STT_UNQ: rcvMiss.STT_UNQ });
						maxIndex = rcvMiss.SORT_ORD + 1;
					}
				}

				let dsKeywordList = res.data.dsKeywordList;

				for (let i = 0; i < dsKeywordList.length; i ++) {
					let cnt = 0;
					let regexAll = new RegExp(dsKeywordList[i].KWD, "g");

					for (let j = 0; j < dsRcvSttAnsData.length; j ++) {
						let text = dsRcvSttAnsData[j].VALUE
						let results = text.match(regexAll); 
						if (results !== null) {
							cnt += results.length;
						}						
					}
					
					dsKeywordList[i].KWD = dsKeywordList[i].KWD + "(" + cnt + ")";
				}

				
				this.setState({
						//howler : sound
					// 	dsKeywordList : res.data.dsKeywordList
					// ,	dsRcvSttData : res.data.dsRcvSttData
					playable : false,
					playing : false,
					dsRcvSttJobData : res.data.dsRcvSttJobData,
					dsRcvSttAnsData : dsRcvSttAnsData,
					dsRcvSttAnsDataOrg : JSON.parse(JSON.stringify(dsRcvSttAnsData)),
					missSenEdited : false,
					newIndex: maxIndex + 1,
					dsKeywordList: dsKeywordList,
					selKeywordData: [{value : '', name : '선택'}],
					srchText : srchText
				}, () => {
					// 데모 시연용 실시간도 24 번 서버에 올라가있음 
					if (this.props.options.JOB_TP === 'C' || this.props.options.JOB_TP === 'R' ) {
					// if (this.props.options.JOB_TP === 'C') {
						this.transaction("PLAYER_R02");
					} else {
						// src : [res.data.dsRcvSttJobData[0].FILE_PATH],
						// src : ["http://172.16.0.30:8080/home/vrm/work/2019010110151000270.wav"]
						this.howler = new Howl({
							src : [res.data.dsRcvSttJobData[0].FILE_PATH],
							format : ['mp3', 'wav', 'mp4'],
							html5: true,
							// preload : true,
							onplay : this.event.player.onPlay,
							onload : this.event.player.onLoad,
							onloaderror  : this.event.player.onLoadError,
							onpause: this.event.player.onPause,
							onend: this.event.player.onEnd,
							onstop : this.event.player.onStop
						});
						if (!StrLib.isNull(this.state.srchText)) {
							this.handler.searchText(this.state.srchText, 0);
						}
					}					
				});				
			} 
						
			// this.setWaveForm(res.data.dsRcvSttData[0].FILE_PATH);
			break;

		case 'PLAYER_R02':		
			this.howler = new Howl({
				src : [res.data.newPath],
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
			if (!StrLib.isNull(this.state.srchText)) {
				this.handler.searchText(this.state.srchText, 0);
			}
			this.setState({...this.state, newPath : res.data.newPath});
			break;

		case 'PLAYER_C01':
			ComLib.openDialog('A', 'SYSI0010', ['오인신 문장이 제출 되었습니다.']);
			this.howler.stop();
			this.transaction('PLAYER_R01'); 
			break;

		default : break;
		}
	}
	event = {
		input : {
			onChange : (e) => {
				switch (e.target.id) {
				case 'iptPlayerBar' :
					if (!this.howler) return;
					let time = (e.target.value * this.state.duration / 100);
					if (!this.state.playing) {
						this.setState({playing : true}, () => {
							this.howler.seek(time);
							this.howler.play();
						});
					} else {
						this.howler.seek(time);
					}
					break;
				case 'iptSrchText' :
					if (this.state.dsKeywordList.filter(item => item['KWD'] === e.target.value).length === 0) {
						this.setState({srchText : e.target.value , selKeyword : ''});
					} else {
						this.setState({srchText : e.target.value , selKeyword : e.target.value});
					}
					break;
				case 'iptVolumBar' :
					if (!this.howler) return;
					this.setState({ volume: parseFloat(e.target.value) }, () => this.howler.volume(this.state.volume));
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
						this.setState({ selKeywordType : e.target.value, selKeywordColor: ComLib.getComCodeCdVal('STT_SYS_KWD', e.target.value, 'KWD_TP')}, () => {
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

				case 'selVolume' :
					if (!this.howler) return;
					this.setState({rate : e.target.value}, () => this.howler.rate(this.state.rate));
					break;
				case 'selKewordList' :
					if (this.state.playing) {
						ComLib.openDialog('A', 'SYSI0010', ['정지 후 플레이어를 검색하기 바랍니다.']);
						return false;
					} else {
						let text = e.target.value.substring(0, e.target.value.indexOf('('));

						this.setState({ selKeyword : e.target.value, srchText : text }, () => {
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
				case 'btnCommitMisSen' :
					
					let ansData = this.state.dsRcvSttAnsData;
					let orgAnsData = this.state.dsRcvSttAnsDataOrg
					let newAnsData = [];
					let updateAnsData = [];
					let deleteAnsData = [];

					for (let i = 0; i < ansData.length; i ++) {
						let orgExist = false;
						let newData  = false;
						let chagned  = false;
						let deleted  = false;

						for (let j = 0; j < orgAnsData.length; j ++) {		
							if (ansData[i].IDX === orgAnsData[j].IDX) {
								orgExist = true;

								if (orgAnsData[j].ACT_TP !== 'r' && (orgAnsData[j].NEW_VALUE !== ansData[i].NEW_VALUE || orgAnsData[j].NEW_SPK !== ansData[i].NEW_SPK))	{
									if (ansData[i].ACT_TP === 'e') {
										deleted = true;
										
									} else {
										chagned = true;
									}
								} else if (orgAnsData[j].NEW_VALUE !== ansData[i].NEW_VALUE || orgAnsData[j].NEW_SPK !== ansData[i].NEW_SPK) {
									newData = true;
																	
								}	
								break;
							}							
						}
						
						if (deleted) {
							deleteAnsData.push(ansData[i]);

						} else if (chagned) {
							updateAnsData.push(ansData[i]);

						} else if (!orgExist || (orgExist && newData)) {
							newAnsData.push(ansData[i])

						}
					}

					if (newAnsData.length > 0 || updateAnsData.length > 0 || deleteAnsData.length > 0) {
						this.setState({...this.state, dsNewMissSen : newAnsData, dsUpdateMissSen : updateAnsData, dsDeleteMissSen : deleteAnsData}, () => {
							this.transaction('PLAYER_C01');
						})
						 
					}

					break;
				case 'btnPlayerPrev' :
					if (!this.howler) return;
					if (this.state.playing) {
						if (this.howler.seek() < 10) {
							this.howler.seek(0);
						} else {
							this.howler.seek(this.howler.seek() - 10);
						}
					} else {
						this.setState({playing : true}, () => {
							if (this.howler.seek() < 10) {
								this.howler.seek(this.howler.seek() - 10);
								this.howler.play();
							} else {
								this.howler.seek(this.howler.seek() - 10);
								this.howler.play();
							}
						});
					}
					break;
				case 'btnPlayerPlay' : 
					if (!this.howler) return;
					this.setState({ playing : !this.state.playing }, () => (this.state.playing) ? this.howler.play() : this.howler.pause()); break;
				case 'btnPlayerAfter' :
					if (!this.howler) return;
					if (this.state.playing) {
						if (this.howler.seek() + 10 > this.state.duration) {
							this.howler.seek(this.state.duration);
						} else {
							this.howler.seek(this.howler.seek() + 10);
						}
					} else {
						this.setState({playing : true}, () => {
							if (this.howler.seek()+ 10 > this.state.duration) {
								this.howler.seek(this.state.duration);
								this.howler.play();
							} else {
								this.howler.seek(this.howler.seek() + 10);
								this.howler.play();
							}
						});
					}
					break;
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
						let txtArr = this.state.dsRcvSttJobData[0]['STT_RSLT'];
						if (txtArr === undefined || txtArr.length === 0) return false;						
						ComLib.copyText(JSON.parse(txtArr).map((item, key) => {
							let text = "";
							text += (item["SPK"] === "A" ? "[상담사]" : "[고객]");
							text += "[" + this.handler.format(item["POS_START"]/100) + "]";
							text += item['VALUE'];
							return text;
						}))
						
						
					}
					break;
				case 'btnSaveAllText' :
					if (this.state.dsRcvSttJobData.length === 0) {
						ComLib.openDialog('A', 'SYSI0010', ['표시된 대화가 없습니다.']);
						return false;
					} else {
						let txtArr = this.state.dsRcvSttJobData[0]['STT_RSLT'];
						if (txtArr === undefined || txtArr.length === 0) return false;
						
						if (!this.props.options.useUuid) {
							ComLib.writeTxtFile(JSON.parse(txtArr).map((item, key) => {
								let text = "";
								text += (item["SPK"] === "A" ? "[상담사]" : "[고객]");
								text += "[" + this.handler.format(item["POS_START"]/100) + "]";
								text += item['VALUE'];
								return text;
							}).join("\r\n"), this.props.options.callId + ".txt" )

						} else {
							ComLib.writeTxtFile(JSON.parse(txtArr).map((item, key) => {
								let text = "";
								text += (item["SPK"] === "A" ? "[상담사]" : "[고객]");
								text += "[" + this.handler.format(item["POS_START"]/100) + "]";
								text += item['VALUE'];
								return text;
							}).join("\r\n"), this.props.options.UUID + ".txt" )
						}						
					}
					break;
				case 'btnOpenGrid' :
					this.setState({ listOpen : !this.state.listOpen });
					break;
				default : break;
				}
			}
		},
		player : {
			onLoad : () => {
				this.setState({playable: true, duration : this.howler.duration()} , () => {
					if (this.props.optionalTime !== undefined && this.props.optionalTime !== null && this.props.optionalTime !== -1) {
						if (!this.state.playing) {
							this.setState({ playing : true }, () => {
								this.howler.seek(this.props.optionalTime/100);
								this.howler.play();
							})
						} else {
							this.howler.seek(this.props.optionalTime/100);
						}
					}
				});
			},
			onLoadError : (id, code) => {
				console.log("howler onLoadError");
				console.log(this.howler)
				console.log(id)
				console.log(code)

				ComLib.openDialog('A', 'SYSI0010', ['녹취파일 다운로드에 실패하였습니다.']);
				this.setState({playable: false, duration : this.howler.duration()});
			},
			onPlay : () => {
				if (this.state.playable) {
					this.setState({playing : true});
					this.handler.renderSeekPos();
				}
			}, 
			onPause : () => {
				this.setState({playing : false});
			},
			onStop : () => {
				//this.setState({ playing : false });
			},
			onEnd : () => {
				this.setState({ playing: false, loadingFinish : true });
			},
			onClickListTime : (idx, pos, e) => {
				e.stopPropagation();
				if (!this.howler || !this.state.playable) return;
		
				if (!this.state.playing) {
					this.setState({playing : true}, () => {
						this.howler.seek(pos/100);
						this.howler.play();
					});
				} else {
					this.howler.seek(pos/100);
				}
			},
			onClickListValue : (idx, value, newValue, ACT_TP, spk) => {
				if (this.props.options.disAllowEdit) {
					return;
				}
				if (!StrLib.isNull(this.state.openId)) {
					document.body.removeChild(document.getElementById(this.state.openId));
					
				}

				let chagned = StrLib.isNull(newValue) ? value : newValue;
				let option = { width: '500px', height: '350px', modaless: false,
							param: [{
								INDEX: idx,
								VALUE: value,
								NEW_VALUE: chagned,
								TYPE: ACT_TP,
								SPK: spk
							}],
						};
				let openId = ComLib.openPop('AnswerArea', '오인식 문장 등록 : ' + this.props.callId, option, this.handler.setMissSen);

				this.setState({...this.state, openId: openId})
			}
		},
		grid : {
			onGridReady : (e) => {
				switch (e.id) {
					case "grdPlayerList":
						this.grdPlayerList = e.grid;
						this.grdPlayerListApi = e.gridApi;
						break;
					default: break;
				}
			},
			onRowDoubleClicked: (e) => {
				switch (e.id) {
				case "grdPlayerList":
					this.howler.stop();
					this.handler.setDs('PLAYER_R01', e.data['STT_UNQ']);
					break;
				default: break;
				}
			},
		},
		switch : {
			onChange: (e) => {
				switch (e.target.id) {
				case 'swchAnswerArea' :
					this.setState({ openAnswerArea : !this.state.openAnswerArea}, () => {
						// 화면 조정
						if (this.props.popupdivid) {
							if (this.state.openAnswerArea) {
								let numberWidth = Number(this.props.options.width.split('px')[0]);
								numberWidth = numberWidth * 2;
								document.getElementById(this.props.popupdivid + "_inner_div").style.width = numberWidth.toString() + 'px';
							} else {
								document.getElementById(this.props.popupdivid + "_inner_div").style.width = this.props.options.width;
							}
						}
						
					});
					break;
				default : break;
				}
			}
		},
		waveform : {
			onChange: (pos) => {
				if (!this.howler) return;
				this.howler.seek(Math.round(pos * this.state.duration));
				if (!this.state.playing) {
					this.setState({ playing: true }, () => this.howler.play());
				}
			}
		}
	}
	handler = {
		initialize : () => {
			if (this.props.options.useUuid) {
				if (this.validation('PLAYER_R01')) {
					this.transaction('PLAYER_R01'); 
				}

			} else {				
				this.transaction('PLAYER_R00');	
			}
		},
		setDs : (serviceid, uuid) => {
			switch (serviceid) {
			case 'PLAYER_R01' :
				if (!this.props.options.useUuid) {
					this.grdPlayerListApi.forEachNode((node, index) => {						
						if (StrLib.isNull(uuid)) {
							if (index === 0) {
								node.setSelected(true);
							}
						} else {
							if (node['data']['STT_UNQ'] === uuid) {
								node.setSelected(true);
							}
						}
					})
				}
				this.transaction('PLAYER_R01');
				break;
			default : break;
			}
		},
		renderSeekPos : () => {
			if (this.howler === null ) {
				cancelAnimationFrame(requestAnimationFrame(this.handler.renderSeekPos));
			} else {
				let index, item, location, matched;
		
				matched  = JSON.parse(this.state.dsRcvSttJobData[0]['STT_RSLT']).filter(item => ((item.POS_START/100) <= this.howler.seek()) && ((item.POS_END/100) > this.howler.seek()));
				if (matched.length === 0) {
		
				} else {
					index = matched[0]['IDX'];
					item = document.getElementById(playerConstants.listItemDivId.item + index.toString() + this.props.ctrNo);
		
					if (item.style.backgroundColor === playerConstants.itemBgColor.default) {
						// bgcolor 초기화
						JSON.parse(this.state.dsRcvSttJobData[0]['STT_RSLT']).forEach(item => {
							if (document.getElementById(playerConstants.listItemDivId.item + item['IDX'].toString() + this.props.ctrNo).style.backgroundColor !== playerConstants.itemBgColor.default) {
								document.getElementById(playerConstants.listItemDivId.item + item['IDX'].toString() + this.props.ctrNo).style.backgroundColor = playerConstants.itemBgColor.default;
							}
						});
						// matching 된 list만 색변경
						item.style.backgroundColor = playerConstants.itemBgColor.selected;
		
						// matched된 list의 scroll위치 조정
						location = item.offsetTop - document.getElementById(playerConstants.listItemDivId.container + this.props.ctrNo).offsetTop - 200;
						if (location < 0 ) location = 0;
						
						// scroll 이동
						document.getElementById(playerConstants.listItemDivId.container + this.props.ctrNo).scrollTop = location;
					}
				}
		
				if (this.howler.seek() === this.state.duration || !this.state.playing) {
					cancelAnimationFrame(requestAnimationFrame(this.handler.renderSeekPos));
				} else {
					this.setState({ seek: this.howler.seek() });
					requestAnimationFrame(this.handler.renderSeekPos);
				}
			}
		},
		format : (seconds) => {
			const date = new Date(seconds * 1000)
			const hh = date.getUTCHours();
			const mm = date.getUTCMinutes();
			const ss = this.handler.pad(date.getUTCSeconds());
			if (hh) {
			  return `${hh}:${this.handler.pad(mm)}:${ss}`;
			}
			return `${mm}:${ss}`;
		},
		pad : (string) => { return ('0' + string).slice(-2); },
		getSrchMarker : (txt, srchTxt) => {
			let txtArr;
			if (StrLib.isNull(srchTxt)) {
				return txt;
			}
			if (txt.includes(srchTxt)) {
				txtArr = txt.replaceAll(srchTxt, '$' + srchTxt + '$').split('$');
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
				let testKwd = item['KWD'].substring(0, item['KWD'].indexOf('('));

				if (tmpText.includes(testKwd)) {
					tmpText = tmpText.replaceAll(testKwd, '$' + testKwd + '$');
				}
				
			});
			
			txtArr = tmpText.split('$');
	
			return txtArr.map(
				text => {

					if (this.state.dsKeywordList.filter(item => item['KWD'].substring(0, item['KWD'].indexOf('(')) === text).length > 0) {
						return this.state.dsKeywordList.filter(item => item['KWD'].substring(0, item['KWD'].indexOf('(')) === text).map(
							(ele, index) => {
								let selectBoxClass = " scrm-react-custom-selectbox-" + ComLib.getComCodeCdVal('STT_SYS_KWD', ele['KWD_TP'], 'KWD_TP');
								
								return <font key={index} className={selectBoxClass}> { this.handler.getSrchMarker(text, this.state.searchText) } </font>;
								
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
			JSON.parse(this.state.dsRcvSttJobData[0]['STT_RSLT']).forEach(
				(item) => {
					return this.state.dsKeywordList.forEach(ele => {
						if (item['VALUE'].includes(ele['KWD'])) {
							kewordList.push({ keyword: ele['KWD'], type : ele['KWD_TP'] });
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
			// 플레이어가 재생중인 지 확인
			if (this.state.playing) {
				ComLib.openDialog('A', 'SYSI0010', ['정지 후 플레이어를 검색하기 바랍니다.']);
				return false;
			}
			// 텍스트 초기화
			if (StrLib.isNull(txt)) {
				ComLib.openDialog('A', 'SYSI0010', ['텍스트가 없습니다.']);
				this.setState({ searchText: txt, searchedIndex : 0, currentIndex : 0})
				return false;
			}
			// 선택된 텍스트만 마킹
			let searched  = JSON.parse(this.state.dsRcvSttJobData[0]['STT_RSLT']).filter(item => item['VALUE'].includes(txt));			
			if (searched.length === 0) {
				this.setState({searchText: txt, searchedIndex : 0, currentIndex : 0});
				ComLib.openDialog('A', 'SYSI0010', ['일치하는 텍스트가 없습니다.']);
				return false;
			} else {
				let cntDupSearched = [];

				for (let i = 0; i < searched.length; i ++) {
					let regexAll = new RegExp(txt, "g");
					let cnt = searched[i].VALUE.match(regexAll); 

					for (let j = 0; j < cnt.length; j ++) {
						cntDupSearched.push(searched[i]);

					}
				}
				this.setState({ searchText: txt, searchedIndex : cntDupSearched, currentIndex : idx }, () => this.handler.moveListItem());
			}
		},
		moveListItem : () => {
			let location, item;
			item = document.getElementById(playerConstants.listItemDivId.item + this.state.searchedIndex[this.state.currentIndex]['IDX'].toString() + this.props.ctrNo);
			location = item.offsetTop - document.getElementById(playerConstants.listItemDivId.container + this.props.ctrNo).offsetTop - 10;
	
			if (location < 0 ) location = 0;
	
			document.getElementById(playerConstants.listItemDivId.container + this.props.ctrNo).scrollTop = location;
		},
		setMissSen : (e) => {
			let state = this.state;
			if (e.type === 'noChange') {
				state.openId = '';
			} else if (e.type === 'update') {
				for (let i = 0; i < state.dsRcvSttAnsData.length; i ++) {
					if (state.dsRcvSttAnsData[i].IDX === e.index) {
						state.dsRcvSttAnsData[i].NEW_VALUE = e.value;
						state.dsRcvSttAnsData[i].NEW_SPK   = e.spk;
						
						if (state.dsRcvSttAnsData[i].ACT_TP !== 'c') {
							let ACT_TP = 'c'
							for (let j = 0; j < state.dsRcvSttAnsDataOrg.length; j ++) {
								if (state.dsRcvSttAnsDataOrg[j].IDX === e.index) {
									if (state.dsRcvSttAnsDataOrg[j].VALUE === e.value && state.dsRcvSttAnsDataOrg[j].NEW_SPK === e.spk ) {
										ACT_TP = 'r'
									} else {
										ACT_TP = 'u'
									}
								}
							}
							state.dsRcvSttAnsData[i].ACT_TP = ACT_TP;	
						}
						
						break;					
					}
				}
			} else if (e.type === 'reset') {
				if (StrLib.isNull(e.value)) {
					for (let i = 0; i < state.dsRcvSttAnsData.length; i ++) {
						if (state.dsRcvSttAnsData[i].IDX === e.index) { 
							let orgExist = false;

							for (let j = 0; j < state.dsRcvSttAnsDataOrg.length; j ++) {		
								if (state.dsRcvSttAnsData[i].IDX === state.dsRcvSttAnsDataOrg[j].IDX) {
									orgExist = true;
	
									break;
								}							
							}	
							if (orgExist) {
								state.dsRcvSttAnsData[i].NEW_VALUE = "";						
								state.dsRcvSttAnsData[i].ACT_TP = 'e';	
							} else {
								state.dsRcvSttAnsData.splice(i, 1);	
							}
							
							break;								
						}
					}
				} else {
					for (let i = 0; i < state.dsRcvSttAnsData.length; i ++) {
						if (state.dsRcvSttAnsData[i].IDX === e.index) {
							state.dsRcvSttAnsData[i].NEW_VALUE = "";								
							state.dsRcvSttAnsData[i].NEW_SPK   = state.dsRcvSttAnsData[i].SPK;					
							state.dsRcvSttAnsData[i].ACT_TP = 'r';		
							break;									
						}
					}
				}
				
			} else if (e.type === 'new') {
				for (let i = 0; i < state.dsRcvSttAnsData.length; i ++) {
					if (state.dsRcvSttAnsData[i].IDX === e.index) {
						state.dsRcvSttAnsData.splice(i + 1, 0, {IDX: state.newIndex, VALUE: '',NEW_VALUE: e.value, ACT_TP: 'c', POS_START: state.dsRcvSttAnsData[i].POS_START + 1, POS_END: state.dsRcvSttAnsData[i].POS_END + 2, NEW_SPK: e.spk, STT_UNQ: state.dsRcvSttAnsData[i].STT_UNQ });
						state.newIndex += 1;
						break;					


					}
				}
				
			} else {
				for (let i = 0; i < state.dsRcvSttAnsData.length; i ++) {
					if (state.dsRcvSttAnsData[i].IDX === e.index) {
						state.dsRcvSttAnsData[i].NEW_VALUE = e.value;
						state.dsRcvSttAnsData[i].NEW_SPK   = e.spk;
						state.dsRcvSttAnsData[i].ACT_TP = 'd';			
						break;								
					}
				}
			}

			this.setState(state, () => {
				let dsRcvSttAnsData = this.state.dsRcvSttAnsData;
				let dsRcvSttAnsDataOrg = this.state.dsRcvSttAnsDataOrg;
				let changed = false;

				for (let i = 0; i < dsRcvSttAnsData.length; i ++) {
					
					if (JSON.stringify(dsRcvSttAnsData[i]) !== JSON.stringify(dsRcvSttAnsDataOrg[i])) {
						changed = true;
						break;
					}
				}	

				this.setState({...this.state, openId: '', missSenEdited: changed}, () =>{

				})
				
			});

		}
	}
	
	render () {
		return (
			<div>
				<div style={{display: 'flex', width: '100%'}}>
					<div className="scrm-player-wrap" style={{width : (this.state.openAnswerArea) ? '50%' : '100%'}}>
						<ComponentPanel>
							{!this.props.options.useUuid ?
								<RFloatArea>
									<BasicButton id={"btnOpenGrid"} onClick={this.event.button.onClick} size="xs" innerImage={true} icon = {(this.state.listOpen) ? 'arrowUp' : 'arrowDn'} />
								</RFloatArea>								
								: 
								null	
							}
							{!this.props.options.useUuid ?
								<div style = {{display : (this.state.listOpen) ? 'block' : 'none' }}>
									<Grid
										id={'grdPlayerList'} height= {"140px"}
										noName = {true}
										header = {[
											{headerName: '상담원명',		field: 'CONST_NM',		colId: 'CONST_NM', width : '100', textAlign : 'center'},
											{headerName: '등록일시',		field: 'REG_DTM',		colId: 'REG_DTM', textAlign : 'center', width : '180'}, 
											{headerName: '통화시간',		field: 'REC_TM',		colId: 'REC_TM', textAlign : 'center', width : '130'},
											{headerName: '통화종류',		field: 'CALL_TP',		colId: 'CALL_TP', textAlign : 'center', width : '130', valueFormatter : (params) => { return ComLib.getComCodeName('CMN', params.value,'CALL_TP')}, resizable : false},
										]}
										rowNum = {false}
										addRowBtn = {false}
										delRowBtn = {false}
										data = {this.state.dsRcvCallList}
										onGridReady = {this.event.grid.onGridReady}
										onRowDoubleClicked = {this.event.grid.onRowDoubleClicked}
										// paging = {true}
										// infinite = {true}
										
										suppressRowClickSelection = {true}
										// infoCheckBox = {{ use : true }}
										rowSelection = 'single'
									/>
								</div>								
								: 
								null	
							}

							<input	className='scrm-player-playbar' type='range' min={0} max={100} step='any'
									id = "iptPlayerBar" value = {(this.state.duration) ? (this.state.seek / this.state.duration * 100) : 0}
									onChange = {this.event.input.onChange}
							/>
							<SubFullPanel>
								<RelativeGroup>
									<LFloatArea>
										<FlexPanel>
											<BasicButton id={"btnPlayerPrev"} onClick={this.event.button.onClick} color={"blue"} size="xs" innerImage={true} icon = {'undo'} ml="5px" tooltip={"10초 이전"} disabled = {!this.state.playable}/>
											<BasicButton id={"btnPlayerPlay"} onClick={this.event.button.onClick} color={"green"} size="xs" innerImage={true} icon = {(!this.state.playing) ? 'play': 'pause'} ml="5px" tooltip={(!this.state.playing) ? '재생': '정지'} disabled = {!this.state.playable}/>
											<BasicButton id={"btnPlayerAfter"} onClick={this.event.button.onClick} color={"blue"} size="xs" innerImage={true} icon = {'redo'} ml="5px" tooltip={"10초 이후"} disabled = {!this.state.playable}/>
										</FlexPanel>
									</LFloatArea>
									<RFloatArea>
										<FlexPanel>
											<Selectbox
												id = {'selVolume'}
												value = {this.state.rate}
												dataset = {[
													{value : 0.5, name : 'x0.5'},
													{value : 1.0, name : 'x1'},
													{value : 1.5, name : 'x1.5'},
													{value : 2.0, name : 'x2.0'},
												]}
												width = {50}
												disabled = {!this.state.playable}
												selected = {1}
												onChange= {this.event.select.onChange}
											/>
											<input id={'iptVolumBar'} className = "scrm-player-volumebar" type='range' min='0' max='1' step='.05' value={this.state.volume} onChange={this.event.input.onChange} disabled = {!this.state.playable}/>
											<div>
												<time dateTime={`P${Math.round(this.state.seek)}S`}>
													{this.handler.format(this.state.seek)}
												</time>
													{' / '}
												<time dateTime={`P${Math.round(this.state.duration)}S`}>
													{this.handler.format(Math.round(this.state.duration))}
												</time>
											</div>
										</FlexPanel>
									</RFloatArea>
								</RelativeGroup>
							</SubFullPanel>
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
										{/* <Switch id={"swchAnswerArea"} onChange = {this.event.switch.onChange} checked = {this.state.openAnswerArea}/> */}
										{/* <button>{'정답지작성'}</button> */}
									</RFloatArea>
								</RelativeGroup>
							</SubFullPanel>
							<SubFullPanel>
								{this.state.missSenEdited ? 
									<div style={{position: "absolute", zIndex: "100", marginTop: "10px", marginLeft: "200px"}}>
										<LFloatArea>
											<BasicButton id={"btnCommitMisSen"} onClick={this.event.button.onClick} innerImage={true} fiiled="o" color="purple" icon = {'save'} value={'오인식 문장 제출'}/>
										</LFloatArea>
									</div>
								:
									null
								}
								<div className="scrm-player-body" id={playerConstants.listItemDivId.container + this.props.ctrNo} style={{height : parseInt(this.props.bodyHeight.split('px')[0]) + ((this.state.listOpen) ? 0 : 125) + 'px', marginTop : '10px'}}>
									{this.state.missSenEdited ? 
										<div style={{height: "43px"}}>
										</div>
									:
										null
									}
									{this.state.dsRcvSttAnsData.filter(item => item['ACT_TP'] !== 'e').map((ele, index) => {
										return (
											<div key={index} id={playerConstants.listItemDivId.item + (index+1).toString() + this.props.ctrNo} className="scrm-player-list-item-container">
												<div className={StrLib.isNull(ele['NEW_SPK']) ? (ele['SPK'] !== 'A') ?  'scrm-player-list-item-client' : 'scrm-player-list-item-caller' : (ele['NEW_SPK'] !== 'A') ?  'scrm-player-list-item-client' : 'scrm-player-list-item-caller'}>
													<div className="scrm-player-list-item-img-div">
														<span><i className="xi-message-o"></i></span>
													</div>
													<div className="scrm-player-list-item-contents">
														<div className="scrm-player-list-item-time-div">
															<span className='scrm-player-list-item-time' onClick={(e)=> {this.event.player.onClickListTime(ele.IDX, ele.POS_START, e)}}>{ this.handler.format(ele.POS_START/100) }</span>
														</div>
														<div className="scrm-player-list-item-text-div">
															<span className='scrm-player-list-item-text' onClick={(e)=> {this.event.player.onClickListValue(ele.IDX, ele.VALUE, ele.NEW_VALUE, ele.ACT_TP, StrLib.isNull(ele.NEW_SPK) ? ele.SPK : ele.NEW_SPK)}}>
																{this.handler.getKewordMark(ele.VALUE)}
																{ ele.ACT_TP === 'r'
																	? 
																	null
																	: 
																	ele.ACT_TP !== 'd' 
																		?
																		ele.VALUE !== ele.NEW_VALUE
																			?
																			<span style={{color : 'red'}}>{'[오인식 문장]'}</span>
																			:
																			<span style={{color : 'red'}}>{'[발화자 변경]'}</span>
																		:
																		null
																}
																{ StrLib.isNull(ele.NEW_VALUE) 
																	? 
																	null
																	: 
																	<div><span style={{color : 'red'}}>{ele.NEW_VALUE}</span></div>
																}

																
															</span>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</SubFullPanel>
						</ComponentPanel>
					</div>						
					{
							(!this.state.openAnswerArea)
								?	
									null
								:		
								<div className="scrm-player-wrap" style={{width : (this.state.openAnswerArea) ? '50%' : '100%'}}>							
									<div style = {{width : this.props.options.width}}>
										<ComponentPanel>
											<div className="scrm-player-body" id={playerConstants.listItemDivId.container2 + this.props.ctrNo} style={{height : parseInt(this.props.bodyHeight.split('px')[0]) + ((this.state.listOpen) ? 0 : 125) + 'px', marginTop : '10px'}}>
											
											</div>											
										</ComponentPanel>
									</div>
								</div>
						}
				</div>
			</div>
		)
	}
}
export default Player;