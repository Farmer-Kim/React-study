import React from 'react';
import {IconButton, LFloatArea} from 'components';

class TrayDiv extends React.Component {
  constructor(props)  {
		super(props);
		this.state = {
		}
	}
	selectMenu = (props) => {
		this.props.data.forEach((key, i) => {
			if (props.MNU_ID === key.MNU_ID) {
				if (document.getElementById(props.MNU_ID) !== null) {
					document.getElementById(props.MNU_ID).style.display = 'block';
					// tray selected 변경 처리
					this.props.onSelect(props);
				}
			} else {
				if (document.getElementById(key.MNU_ID) !== null && document.getElementById(key.MNU_ID) !== undefined) {
					document.getElementById(key.MNU_ID).style.display = 'none';
				}
			}
		});
	}

	removeMenu = (props) => { this.props.onClose(props);}

	render () {
		return (
			<React.Fragment>
				<LFloatArea>
					<div className='scrm-tray-div' id = {this.props.id}>
						<ul id = { '_ul' + this.props.id}>
							{
								this.props.data.map((item, key) => {
									return (
										<li className = {(item.MNU_ID === this.props.selected.MNU_ID) ? 'scrm-tray-div-li-selected' : null}
											key={'scrm-tray-div' + key} id={'tray_li_' + item.MNU_ID} onClick={(e) => { this.selectMenu(item)}}
										>
											<div className='scrm-tray-div-li-div' id={'tray_div_item_' + item.MNU_ID}>{item.MNU_NM}</div>
											<IconButton classes='scrm-tray-div-btn-close' id='btnClose' onClick={(e) => {e.stopPropagation(); this.removeMenu(item)}}/>
										</li>
									)
								})
							}
						</ul>
					</div>
				</LFloatArea>
			</React.Fragment>
		)
	}
}

export {TrayDiv};