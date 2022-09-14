import React from 'react';
import ReactDOM from 'react-dom';
import {TransManager, ComLib, StrLib} from 'common';
import {Checkbox, MultiCheckBox} from 'components';
import DropdownTreeSelect from 'react-dropdown-tree-select'

class TreeSelectbox extends React.Component {	
	constructor(props) {
		super(props);
		
		this.onChange = this.onChange.bind(this);
		this.onAction = this.onAction.bind(this);
		this.onNodeToggle = this.onNodeToggle.bind(this);
		this.state = {
			disabled: true,
			
		}
	}
	static defaultProps = {
		onChange : () => {return;},
		onAction : () => {return;},
		onNodeToggle : () => {return;},
		showPartiallySelected: false,
		noMatches: "조회된 결과가 존재하지 않습니다.",
		disabled: false,
		readOnly: false,
		mode: "radioSelect",
		width: "200px"
	}
	
	onChange = (e) => {
		let rowId = "";

		if (e.checked) {
			rowId = e.value;
		}

		this.props.onChange({id: this.props.id, event: e, rowId: rowId});
	}
	onAction = (e) => {
		this.props.onAction({id: this.props.id, event: e});
		
	}
	onNodeToggle = (e) => {
		this.props.onNodeToggle({id: this.props.id, event: e});
		
	}
	changeToTreeSelectData = (data, parentId, expandArr) => {
		const records = data;
		let newTreeData = [];

		for (let i = 0; i < records.length; i ++) {
			if (records[i].PARENT_ID === parentId) {
				let expand = false;

				for (let j = 0; j < expandArr.length; j ++) {
					if (records[i].ID === expandArr[j] && records[i].ID !== this.props.value) {
						expand = true;

						break;
					}
				}

				let checked = records[i].ID === this.props.value;
				let temp = {label: records[i].LABEL, value: records[i].ID, children: [], isDefaultValue: records[i].DEFAULT, disabled: records[i].DISABLED, checked: checked, expanded: expand}
				newTreeData.push(temp)
			}
		}
		
		for (let i = 0; i < newTreeData.length; i ++) {
			let tempChild = [];

			for (let j = 0; j < records.length; j ++) {
				if (records[j].PARENT_ID === newTreeData[i].value) {
					tempChild = this.changeToTreeSelectData(data, newTreeData[i].value, expandArr)
					break;
				}	
			}
			newTreeData[i].children	= tempChild;						
		}

		return newTreeData;
	}
	makeData = (data) => {
		let parentArr = [];

		if (this.props.value !== "") {
			parentArr = ComLib.findParentOrg(this.props.value, [], data);
			
		}
		
		let treeData = this.changeToTreeSelectData(data, null, parentArr)
			
		return treeData;
	}


	render () {		
		const {noMatches, placeholder, data, showPartiallySelected, disabled, readOnly, mode, value} = this.props;
		let text = {noMatches: noMatches};

		if (value === "") {
			text.placeholder = placeholder;
		} else {
			text.placeholder = " ";
		}

		return (
			
			<div style={{width: this.props.width, height: "31px", paddingRight: "5px"}}>
				<DropdownTreeSelect
					data = {data.length > 0 ? this.makeData(data) : []} 
					onChange = {this.onChange} 
					onAction = {this.onAction} 
					onNodeToggle = {this.onNodeToggle} 
					showPartiallySelected = {showPartiallySelected}
					disabled={disabled}
					readOnly={readOnly}
					texts = {text}
					mode={mode} 
					inlineSearchInput = {true}
					showDropdown={true}
				/>
			</div>
		)
	}
}

class Selectbox extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);
	}
	static defaultProps = {
		selected : 0,
		color: null,
		onChange : () => {return;},
		tooltip : false
		}
	onChange = (e) => {
		this.props.onChange({target : e.target, id : this.props.id});
	}
	render () {
		let selectBoxClass = "";
		
		if (this.props.color !== null) {
			selectBoxClass = "scrm-react-custom-selectbox-" + this.props.color;
		}
		
		return (

			!this.props.tooltip ?
				<div className="scrm-select-div" style={{width : this.props.width}}>
					<select
						id = {this.props.id}
						value = {this.props.value} 
						disabled = {
							(StrLib.isNull(this.props.controlOrgCombo))
							? this.props.disabled
							: ComLib.setDisableByAuth(this.props.controlOrgCombo, this.props.isQaCombo)
						}
						className={selectBoxClass}
						onChange = {this.onChange}
					> 
						{
							this.props.dataset.filter(item=> item.value !== null && item.value !== undefined).map((prop, key) => {
								return (<option value={prop.value} key={prop.value + '_' + key} >{prop.name}</option>);
							})
						}
					</select>
				</div>
				:
				<div data-tip={this.props.tooltipCont}>
					<div className="scrm-select-div" style={{width : this.props.width}}>
						<select
							id = {this.props.id}
							value = {this.props.value} 
							disabled = {
								(StrLib.isNull(this.props.controlOrgCombo))
								? this.props.disabled
								: ComLib.setDisableByAuth(this.props.controlOrgCombo, this.props.isQaCombo)
							}
							className={selectBoxClass}
							onChange = {this.onChange}
						> 
							{
								this.props.dataset.filter(item=> item.value !== null && item.value !== undefined).map((prop, key) => {
									return (<option value={prop.value} key={prop.value + '_' + key} >{prop.name}</option>);
								})
							}
						</select>
					</div>
				</div>

			
		);
	}
}
class CentListSelectBox extends React.Component {
	constructor (props) {
		super(props);
		this.state = { comboItem : [] }
	}
	static defaultProps = { type : 'A' }
	componentDidMount () {
		this.getCentList();
	}
	getCentList = async() => {
		try {
			let transManager = new TransManager();
			transManager.setTransId('CENTLIST_R01');
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid:"COM.R_getCentComboInfo",
				datasetsend:"dsSrchParamInfo",
				datasetrecv:"dsCentComboInfo"
			});
			transManager.addDataset('dsSrchParamInfo', [{ SRCH_YN : 'Y' }]);
			const res = await transManager.agent();

			if ( res.data.dsCentComboInfo.length === 0 ) {
			} else {
				this.setState({...this.state, comboItem : res.data.dsCentComboInfo.map((item) => { return { value : item.CENT_CD , name : item.CENT_NM }; })});
			}
		} catch (e) {
			ComLib.openDialog('A', 'SYSI0010', ['서버 오류 발생\n로그를 확인하십시오.']);
		}
	}
	render () {
		return ( <Selectbox type={this.props.type} id = {this.props.id} value = {this.props.value} options = {this.state.comboItem} onChange = {this.props.onChange}/>);
	}
}
class TeamListSelectBox extends React.Component {
	constructor (props) {
		super(props);
		this.state = { comboItem : [] }
	}
	static defaultProps = {
		centCd : '',
		type : 'A'
	}
	componentDidMount () {
		this.getTeamList(this.props.centCd);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.centCd !== this.props.centCd) {
			this.getTeamList(this.props.centCd);
		}
	}
	getTeamList = async() => {
		try {
			let transManager = new TransManager();
			transManager.setTransId('TEAMLIST_R01');
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid:"COM.R_getTeamComboInfo",
				datasetsend:"dsSrchParamInfo",
				datasetrecv:"dsTeamComboInfo"
			});
			transManager.addDataset('dsSrchParamInfo', [{ CENT_CD : this.props.centCd }]);
			let res = await transManager.agent();


			if (res.data.dsTeamComboInfo.length === 0) {
			} else {
				this.setState({ ...this.state, comboItem : res.data.dsTeamComboInfo.map((item) => { return { value : item.TEAM_CD , name : item.TEAM_NM }; })});
			}
		} catch (e) {
			ComLib.openDialog('A', 'SYSI0010', ['서버 오류 발생\n로그를 확인하십시오.']);
		}
	}
	render () {
		return ( <Selectbox type={this.props.type} id = {this.props.id} value = {this.props.value} options = {this.state.comboItem} onChange={this.props.onChange}/> );
	}
}
class UsrListSelectBox extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			comboItem : []
		}
	}
	componentDidMount () {
		this.getUserList();
	}
	componentDidUpdate(prevProps) {
		if (prevProps.centCd !== this.props.centCd || prevProps.teamCd !== this.props.teamCd) {
			this.getTeamList();
		}
	}
	static defaultProps = {
		centCd : '',
		teamCd : '',
		type : 'A'
	}
	getUserList = async() => {
		try {
			let transManager = new TransManager();
			transManager.setTransId('USERLIST_R01');
			transManager.setTransUrl(transManager.constants.url.common);
			transManager.addConfig({
				dao: transManager.constants.dao.base,
				crudh: transManager.constants.crudh.read,
				sqlmapid:"COM.R_getUsrComboInfo",
				datasetsend:"dsSrchParamInfo",
				datasetrecv:"dsUsrComboInfo"
			});
			transManager.addDataset('dsSrchParamInfo', [{ CENT_CD : this.props.centCd, TEAM_CD : this.props.teamCd }]);
			let res = await transManager.agent();

			if (res.data.dsUsrComboInfo.length === 0) {
			} else {
				this.setState({ ...this.state, comboItem : res.data.dsUsrComboInfo.map((item) => { return { value : item.USR_CD , name : item.USR_NM }; })});
			}
		} catch (e) {
			ComLib.openDialog('A', 'SYSI0010', ['서버 오류 발생\n로그를 확인하십시오.']);
		}
	}
	render () {
		return ( <Selectbox type={this.props.type} id = {this.props.id} value = {this.props.value} options = {this.state.comboItem} onChange = {this.props.onChange}/> );
	}
}
class MulitSelectBox extends React.Component {
	constructor (props) {
		super(props);
		
		let text = '...';
		if (this.props.dataset.length !== 0) {
			if (this.props.dataset.filter(item => item['value'] === 'Y').length === this.props.dataset.length) {
				text = '전체선택';
			} else {
				text = this.props.dataset.filter(item => item['value'] === 'Y').map(element => { return element[this.props.value]}).toString();
			}
		}
		this.state = {
			expended : false,
			text : text,
			baseOption : {
				keyProp : 'all_check',
				value : '전체선택',
				checked : 'N'
			},
		}
		this.onCheckAll = this.onCheckAll.bind(this);
		this.onCheckboxClick = this.onCheckboxClick.bind(this);
		this.onChange = this.onChange.bind(this);
	}
	componentDidMount() {
		document.addEventListener('click', this.handleClickOutside, true);
	}
	componentWillUnmount() {
		document.removeEventListener('click', this.handleClickOutside, true);
	}
	handleClickOutside = (e) => {
		const domNode = ReactDOM.findDOMNode(this);
		if ( !domNode || !domNode.contains(e.target) ) {
			document.getElementById(this.props.id).style.display = "none";
			this.setState({...this.state, expended : false});
		}
	}
	openCheckbox = () => {
		let checkboxes = document.getElementById(this.props.id);
		if (!this.state.expended) {
			checkboxes.style.display = "block";
			this.setState({...this.state, expended: true});
		} else {
			checkboxes.style.display = "none";
			this.setState({...this.state, expended: false});
		}
	}
	onCheckAll = (e) => {
		this.setState({...this.state
			, text: (e.checked) ? '전체선택' : '...'
			, baseOption : {...this.state.baseOption, checked : (e.checked) ? 'Y' : 'N'}
		}, () => {
			this.props.onChange({
				target : e.target,
				id : this.props.id,
				dataset : this.props.dataset.map((item) =>{ item['value'] = (e.checked) ? 'Y' : 'N'; return item;})
			});
		});
	}
	onChange = (e) => {
		switch (e.target.id) {
			case  "multiselect_" + this.props.id + '_head' :
				console.log('all check box');
				break;
			case  "multiselect_" + this.props.id :
				console.log('single check box');
				break;
			default : break;
		}
	}
	onCheckboxClick = (e) => {
		let rtnText = null;
		let checkedList = null;
		if (e.target.checked) {
			checkedList = this.props.dataset.filter(item => item['value'] === 'Y' || item === this.props.dataset[e.index]).map((item) => { return item[this.props.value] });
		} else {
			checkedList = this.props.dataset.filter(item => item['value'] === 'Y' && item !== this.props.dataset[e.index]).map((item) => { return item[this.props.value] });
		}
		if (checkedList.length === this.props.dataset.length) {
			rtnText  = '전체선택';
		} else {
			if (checkedList.length === 0) {
				rtnText  = '...';
			} else {
				rtnText = checkedList.toString();
			}
		}

		this.setState({ ...this.state,  text :  rtnText,  baseOption : {...this.state.baseOption, checked : (checkedList.length === this.props.dataset.length) ? 'Y' : 'N'}}
		, () => {
			this.props.onChange({
				id : this.props.id,
				target : e.target,
				dataset : this.props.dataset.map((item, index) => {
					if (index === e.index) {
						item['value'] = (e.checked) ? 'Y' : 'N';
					}
					return item;
				})
			});
		});
	}
	
	render () {
		return (
			<div className="scrm-react-mulitlselect">
				<div className= { (this.props.disabled) ? "scrm-react-mulitlselect-selectbox-disabled" : "scrm-react-mulitlselect-selectbox"}
					 onClick={(this.props.disabled) ? (e) => { return null; } : this.openCheckbox} style={{width: this.props.width, display: 'flex'}}
				>
					<div className="scrm-react-mulitlselect-selectbox-label" style={{width: this.props.width}}>
						<span>{this.state.text}</span>
					</div>
					<div style={{width:'10px', float: 'right', marginRight: '5px', verticalAlign: "middle"}}>
						<i className={(this.state.expended) ? "arrow up" : "arrow down"}></i>
					</div>
				</div>
				<div className="scrm-react-mulitselect-checkbox" id= {this.props.id} style={{width: this.props.width, height: this.props.displayCount * 20 + 'px'}}>
					<Checkbox 
						id = {"multiselect_" + this.props.id + '_head'}
						keyProp = {"multiselect_baseOpt_" + this.props.id}
						value = {this.state.baseOption.value}
						checked = {this.state.baseOption.checked}
						onClick = {this.onCheckAll}
						onChange = {this.onChange}
					/>
					<MultiCheckBox
						id= {"multiselect_" + this.props.id}
						dataset = {this.props.dataset}
						keyProp = {this.props.keyProp}
						value = {this.props.value}
						disabled = {false}
						onClick = {this.onCheckboxClick}
					/>
				</div>
			</div>
		)
	}
}

export {Selectbox, MulitSelectBox, CentListSelectBox, TeamListSelectBox, UsrListSelectBox, TreeSelectbox};