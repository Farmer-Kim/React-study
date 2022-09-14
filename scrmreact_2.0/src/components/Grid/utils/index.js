/* ***************************************************
 *	explain : 그리드 내부에서 필요한 util 정의
 *	written by hw.lee
 * ***************************************************/

 const rowSpan = (params) => {
	let cnt = 0;
	let api = params.api;
	// index 위의 데이터 찾기
	let data  = [];
	api.forEachNodeAfterFilterAndSort((node) => {
		data.push({node : node, index : node['rowIndex']});
	});
	let prevVal;
	let presVal = params.data[params.column.colId];
	if (presVal === null || presVal === undefined) {
		return 1;
	}

	if (params.node.rowIndex > 0) {
		prevVal = api.getValue(params.column.colId , data[params.node.rowIndex-1]['node']);
		if (prevVal === presVal) {
			return 1;
		} else {
			for (let intA = 0; intA < data.length; intA++) {
				if (data[intA]['index'] >= params.node.rowIndex) {
					if (data[intA]['node']['data'][params.column.colId] === params.data[params.column.colId]) {
						cnt ++;
					} else {
						break;
					}
				}
			}
		}
	} else {
		for (let intA = 0; intA < data.length; intA++) {
			if (data[intA]['index'] >= params.node.rowIndex) {
				if (data[intA]['node']['data'][params.column.colId] === presVal) {
					cnt ++;
				} else {
					break;
				}
			}
		}
	}
	return cnt;
}
const valueRowSpan = (params) => {
	if (params['node']['rowIndex'] > 0) {
		let beforeData = params.api.getValue(params.column.colId, params.api.getDisplayedRowAtIndex(params['node']['rowIndex'] - 1));
		if (beforeData === null || beforeData === undefined) {
			return params.data[params.column.colId];
		} else {
			if (beforeData === params.data[params.column.colId]) {
				return '';
			} 
		}
	}
	return params.data[params.column.colId];
}
const setColumnProperty = (ele) => {
	if (ele['rowSpan'] === true) {
		ele['rowSpan'] = function (params) { return 1;};
		ele['valueFormatter'] = valueRowSpan
	}
	if (ele['cellStyle'] === undefined || ele['cellStyle'] === null) ele['cellStyle'] = {};
	if (ele['autoHeight'] === true) {
		ele['cellStyle']['white-space'] = "normal";
	}
	if (ele['textAlign'] === undefined || ele['textAlign'] === null) {
		ele['textAlign'] = 'left';
	}
	ele['cellStyle']["text-align"] = ele['textAlign'];

	if (ele['req']) {
		ele['headerName'] = ele['headerName'] + '*';
	}
	return ele;
}

const setGridHeader = (header, props) => {
	if (header === null || header === undefined) {
		return null;
	}
	if (props === undefined || props === null) {
		return header;
	}
	let rtnHeader;
	
	let _depthCol = [{headerName: '_HIERARCHY', field: '_HIERARCHY', colId: '_HIERARCHY', filter: false, resizable: false, lockPosition: true, cellStyle: {paddingLeft: '20px'}}];
	let treeCol   = [{headerName: '_TREE', field: '_TREE', colId: '_TREE', filter: false, resizable: false, sortable: false, lockPosition: true, defaultWidth: 45, minWidth: 45, maxWidth: 45}];
	let numCol =	[{	headerName: 'No.', field: '_No', colId: '_No', defaultWidth: 60, minWidth: 60, maxWidth: 70, sortable: false, filter: false, resizable: false, lockPosition: true,
						valueGetter: function(params) { return params.node.rowIndex + 1;}, cellStyle: {'text-align' : 'right'}
					}];
	let chkCol =	[{	headerName: '', field: '',	colId: '',	sort: false, filter: false, resizable: false, headerCheckboxSelection: true, checkboxSelection: true, lockPosition: true, maxWidth : 30}];
	let hideCol =	[{	headerName: 'CHK',	field: 'CHK',	colId: 'CHK',	hide: true }];
	let dragCol =	[{	headerName: '', field: '',	colId: '',	lockPosition: true, sort: false, filter: false, rowDrag: true, resizable: false, maxWidth : 30,
						rowDragText : function (params) { return params.rowNode.rowIndex + 1 + '행'} 
					}];

	if (typeof props.colPinned === 'number') {
		for (let intA = 0; intA < props.colPinned - 1; intA ++) {
			if (header.length < intA) {
				break;
			}
			header[intA]['pinned'] = 'left';
			header[intA]['suppressNavigable'] = true;
			header[intA]['lockPosition'] = true;
		}
		_depthCol[0]['pinned'] = 'left';
		numCol[0]['pinned'] = 'left';
		chkCol[0]['pinned'] = 'left';
		dragCol[0]['pinned'] = 'left';
	}

	rtnHeader = checkHeaderDepth(header, setColumnProperty);
	
	if (props.tree !== undefined && props.tree['isTree']) {
		treeCol[0]['headerName']   = "";
		treeCol[0]['cellRenderer'] = 'treeRenderer';
		rtnHeader = treeCol.concat(rtnHeader);
	} else {
		if (props.rowNum) {
			rtnHeader = numCol.concat(rtnHeader);
		}
	}
	if (props.infoCheckBox['use']) {
		if (props.infoCheckBox['colId'] !== undefined && props.infoCheckBox['colId'] !== null && props.infoCheckBox['colId'] !== '') {
			hideCol[0]['headerName'] = props.infoCheckBox['colId'];
			hideCol[0]['field'] = props.infoCheckBox['colId'];
			hideCol[0]['colId'] = props.infoCheckBox['colId'];
		}
		rtnHeader = chkCol.concat(rtnHeader).concat(hideCol);
	}
	
	if (props.rowDrag) {
		rtnHeader = dragCol.concat(rtnHeader);
	}
	return rtnHeader;
}

const checkHeaderDepth = (arrData, _function) => {
	const _func = _function;
	for (let intA = 0; intA < arrData.length; intA ++) {
		if (arrData[intA].hasOwnProperty('children')) {
			arrData[intA]['children'] = checkHeaderDepth(arrData[intA]['children'], _func);
		} else {
			arrData[intA] = _func(arrData[intA]);
		}
	}
	return arrData;
}

const checkHeaderProp = (arrData, col) => {
	let rtnVal = false;
	for (let intA = 0; intA < arrData.length; intA ++) {
		if (arrData[intA].hasOwnProperty('children')) {
			rtnVal = checkHeaderProp(arrData[intA]['children'], col);
		} else {
			if (arrData[intA][col] !== undefined && arrData[intA][col] !== null) {
				rtnVal = true;
				return rtnVal;
			}
		}
	}
	return rtnVal;
}

const compareArray = (arr1, arr2) => {
	if (JSON.stringify(arr1) === JSON.stringify(arr2)) {
		return true;
	} else {
		return false;
	}
}

export { rowSpan, setGridHeader, checkHeaderDepth, compareArray, checkHeaderProp };