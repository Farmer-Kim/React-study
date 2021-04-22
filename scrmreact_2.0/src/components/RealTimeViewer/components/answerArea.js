import React from 'react';
import {BasicButton as Button, Textfield, RFloatArea, RelativeGroup, ComponentPanel } from 'components';

class AnswerArea extends React.Component {
	setAnswerArea = (data) => {
		return data.map(
			(item, index) => {
				return (
					<React.Fragment>
						<div className="scrm-player-answer-list-div" key={index}>
							<div className="scrm-profile"><i class="xi-profile-o"></i></div>
							<textarea/>
							<RFloatArea>
								<Button filled={true} size={'md'} color={'green'} value ={''} innerImage={true} icon={'check'}></Button>
								<Button filled={true} size={'md'} color={'red'} value ={''} innerImage={true} icon={'trash'}></Button>
							</RFloatArea>
							
						</div>
						<div className="scrm-player-answer-list-tail">
							<Button filled={true} size={'xs'} color={'blue'} value ={'+'}></Button>
							<Button filled={true} size={'xs'} value ={'-'} ml='4px'></Button>
						</div>
					</React.Fragment>
				)
			}
		)
	}
	render () {
		return (
			<React.Fragment>
				<RelativeGroup>
					<ComponentPanel>
						<RelativeGroup>
							<RFloatArea>
								<Textfield/>
								<Textfield/>
								<RFloatArea>
									<Button filled={true} size={'xs'} mt="5px" value ={'등록'}></Button>
									<Button filled={true} size={'xs'} mt="5px" color={'red'} value ={'삭제'}></Button>
								</RFloatArea>
							</RFloatArea>
						</RelativeGroup>
					</ComponentPanel>
				</RelativeGroup>
				<RelativeGroup>
					<div style={{textAlign: 'start', fontSize: '12px', color: 'blue', marginTop: '5px', marginLeft: '5px', lineHeight: 1.3 , width: '99%'}}>
						{"※유의사항"}<br/>
						{"작성된 정답지에 한글을 제외한 숫자, 영문자, 특수문자 등이 포함되어 있을 경우, 임시 저장 및 제출이 불가능합니다."}
					</div>
					<div className="scrm-player-answer-list-area">
						{this.setAnswerArea(this.props.data)}
					</div>
				</RelativeGroup>
				<RelativeGroup>
					<RFloatArea>
						<Button filled={true} innerImage={true} icon={'save'} mt="10px" value ={'임시저장'}></Button>
						<Button filled={true} color={'green'} value ={'제출'} mt="10px" ></Button>
					</RFloatArea>
				</RelativeGroup>
			</React.Fragment>
		);
	}
}

export default AnswerArea;