import React from 'react';
import {appRoute} from 'routes';
import {TrayPanel, IconButton, RFloatArea, LFloatArea, TrayDiv} from 'components';

class Main extends React.Component{
	constructor (props) {
		super(props);
		this.state = {
			trayProp : []
		}
		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onPrevMove = this.onPrevMove.bind(this);
		this.onNextMove = this.onNextMove.bind(this);
		this.onSelect = this.onSelect.bind(this);
	}
	onClick = (e) => { this.selectMenu(); }
	onClose = (e) => { this.props.closeMenu(e); }
	onPrevMove  = (e) => { this.props.prevMenu(e); }
	onNextMove  = (e) => { this.props.nextMenu(e); }
	onSelect  = (e) => { this.props.selectMenu(e); }
	event = {
		button : {
			onClick : (e) => {
				switch (e.target.id) {
					case 'btnPrev' :
						// 이전 메뉴 이동
						this.props.prevMenu(this.props.selected);
						break;
					case 'btnNext' :
						// 다음 메뉴 이동
						this.props.nextMenu(this.props.selected);
						break;
					case 'btnClose' :
						this.props.closeAllMenu();
						break;
					default : break;
				}
			}
		}
	}

	render () {
		return (
			<React.Fragment>
				<TrayPanel id = {"_trayPanelMenu"}>
					<LFloatArea>
						<TrayDiv id={"_mainTrayDiv"} data= {this.props.tray} selected = {this.props.selected} onClick = {this.onClick} onClose = {this.onClose} onSelect={this.onSelect}/>
					</LFloatArea>
					<RFloatArea>
						<div className="scrm-tray-btn-div" id = "_trayBtnArea">
							<IconButton classes='scrm-tray-btn-prev' id='btnPrev' onClick={this.event.button.onClick} />
							<IconButton classes='scrm-tray-btn-next' id='btnNext' onClick={this.event.button.onClick} />
							<IconButton classes='scrm-tray-btn-close' id='btnClose' onClick={this.event.button.onClick} />
						</div>
					</RFloatArea>
				</TrayPanel>
				<div className={'scrm-main-view-area'}>
					{
						this.props.tray.map(tray => {
							return (
								<div id={tray.MNU_ID} style={{display : (this.props.selected.MNU_ID === tray.MNU_ID) ? 'block' : 'none'}} key={'_menu_div_' + tray.MNU_ID}>
									{
										appRoute.filter(item => item.id === tray.MNU_ID).map((prop) => {
											return <prop.component key = {'_menu_comp_' + prop.id}/>
										})
									}
								</div>
							)
						})
					}
				</div>
			</React.Fragment>
		);
	}
}
export default Main;