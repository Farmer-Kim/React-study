// STT 학습
import React from 'react';
import {
	ComponentPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button} from 'components';
import {Textfield} from 'components';
import {ComLib, DataLib, newScrmObj, StrLib} from 'common';

class View extends React.Component {
	constructor(props) {
		super();
		this.state = {
			dsStudyList : DataLib.datalist.getInstance(),
			buttonProps : {
				btnSearch : {
					id : 'btnSearch',
					disabled : false,
					value : '조회',
					hidden : false,
					icon : 'srch',
					innerImage : true ,
					color : "blue"
				},
				btnAddSentence : {
					id : 'btnAddSentence',
					disabled : true,
					value : '추가',
					hidden : false,
					color : "purple",					
				}
			},
			textFieldProps : {
				iptSearchSentence : {
					id   : 'iptSearchSentence',
					name : 'iptSearchSentence',
					value : '',
					placeholder : '문장검색',
					readOnly : false,
					disabled : false,
					
				},
				iptAddSentence : {
					id   : 'iptAddSentence',
					name : 'iptAddSentence',
					value : '',
					placeholder : '문장을 입력하세요',
					readOnly : false,
					disabled : false,
				}
			},
			addSentence: "",
			sentenceList: null
		}

		this.event.iconClick.onClick = this.event.iconClick.onClick.bind(this);
		this.event.input.onChange = this.event.input.onChange.bind(this);

	}

	componentDidMount () {
		this.filterSentenceList(this.props.sentenceList) 
	}

	componentDidUpdate(prevProps) {
		if (this.props !== prevProps) {
			this.filterSentenceList(this.props.sentenceList) 		  	
		}
	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/	
	validation = (...params) => {
		let transId = params[0];

		switch (transId) {
			case 'checkSentence' :
				let targetParams = params[1]

				if(StrLib.isNull(targetParams))  {					
					ComLib.openDialog('A', 'SYSI0010', '추가하실 문장를 입력해주세요.');		
					return false;
				}

				if(!/^[가-힣\s]+$/.test(targetParams)) {					
					ComLib.openDialog('A', 'SYSI0010', '문장 추가에 실패하였습니다. \n(영문자, 특수문자 불가능)');

					return false;
				}			

				break;


			default :
				break;
		}

		return true;

	}

	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		button : {
			onClick : (e) => {
				switch (e.target.id) {					
					case "btnAddSentence" :			
						let state = this.state;
						let addSentence = state.textFieldProps.iptAddSentence.value;

						if(this.validation('checkSentence', addSentence)){

							let newSentenceArr = this.props.sentenceList;
								
							let checkCnt = 0;

							newSentenceArr.forEach((item, index) => {	
								if(item.sentence === addSentence && item.rowtype !== newScrmObj.constants.crud.remove){	

									checkCnt++	
								}
							});
							
							if (checkCnt === 0) {
								this.props.addSentence({targetSentence : addSentence});

							} else {
								ComLib.openDialog('A', 'SYSI0010', '이미 추가된 문장 입니다.');
							}

							state['textFieldProps']['iptAddSentence'].value = '';
							
							this.setState(state);	

						}

					break;

				case "btnSearch":
					let propsSentenceList = this.props.sentenceList;
						
					this.filterSentenceList(propsSentenceList)
					
					break;

				default : break;

				}


			}

		},
		input : {			
			onChange : (e) => {				
				let state = this.state;

				state['textFieldProps'][e.target.id].value = e.target.value;
				
				this.setState(state);

			},
			onKeyPress : (e) => {
				switch (e.target.id) {
				case 'iptAddSentence' :
					if(e.key === 'Enter') {							
						let state = this.state;
						let addSentence = state.textFieldProps.iptAddSentence.value;

						if(this.validation('checkSentence', addSentence)){

							let newSentenceArr = this.props.sentenceList;
								
							let checkCnt = 0;

							newSentenceArr.forEach((item, index) => {	
								if(item.sentence === addSentence && item.rowtype !== newScrmObj.constants.crud.remove){	

									checkCnt++	
								}
							});
							
							if (checkCnt === 0) {
								this.props.addSentence({targetSentence : addSentence});

							} else {
								ComLib.openDialog('A', 'SYSI0010', '이미 추가된 문장 입니다.');
							}

							state['textFieldProps']['iptAddSentence'].value = '';
							
							this.setState(state);	

						}
					}

					break;

				case 'iptSearchSentence' :
					if(e.key === 'Enter') {	
						let propsSentenceList = this.props.sentenceList;
						
						this.filterSentenceList(propsSentenceList)
					}
					break;

				default : break;

				}
				
			}

		},
		// 임시 기능 
		iconClick : {
			onClick : (e) => {				
				this.props.delSentence({targetSentence : e.currentTarget.name})

			}
		}				
	}

	filterSentenceList(propsList) {
		let state = this.state;
		let searchSentence = state.textFieldProps.iptSearchSentence.value;

		let NewList = propsList.map((sentence, index )=> (				
			sentence.rowtype !== newScrmObj.constants.crud.remove && (!StrLib.isNull(searchSentence) ? sentence.sentence === searchSentence : true) ?
				<div 
					id={"cmbSentence_" + index}
					style={{borderRadius: '2em', display : 'inline-block', paddingLeft: '10px', margin: '5px'}}
					className={'scrm-btn ' + (sentence.rowtype === newScrmObj.constants.crud.read ? this.props.orgColor : this.props.newColor) + '-o'}
				>
					{sentence.sentence} 
					<a name={sentence.sentence} onClick={this.event.iconClick.onClick}>
						<i name={sentence.sentence} className="xi-close-min xi-x"></i>
					</a>
				</div>
			:
			null											
		))
		state['sentenceList'] = NewList

		this.setState(state);
	}
	render () {
		return (
			<React.Fragment>
				<ComponentPanel>
					<RelativeGroup>
						<LFloatArea>
							<Textfield								
								width       = {300}
								id          = {this.state.textFieldProps.iptSearchSentence.id}
								name        = {this.state.textFieldProps.iptSearchSentence.name}
								value       = {this.state.textFieldProps.iptSearchSentence.value}
								placeholder = {this.state.textFieldProps.iptSearchSentence.placeholder}
								minLength   = {3}
								maxLength   = {15}
								readOnly    = {this.state.textFieldProps.iptSearchSentence.readOnly}
								disabled    = {this.state.textFieldProps.iptSearchSentence.disabled}
								onChange    = {this.event.input.onChange}
								onKeyPress  = {this.event.input.onKeyPress}
							/>
						</LFloatArea>
						<RFloatArea>
							<Button 
								value      = {this.state.buttonProps.btnSearch.value} 
								color      = {this.state.buttonProps.btnSearch.color} 
								fiiled     = {true}  
								id         = {this.state.buttonProps.btnSearch.id}  
								innerImage = {this.state.buttonProps.btnSearch.innerImage}  											
								icon       = {this.state.buttonProps.btnSearch.icon} 
								onClick    = {this.event.button.onClick}
							/>
						</RFloatArea>
					</RelativeGroup>
				</ComponentPanel>
				<ComponentPanel height ={"400px"}>						
					<div style={{display: 'inline-block'}}>
						{this.state.sentenceList}
					</div>
				</ComponentPanel>
				<SubFullPanel>
					<ComponentPanel>
						<RelativeGroup>
						<LFloatArea>
							<Textfield								
								width       = {300}
								id          = {this.state.textFieldProps.iptAddSentence.id}
								name        = {this.state.textFieldProps.iptAddSentence.name}
								value       = {this.state.textFieldProps.iptAddSentence.value}
								placeholder = {this.state.textFieldProps.iptAddSentence.placeholder}
								minLength   = {3}
								maxLength   = {100}
								readOnly    = {this.state.textFieldProps.iptAddSentence.readOnly}
								disabled    = {this.state.textFieldProps.iptAddSentence.disabled}
								onChange    = {this.event.input.onChange}
								onKeyPress  = {this.event.input.onKeyPress}
							/>
							</LFloatArea>
							<RFloatArea>
								<Button 
									value   = {this.state.buttonProps.btnAddSentence.value} 
									color   = {this.state.buttonProps.btnAddSentence.color} 										
									id      = {this.state.buttonProps.btnAddSentence.id}  
									fiiled  = {true}
									onClick = {this.event.button.onClick}
								/>								
							</RFloatArea>
						</RelativeGroup>
					</ComponentPanel>
				</SubFullPanel>
			</React.Fragment>
		)
	}
}
export default View;