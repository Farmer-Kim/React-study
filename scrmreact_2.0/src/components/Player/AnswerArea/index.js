import React from 'react';
import {BasicButton as Button, Label, Textarea, RelativeGroup, ComponentPanel, Switch, SubFullPanel, RFloatArea} from 'components';
import {ComLib, StrLib} from 'common';
import 'assets/styles/component.css';

class AnswerArea extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			org     : "",
			changed : "",
			isAddNew: false,
			isCS: false
		}
		
	}
	componentDidMount () {
		let params = this.props.options.param[0]		
		let newVal = params.TYPE === 'd' ? "" : params.NEW_VALUE;
		let spk    = params.SPK  === 'A' ? true : false;
		
		this.setState({org : params.VALUE, changed: newVal, isCS: spk}, () => {
					
			if (this.state.isCS) {
				if (params.TYPE !== 'd') {
					document.getElementById('changeTo_' + params.INDEX).style.backgroundColor = "#ffec99";

				}

				if (params.TYPE !== 'c') {
					document.getElementById('org_'      + params.INDEX).style.backgroundColor = "#ffec99";

				}								
			} 			
		});		
	}
	componentWillUnmount () {
		this.props.onCallbackFunc({type: 'noChange'});
	}

	onChange (e) {
		this.setState({...this.state, changed: e.target.value})
	}
	onKeyPress (e) {
		
	}
	validation = (serviceid) => {
		let rtn = true
		switch (serviceid) {
		case 'btnSave':	
			let params = this.props.options.param[0]

			if (params.TYPE === 'c' || params.TYPE === 'u') {
				if ((params.NEW_VALUE === this.state.changed) && ((params.SPK  === 'A') === this.state.isCS)) {
					ComLib.openDialog('A', 'SYSI0010', ['오인식 문장이 변경 되지 않았습니다.']);
		
					rtn = false;
				}
			} else {
				if (this.state.org === this.state.changed && ((params.SPK  === 'A') === this.state.isCS)) {
					ComLib.openDialog('A', 'SYSI0010', ['원문 문장과 동일 합니다.']);
		
					rtn = false;
				}
			} 
			if (StrLib.isNull(this.state.changed)) {
				ComLib.openDialog('A', 'SYSI0010', ['오인식 문장을 작성 해주셔야 합니다.']);
				rtn = false;
			}
			// 한글만 입력 가능 하도록 validation 걸어야 함
			break;
		}
						
		return rtn;
	}
	event = {
		switch: {
			onChange: (e) => {
				this.setState({...this.state, isCS : !this.state.isCS}, () => {
					
					let param = this.props.options.param[0];

					if (this.state.isCS) {
						document.getElementById('changeTo_' + param.INDEX).style.backgroundColor = "#ffec99";
					} else {
						document.getElementById('changeTo_' + param.INDEX).style.backgroundColor = "white";
					}
					
				});
			} 
		},
		button: {
			onClick: (e) => {
				switch (e.target.id) {
				case 'btnSave':
					let changed = this.state.changed
					if (this.validation('btnSave')) {
						if (this.state.isAddNew) {
							ComLib.openDialog('C', 'SYSI0010', ['신규 문장을 추가 하시겠습니까?'], checked => { if (checked === true) {		
								this.props.onCallbackFunc({value: changed, index: this.props.options.param[0].INDEX, type: 'new', spk: this.state.isCS ? 'A' : 'C'});
								this.props.onClose();
							}});
							
			
						} else {
							ComLib.openDialog('C', 'SYSI0010', ['오인식 문장을 저장 하시겠습니까?'], checked => { if (checked === true) {		
								this.props.onCallbackFunc({value: changed, index: this.props.options.param[0].INDEX, type: 'update', spk: this.state.isCS ? 'A' : 'C'});
								this.props.onClose();
							}});
							
						}
					}
										
					break;

				case 'btnDel':
					ComLib.openDialog('C', 'SYSI0010', ['문장을 삭제 하시겠습니까?'], checked => { if (checked === true) {	
	
						this.props.onCallbackFunc({value: "[문장 삭제]", index: this.props.options.param[0].INDEX, type: 'delete'});
						this.props.onClose();
					}});
					break;

				case 'btnCanc':
					let param = this.props.options.param[0];
					if (param.TYPE === 'd') {
						ComLib.openDialog('C', 'SYSI0010', ['문장 삭제를 취소 하시겟습니까?'], checked => { if (checked === true) {	

							this.props.onCallbackFunc({value: this.state.org, index: this.props.options.param[0].INDEX, type: 'reset'});
							this.props.onClose();
						}});
					} else {
						ComLib.openDialog('C', 'SYSI0010', ['문장 등록를 취소 하시겟습니까?'], checked => { if (checked === true) {	

							this.props.onCallbackFunc({value: this.state.org, index: this.props.options.param[0].INDEX, type: 'reset'});
							this.props.onClose();
						}});	
					}
														
					break;

				case 'btnCanc2':
								
					break;
				case 'btnAddNew':
					let params = this.props.options.param[0]

					this.setState({...this.state, isAddNew : true, changed : ""}, () => {
					
						if (this.state.isCS) {							
							document.getElementById('changeTo_' + params.INDEX).style.backgroundColor = "#ffec99";
							
						} 			
					})
					break;
				}
			}
		}
	}
	render () {
		let param = this.props.options.param[0];
		return (
			<React.Fragment>
				<RelativeGroup>
					<ComponentPanel>
						{this.state.isAddNew ?
							<div>
								<Label value="작성문장"/>
								<Textarea
									width       = {280}
									id          = {'changeTo_' + param.INDEX}
									name        = {'changeTo_' + param.INDEX}
									value       = {this.state.changed}
									placeholder	= {this.state.org}
									minLength	= {0}
									maxLength	= {2000}
									readOnly	= {false}
									disabled	= {false}
									rows		= {3}							
									onChange	= {(e) => this.onChange(e)}
									onKeyPress	= {(e) => this.onKeyPress(e)}
								/>	
								<Label value="상담원 발화"/>
								<Switch id={"swchAnswerArea"} onChange={this.event.switch.onChange} checked={this.state.isCS}/>
								<div style={{height: "95px"}}></div>
								<SubFullPanel>  
									<Button
										id = "btnSave" 
										value = {"저장"} 
										onClick = {this.event.button.onClick} 	
										tooltip ={"신규 오인식 문장 등록"}									
										color="purple" 
										fiiled="o"
										mt={5}
										mr={5}
									/>	
								</SubFullPanel>
							</div>

						:	
							<div>
								{param.TYPE === 'c' ? 
									null
									: 
									<div>
										<Label value="상담원문"/>
										<Textarea
											width       = {280}
											id          = {'org_' + param.INDEX}
											name        = {'org_' + param.INDEX}
											value       = {this.state.org}
											placeholder	= {""}
											minLength	= {0}
											maxLength	= {2000}
											readOnly	= {true}
											disabled	= {false}
											rows		= {3}							
											onChange	= {(e) => this.onChange(e)}
											onKeyPress	= {(e) => this.onKeyPress(e)}
										/>
									</div>
								}
								{param.TYPE === 'd' ? 
									null
									: 
									<div>
										<Label value="작성문장"/>
										<Textarea
											width       = {280}
											id          = {'changeTo_' + param.INDEX}
											name        = {'changeTo_' + param.INDEX}
											value       = {this.state.changed}
											placeholder	= {this.state.org}
											minLength	= {0}
											maxLength	= {2000}
											readOnly	= {false}
											disabled	= {false}
											rows		= {3}							
											onChange	= {(e) => this.onChange(e)}
											onKeyPress	= {(e) => this.onKeyPress(e)}
										/>
									</div>
								}
								{param.TYPE !== 'd' ? 
									<div>
										<Label value="상담원 발화"/>
										<Switch id={"swchAnswerArea"} onChange={this.event.switch.onChange} checked={this.state.isCS}/>
									</div>
									: 
									null
								}
								{param.TYPE === 'r' || param.TYPE === 'u' ? 
									null
									: 
									param.TYPE === 'd' ? 
										<div style={{height: "120px"}}></div>
									:
										<div style={{height: "90px"}}></div>
								}
								<Button
									id = "btnAddNew" 
									value = {"신규"} 
									innerImage={true} 
									icon = {'down'}
									onClick = {this.event.button.onClick} 		
									tooltip = {"신규 오인식 문장 추가"}  									
									color="purple" 
									fiiled="o"
									mt={5}
									mr={5}
								/>
								{param.TYPE === 'd' ? 
									null
									: 
									<Button
										id = "btnSave" 
										value = {"저장"} 
										onClick = {this.event.button.onClick}										
										tooltip = {param.TYPE === 'r' ? "오인식 문장 등록" : "오인식 문장 수정"}  		
										color="purple" 
										fiiled="o"
										mt={5}
										mr={5}
									/>	
								}								
								{param.TYPE === 'r' ? 
									null
									: 
									<Button
										id = "btnCanc" 
										value = {"취소"} 
										onClick = {this.event.button.onClick} 		
										tooltip = {param.TYPE === 'd' ? "오인식 문장 삭제 취소" : "오인식 문장 등록 취소"}  									
										color="purple" 
										fiiled="o"
										mt={5}
										mr={5}
									/>	
								}
								{param.TYPE !== 'd' && param.TYPE !== 'c' ? 
									<Button
										id = "btnDel" 
										value = {"삭제"} 
										onClick = {this.event.button.onClick} 	
										tooltip = {"오인식 문장 삭제"}  									
										color="purple" 
										fiiled="o"
										mt={5}
										mr={5}
									/>
									: 
									null	
								}
							</div>

						}
{/* 


						{ !this.state.isAddNew && param.TYPE !== 'c' ?
							<div>
								<Label value="상담원문"/>
								<Textarea
									width       = {280}
									id          = {'org_' + param.INDEX}
									name        = {'org_' + param.INDEX}
									value       = {this.state.org}
									placeholder	= {""}
									minLength	= {0}
									maxLength	= {2000}
									readOnly	= {true}
									disabled	= {false}
									rows		= {3}							
									onChange	= {(e) => this.onChange(e)}
									onKeyPress	= {(e) => this.onKeyPress(e)}
								/>
							</div>
						:
							null
						}
						{ param.TYPE !== 'd' || this.state.isAddNew ?
							<div>
								<Label value="작성문장"/>
								<Textarea
									width       = {280}
									id          = {'changeTo_' + param.INDEX}
									name        = {'changeTo_' + param.INDEX}
									value       = {this.state.changed}
									placeholder	= {this.state.org}
									minLength	= {0}
									maxLength	= {2000}
									readOnly	= {false}
									disabled	= {false}
									rows		= {3}							
									onChange	= {(e) => this.onChange(e)}
									onKeyPress	= {(e) => this.onKeyPress(e)}
								/>	
							</div>
						:		
							<div style={{height: '92px'}}></div>
						}
						{ this.state.isAddNew || param.TYPE === 'c'?
							<div style={{height: '92px'}}>
							<Label value="상담원 발화"/>
							<Switch id={"swchAnswerArea"} onChange={this.event.switch.onChange} checked={this.state.isCS}/>
							</div>
						:	
							null
						}
						{ param.TYPE === 'd' ?
							<div>
								<Button
									id = "btnCanc" 
									value = {"삭제 취소"} 
									onClick = {this.event.button.onClick} 										
									color="purple" 
									fiiled="o"
									mt={5}
									ml={5}
								/>
								<Button
									id = "btnAddNew" 
									value = {"신규 문장"} 
									innerImage={true} 
									icon = {'down'}
									onClick = {this.event.button.onClick} 										
									color="purple" 
									fiiled="o"
									mt={5}
									ml={5}
								/>
							</div>
						:
							<div>
								<Button
									id = "btnSave" 
									value = {param.TYPE === 'u' || param.TYPE === 'c' ? "문장 수정" : "문장 등록"} 
									onClick = {this.event.button.onClick} 	
									tooltip ={"테스트트트트트트트트트트"}									
									color="purple" 
									fiiled="o"
									mt={5}
									mr={5}
								/>	
								{this.state.isAddNew || param.TYPE === 'c' ?
									null
								: 
									<Button
										id = "btnAddNew" 
										value = {"신규 문장"} 
										innerImage={true} 
										icon = {'down'}
										onClick = {this.event.button.onClick} 										
										color="purple" 
										fiiled="o"
										mt={5}
										ml={5}
									/>
								}
									
								{
								param.TYPE === 'u' || param.TYPE === 'c' ? 
									<Button
										id = "btnCanc2" 
										value = {"등록 취소"} 
										onClick = {this.event.button.onClick} 										
										color="purple" 
										fiiled="o"
										mt={5}
										ml={5}
										mr={5}
									/>	
								: 
									null
								} 	
								{this.state.isAddNew || param.TYPE === 'c'?
									null
								: 													
									<Button
										id = "btnDel" 
										value = {"문장 삭제"} 
										onClick = {this.event.button.onClick} 										
										color="purple" 
										fiiled="o"
										mt={5}
										ml={5}
									/>	
								}
							</div>
							
						} */}
					</ComponentPanel>
				</RelativeGroup>				
			</React.Fragment>
		);
	}
}

export default AnswerArea;