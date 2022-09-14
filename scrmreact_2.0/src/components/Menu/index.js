import React from 'react';
import ReactDOM from 'react-dom';
import {StrLib} from 'common';

class HeaderMenu extends React.Component {
	constructor(props)  {
		super(props);
		this.state = {
			open : false
		}
	}
	componentDidMount() {
		document.addEventListener('click', this.handleClickOutside, true);
	}
	componentWillUnmount() {
		document.removeEventListener('click', this.handleClickOutside, true);
	}
	handleClickOutside = (e) => {
		const domNode = ReactDOM.findDOMNode(this);
		if ( !domNode || !domNode.contains(e.target) ) this.closeMenuList();
	}
	closeMenuList = () => { this.setState({...this.state, open : false});}
	setMenuDivOpen = () => { this.setState({...this.state, open : !this.state.open});}
	render () {
		return (
			<React.Fragment>
				<div className="scrm-header-menu-container">
					<ul className="scrm-header-menu-ul">
						{
							this.props.menu.filter(item => StrLib.isNull(item.PARE_MNU_ID) ).map((item, key) => {
								return <li className="scrm-header-menu-li" key={'menu_' + key} onClick={this.setMenuDivOpen}>{item.MNU_NM}</li>
							})
						}
					</ul>
				</div>
				<div id="_scrm_menu_area" className= {(this.state.open) ? "scrm-header-menu-active" : "scrm-header-menu-nested"}>
						<ul className="scrm-header-menu-ul">
							{
								this.props.menu.filter(item => StrLib.isNull(item.PARE_MNU_ID)).map((item, key) => {
									return (
										<li className="scrm-header-menu-li" key={'div_menu_' + key} onClick={this.closeMenuList}>
											<ul className="scrm-header-submenu-ul">
												{
													this.props.menu.filter(menu => menu.PARE_MNU_ID === item.MNU_ID).map((subMenu, subKey) => {
														return <li  className="scrm-header-submenu-li" key={'submenu_' + subKey} id={'subMenu_' + subMenu.MNU_ID}
																	onClick = {
																		(e) => {
																			this.props.openMenu(subMenu);
																			this.setState({...this.state, open : false});
																		}
																	}
																> {subMenu.MNU_NM} </li>;
													})
												}
											</ul>
										</li>
									);
								})
							}
						</ul>
					</div>
			</React.Fragment>
		)
	}
}

export { HeaderMenu};