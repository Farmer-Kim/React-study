import React from 'react';
import {BasicButton as Button} from 'components';
import {StrLib} from 'common';
 
class DelRowButton extends React.Component{
	constructor (props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	onClick = (e) => {
		this.props.context.componentParent.onDeleteRow(this.props);
	}
	render () {
		return (
			<React.Fragment>
				<Button value='삭제' onClick={this.onClick}/>
			</React.Fragment>
		)
	}
}

class ActionButton extends React.Component{
	constructor (props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	onClick = (e) => {
		this.props.context.componentParent.onActionCellClicked(this.props);
	}
	render () {
		let colDef = this.props.colDef;
		let data   = this.props.data

		let id     = colDef['colId'] + '_' + data[colDef['colId']] + '_' + data['recid']
		let iconClass;
		
		let color = 'blue';

		if (!StrLib.isNull(colDef.color)) {
			color = colDef.color;
		}

		switch (data[colDef['colId']]) {
			case "save"       : iconClass = 'xi-diskette xi-2x'; break;
			case "add"        : iconClass = 'xi-plus xi-2x';     break;
			case "del"        : iconClass = 'xi-minus xi-2x';    break;
			case "check"      : iconClass = 'xi-check xi-2x';    break;
			case "trash"      : iconClass = 'xi-trash-o xi-2x';  break;				
			case "undo"       : iconClass = 'xi-undo';           break;
			case "redo"       : iconClass = 'xi-redo';           break;
			case "arrowUp"    : iconClass = 'xi-arrow-up';       break;
			case "arrowDn"    : iconClass = 'xi-arrow-down';     break;
			case "close"      : iconClass = 'xi-close';          break;
			case "play"       : iconClass = 'xi-play xi-2x';     break;
			case "pause"      : iconClass = 'xi-pause xi-2x';    break;						
			case "left"       : iconClass = 'xi-arrow-left xi-2x c-grey-6';   break;
			case "right"      : iconClass = 'xi-arrow-right xi-2x c-grey-6';  break;		
			case "message"    : iconClass = (colDef.fiiled) ? 'xi-message xi-2x'    : 'xi-message-o xi-2x';     break;
			case "fileCheck"  : iconClass = (colDef.fiiled) ? 'xi-file-check xi-2x' : 'xi-file-check-o xi-2x';  break;
			case "fileCode"   : iconClass = (colDef.fiiled) ? 'xi-file-code xi-2x'  : 'xi-file-code-o xi-2x';   break;
			case "fileImage"  : iconClass = (colDef.fiiled) ? 'xi-file-image xi-2x' : 'xi-file-image-o xi-2x';  break;
			case "fileText"   : iconClass = (colDef.fiiled) ? 'xi-file-text xi-2x'  : 'xi-file-text-o xi-2x';   break;
			case "fileFolder" : iconClass = (colDef.fiiled) ? 'xi-folder xi-2x'     : 'xi-folder-o xi-2x';      break;
			case "sitemap"    : iconClass = (colDef.fiiled) ? 'xi-sitemap xi-2x'    : 'xi-sitemap-o xi-2x';     break;
			case "tint"       : iconClass = (colDef.fiiled) ? 'xi-tint xi-2x'       : 'xi-tint-o xi-2x';        break;
			case "down"       : iconClass = (colDef.fiiled) ? 'xi-download xi-2x'   : 'xi-download-o xi-2x';    break;
			case "srch"       : iconClass = (colDef.fiiled) ? 'xi-search xi-2x'     : 'xi-search-o xi-2x';      break;
			case "copy"       : iconClass = (colDef.fiiled) ? 'xi-documents xi-2x'  : 'xi-documents-o xi-2x';   break;
			default           : iconClass = null; break;
		}
		iconClass += ' ' + 'action_icon' + ' ' + color;

		return (
			!StrLib.isNull(data[colDef['colId']]) ? 
			<div style={{textAlign: 'center'}}>	
				<i style={{cursor: 'pointer'}} onClick= {(e) => { e.stopPropagation(); this.onClick(); }} className={ iconClass }></i>				
			</div>
			: 
			null
		) 
	}
}

export {DelRowButton, ActionButton}