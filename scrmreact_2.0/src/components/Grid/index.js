import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {ComLib, newScrmObj, StrLib, ExcelLib, DataLib} from 'common';
import {LFloatArea, RFloatArea, BasicButton as Button} from 'components';
import {DateComponent, TimeComponent, CheckboxRenderer, RangeDateComponent, RangeTimeComponent, DelRowButton, SelectboxRenderer, CustomEditor, ActionButton, CustomToolTip} from './components';

import {setGridHeader, checkHeaderProp} from './utils';
import 'ag-grid-community/dist/styles/ag-grid.css';
import "flatpickr/dist/themes/dark.css";

class Grid extends React.Component {
	constructor (props) {
		super(props);
		this.initFlag = false;
		this.pageDataset = [];
		this.propDataset = [];
		this.gridDataset = DataLib.datalist.getInstance();
		this.state = { gridApi : null, columnApi : {}, columnDefs: [], rowData: [] };
		this.onActionCellClicked  = this.onActionCellClicked.bind(this);
		this.onCellClicked		  = this.onCellClicked.bind(this);
		this.onCellDoubleClicked  = this.onCellDoubleClicked.bind(this);
		this.onCellFocused		  = this.onCellFocused.bind(this);
		this.onRowClicked		  = this.onRowClicked.bind(this);
		this.onRowSelected		  = this.onRowSelected.bind(this);
		this.onRowDoubleClicked	  = this.onRowDoubleClicked.bind(this);
		this.onCellValueChanged	  = this.onCellValueChanged.bind(this);
		this.onGridReady		  = this.onGridReady.bind(this);
		this.onCellEditingStopped = this.onCellEditingStopped.bind(this);
		this.onRowDataChanged	  = this.onRowDataChanged.bind(this);
		this.onSelectionChanged	  = this.onSelectionChanged.bind(this);
		this.onPaginationChanged  = this.onPaginationChanged.bind(this);
		this.onBodyScroll		  = this.onBodyScroll.bind(this);
		this.onRowDataUpdated	  = this.onRowDataUpdated.bind(this);
		this.onSortChanged		  = this.onSortChanged.bind(this);
		this.onRowDragEnd		  = this.onRowDragEnd.bind(this);
		this.onGridSizeChanged	  = this.onGridSizeChanged.bind(this);
		this.onColumnResized	  = this.onColumnResized.bind(this);
		this.onColumnGroupOpened  = this.onColumnGroupOpened.bind(this);
	}
	// checkboxSelection: false,
	static defaultProps = {
		id : null,
		data : [],
		header : [],
		suppressMovableColumns : true,
		rowDrag : false,
		doNotScrollTop : true,
		suppressRowClickSelection : false,
		sort : true,
		filter : false,
		floatingFilter: false,
		rowSelection : 'single',
		addRowBtn : true,
		delRowBtn : true,
		dnlExcelBtn : false,
		infoCheckBox : {
			use : false,
			colId : null,
		},
		onGridReady : () => {return;},
		onGridSizeChanged : () => {return;},
		onRowClicked : () => {return;},
		onCellFocused : () => {return;},
		onActionCellClicked : () => {return;},
		onCellClicked : () => {return;},
		onCellDoubleClicked : () => {return;},
		onCellValueChanged : () => {return;},
		onRowDoubleClicked : () => {return;},
		onCellEditingStopped  : () => {return;},
		onSelectionChanged  : () => {return;},
		onRowSelected  : () => {return;},
		onDeleteRow : () => {return;},
		onPaginationChanged : () => {return;},
		onBodyScroll : () => {return;},
		onScrollEnd : () => {return;},
		onRowDragEnd : () => {return ;},
		onBeforeInsertRow : () => {return { rtn : true, index : 0};},
		onBeforeDeleteRow : () => {return true;},
		onColumnGroupOpened : () => {return true;}
	};
	componentDidMount () { 
	};
	shouldComponentUpdate (nextProps) {
		if (!this.props.infinite) {
			// 화면에서 setState시, 다른 컴포넌트의 데이터가 변경되는 경우에 prop 데이터의 변경이 없으면 render 하지 않음
			if (nextProps.data.records === this.propDataset && nextProps.data.records === this.props.data.records && this.props.data.records === this.propDataset) {
				return false;
			}
		} else {
			if (nextProps.data.records === this.pageDataset && nextProps.data.records === this.props.data.records && this.props.data.records === this.pageDataset) {
				return false;
			}
		}
		return true;

	}
	componentDidUpdate(prevProps) {
		// gridApi가 없는 경우, 로직 pass 시킴
		if (this.state.gridApi === null) return;

		if (this.props.data.getRecords().length === 0) {
			this.gridDataset.initRecords(this.props.data.getRecords());
			this.propDataset = this.props.data.records;
			this.state.gridApi.setRowData(null);
			return;
		}

		if (this.props !== prevProps) {
			if (this.state.gridApi) {
				if (!this.props.infinite) {
					// infinite가 아닌 경우, 그냥 리셋
					// 문제점 : 행 추가 시, 데이터셋 리셋은 안됨 + 재조회시에는 데이터셋 리셋
					// 그리드가 여러개인 경우, 화면에서 setState를 할 때마다 render가 일어나기 때문에 state가 변경된 그리드를 제외하고는 update 하지 않도록 로직 필요
					// -> shouldComponentUpdate에서 판단하여 render
					this.propDataset = this.props.data.records;
					if (this.props.tree !== undefined && this.props.tree.isTree) {
						this.gridDataset.initRecords(this.makeTreeData(this.props.data.getRecords()));
						this.state.gridApi.setRowData(this.getTreeData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)));
					} else {
						this.gridDataset.initRecords(this.props.data.getRecords());
						this.state.gridApi.setRowData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
					}
				} else {
					// 최초 그리드 셋팅
					if (this.gridDataset.getRecords().length === 0 || this.propDataset.length === 0) {
						this.setInfiniteGridData('R');
					} else {
							// infinte 데이터 추가 시, 현재 페이지 데이터의 recid와 props recid 더 큰 경우에는 page 데이터 갱신						
							if (this.propDataset[0]['recid'] === this.props.data.getRecords()[0]['recid']) {
								this.setInfiniteGridData('R');
							} else {
								if (this.pageDataset[0]['recid'] === this.props.data.getRecords()[0]['recid']) {
									// recid가 같은 경우는 재조회로 간주하고 데이터 재 셋팅
									this.setInfiniteGridData('R');
								} else {
									this.setInfiniteGridData('A');
								}
							}
					}
				}
			}
		}
		
	}
	/* Event Zone */
	onGridReady = (event) => {
		this.setState({
			...this.state, gridApi: event.api, columnApi: event.columnApi
		}, () => {
			if (this.state.gridApi !== undefined && this.state.gridApi !== null && Object.keys(this.state.gridApi).length !== 0) this.pageDataset = this.props.data.getRecords();
			this.state.gridApi.sizeColumnsToFit(); 
			this.props.onGridReady({id : this.props.id, gridApi : this.state.gridApi, grid : this , columnApi : this.state.columnApi});
		});
	};
	onColumnResized = (e) => { }
	onGridSizeChanged = (e) => { e.api.sizeColumnsToFit(); }
	onRowDataUpdated = (e) => {
		e.api.sizeColumnsToFit(); 
	}
	onBodyScroll = (e) => {
		if (this.props.infinite) {
			if (this.state.gridApi.getDisplayedRowAtIndex(this.state.gridApi.getDisplayedRowCount()-1)) {
				let lastNode = this.state.gridApi.getDisplayedRowAtIndex(this.state.gridApi.getDisplayedRowCount()-1);
				if ((lastNode.rowHeight + lastNode.rowTop) <= this.state.gridApi.getVerticalPixelRange().bottom) {
					if (this.props.totalRowCnt > this.propDataset.length) {
						this.props.onScrollEnd({ id : this.props.id, excelLoadAll: false});
						
					}
				}
			}
		}
	}
	onPaginationChanged = (e) => {

	};

	onCellValueChanged = (e) => {
		let _newValue = e.newValue;

		if (e.oldValue !== _newValue) {
			if (e.data['rowtype'] !== newScrmObj.constants.crud.create) {
				this.gridDataset.setValue(this.gridDataset.indexOf('recid', e.data.recid), e.column.colId, _newValue);
			} else {
				let rowData = this.gridDataset.getRecords();
				Object.assign(rowData.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)[e.rowIndex], e.data);
				this.gridDataset.setRecords(rowData);
			}
			this.props.onCellValueChanged({ 
					id : this.props.id
				,	data : this.gridDataset.getRecords()
				,	index : e.node.id
				,	row: e.rowIndex
				,	col: e.column.colId
				,	node : e.node
				,	cellEditor : e.colDef.cellEditor
				,	cellEditorParams : e.colDef.cellEditorParams
				,	oldValue : e.oldValue
				,	newValue : _newValue
			});
		}
	}

	doDisplayChange = (e) => {
		let gridDataset = e.gridDataset;

		for (let intA = 0; intA < gridDataset.length; intA ++) {
			if(e.data['ID'] === gridDataset[intA]['ID'] && !e.isSub) {
				gridDataset[intA]['EXPAND'] = !gridDataset[intA]['EXPAND'];

			}
			if (gridDataset[intA]['PARENT_ID'] !== '0') {
				if (gridDataset[intA]['PARENT_ID'] === e.data['ID'] ) {
					gridDataset[intA]['_display'] = !gridDataset[intA]['_display'];	
					if (gridDataset[intA]['EXPAND']) {
						gridDataset = this.doDisplayChange({gridDataset: gridDataset, data: gridDataset[intA], isSub: true});	
					}
				}
			}
		}		
		
		return gridDataset;
	}
	onActionCellClicked = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }

		if (this.props.tree !== undefined && this.props.tree.isTree) {
			if (e.column.colId === '_HIERARCHY') {
				let gridDataset = this.gridDataset.getRecords();
				let newDataset = this.doDisplayChange({gridDataset: gridDataset, data: e.data, isSub: false});
				
				this.gridDataset.setRecords(newDataset);
				e.api.setRowData(this.getTreeData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)));
			}
		}
		this.props.onActionCellClicked({ id : this.props.id, data : e.data, index : e.node.id, col : e.column.colId});
	};
	onCellClicked = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }

		if (this.props.tree !== undefined && this.props.tree.isTree) {
			if (e.column.colId === '_HIERARCHY') {
				let gridDataset = this.gridDataset.getRecords();
				let newDataset = this.doDisplayChange({gridDataset: gridDataset, data: e.data, isSub: false});
				
				this.gridDataset.setRecords(newDataset);
				e.api.setRowData(this.getTreeData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)));
			}
		}
		this.props.onCellClicked({ id : this.props.id, data : e.data, index : e.node.id, col : e.column.colId});
	};
	onCellDoubleClicked = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }
		this.props.onCellDoubleClicked({ id : this.props.id, data : e.data, index : e.node.id, col : e.column.colId});
	};
	onCellFocused = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }
		this.props.onCellFocused({ id : this.props.id, data : e.data, index : e.node.id });
	};
	onRowClicked = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }
		this.props.onRowClicked({ id : this.props.id, data : e.data, index : e.node.id });
	};
	onRowDoubleClicked = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }
		this.props.onRowDoubleClicked({ id : this.props.id, data : e.data, index : e.node.id });
	};
	onCellEditingStopped = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }
		this.props.onCellEditingStopped({ id : this.props.id, data : e.data, index : e.node.id });
	};
	onRowDataChanged = (e) => { 
		if (this.state.gridApi !== undefined && this.state.gridApi !== null && Object.keys(this.state.gridApi).length !== 0) {
			this.state.gridApi.sizeColumnsToFit();
		}
	};
	onSelectionChanged = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }
		this.props.onSelectionChanged({ id : this.props.id, gridApi : e.api, columnApi : e.columnApi, event : e});
	};
	onRowSelected = (e) => {
		if (this.props.id === null || this.props.id === undefined) { return; }
		this.props.onRowSelected({ id : this.props.id, data : e.data, index : e.node.id, event : e});
	}
	onSortChanged = (e) => {
		if (this.props.rowNum) {
			e.api.refreshCells({ columns : ['_No'] });
		}
	}
	onColumnGroupOpened = (e) => {
		this.props.onColumnGroupOpened({ id : this.props.id , gridApi : e.api, columnApi : e.columnApi, extended : e.columnGroup.expanded});
	}
	findRowToMove =(e) => {
		let rtnArr  = [];
		let display = false;

		if (!e.isSub) {
			if (e.parentID === "0") {
				display = true;
			} else {
				for(let i = 0; i < e.org.length; i ++) {
					if (e.org[i]["PARENT_ID"] === e.parentID) {
						display = e.org[i]["_display"];
						break;
					}
				}
			}
		}

		for (let i = 0; i < e.target.length; i ++) {
			let temp;
			if (!e.isSub) {
				temp = JSON.parse(JSON.stringify(e.target[i]["data"]));
			} else {
				temp = JSON.parse(JSON.stringify(e.target[i]));	
			}
			temp["LEVEL"] = e.parentLV + 1;
			if (!e.isSub) {
				temp["PARENT_ID"] = e.parentID;
				display = (temp["_display"] && display);
			} else {
				display = (e.parnetOpen && temp['_display']);	
			}
			temp["_display"]  = display;
			if (temp['rowtype'] !== newScrmObj.constants.crud.create) {
				if (temp['rowtype'] === newScrmObj.constants.crud.read) {
					temp['rowtype'] = newScrmObj.constants.crud.update;
				}
			}
			let temp2 = [];
			for(let j = 0; j < e.org.length; j ++) {
				if (e.org[j]["PARENT_ID"] === temp["ID"]) {
					let needToMove = this.findRowToMove({org: e.org, target : [e.org[j]], parentLV: temp["LEVEL"], parentID: temp["ID"], isSub: true, parnetOpen: (display && e.org[j]['_display'])});
					for(let k = 0; k < needToMove.length; k ++) {
						temp2.push(needToMove[k])
					}
				}
			}
			if (temp2.length > 0) {
				temp["EXPAND"]  = temp2[0]['_display'];
				rtnArr.push(temp)

				for(let k = 0; k < temp2.length; k ++) {
					rtnArr.push(temp2[k])
				}
			} else {
				rtnArr.push(temp)
			}
		}
		return rtnArr;
	}

	makeTreeData = (data) => {
		let rtnVal = data;
		if (this.props.tree.isTree) {
			if ( this.props.tree.stndCol.length > 0 ) {
				for ( let intA = 0; intA < rtnVal.length; intA++ ) {
					if (rtnVal[intA]['_display'] === undefined) {
						if (this.props.tree.open) {
							rtnVal[intA]['_display'] = true;
							rtnVal[intA]['EXPAND'] = true;
						} else {
							if (rtnVal[intA]['LEVEL'] !== 1) {
								rtnVal[intA]['_display'] = false;
								rtnVal[intA]['EXPAND'] = false;
							} else {
								rtnVal[intA]['_display'] = true;
								rtnVal[intA]['EXPAND'] = false;
							}
						}
						let childCnt = 0;

						for (let intB = 0; intB < rtnVal.length; intB++) {
							if (rtnVal[intB]['PARENT_ID'] === rtnVal[intA]['ID']) {
								childCnt += 1;
								
							}
						}
						rtnVal[intA]['childCNT'] = childCnt;
					}
				}
			}
		}
		return rtnVal;
	};

	getTreeData = (data) => {
		let rtnVal = [];
		for (let intA = 0; intA < data.length; intA++ ) {
			if (data[intA]['LEVEL'] > 1) {
				if (data[intA]['_display']) {
					if ( data.filter(item => item['ID'] === data[intA]['PARENT_ID'] && item['_display'] === true).length > 0) {
						rtnVal.push(data[intA]);
					}
				}
			} else {
				rtnVal.push(data[intA]);
			}
		}
		return rtnVal;
	};

	setTreeOrder = (records, needTomove, parentID) => {
		let changed = [];

		if (needTomove[0]["PARENT_ID"] === "0") {
			for(let j = 0; j < needTomove.length; j ++) {
				changed.push(needTomove[j]);
			}
		}

		for(let i = 0; i < records.length; i ++) {
			if (parentID === records[i]["ID"]) {
				changed.push(records[i]);

				for(let j = 0; j < needTomove.length; j ++) {
					changed.push(needTomove[j]);
				}

			} else if (parentID !== records[i]["ID"]) {
				let isMoved = false;
				
				for(let j = 0; j < needTomove.length; j ++) {
					if (records[i]["ID"] === needTomove[j]["ID"]) {
						isMoved = true;

						break;
					}
				}

				if (!isMoved) {
					changed.push(records[i]);
				}
			} 
		}
		
		for(let i = 0; i < changed.length; i ++) {
			let cnt = 0;
			for(let j = 0; j < changed.length; j ++) {
				if (changed[i]["ID"] === changed[j]["PARENT_ID"]) {
					cnt += 1;
				}
			}
			changed[i]['childCNT'] = cnt;
		}

		return changed;
	};

	onRowDragEnd = (e) => {
		let gridData = this.gridDataset.getRecords();
		if (this.props.tree !== undefined && this.props.tree.isTree) {
			let standardNode =  (e.overIndex !== -1) ? ((e.overNode.rowIndex > 0 ) ? e.api.getDisplayedRowAtIndex(e.overNode.rowIndex - 1) : '') : '';
				
			let parentLV = standardNode === '' ? 0 : standardNode.data["LEVEL"];
			let parentID = standardNode === '' ? "0" : standardNode.data["ID"];

			const records = JSON.parse(JSON.stringify(gridData));
				
			let needTomove = this.findRowToMove ({org: records, target: e.nodes, parentLV: parentLV, parentID: parentID, isSub: false})
		
			let changed = this.setTreeOrder(records, needTomove, parentID);

			for(let i = 0; i < changed.length; i ++) {
				Object.assign(gridData.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)[i], changed[i]);
			}
		} else {
			e.api.forEachNode((node, index) => {
				if (node['data']['rowtype'] !== newScrmObj.constants.crud.create) {
					if (node['data']['rowtype'] === newScrmObj.constants.crud.read) {
						if (node['rowIndex'] !== Number(node['id'])) {
							node['data']['rowtype'] = newScrmObj.constants.crud.update;
							
						}
					}
				}
				Object.assign(gridData.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)[index], node['data']);
			});
		}
		
	
		if (this.gridDataset.orgrecords.length > 0) {
			this.gridDataset.orgrecords.forEach(
				(item, index) => {
					for (let intA=0; intA < gridData.length; intA++) {
						if (item['recid'] === gridData[intA]['recid']) {
							if (gridData[intA]['rowtype'] === newScrmObj.constants.crud.update) {
								if (intA === index) {
									// 두 json 데이터 비교 (row type 비교)
									let tmpGrdData = JSON.parse(JSON.stringify(gridData[intA]));
									let tmpOrgData = JSON.parse(JSON.stringify(item));

									delete tmpGrdData.rowtype;
									delete tmpOrgData.rowtype;

									if (JSON.stringify(tmpGrdData) === JSON.stringify(tmpOrgData)) {
										gridData[intA]['rowtype'] = newScrmObj.constants.crud.read;
									}
								}
							}
						}
					}
				}
			)
		}

		this.gridDataset.setRecords(gridData);

		// // 데이터 재 배열 후, grid 재 셋팅
		if (this.props.tree !== undefined && this.props.tree.isTree) {
			e.api.setRowData(this.getTreeData(gridData.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)));

		} else {
			e.api.redrawRows();
		}

		this.props.onRowDragEnd({ id : this.props.id, data : gridData,  dragData : e.nodes});
	}

	/* Method Zone */
	doFilter = (value) => {
		this.state.gridApi.setQuickFilter(value);
	};
	getSelectedRowIndex = () => {
		if (this.state.gridApi.getSelectedNodes().length === 0) {
			return null;
		}
		return Number(this.state.gridApi.getSelectedNodes()[0].rowIndex);
	};
	getSelectedRows = () => {
		if (this.state.gridApi.getSelectedRows().length === 0) {
			return [];
		}
		return this.state.gridApi.getSelectedRows();
	};
	getDeSelectedRows = () => {
		let deSelectRows = [];
		this.state.gridApi.forEachNode((node, index) => {  
			if (!node.isSelected()) deSelectRows.push(node.data);
		});
		return deSelectRows;
	};
	editStart = (row, col) => {
		this.state.gridApi.setFocusedCell(row, col);
		this.state.gridApi.startEditingCell({ rowIndex : row, colKey : col});
	};
	autoSizeFit = () => {
		this.state.gridApi.sizeColumnsToFit();
	};

	addGridRow = () => {
		let rtnJson = this.props.onBeforeInsertRow({ id : this.props.id });

		if (rtnJson['rtn'] !== false) rtnJson['rtn'] = true;

		if (rtnJson['rtn']) {
			let index = this.gridDataset.length;
			if (typeof rtnJson['index'] !== 'number') {
				index = (this.props.infinite) ? this.gridDataset.addRow(0) : this.gridDataset.addRow();
			} else {
				index = (this.props.infinite) ? this.gridDataset.addRow(0) : this.gridDataset.addRow(rtnJson['index']);
			}

			if (this.props.header.filter(item => StrLib.isNull(item['defaultValue']) === false).map((ele) => { return { colId : ele['colId'], value : ele['defaultValue']}}).length > 0) {
				this.props.header.filter(item => StrLib.isNull(item['defaultValue']) === false).map((ele) => { return { colId : ele['colId'], value : ele['defaultValue']}}).forEach(element => {
					this.gridDataset.setValue(index, element['colId'], element['value']);
				});
			}
			this.state.gridApi.setRowData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
			this.moveRow(index, true);

			if (this.props.id === null || this.props.id === undefined) { return; }
			this.props.onInsertRow({ 
					id : this.props.id
				,	data : this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)
				,	insertData : this.gridDataset.getRow(index)
				,	index : index
			});
		}
	};

	delGridRow = () => {
		if (this.state.gridApi.getSelectedNodes().length === 0) {
			ComLib.openDialog('A', 'SYSI0010', ['선택된 행이 없습니다.']);
		} else {
			let rtn = this.props.onBeforeDeleteRow({  id : this.props.id });
			if (rtn !== false) rtn = true;

			if (rtn) {
				let index = this.state.gridApi.getSelectedNodes()[this.state.gridApi.getSelectedNodes().length-1]['rowIndex'];
				let lstRecid = this.state.gridApi.getSelectedNodes()[this.state.gridApi.getSelectedNodes().length-1]['data']['recid'];
				let deleteData = this.state.gridApi.getSelectedNodes().map(item => item['data']);
				let rtnVal = this.gridDataset.getRecords();


				for (let intA = 0; intA < rtnVal.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy).length; intA++) {
					for (let intB = 0; intB < this.state.gridApi.getSelectedNodes().length; intB++) {
						if (intA === this.state.gridApi.getSelectedNodes()[intB]['rowIndex']) {
							if (rtnVal.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)[intA]['rowtype'] === newScrmObj.constants.crud.create) {
								rtnVal.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy)[intA]['rowtype'] = newScrmObj.constants.crud.remove;
							} else {
								ComLib.openDialog('A', 'SYSI0010', ['신규 행만 삭제가 가능합니다.']);
								return;
							}
						}
					}
				}
				this.gridDataset.setRecords(rtnVal.filter(item => item['rowtype'] !== newScrmObj.constants.crud.remove));
				this.state.gridApi.setRowData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
				
				this.moveRow(index, true);

				if (this.props.id === null || this.props.id === undefined) { return; }
				this.props.onDeleteRow({
						id : this.props.id
					,	data : rtnVal.filter(item => item['rowtype'] !== newScrmObj.constants.crud.remove)
					,	deleteData : deleteData
					,	index : index
					,	lstRecid : lstRecid
				});
			}
		}
	};
	setGridData = (data) => {
		if (data.length < 1) return;
		if (this.gridDataset.getRecords().length > 0) {
			this.gridDataset.initRecords(data);
			this.state.gridApi.setRowData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
		} else {
			this.gridDataset.appendRecords(data);
			this.state.gridApi.setRowData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
		}

	}
	downExcelData = () => {		
		let exelData = [];
		this.state.gridApi.forEachNode((item) => {
			if (item['data']['rowtype'] !== newScrmObj.constants.crud.destroy)  {
				let data = item['data'];
				data['node'] = item;
				exelData.push(data);
			}
		});

		let lengthCheck = this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.create)

		if (this.props.infinite && Number(this.props.totalRowCnt) > 1000) {
			ComLib.openDialog('A', 'SYSI0010', ['1000건 이내의 결과만 엑셀다운 가능합니다. 검색 조건을 변경하여 다시 시도 부탁드립니다.']);

		} else if (this.props.infinite && this.props.totalRowCnt <= lengthCheck.length) {	
			ExcelLib.exportToExcel(setGridHeader(this.props.header, this.props), exelData, true, this.props.areaName);

		} else if (this.props.infinite) {
			this.props.onScrollEnd({ id : this.props.id, excelLoadAll: true});
			
		} else {
			ExcelLib.exportToExcel(setGridHeader(this.props.header, this.props), exelData, true, this.props.areaName);
		}
		// ExcelLib.exportToExcel(setGridHeader(this.props.header, this.props), this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy), true, this.props.areaName);
		
	}

	moveRow = (index, selected) => {
		let data, rtnNode;
		this.state.gridApi.forEachNode((node, idx) => {if (idx === index) data = node;});

		if (data === undefined) {
			this.state.gridApi.forEachNode((node, idx) => {
				if (idx === (this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy).length-1)) rtnNode = node;
			});
			if (rtnNode) {
				if (selected) {
					rtnNode.setSelected(true);
				}
				this.state.gridApi.ensureIndexVisible(rtnNode['rowIndex'], 'top');
			}
		} else {
			if (selected) data.setSelected(true);
			this.state.gridApi.ensureIndexVisible(index, 'top');
		}
	};
	undoCellEditng = () => {
		this.state.gridApi.undoCellEditing();
	}
	redoCellEditng = () => {
		this.state.gridApi.redoCellEditing();
	}
	setInfiniteGridData = (type) => {
		if (type === 'A') {
			let initPageIndex = this.gridDataset.getRecords().length - 1;
			this.pageDataset = this.props.data.records;
			this.propDataset = this.propDataset.concat(JSON.parse(JSON.stringify(this.pageDataset)));
			this.gridDataset.initRecords(this.gridDataset.getRecords().concat(this.pageDataset));
			this.state.gridApi.setRowData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
			// 페이지 이동
			this.state.gridApi.ensureIndexVisible(initPageIndex, 'bottom');
		} else {
			this.propDataset = this.props.data.records;
			this.pageDataset = this.props.data.records;
			this.gridDataset.initRecords(this.props.data.getRecords());
			this.state.gridApi.setRowData(this.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
			this.state.gridApi.ensureIndexVisible(0, 'top');
		}
	}
	render () {
		return (
			<React.Fragment>
				{	(this.props.noName && !this.props.addRowBtn && !this.props.delRowBtn && !this.props.dnlExcelBtn) ?
						null
					:	<div style={{display : 'block', width:'100%', height : '30px'}}>
							<LFloatArea>
								{
									(this.props.noName) 
									?
									null 
									:	
									<LFloatArea>
										<div className = "scrm-component-panel-namearea">
											<span> {(this.props.areaName) ? this.props.areaName : '그리드'} </span>
										</div>
									</LFloatArea>
								}
								{
									(this.props.infinite && this.props.totalRowCnt > 0) 
									?
									<LFloatArea>
										<div className = "scrm-component-panel-namearea">									 
											<span> &nbsp;&nbsp;&nbsp;-&nbsp;전체&nbsp;:&nbsp;{this.props.totalRowCnt}&nbsp;건</span>
										</div>
									</LFloatArea>
									:
									null

								}
							</LFloatArea>
							<RFloatArea>								
								{/* <button className="scrm-btn xs grey-o i"onClick={this.undoCellEditng}><i className="xi-undo"/></button>
								<button className="scrm-btn xs grey-o i"onClick={this.redoCellEditng}><i className="xi-redo"/></button> */}
								{(this.props.addRowBtn) ? <Button onClick={this.addGridRow} size="xs" innerImage={true} icon = {'add'} ml="5px" tooltip={"추가"}/> : null}
								{(this.props.delRowBtn) ? <Button onClick={this.delGridRow} size="xs" innerImage={true} icon = {'del'} ml="5px" tooltip={"삭제"}/> : null}
								{(this.props.dnlExcelBtn) ? <Button onClick={this.downExcelData} size="xs" innerImage={true} icon = {'save'} ml="5px" tooltip={"엑셀다운로드"}/> : null}
							</RFloatArea>
						</div>
				}
				<div className= {"ag-theme-alpine"} style={ {width:'100%', height: this.props.height} }>
					<AgGridReact 
						onGridReady={this.onGridReady}
						alwaysShowVerticalScroll = { false }
						frameworkComponents = {{
							date : DateComponent,
							rangeDate : RangeDateComponent,
							rangeTime : RangeTimeComponent,
							time : TimeComponent,
							checkbox: CheckboxRenderer,
							selectbox : SelectboxRenderer,
							delButton : DelRowButton,
							customEditor : CustomEditor,
							actionButton : ActionButton,							
							customTooltip: CustomToolTip,
						}}
						tooltipShowDelay={0}

						// cellRender 전용 추후 컴토후 컴포넌트화
						// domLayout = {'autoHeight'}
						components = { this.props.components }
						context = {{ componentParent : this }}
						suppressMovableColumns = {this.props.suppressMovableColumns}
						multiSortKey = {'ctrl'}
						headerHeight = {30}
						rowHeight = {30}
						defaultColDef = {{ 
								resizable: true
							,	sortable : this.props.sort
							,	editable : false
							,	filter : this.props.filter
							,	floatingFilter: this.props.floatingFilter
						}}
						// row drag props
						rowDragManaged = {this.props.rowDrag}
						enableMultiRowDragging = {true}


						suppressDragLeaveHidesColumns={true}
						suppressRowClickSelection = {this.props.suppressRowClickSelection}
						suppressRowDeselection = {(this.props.suppressRowDeselection) ? this.props.suppressRowDeselection : false}
						stopEditingWhenGridLosesFocus = {true}

						columnDefs = { setGridHeader(this.props.header, this.props) }
						rowBuffer = {100}

						undoRedoCellEditing = {true}
						enableCellChangeFlash = {false}
						undoRedoCellEditingLimit = {10}
						
						localeText = {{noRowsToShow: '조회된 결과가 존재하지 않습니다.'}}
						rowSelection= {this.props.rowSelection}
						colResizeDefault= {'shift'}

						// 로우 스판
						suppressRowTransform={checkHeaderProp(this.props.header, 'rowSpan')}
						// 로우 스크롤 시, 신규 데이터에 대한 Scroll Top이동을 막을 건지 설정
						suppressScrollOnNewData={this.props.doNotScrollTop}


						// event
						onGridSizeChanged    = {this.onGridSizeChanged}
						onRowClicked         = {this.onRowClicked}
						onActionCellClicked  = {this.onActionCellClicked}
						onCellClicked        = {this.onCellClicked}
						onCellDoubleClicked  = {this.onCellDoubleClicked}
						onCellValueChanged   = {this.onCellValueChanged}
						onCellEditingStopped = {this.onCellEditingStopped}
						onRowDataChanged     = {this.onRowDataChanged}
						onSelectionChanged   = {this.onSelectionChanged}
						onRowSelected        = {this.onRowSelected}
						onBodyScroll         = {this.onBodyScroll}
						onRowDataUpdated     = {this.onRowDataUpdated}
						onSortChanged        = {this.onSortChanged}
						onRowDragEnd         = {this.onRowDragEnd}
						onRowDoubleClicked   = {this.onRowDoubleClicked}
						onColumnResized      = {this.onColumnResized}
						onColumnGroupOpened  = {this.onColumnGroupOpened}

						rowMultiSelectWithClick = {true}
					/>
				</div>
			</React.Fragment>
			
		)
	}
}
export default Grid;