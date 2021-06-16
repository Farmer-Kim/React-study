// 실시간 STT
import   React from 'react';
import { ComponentPanel
	   , SearchPanel
	   , FullPanel
	   , SubFullPanel
	   , RFloatArea
	   , RelativeGroup
	   , LFloatArea
	   , FlexPanel            } from 'components';
import { ComLib
	   , DataLib
	   , TransManager         } from 'common';	   
import { Textfield
	   , CsState
	   , Checkbox             } from 'components';
import { BasicButton as Button
	   , Label                } from 'components';

class View extends React.Component {
	/*------------------------------------------------------------------------------------------------*/
	// [1. Default State Zone]
	/*------------------------------------------------------------------------------------------------*/
	constructor(props){		
		super(props);
		this.state = {
			dsCenterList : DataLib.datalist.getInstance(),
			dsCsList     : DataLib.datalist.getInstance(),
			textFieldProps: {
				iptCsNm: {
					value: '',
					placeholder: '상담사성명'
				}
			},			
			csList    : [],
			centerList: [],
			timeoutID : ""
		}

		this.event.checkbox.onChange = this.event.checkbox.onChange.bind(this);	
	}
	
	/*------------------------------------------------------------------------------------------------*/
	// [2. OnLoad Event Zone]
	/*------------------------------------------------------------------------------------------------*/
	componentDidMount () {
		if(this.validation("STT010000_R01")) this.transaction("STT010000_R01");
	}

	componentWillUnmount () {
		clearTimeout(this.state.timeoutID);
	}
	/*------------------------------------------------------------------------------------------------*/
	// [3. validation Event Zone]
	//  - validation 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	validation = (serviceid) => {
		switch (serviceid) {
		case 'STT010000_R01':
			break;

		default : break;
		}
		return true;
	}

	/*------------------------------------------------------------------------------------------------*/
	// [4. transaction Event Zone]
	//  - transaction 관련 정의
	/*------------------------------------------------------------------------------------------------*/
	transaction = (serviceid) => {
		let transManager = new TransManager();
		
		const userCent = ComLib.getSession("gdsUserInfo")[0].CENT_CD;
		const userAuth = ComLib.getSession("gdsUserInfo")[0].AUTH_LV;

		transManager.setTransId (serviceid);
		transManager.setProgress(false);	
		transManager.setTransUrl(transManager.constants.url.common);
		transManager.setCallBack(this.callback);

		try {
			switch (serviceid) {	
			case 'STT010000_R01':					
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_getCenterList",
					datasetsend: "dsSend",
					datasetrecv: "dsCent",
				});
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_getUserList",
					datasetsend: "dsSend",
					datasetrecv: "dsUser",
				});
					
				transManager.addDataset('dsSend', [{AUTH_LV: userAuth, CENT_CD: userCent}]);
				transManager.agent();

				break;
			case 'STT010000_R02':			
				transManager.addConfig({
					dao        : transManager.constants.dao.base,
					crudh      : transManager.constants.crudh.read,
					sqlmapid   : "STT.R_getUserList",
					datasetsend: "dsSend",
					datasetrecv: "dsUser",
				});
					
				transManager.addDataset('dsSend', [{AUTH_LV: userAuth, CENT_CD: userCent}]);
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
		switch (res.id) {
		case 'STT010000_R01':													
			ComLib.setStateInitRecords(this, "dsCenterList", res.data.dsCent);
			ComLib.setStateInitRecords(this, "dsCsList"    , res.data.dsUser);

			let timeoutID = setTimeout(() => {
				this.transaction('STT010000_R02');
			}, 5000);

			this.setState({
				...this.state,
				timeoutID: timeoutID,
				csList    : res.data.dsUser,
				centerList: res.data.dsCent
			})
			break;	
		case 'STT010000_R02':													
			ComLib.setStateInitRecords(this, "dsCsList"    , res.data.dsUser);

			let timeoutID2 = setTimeout(() => {
				this.transaction('STT010000_R02');
			}, 5000);

			this.setState({
				...this.state,
				timeoutID: timeoutID2,
				csList    : res.data.dsUser,
			})
			break;
		default : break;
		}
	}

	/*------------------------------------------------------------------------------------------------*/
	// [6. event Zone]
	//  - 각 Component의 event 처리
	/*------------------------------------------------------------------------------------------------*/
	event = {
		input: {
			onChange: (e) => {
				switch (e.target.id) {				
				case 'iptCsNm':								
					let state = this.state;

					state['textFieldProps']['iptCsNm']['value'] = e.target.value;
	
					this.setState(state);

					break;
				default : break;
				}

			},
			onKeyPress: (e) => {
				switch (e.target.id) {				
				case 'iptCsNm':								
					if (e.key === 'Enter') {
						let target = this.state.textFieldProps.iptCsNm.value;

						this.serchCs(target);
					}

					break;
				default : break;
				}
			}
		},
		button: {		
			onClick: (e) => {				
				switch (e.target.id) {				
				case 'btnSearchCs':	
					let target = this.state.textFieldProps.iptCsNm.value

					this.serchCs(target)

					break;
				default : break;
				}
			}
		},
		checkbox: {
			onChange: (e) => {
				let centerList = this.state.dsCenterList;

				centerList.setValue(e.index, 'CHK', e.checked ? 'Y' : 'N');
				
				this.setState({...this.state,dsCenterList: centerList})
			}
		}
	}
	onClickCs(e) {		
		let params = e;
		let option1 = { width: '600px', height: '830px', modaless: true, params}
		
		ComLib.openRealTime(option1);
		// ComLib.openPop('STT010001', e.CONST_NM, option1);

	}
	serchCs = async (target) => {
		const {dsCsList} = this.state;

		const filterList = await this.filterCsList( dsCsList.records, target );

		this.setState({...this.state, csList: filterList})
		
		this.forceUpdate();
	}
	filterCsList = async (csList, target) => {
		const filteredcsList = csList.filter(item => item.CONST_NM.includes( target ));
	
		return filteredcsList;
	}
	/*------------------------------------------------------------------------------------------------*/
	// [7. render Zone]
	//  - 화면 관련 내용 작성
	/*------------------------------------------------------------------------------------------------*/
	render () {					
		return (
			<React.Fragment>
				<FullPanel>
					<SearchPanel>
						<RelativeGroup>
							<LFloatArea>
								<FlexPanel>
									<Label value="상담사 검색"/>
									<Textfield
										width       = {300}
										id          = {'iptCsNm'}
										name        = {'iptCsNm'}
										value       = {this.state.textFieldProps.iptCsNm.value}
										placeholder = {this.state.textFieldProps.iptCsNm.placeholder}
										minLength   = {2}
										maxLength   = {5}
										readOnly    = {false}
										disabled    = {false}
										onChange    = {this.event.input.onChange}
										onKeyPress  = {this.event.input.onKeyPress}
									/>						
									
								</FlexPanel>	
							</LFloatArea>
							<RFloatArea>
								<Button
										color      = 'blue' 
										fiiled	   = "o"
										innerImage = {true} 
										icon	   = {'srch'}  
										id         = {'btnSearchCs'}
										value      = {'조회'}
										disabled   = {false}
										hidden     = {false}
										onClick    = {this.event.button.onClick}
										mt         = {5}
								/>								
							</RFloatArea>
						</RelativeGroup>
						<RelativeGroup>
							{this.state.dsCenterList.records.map((item, index) =>
								<Checkbox  
									id={item.CENT_CD}
									key={item.CENT_CD}
									value={item.CENT_NM}
									index={index}
									keyProp={item.CENT_CD}
									readOnly={false}
									disabled={false}
									checked={item.CHK}
									onChange={this.event.checkbox.onChange}
								/>
							)}
						</RelativeGroup>
					</SearchPanel>
					<SubFullPanel>
						<ComponentPanel>							
							<CsState
								id = 'test'
								centerList={this.state.centerList}
								csList={this.state.csList}
								colLeng={15}
								iconSize="40px"
								height="640px"
								onClickCs={this.onClickCs}
							/>
						</ComponentPanel>		
					</SubFullPanel>
				</FullPanel>
			</React.Fragment>
		)
	}
}

export default View;