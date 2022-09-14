import React from 'react';
import 'assets/styles/component.css';

class Table extends React.Component {
	setColGroup = (colGrp) => {
		if (colGrp === undefined) {
			return null;
		} else {
			if (colGrp.length === 0) {
				return null;
			}  else {
				return colGrp.map((colGrp, index) => {
					return (<col key={'col_' + index} style={{width: colGrp.width}}></col>)
				});
			}
		}
	}
	setBody = (body) => {
		if (body === undefined)  {
			return null;
		} else {
			return this.setRow(body);
		}
	}
	setRow = (rowArray) => {
		return rowArray.map((colArray, index) => {
			return (<tr key={'tr_' + index}>{this.setColumn(colArray)}</tr>)
		});
		
	}
	setColumn = (colArray) => {
		return colArray.map((colJson, index) => {
			return (
			  (colJson.type === 'T') ?  <th className='scrm-table-th' key={'cobody_' + index} colSpan = {colJson.colSpan} rowSpan = {colJson.rowSpan}>{colJson.value}</th>
									 :  <td className='scrm-table-td' key={'cobody_' + index} colSpan = {colJson.colSpan} rowSpan = {colJson.rowSpan}>{colJson.value}</td>
			)
		});
	}
	render () {
		return (
			<table className = 'scrm-table' id = {this.props.id} style={{width: this.props.width}}>
				<colgroup>
					{ this.setColGroup(this.props.colGrp) }
				</colgroup>
				{ (this.props.head === null || this.props.head === undefined) ? <thead>{this.props.head}</thead> : <thead/> }
				<tbody>
					{ this.setBody(this.props.tbData) }
				</tbody>
				{ (this.props.footer === null || this.props.footer === undefined) ? <tfoot>{this.props.footer}</tfoot> : <tfoot></tfoot> }
			</table>
		);
	}
}
export default Table;