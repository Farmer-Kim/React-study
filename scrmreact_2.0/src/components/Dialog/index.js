import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {popRoute} from 'routes/popupRoute.js';
import Draggable from 'react-draggable';
import DialogBox from 'react-modeless';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as appModuleActions from 'store/modules/appModule';
import {BasicButton as Button} from 'components';

class AlertDialog extends React.Component {
	static defaultProps = {
		open: false,
		message : '',
		onClose : () => {return false;}
	};
	static propTypes = {
		open : PropTypes.bool.isRequired,
		message :  PropTypes.string.isRequired,
		onClose: PropTypes.func.isRequired
	};

	onClose = () => { this.props.onClose();};

	render () {
		return (
			<DialogBox
				isOpen={this.props.open}
				onClose={this.onClose}
				style  = {{backgroundColor : "rgba(0, 0, 0, 0.3)", borderRadius: '4px', zIndex : '9994'}}
				backdropStyle = {{ zIndex : '9993' }}
				noBackdrop={false}
				clickBackdropToClose={true}
			>
				<div className = "scrm-alert-modal-content">
					<div className = "scrm-alert-modal-content-header">
						<button className="scrm-btn xs grey-o" style={{float: 'right'}} onClick ={this.onClose}><i className="xi-close"></i></button>
					</div>
					<div className = "scrm-alert-modal-content-body">
						<div className="scrm-label-div">
							<span>{this.props.message}</span>
						</div>							
					</div>
					{/* </div> */}
				</div>
			</DialogBox>
		);
	}
}
class ConfirmDialog extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			returnVal : false
		}
	}
	static defaultProps = {
		open: false ,
		message :  '',
		onReturnVal : () =>  { return false; } ,
		onClose: () =>  { return false; }
	};
	static propTypes = {
		open : PropTypes.bool.isRequired,
		message :  PropTypes.string.isRequired,
		onReturnVal : PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired
	};
	onClick = (e) => {
		switch (e.target.id) {
			case 'btnConfirm' :  this.setState({...this.state, returnVal : true}, () => this.onClose()); break;
			case 'btnCancel' : this.setState({...this.state, returnVal : false}, () => this.onClose()); break;
			default : this.setState({...this.state, returnVal : false}, () => this.onClose()); break;
		}
	}
	onClose = () => {
		this.props.onClose();
		this.props.onReturnVal(this.state.returnVal);
	};

	render () {
		return (
			<DialogBox
				isOpen={this.props.open}
				noBackdrop={false}
				style  = {{backgroundColor : "rgba(0, 0, 0, 0.3)", borderRadius: '4px', zIndex : '9994'}}
				backdropStyle = {{ zIndex : '9993' }}
			>
				<div className = "scrm-alert-modal-content">
					<div className = "scrm-alert-modal-content-header">
						<button class="scrm-btn xs grey-o" style={{float: 'right'}} onClick ={this.onClick.bind(this)}><i className="xi-close"></i></button>
					</div>
					<div className = "scrm-alert-modal-content-body">
						<div className="scrm-label-div">
							<span>{this.props.message}</span>
						</div>
					</div>
					<div style={{position: 'absolute', bottom: '5px', textAlign: 'center', width: '100%', padding: '5px'}}>
						<Button id='btnConfirm'	color={'purple'} onClick ={this.onClick.bind(this)} value={'예'} mr = {10}/>
						<Button id='btnCancel'	color={'purple'} onClick ={this.onClick.bind(this)} value={'아니오'} ml = {10}/>
					</div>
				</div>
			</DialogBox>
		);
	}
}
class PopupDialog extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			open : false ,
			modal : true,
			bound : { top: 0, left : 0, right : 0, bottom : 0}
		}
		this.onClose = this.onClose.bind(this);
		this.onMinimize = this.onMinimize.bind(this);
	}
	static defaultProps = {
		open: false,
		modaless : false,
		position : {x : 0, y: 0}
	};
	static propTypes = { onClose: PropTypes.func };
	componentDidMount () {
		let bound = { 
			top: -(document.getElementById(this.props.popupdivid + "_inner_div").getBoundingClientRect().top),
			left: -(document.getElementById(this.props.popupdivid + "_inner_div").getBoundingClientRect().left)-400,
			right: document.getElementById(this.props.popupdivid + "_inner_div").getBoundingClientRect().left+400,
			bottom: document.getElementById(this.props.popupdivid + "_inner_div").getBoundingClientRect().top+400
		}
		ReactDOM.findDOMNode(this).scrollIntoView();
		if (!this.props.modaless) {
			document.body.addEventListener('keydown', this.onKeyDown);
		}
		this.setState({bound : bound});
	}
	componentWillUnmount () {
		if (!this.props.modaless) {
			document.body.removeEventListener('keydown', this.onKeyDown);
		}
	}
	onKeyDown = (e) => {
		if (e.code === 'Tab' || e.key === 'Tab' || e.keyCode === 9) {
			if (e.shiftKey) {
				if (document.activeElement === document.getElementById(this.props.popupdivid + "_first_div")) {
					document.getElementById(this.props.popupdivid + "_last_div").focus();
					e.preventDefault();
				}
			} else {
				if (document.activeElement === document.getElementById(this.props.popupdivid + "_last_div")) {
					document.getElementById(this.props.popupdivid + "_first_div").focus();
					e.preventDefault();
				}
			}
			
		}
	}
	onClose = (e) => {
		this.props.onClose(e);
	}
	onMinimize = (e) => {
		const {AppModuleAction} = this.props;
		AppModuleAction.addPop({id : this.props.popupdivid, name : this.props.name});
		document.getElementById(this.props.popupdivid).hidden = true;

	}
	onCallbackFunc = (data) => {this.props.onCallbackFunc(data);}

	render () {
		return (
			<DialogBox
				isOpen={this.props.open}
				noBackdrop={this.props.modaless}
				clickBackdropToClose = {this.props.modaless}
				style={{ zIndex : '9991' }}
				backdropStyle = {{ zIndex : '9990' }}
			>
				<Draggable
					bounds={this.state.bound}
					defaultPosition = {this.props.position}
					positionOffset = {{x: '-50%', y: 0}}
					allowAnyClick ={false}
					handle = {'.scrm-popup-modal-content-header'}
				>
					<div id={this.props.popupdivid + "_inner_div"} className = "scrm-popup-modal-content" style={{width: this.props.options.width, height: this.props.options.height}}>
						<div id={this.props.popupdivid + "_first_div"} tabIndex={0} className = "scrm-popup-modal-content-header">
							<div style={{float: 'left'}}>
								{this.props.name}
							</div>
							<button className="scrm-btn xs grey-o" id={'_btnClose'}  style={{float: 'right'}} onClick ={this.onClose}> <i className="xi-close"></i> </button>
							{
								(this.props.modaless)
									?	<button className="scrm-btn xs grey-o"  style={{float: 'right'}} onClick ={this.onMinimize}>
											<i className="xi-minus"/>
										</button>
									: null
							}
						</div>
						<div className = "scrm-popup-modal-content-body" style={{overflow: 'auto'}}>
							{
								popRoute.filter(item => item.id === this.props.url).map((comp, key) => {
									return <comp.component popupdivid={this.props.popupdivid} onCallbackFunc={this.onCallbackFunc} key={'pop_' + comp.id + '_' + key} onClose={this.onClose} options = {this.props.options}/>
								})
							}
						</div>
						<div id={this.props.popupdivid + "_last_div"} tabIndex={0}/>
					</div>
				</Draggable>
			</DialogBox>
		);
	}
}
class ModalLoading extends React.Component {
	constructor() {
		super();
		this.state = { isOpen: false }
	};
	render() {
		return (
			<DialogBox	isOpen = {this.props.isOpen} defaultPosition = {{x: 0, y: 0}} backdropStyle={{background: 'transparent'}} noBackdrop = {false}
						style = {{backgroundColor : "rgba(0, 0, 0, 0)", borderRadius: '90px'}}
			> 
				<div style={{position: 'fixed', zIndex: '9999', top: '40%', fontSize: '14px', fontWeight: 'bold', fontFamily: 'dotum', color: 'black', width: '100%', textAlign: 'center'}}>
					{'Loading'}
				</div>
				<div className={'scrm-loader-div'}>
				</div>
			</DialogBox>
		);
	}
}
export default {
	AlertDialog, ConfirmDialog, ModalLoading,
	PopupDialog : connect(
		(state) => ({
			popupList : state.appModule.popupList,
		}),
		(dispatch) => ({
			AppModuleAction : bindActionCreators(appModuleActions, dispatch)
		})
	)(PopupDialog)
}