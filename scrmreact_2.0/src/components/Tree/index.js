import React from 'react';
import ReactDOM from 'react-dom';
import SortableTree from 'react-sortable-tree';
import {LFloatArea, RFloatArea, Textfield, Label, RelativeGroup, BasicButton as Button, SubFullPanel } from 'components';
import {TreeSelectbox} from './components';
import 'react-sortable-tree/style.css';
import {getFlatDataFromTree, getTreeFromFlatData, addNodeUnderParent, getNodeAtPath, getDescendantCount, changeNodeAtPath , removeNodeAtPath, map, toggleExpandedForAll, find, getVisibleNodeInfoAtIndex} from './utils';
import {ComLib, newScrmObj, DataLib} from 'common';

class Tree extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);	
		this.treeDataset = DataLib.datalist.getInstance();
		this.propDataset = [];
		this.tempDataset = [];
		this.defaultNode = null;
		this.initial     = true;

		this.state = {
			treeData: [],
			searchString: "",
			searchFocusIndex: -1,
			searchFoundCount: 0,
			searched: []
		}
	}

	static defaultProps = {
		openAllonInitial : false,
		addRowBtn  : false,
		delRowBtn  : false,
		ediRowBtn  : false,
		noName     : false,
		allowDel   : false,
		allowSearch: false,
		maxDepth   : 10,
		addToTop   : true,
		canDrag    : false,
		onChange      : () => {return;},
		onMoveNode    : () => {return;},
		onRowDelete   : () => {return;},
	}	

	onMoveNode = (e) => {			
		let dataNodes = getFlatDataFromTree({ treeData: e.treeData,
												getNodeKey:  node => node.id,
												ignoreCollapsed: false
											})
		let propData = [];		
		let newSortOrd = 1;

		for (let i = 0; i < dataNodes.length; i ++) {
			if (dataNodes[i]['node']['treeIndex'] === e.node.treeIndex) {
				if (dataNodes[i]['node']['rowtype'] === newScrmObj.constants.crud.read) {
					dataNodes[i]['node']['rowtype'] = newScrmObj.constants.crud.update
				}
				if (e.nextParentNode !== null) {
					dataNodes[i]['node']['parent'] = e.nextParentNode.treeIndex;
				} else if (e.nextParentNode === null) {
					dataNodes[i]['node']['parent'] = 0;
				}

				dataNodes[i]['node']['PARENT_ID'] = "";

			}
			if (e.nextParentNode === null) {
				if (dataNodes[i]['node']['parent'] === 0) {
					if (dataNodes[i]['node']['SORT_ORD'] === newSortOrd) {
						newSortOrd += 1;
	
					} else {
						if (dataNodes[i]['node']['rowtype'] === newScrmObj.constants.crud.read) {
							dataNodes[i]['node']['rowtype'] = newScrmObj.constants.crud.update
						}
	
						dataNodes[i]['node']['SORT_ORD'] = newSortOrd;
						newSortOrd += 1;
					}
				}
			} else {
				if (dataNodes[i]['node']['parent'] === e.nextParentNode.treeIndex) {
					if (dataNodes[i]['node']['SORT_ORD'] === newSortOrd) {
						newSortOrd += 1;
	
					} else {
						if (dataNodes[i]['node']['rowtype'] === newScrmObj.constants.crud.read) {
							dataNodes[i]['node']['rowtype'] = newScrmObj.constants.crud.update
						}
	
						dataNodes[i]['node']['SORT_ORD'] = newSortOrd;
						newSortOrd += 1;
					}
				}
			}
						
			propData.push(dataNodes[i]['node'])
		}
		
		this.updateTreeData(true, propData);

		//this.props.onMoveNode({id: this.props.id, data: propData});
	}

	onChange = (treeData) => {
		let dataNodes =  getFlatDataFromTree({ treeData: treeData,
			getNodeKey:  node => node.id,
			ignoreCollapsed: false
		})

		let temp = [];
	
		for (let i = 0; i < dataNodes.length; i ++) {
			temp.push(dataNodes[i]['node']);
		}
		
		if (this.treeDataset !== temp) {
			this.setState({treeData: treeData});			
			this.treeDataset = temp;
		}	
	}
	
	isSearched = (content, searchString) => {	
		if (content.indexOf(searchString) > -1 && searchString.length > 0) {
			return true;
			
		} else {
			return false;
		}

	}
	generateNodeProps (rowInfo) {			
		if (rowInfo['node']['rowtype'] === newScrmObj.constants.crud.destroy) {
			return false;
		}

		let header  = this.props.header;

		let cnt = 0;
		let title = [];		
		
		for (let i = 0; i < header.length; i ++) {
			let content = rowInfo['node'][header[i]['field']];		
			let name    = header[i]['headerName'];
			let len     = header[i]['fieldLen'];
			let type    = header[i]['type'];

			if (len === undefined || len === null || len === 0) {
				len = 40;
			}

			if (rowInfo.path.length > 1 && cnt === 0) {
				len -= 44 * (rowInfo.path.length - 1);			
			}
			
			len = len +"px";
			if (type === 'sel') {				
				let codeValue = header[i]['codeValue'];
				let selVal = ComLib.getComCodeValue(codeValue);
				
				selVal = ComLib.getComCodeName(codeValue, content);
				
				title.push(<div style={{width:"5px"}}/>)
				// title.push(<Label value={name}/>)
				title.push(<div className='scrm-input-div' id={header[i]['field'] + '__' + rowInfo['node']['ID'] + '__' + rowInfo['node']['treeIndex'] + '__' + cnt + '__div'} style={{width: len}}>
								<input	
									className = "scrm-input-text"
									type        = "text"
									id          = {header[i]['field'] + '__' + rowInfo['node']['ID'] + '__' + rowInfo['node']['treeIndex'] + '__' + cnt}
									name        = {len.substring(0, len.length - 2)}
									value       = {selVal}
									placeholder = {name}
									minLength   = {0}
									maxLength   = {100}
									readOnly    = {false}
									disabled    = {false}
									onClick     = {(e) => this.event.treeRow.selectbox.onChange(e)}
								/>
							</div>)
							// onfocus     = {this.event.treeRow.selectbox.onChange}
			} else {
				title.push(<div key={header[i]['field'] + '__' + rowInfo['node']['treeIndex'] + '__' + cnt + '__div'} style={{width:"5px"}} id={header[i]['field'] + '__' + rowInfo['node']['treeIndex'] + '__' + cnt + '__div'}></div>)
				// title.push(<Label value={name}/>)
				title.push(<Textfield
								key         = {header[i]['field'] + '__' + rowInfo['node']['treeIndex'] + '__' + cnt}
								width       = {len}
								id          = {header[i]['field'] + '__' + rowInfo['node']['treeIndex'] + '__' + cnt}
								name        = {header[i]['field'] + '__' + rowInfo['node']['treeIndex'] + '__' + cnt}
								value       = {content}
								placeholder = {name}
								minLength   = {0}
								maxLength   = {100}
								readOnly    = {false}
								disabled    = {false}
								onChange    = {this.event.treeRow.input.onChange}
							/>)
			}
			cnt += 1;
		}

		let depth = rowInfo.path.length;

		if (this.props.addRowBtn === true && depth < this.props.maxDepth) {
			title.push(<button className="scrm-btn xs grey-o i ml5 mt5" onClick={e => this.event.button.onClick(e, rowInfo.path, rowInfo['node']['treeIndex'] + "__add")}>
						<i className="xi-plus xi-x"/>
					   </button>);

		} else if (this.props.addRowBtn === true && depth >= this.props.maxDepth) {
			title.push(<button className="scrm-btn xs grey i ml5 mt5">
							<i className="xi-plus xi-x"/>
						</button>);
		}

		if (this.props.delRowBtn === true) {
			title.push(<button className="scrm-btn xs grey-o i ml5 mt5" onClick={e => this.event.button.onClick(e, rowInfo.path, rowInfo['node']['treeIndex'] + "__delete")}>
						<i className="xi-minus xi-x"/>
					   </button>)
		}

		if (this.props.ediRowBtn === true) {
			title.push(<button className="scrm-btn xs grey-o i ml5 mt5" onClick={e => this.event.button.onClick(e, rowInfo.path, rowInfo['node']['treeIndex'] + "__edit")}>
						<i className="xi-pen xi-x"/>
					   </button>)
		}
		
		
		// let tempRow = this.tempDataset[this.datasetIndexOf("ID", rowInfo["node"].ID, this.tempDataset)];

		const { searched, searchFocusIndex} = this.state;
		if (this.props.allowSearch && searched.length > 0) {
			for (let i = 0; i < header.length; i ++) {
				if (header[i]['searchedTarget'] === true) {
					let content = rowInfo["node"][header[i]['field']];

					let rtnVal = this.isSearched(content, this.state.searchString);

					if (rtnVal === true) {							
						title.push(<button key={"serched_" + rowInfo["node"].ID} className="scrm-btn xs red-o i ml5 mt5" style={{cursor: "initial"}}>
										<i className="xi-search xi-x"/>
									</button>);			
						const searchedId = searched[searchFocusIndex].node.ID;	
						
						if (searchedId === rowInfo['node'].ID) {
							rowInfo["className"] = "tree_custom_search_css_current";
						} else {
							rowInfo["className"] = "tree_custom_search_css";
						}
						
						break;			
					} 
				}
			}
		}
		
		rowInfo['node']['title'] = <div style={{display: 'flex'}}>{title}</div>;
		delete rowInfo['lowerSiblingCounts'];

		

		return rowInfo;
	}
	addTreeRow = () => {
		let topNode  = getNodeAtPath({treeData: this.state.treeData, path: [], getNodeKey: node => node.treeIndex, ignoreCollapsed: true});
		let newNode  = JSON.parse(JSON.stringify(this.defaultNode));
		let newIndx  = getDescendantCount({ node: topNode.node, ignoreCollapsed: false }) + 1;
		let isToTop = false;

		if (this.props.addToTop === true) {
			newNode.SORT_ORD = 1;
			isToTop = true;
		} else {
			newNode.SORT_ORD = topNode.Children === undefined ? 1 : topNode.Children.length + 1;
		}

		newNode.parent    = 0;
		newNode.recid     = newIndx;
		newNode.treeIndex = newIndx;
		newNode.rowtype   = newScrmObj.constants.crud.create;
		
		const newTree = addNodeUnderParent({
			treeData: this.state.treeData,
			newNode: newNode,
			expandParent: true,
			addAsFirstChild : isToTop,
			parentKey: undefined,
			getNodeKey: node => node.treeIndex,
		});

		let newSortOrd = 1;

		if (this.props.addToTop === true) {
			let treeDataState = map({
				treeData: newTree.treeData,
				callback: param => { 	
					if (param['node']['parent'] === 0) {
						if (param['node']['rowtype'] === newScrmObj.constants.crud.read) {
							param['node']['rowtype'] = newScrmObj.constants.crud.update;
						}
	
						param['node']['SORT_ORD'] = newSortOrd;
						newSortOrd += 1;
						
					}
					return param['node']
				},
				getNodeKey: ({ treeIndex }) => treeIndex,
				ignoreCollapsed: true,
			});
			
			this.updateTreeData (false, treeDataState, true);	

		} else {

			this.updateTreeData (false, newTree.treeData, false);	
		}
	}

	componentDidMount() {
		let header = this.props.header;

		this.defaultNode = {};

		this.defaultNode['ID']            = "";
		this.defaultNode['PARENT_ID']     = "";
		this.defaultNode['BAS_PARENT_ID'] = "";
		this.defaultNode['SORT_ORD']      = "";
		this.defaultNode['parent']    = 0;
		this.defaultNode['recid']     = 1;
		this.defaultNode['treeIndex'] = 1;
		this.defaultNode['rowtype']   = newScrmObj.constants.crud.create;
		
		for (let i = 0; i < header.length; i ++) {
			let field = header[i]['field'];
			let type = header[i]['type'];

			if (type === 'sel') {
				let codeValue    = header[i]['codeValue'];
				let defaultValue = ComLib.getComCodeValue(codeValue)[0];

				this.defaultNode[field] = defaultValue;

			} else {
				this.defaultNode[field] = "";

			}
		}

	}

	componentDidUpdate (prevProps, prevState) {		
		if (this.props.data === null) {

			return;
		}
		
		if (this.props.data.records !== this.propDataset) {
			this.propDataset = this.props.data.records;
			
			let tempRecords = JSON.parse(JSON.stringify(this.propDataset));

			for(let i = 0; i < tempRecords.length; i ++) {
				tempRecords[i]['treeIndex'] = i + 1;
				for (let j = 0; j < tempRecords.length; j ++) {
					if (tempRecords[j]['ID'] === tempRecords[i]['PARENT_ID']) {
						
						tempRecords[i]['parent'] = j + 1;
						break;
					}
				}	
				if (tempRecords[i]['parent'] === undefined || tempRecords[i]['parent'] == null) {
					tempRecords[i]['parent'] = 0;
				}
			}

			if (tempRecords.length > 0) {
				if (this.props.openAllonInitial || (this.props.searched !== null && this.props.searched !== undefined && this.props.searched.length > 0)) {
					tempRecords = map({
							treeData: tempRecords,
							callback: ({ node }) => ({ ...node, expanded: true }),
							getNodeKey: ({ treeIndex }) => treeIndex,
							ignoreCollapsed: false,
						});
				}
			}
			this.updateTreeData (true, tempRecords);

		} 
	}	
	chkChildRowtype = (parent) => {
		let rtnVal = false;
		let children = parent.children;
		for (let i = 0; i < children.length; i ++) {
			if (children[i].rowtype !== newScrmObj.constants.crud.create) {
				return true;

			} else if (children[i].children !== undefined && children[i].children !== null && children[i].children.length > 0){
				let childRtnVal = this.chkChildRowtype(children[i]);

				if (childRtnVal) return true;
			}
		}
		return rtnVal;
	}

	chkChildSearched = (parent) => {
		let rtnVal = false;
		let children = parent.children;
		let header = this.props.header;

		if (children === undefined) {
			return false;
		}

		for (let i = 0; i < children.length; i ++) {			
			for (let j = 0; j < header.length; j ++) {
				if (header[j]['searchedTarget'] === true) {
					let content = children[i][header[j]['field']];
	
					rtnVal = this.isSearched(content, this.state.searchString);
					
					if (rtnVal) return rtnVal;
				}
			}
			if (children[i].children !== undefined && children[i].children !== null && children[i].children.length > 0){
				rtnVal = this.chkChildSearched(children[i])

				if (rtnVal) {
					return rtnVal;
				}
			}			
		}
		return rtnVal;
	}

	updateTreeData = (isFlatData, treeDataset, addToTop) => {
		let treeDataState;
		if (treeDataset !== this.treeDataset) {
			
			if (isFlatData) {
				this.treeDataset = treeDataset.filter(item => item['rowtype'] !== newScrmObj.constants.crud.remove);
	
			} else {
				let dataNodes =  getFlatDataFromTree({ treeData: treeDataset,
					getNodeKey:  node => node.id,
					ignoreCollapsed: false
				})
	
				let temp = [];
	
				for (let i = 0; i < dataNodes.length; i ++) {
					temp.push(dataNodes[i]['node']);
				}
	
				this.treeDataset = temp.filter(item => item['rowtype'] !== newScrmObj.constants.crud.remove);
			}

			let records = this.treeDataset.filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy);
			
			for (let i =0; i < records.length; i ++) {
				delete records[i]['children'];
				
			}

			for (let i = 0; i < this.propDataset.length; i ++) {
				let propData = this.propDataset[this.datasetIndexOf("recid", i + 1, this.propDataset)];
				let treeData = records[this.datasetIndexOf("recid", i + 1, records)];
				
				let rtnVal = true;

				Object.keys(propData).forEach(function(key){

					if (propData[key] !== treeData[key]) {
						rtnVal = false;
					}
				});
				
				if (rtnVal) {
					records[this.datasetIndexOf("recid", i + 1, records)].rowtype = propData.rowtype;
										
				} else {
					if (records[this.datasetIndexOf("recid", i + 1, records)].rowtype === newScrmObj.constants.crud.read) {
						records[this.datasetIndexOf("recid", i + 1, records)].rowtype = newScrmObj.constants.crud.update;
					
					}
				}
			}
			treeDataState = getTreeFromFlatData({flatData    : records.map(node => ({ ...node, title: node.title})),
												getKey      : node => node.treeIndex,
												getParentKey: node => node.parent,
												rootKey     : 0, 
												});
	
			if (treeDataState !== this.state.treeData) {
				this.setState({treeData: treeDataState});
				
				this.props.onChange({id: this.props.id, data: this.treeDataset});

				if (addToTop !== undefined) {
					let treeDiv   = document.getElementById(this.props.id)
					let scrollDiv = treeDiv.getElementsByClassName('ReactVirtualized__Grid ReactVirtualized__List rst__virtualScrollOverride')[0];
				
					if (addToTop) {
						scrollDiv.scrollTop = scrollDiv.offsetTop;

					} else {
						scrollDiv.scrollTop = scrollDiv.offsetTop + scrollDiv.offsetHeight;

					}
				}
			}
			
		}
	}
	datasetIndexOf = (column, value, records) => {
		var index = -1;
		for (var i = 0; i < records.length; i++) {
			if (records[i][column] === value) {
				index = i;
				break;
			}
		}
		return index;
	}
	
	event = {
		treeRow : {
			input : {
				onChange: (e) => {
					let target    = e.target.id.substring(0, e.target.id.lastIndexOf("__"));
					let treeIndex = target.substring(target.lastIndexOf("__") + 2);
					let colum     = target.substring(0, target.lastIndexOf("__"));
					
					let treedata = map({
						treeData: this.state.treeData,
						getNodeKey: node => node.treeIndex,
						callback: param => { 
							if (param['node']['recid'] === Number(treeIndex)) {
								param['node'][colum] = e.target.value
							} 
							return param['node'];
						},
						ignoreCollapsed: false,
					});
	
					this.updateTreeData(false, treedata);
				}
			},
			selectbox : {
				onChange: (e) => {
					//let target    = e.target.id.substring(0, e.target.id.lastIndexOf("__"));
					let cnt       = e.target.id.substring(e.target.id.lastIndexOf("__") + 2);
					
					let selected     = 0;
					let codeValue    = this.props.header[Number(cnt)]['codeValue'];

					let selectedCode = ComLib.getCommCodeList(codeValue).filter(ele => ele['CODE_NM'] === e.target.value)[0]['CODE'];

					let selArr       = ComLib.getComCodeValue(codeValue);
				
					for (let i = 0; i < selArr.length; i ++) {
						if (selectedCode === selArr[i]) {
							selected = i;
							break;
						}
					}
					
					ReactDOM.render(<TreeSelectbox
										value= {e.target.value}
										id   = {e.target.id + '__' + e.target.name}
										name = {e.target.name}
										codeValue={codeValue}
										treeData={this.state.treeData}
										updateTreeData={this.updateTreeData}
										event={this.event}
										selected={selected}
									/>, document.getElementById(e.target.id + '__div'));

				}
			}
		},
		button: {
			onClick: (e, path, targetId) => {
				let eventId   = targetId.substring(targetId.lastIndexOf("__") + 2);
				
				switch (eventId) {
				case "add":
					let addNode = getNodeAtPath({treeData: this.state.treeData, path: path, getNodeKey: node => node.treeIndex, ignoreCollapsed: true});
					let depth   = path.length;
					
					if (!(depth >= this.props.maxDepth)) {
						let topNode = getNodeAtPath({treeData: this.state.treeData, path: [], getNodeKey: node => node.treeIndex, ignoreCollapsed: true});
						let newNode = JSON.parse(JSON.stringify(this.defaultNode));
						let newIndx = getDescendantCount({ node: topNode.node, ignoreCollapsed: false }) + 1;
						
						newNode.parent    = addNode.node.treeIndex;
						newNode.recid     = newIndx;
						newNode.treeIndex = newIndx;
						newNode.rowtype   = newScrmObj.constants.crud.create;
						newNode.ID        = '';
						newNode.PARENT_ID = addNode.node.ID;
						newNode.SORT_ORD  = addNode.children === undefined ? 1 : addNode.children.length + 1;

						const newTree = addNodeUnderParent({
							treeData: this.state.treeData,
							newNode: newNode,
							expandParent: true,
							addAsFirstChild : false,
							parentKey: addNode ? addNode.treeIndex : undefined,
							getNodeKey: node => node.treeIndex,
						});

						this.updateTreeData(false, newTree.treeData);
					} else {
						ComLib.openDialog('A', 'SYSI0010', ['가장 최 하위 데이터 입니다.']);
					}

					this.props.onRowSelect({id: this.props.id, data:addNode.node, type: 'add'});

					break;
					
				case "delete":
					let delNode = getNodeAtPath({treeData: this.state.treeData, path: path, getNodeKey: node => node.treeIndex, ignoreCollapsed: true});
					let rtn = this.props.allowDel;
					
					if (rtn === true) rtn = true;

					if (delNode.node.rowtype === newScrmObj.constants.crud.create) {
						if (delNode['node']['children'] !== undefined && delNode['node']['children'] !== null && delNode['node']['children'].length !== 0) {
							if (rtn === true) {								
								ComLib.openDialog('C', 'SYSI0010', ['하위에 속한 데이터들도 삭제됩니다. 삭제 하시겟습니까?'], checked => { if (checked === true) {
									let treeData = map({
										treeData: this.state.treeData,
										getNodeKey: node => node.treeIndex,
										callback: param => { 
											if (param['node']['ID'] === delNode['node']['ID']) {
												if (param['node']['rowtype'] === newScrmObj.constants.crud.create) {
													param['node']['rowtype'] = newScrmObj.constants.crud.remove;
												
												} else {
													param['node']['rowtype'] = newScrmObj.constants.crud.destroy;
												
												}
											} else if (param['path'].indexOf(delNode['node']['ID']) > -1) {
												if (param['node']['rowtype'] === newScrmObj.constants.crud.create) {
													param['node']['rowtype'] = newScrmObj.constants.crud.remove;
												
												} else {
													param['node']['rowtype'] = newScrmObj.constants.crud.destroy;
												
												}
											}
											return param['node'];
										},
										ignoreCollapsed: false,
									});

									this.updateTreeData(false, treeData);
								}});
							} else {
								let isChildContainNonCreate = false;

								isChildContainNonCreate = this.chkChildRowtype(delNode.node)

								if (isChildContainNonCreate) {
									ComLib.openDialog('A', 'SYSI0010', ['하위에 속한 데이터가 모두 신규 행일 경우만 삭제가 가능합니다.']);
								} else {
									let treeData = map({
										treeData : this.state.treeData,
										getNodeKey: node => node.treeIndex,
										callback: param => { 
											if (param['node']['treeIndex'] === delNode['node']['treeIndex']) {
												param['node']['rowtype'] = newScrmObj.constants.crud.remove;
																					
											} else if (param['path'].indexOf(delNode['node']['treeIndex']) > -1) {
												param['node']['rowtype'] = newScrmObj.constants.crud.remove;
												
											}
											return param['node'];
										},
										ignoreCollapsed: false,
									});
			
									this.updateTreeData(false, treeData);
								}
							}
						} else {
							let deletedtreeData = removeNodeAtPath({ treeData : this.state.treeData, path: path, getNodeKey: node => node.treeIndex, ignoreCollapsed: true})
						
							this.updateTreeData(false, deletedtreeData);
						}
					} else if  ((delNode.node.rowtype === newScrmObj.constants.crud.read || delNode.node.rowtype === newScrmObj.constants.crud.update) && rtn === true) {
						if (delNode['node']['children'] !== undefined && delNode['node']['children'] !== null && delNode['node']['children'].length !== 0) {
							ComLib.openDialog('C', 'SYSI0010', ['하위에 속한 데이터들도 삭제됩니다. 삭제 하시겟습니까?'], checked => { if (checked === true) {
								let treeData = map({
									treeData : this.state.treeData,
									getNodeKey: node => node.treeIndex,
									callback: param => { 
										if (param['node']['treeIndex'] === delNode['node']['treeIndex']) {
											param['node']['rowtype'] = newScrmObj.constants.crud.destroy;
										
										} else if (param['path'].indexOf(delNode['node']['treeIndex']) > -1) {
											if (param['node']['rowtype'] === newScrmObj.constants.crud.create) {
												param['node']['rowtype'] = newScrmObj.constants.crud.remove;
												
											} else {
												param['node']['rowtype'] = newScrmObj.constants.crud.destroy;
											
											}
										}
										return param['node'];
									},
									ignoreCollapsed: false,
								});
		
								this.updateTreeData(false, treeData);

							}});
						}
					} else {
						ComLib.openDialog('A', 'SYSI0010', ['신규 행만 삭제가 가능합니다.']);

					}

					break;

				case "edit":
					let editNode = getNodeAtPath({treeData: this.state.treeData, path: path, getNodeKey: node => node.treeIndex, ignoreCollapsed: true});
					
					this.props.onRowSelect({id: this.props.id, data: editNode.node, type: 'edit'});
					
					break;

				case "view":
					let viewNode = getNodeAtPath({treeData: this.state.treeData, path: path, getNodeKey: node => node.treeIndex, ignoreCollapsed: true});
					
					this.props.onRowSelect({id: this.props.id, data:viewNode.node, type: 'view'});

					break;
					
				default : break;
				}

			}
		},
	}
	customPlaceholder = () => {
		let height = (Number(this.props.height.substring(0, this.props.height.length - 2)) - 100) + 'px';

		const placeholder = (<div style={{width: '100%', height: height, textAlign: 'center'}}>
					<div style={{display: 'inline-block', position: 'relative', top: '40%'}}>
					조회된 결과가 존재하지 않습니다.
					</div>
				</div>)
		return placeholder;
	}
	makeTreeHeader = () => {
		let treeHeader = [];
		let header  = this.props.header;
		
		for (let i = 0; i < header.length; i ++) {
			let name    = header[i]['headerName'];
			let len     = header[i]['fieldLen'];
			let paddingLeft = 0;
			len = len +"px";

			if (i === 0) {
				if (this.props.canDrag) {
					paddingLeft += 100;

				} else {
					paddingLeft += 60;
				}
			} else {
				paddingLeft += 5;
			}

			paddingLeft = paddingLeft +'px'

			treeHeader.push(<div key={i} style={{width:len, float: "left", paddingLeft: paddingLeft, borderLeft: "1px #cacaca solid", height: "30px", backgroundColor: "var(--ag-header-background-color, #F1F3F5)"}}>
								<Label value={name}/>
							</div>)
		}
		let lastLen = 25;
		if (this.props.addRowBtn === true) {
			lastLen += 29;
		}
		if (this.props.delRowBtn === true) {
			lastLen += 29;
		} 
		if (this.props.allowSearch) {
			lastLen += 29;
		}
		
		lastLen = lastLen + 'px';

		treeHeader.push(<div key={"last"} style={{width:lastLen, float: "left", borderLeft: "1px #cacaca solid", height: "30px", backgroundColor: "var(--ag-header-background-color, #F1F3F5)"}}>
						</div>)
		return treeHeader
	}
	toggleNodeExpansion = expanded => {
		this.setState(prevState => ({
		  treeData: toggleExpandedForAll({ treeData: this.state.treeData, expanded })
		}));
	};
	searchNode = (e) => {
		let header  = this.props.header;
		let content = "";

		for (let i = 0; i < header.length; i ++) {
			if (header[i]['searchedTarget'] === true) {
				content = e.node[header[i]['field']];
			}
		}
		
		let rtnVal = this.isSearched(content, e.searchQuery);
				
		return rtnVal;
	}
	handleSearchOnChange = e => {	
		this.setState({
			searchString: e.target.value,
		});		
	};
	moveListItem = () => {
		const { searched, searchFocusIndex} = this.state;
		
		if (searched.length > 0) {
			const serchTargetIndex = searched[searchFocusIndex].node.treeIndex;
			
			this.treeRef.wrappedInstance.current.scrollToRow(serchTargetIndex - 1)
		
		}
	}
	selectPrevMatch = () => {
		const { searchFocusIndex, searchFoundCount } = this.state;
	
		this.setState({
			searchFocusIndex:
				searchFocusIndex !== null
				? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
				: searchFoundCount - 1
		}, () => {
			this.moveListItem()
		});
	  };
	
	selectNextMatch = () => {
		const { searchFocusIndex, searchFoundCount } = this.state;
	
		this.setState({
			searchFocusIndex:
				searchFocusIndex !== null
				? (searchFocusIndex + 1) % searchFoundCount
				: 0
		}, () => {
			this.moveListItem()
		});
	};

	testonScroll =(e) => {
		console.log(e)
	}
	render() {
		let treeHeader = this.makeTreeHeader();		
		return (
			<React.Fragment>
				<SubFullPanel>
					<RelativeGroup>
					{(this.props.noName && !this.props.addRowBtn) ?
							null
						:	<div style={{display : 'block', width:'100%', height : '30px'}}>
								<LFloatArea>
									{
										(this.props.noName) ?
											null 
										:	
											<LFloatArea>
												<div className = "scrm-component-panel-namearea">
													<span> {(this.props.areaName) ? this.props.areaName : '트리'} </span>
												</div>
											</LFloatArea>
									}
									<LFloatArea>
										<Button onClick={this.toggleNodeExpansion.bind(this, true)} size="xs" ml="5px" value={"+ all"}/>
										<Button onClick={this.toggleNodeExpansion.bind(this, false)} size="xs" ml="5px" value={"- all"}/>
									</LFloatArea>
								</LFloatArea>
								{(this.props.addRowBtn)
									?
									<RFloatArea>
										<button className="scrm-btn xs grey-o i"onClick={this.addTreeRow}><i className="xi-plus xi-x"/></button>
									</RFloatArea>
									:
									null
								}
								<RFloatArea>
									<Label value="검색"/>
								</RFloatArea>
								<RFloatArea>
									<Textfield
										width       = {"100px"}
										id          = {"iptSearchAll"}
										name        = {"iptSearchAll"}
										value       = {this.state.searchString}
										placeholder = {"검색"}
										minLength   = {0}
										maxLength   = {50}
										readOnly    = {false}
										disabled    = {false}
										onChange    = {this.handleSearchOnChange}
									/>
								</RFloatArea>
								<RFloatArea>
									<Button onClick={this.selectPrevMatch} size="xs" ml="5px" value={"<"}/>
									<Button onClick={this.selectNextMatch} size="xs" ml="5px" value={">"}/>      
									<Label value={ this.state.searchFoundCount > 0 ? this.state.searchFocusIndex + 1 + " / " +  this.state.searchFoundCount : "0 / 0"}/>
								</RFloatArea>		
							</div>
					}
					</RelativeGroup>
				</SubFullPanel>
				
				<div id={this.props.id} className="ag-theme-alpine" style={{width:'100%', border: '1px solid rgb(222 226 230 / 40%)', borderRadius: '0.5em'}}>
					<RelativeGroup>
						{treeHeader}
					</RelativeGroup>
					<div style={{width:'100%', height: this.props.height}} id={this.props.id + "_container"}>
						<SortableTree							
							treeData  ={this.state.treeData}
							onChange  ={e => this.onChange(e)}
							onMoveNode={e => this.onMoveNode(e)}
							generateNodeProps={rowInfo => this.generateNodeProps(rowInfo)}
							maxDepth={this.props.maxDepth}
							placeholderRenderer={this.customPlaceholder}
							canDrag={this.props.canDrag}

							searchMethod={ this.searchNode}
							searchQuery ={this.state.searchString}
							scaffoldBlockPxWidth={44}
							// rowHeight={55}
							reactVirtualizedListProps={{
								ref: ref => this.treeRef = ref
							 }}
							searchFinishCallback={matches =>
								{	
									const orgSearched = this.state.searched
									
									let toMove = false;
									
									if (orgSearched.length !== matches.length && matches.length > 0) {
										toMove = true;

									} else {

										for (let i = 0; i < matches.length; i ++) {
											let dubchk = false;
											for (let j = 0; j < orgSearched.length; j ++) {
												if (matches[i].node.ID ===  orgSearched[j].node.ID) {
													dubchk = true;
													break;
												}
											}
											if (!dubchk) {
												toMove = true;
												break;
											}
										}
									}
									
									this.setState({
										searched: matches,
										searchFoundCount: matches.length,
										searchFocusIndex: matches.length > 0 ? this.state.searchFocusIndex % matches.length : 0
									}, ()=> {
										if (toMove) {
											this.moveListItem();
										}																	
									})
								}								
							}
						/>
					</div>
				</div>
			</React.Fragment>
		);
	}
}
export default Tree;



	