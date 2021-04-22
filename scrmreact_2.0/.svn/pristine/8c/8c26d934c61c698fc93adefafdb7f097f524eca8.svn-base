import React from 'react';
import {
	IconButton, Table, Label, CsButton
} from 'components';
import { RFloatArea } from '../Layout';

class CsState extends React.Component {
	constructor (props) {
		super(props);
		this.state = { 
			colGrp  : [],
			tbData  : [],
			listOpen: [],

			totalCs: 0,
			openCs : 0
		}
	}	

	static defaultProps = {
		tbllm: '40px',
		tblrm: '40px',
		iconbm: '10px',
		height: '640px',
		iconSize: '50px',
		colCount: 1,
		tblData: [],		
		onClickCs : (e) => {return;},
		toggleCenter: (e) => {return;}
	}
	doMakeTable() {
		let colGrp = [];
		let csPerCenterList = [];
		
		let totalCsAll    = 0;
		let openCsAll     = 0;

		let colLen = Math.floor(100/this.props.colLeng)
				
		for (let i = 0; i < this.props.colLeng; i ++) {
			colGrp.push({width: colLen + '%'});

		}

		let csList = this.props.csList;

		csPerCenterList = Object.keys(this.props.centerList).map(key => {
			
			let item        = this.props.centerList[key];
			let csListItems = [];	

			if (item.CHK === 'Y') {
				csListItems = Object.keys(this.props.csList).map(keys => {
					let cs       = this.props.csList[keys];
					let callType = cs.CONS_STATE;
													
					if (cs.CENT_CD === item.CENT_CD) {
						return ({type: 'D', value:
							
							<div 
								key={cs.CONST_CD}
								style={{textAlign: 'center', marginBottom: this.props.iconbm}}										
								onClick = {callType === 'E' ? null : () => {this.props.onClickCs({ USR_CD: cs.CONST_CD, USR_NM: cs.CONST_NM })}}
							>
								<CsButton		
									id       = {cs.CONST_CD}
									name     = {cs.CONST_NM}
									callType = {callType}
									color    = 'blue' 
									color2   = 'red' 
									size	 = {'xi-4x'} // xi-5x, xi-4x, xi-3x, xi-2x, xi-x
								/>
							</div>
						 });
					} 
				});

				let totalCs;
				let openCs;
				
				let tempCnt = 0;
				let tempCnt2 = 0;

				for (let j = 0; j < csList.length; j ++){
					if (csList[j].CENT_CD === item.CENT_CD ) {
						tempCnt += 1;       

						if (csList[j].CONS_STATE !== 'N') {
							tempCnt2 += 1;
						}
					}

					if (j + 1 === csList.length) {
						totalCs = tempCnt;
						openCs = tempCnt2;
					}
				}

				totalCsAll += totalCs;
				openCsAll  += openCs;

				let title = "";

				title += item.CENT_NM;
				title += " (" + openCs + " / " + totalCs + ")";
				
				return (
					[[{type: 'D', value: <div style={{marginBottom: this.props.iconbm, marginTop: "30px" }}><Label value={title}/></div>, colSpan: this.props.colLeng}],
					[csListItems.filter(items => items !== undefined)]]

				)
			}			
		})

		let tbData = [];

		for (let i = 0; i < csPerCenterList.length; i ++) {
			if (csPerCenterList[i] !== undefined) {
				tbData.push([csPerCenterList[i][0][0]]);
			
				let rowCnt = 1;
				let csRow  = [];	
				
				for (let j = 0; j < csPerCenterList[i][1][0].length; j ++) {		
					if (rowCnt * this.props.colLeng > Math.ceil(j + 1 / this.props.colLeng) && j + 1 !== csPerCenterList[i][1][0].length) {
						csRow.push(csPerCenterList[i][1][0][j])
						
					} else {
						csRow.push(csPerCenterList[i][1][0][j])
						tbData.push(csRow);
						rowCnt ++;
						csRow = [];
						
					}	
				}
			}
		}

		return ({colGrp: colGrp, tbData: tbData})
	}

	render () {
		let { tbData, colGrp} = this.doMakeTable();
		return (
			<div style={{marginLeft: this.props.tbllm, marginRight: this.props.tblrm, height: this.props.height, overflow: 'auto'}}>				
				<Table  
					id={this.props.id} 
					colGrp = {colGrp}
					tbData = {tbData}
				/>
			</div>
		);
	}
}

export default CsState;