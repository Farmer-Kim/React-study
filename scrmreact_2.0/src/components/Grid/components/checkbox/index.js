import React from 'react';
class CheckboxRenderer extends React.Component {
	constructor(props) {
		super(props);
		this.checkedHandler = this.checkedHandler.bind(this);
	}
	static defaultProps = {
		value : 'N'
	};
	checkedHandler(event) {
		let value = 'N'
		if (event.target.checked) {
			value = 'Y'
		}
		let colId = this.props.column.colId;
		this.props.node.setDataValue(colId, value);
		
	}
	render() {
		return (
			<input type="checkbox"  onClick={this.checkedHandler} checked={(this.props.value === 'Y') ? true : false} />
		)
	}
}
export default CheckboxRenderer;