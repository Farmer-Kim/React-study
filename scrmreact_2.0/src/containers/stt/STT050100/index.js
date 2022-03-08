// STT 학습
import React from 'react';
import {
	ComponentPanel, LFloatArea, RFloatArea, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button} from 'components';
import {Textfield} from 'components';
import {StrLib, ComLib, newScrmObj} from 'common';


//임시로 가운데 버튼 하드코딩
// const wordStyle =
// styled.div`

// border-width: 2px 4px;
// border-radius: 40px;
// background: gold;
// border: ridge gold;
// `

class View extends React.Component {
	constructor(props) {
		super();
		this.state = {
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
				btnAddWord : {
					id : 'btnAddWord',
					disabled : true,
					value : '추가',
					hidden : false,
					color : "purple"				
				}
			},
			textFieldProps : {
				iptSearchCW : {
					id   : 'iptSearchCW',
					name : 'iptSearchCW',
					value : '',
					placeholder : '복합명사 검색',
					readOnly : false,
					disabled : false,

				},
				iptAddCW : {
					id   : 'iptAddCW',
					name : 'iptAddCW',
					value : '',
					placeholder : '복합명사를 입력하세요',
					readOnly : false,
					disabled : false,
				}
			},
			CmpWordList: null,

		}

		this.event.iconClick.onClick = this.event.iconClick.onClick.bind(this);
		this.event.input.onChange = this.event.input.onChange.bind(this);
	}

	componentDidMount () {
		this.filterCmpWrodList(this.props.cmpWordList) 
	}

	componentDidUpdate(prevProps) {
		if (this.props !== prevProps) {
			this.filterCmpWrodList(this.props.cmpWordList) 		  	
		}
	}

	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/	
	validation = (...params) => {
		let transId = params[0];

		switch (transId) {
			case 'checkCompWord' :
				let targetParams = params[1]

				if(StrLib.isNull(targetParams))  {					
					ComLib.openDialog('A', 'SYSI0010', '추가하실 복합명사를 입력해주세요.');		
					return false;
				}

				if(!/^[가-힣\n]+$/.test(targetParams)) {					
					ComLib.openDialog('A', 'SYSI0010', '복합 명사 추가에 실패하였습니다. \n한글만 입력해 주세요. \n(영문자, 특수문자, 띄어쓰기 불가능)');

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
				case "btnAddWord" :
					let state = this.state;
					let addWord = state.textFieldProps.iptAddCW.value;

					if(this.validation('checkCompWord', addWord)){

						let newWordArr = this.props.cmpWordList;
							
						let checkCnt = 0;

						newWordArr.forEach((item, index) => {	
							if(item.word === addWord && item.rowtype !== newScrmObj.constants.crud.remove){	

								checkCnt++	
							}
						});
						
						if (checkCnt === 0) {
							this.props.addCombineWord({targetWord : addWord});

						} else {
							ComLib.openDialog('A', 'SYSI0010', '이미 추가된 복합명사 입니다.');
						}

						state['textFieldProps']['iptAddCW'].value = '';
						
						this.setState(state);	
					}

					break;

				case "btnSearch":
					let propsCmpWordList = this.props.cmpWordList;
						
					this.filterCmpWrodList(propsCmpWordList)

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
				case 'iptAddCW' :
					if(e.key === 'Enter') {							
						let addWord = this.state.textFieldProps.iptAddCW.value;

						if(this.validation('checkCompWord', addWord)){

							let newWordArr = this.props.cmpWordList;
								
							let checkCnt = 0;

							newWordArr.forEach((item, index) => {	
								if(item.word === addWord && item.rowtype !== newScrmObj.constants.crud.remove){	
									// rowTypd 에 따라 update 시킬껀지 아니명 그냥 중복 확인해서 카운트 늘릴껀지 확인 로직

									checkCnt++	
								}
							});
							
							if (checkCnt === 0) {
								this.props.addCombineWord({targetWord : addWord});

							} else {
								ComLib.openDialog('A', 'SYSI0010', '중복 처리 되었습니다.');
							}
							
							let state = this.state;
							state['textFieldProps']['iptAddCW'].value = '';
							this.setState(state);	
						}
					}

					break;

				case 'iptSearchCW' :
					if(e.key === 'Enter') {	
						let propsCmpWordList = this.props.cmpWordList;
						
						this.filterCmpWrodList(propsCmpWordList)
					}
					break;

				default : break;

				}
			}

		},
		// 임시 기능 
		iconClick : {
			onClick : (e) => {				
				this.props.delCombineWord({targetWord : e.currentTarget.name})

			}
		}				
	}

	filterCmpWrodList(propsList) {
		let state = this.state;

		let searchWord = state.textFieldProps.iptSearchCW.value;
		let NewList = propsList.map((word, index )=> (				
			word.rowtype !== newScrmObj.constants.crud.remove && (!StrLib.isNull(searchWord) ? word.word === searchWord : true) ?
				<div 
					id={"cmbWord_" + index}
					style={{borderRadius: '2em', display : 'inline-block', paddingLeft: '10px', margin: '5px'}}
					className={'scrm-btn ' + (word.rowtype === newScrmObj.constants.crud.read ? this.props.orgColor : this.props.newColor) + '-o'}
				>
					{word.word} 
					<a name={word.word} onClick={this.event.iconClick.onClick}>
						<i name={word.word} className="xi-close-min xi-x"></i>
					</a>
				</div>
			:
			null											
		))

		state['CmpWordList'] = NewList

		this.setState(state);
	}
		
	render () {
		return (
			<React.Fragment>
					<ComponentPanel>
						<RelativeGroup>
							<LFloatArea>
								<Textfield								
									width = {300}
									id          = {this.state.textFieldProps.iptSearchCW.id}
									name        = {this.state.textFieldProps.iptSearchCW.name}
									value       = {this.state.textFieldProps.iptSearchCW.value}
									placeholder = {this.state.textFieldProps.iptSearchCW.placeholder}
									minLength   = {1}
									maxLength   = {10}
									readOnly    = {this.state.textFieldProps.iptSearchCW.readOnly}
									disabled    = {this.state.textFieldProps.iptSearchCW.disabled}
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
							{this.state.CmpWordList}
						</div>
					</ComponentPanel>
					<ComponentPanel>
						<RelativeGroup>
							<LFloatArea>
								<Textfield								
									width = {300}
									id          = {this.state.textFieldProps.iptAddCW.id}
									name        = {this.state.textFieldProps.iptAddCW.name}
									value       = {this.state.textFieldProps.iptAddCW.value}
									placeholder = {this.state.textFieldProps.iptAddCW.placeholder}
									minLength   = {1}
									maxLength   = {10}
									readOnly    = {this.state.textFieldProps.iptAddCW.readOnly}
									disabled    = {this.state.textFieldProps.iptAddCW.disabled}
									onChange    = {this.event.input.onChange}
									onKeyPress  = {this.event.input.onKeyPress}
								/>
							</LFloatArea>
							<RFloatArea>
								<Button 
									value={this.state.buttonProps.btnAddWord.value} 
									color={this.state.buttonProps.btnAddWord.color} 										
									id={this.state.buttonProps.btnAddWord.id}  
									fiiled = {true}
									onClick = {this.event.button.onClick}
								/>								
							</RFloatArea>
						</RelativeGroup>
					</ComponentPanel>
					
			</React.Fragment>
		)
	}
}

export default View;