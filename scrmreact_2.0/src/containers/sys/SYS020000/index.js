// 센터 관리
import React from 'react';
import {
   ComponentPanel,
   FlexPanel, FullPanel, SearchPanel, SubFullPanel, LFloatArea, RFloatArea, RelativeGroup
} from 'components';
//버튼 컴포넌트
import {BasicButton as Button} from 'components';
import {Textfield, Selectbox, Grid
   , Label  } from 'components';
import {ComLib, StrLib, DataLib, newScrmObj, TransManager} from 'common';

class View extends React.Component {
   constructor() {
      super();
      this.gridCentApi = null;
      this.gridTeamApi = null;
      this.gridStndValApi = null;

      this.gridCent = null;
      this.gridTeam = null;
      this.gridStndVal = null;

      this.currentRowCent  = '';
      this.currentRowTeam  = '';
      this.currentRowStnd  = '';

      this.currentCentTempCd = 0;
      this.currtenTeamTempCd = 0;
      
      this.maxCentTempCd = 0;
      this.maxTeamTempCd = 0;
      this.maxStndTempCd = 0;

      this.lastEditedCent = '';
		this.lastEditedTeam = '';


      this.copyRow = false;

      this.state = {
      
         dsSel : DataLib.datalist.getInstance([{USE_FLAG:"", }]),
         dsCentList : DataLib.datalist.getInstance(),
         dsTeamList : DataLib.datalist.getInstance(),
         dsCentStndValList : DataLib.datalist.getInstance(),
         

         btnProps : {
            btnSearch : {
               id       : 'btnSearch',
               disabled : false,
               value    : '조회',
               hidden   : false
            },
            btnCentSave : {
               id       : 'btnCentSave',
               disabled : false,
               value    : '저장',
               hidden   : false
            },
   
            btnTeamSave : {
               id       : 'btnTeamSave',
               disabled : false,
               value    : '저장',
               hidden   : false
            },
            btnStndSave : {
               id       : 'btnStndSave',
               disabled : false,
               value    : '저장',
               hidden   : false
            },
         },

         textFieldProps : {
            iptCentCdNm : {
               id          : 'iptCentCdNm',
               name        : 'iptCentCdNm',
               value       : '',
               placeholder : '센터코드/센터명',
               minLength   : 1,
               maxLength   : 20,
               readOnly    : false,
               disabled    : false
            }
         },

         gridCent : {
            id : 'gridCent',
            areaName : '센터정보',
            header :
               [
                  {headerName: '센터코드',      field: 'CENT_CD',      colId: 'CENT_CD', editable: true, req: true, width: '110', cellEditor: 'customEditor', maxLength : '10'},
                  {headerName: '센터명',        field: 'CENT_NM',      colId: 'CENT_NM',   editable: true, req: true, width: '110',cellEditor: 'customEditor', maxLength : '90'},
                  {headerName: '영업가능여부',   field: 'BIZ_PSB_FLAG', colId: 'BIZ_PSB_FLAG',   editable: true, width: '90', defaultValue : 'Y', textAlign: 'center', singleClickEdit: true,
                     cellEditor: 'agSelectCellEditor',
                     cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'BIZ_PSB_FLAG')},
                     valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'BIZ_PSB_FLAG')                  
                  },
                  {headerName: '사용여부',      field: 'USE_FLAG',      colId: 'USE_FLAG',   editable: true, req: true, width: '90', defaultValue : 'Y', textAlign: 'center', singleClickEdit: true,
                     cellEditor: 'agSelectCellEditor',
                     cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
                     valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')
                  },
                  {headerName: '등록일자',      field: 'REG_DTM',      colId: 'REG_DTM',   editable: true, width: '100', resizable : false, },
               ],
               
         },
         gridTeam : {
            id : 'gridTeam',
            areaName : '팀정보',
            header : 
               [
                  {headerName: '팀 코드',      field: 'TEAM_CD',      colId: 'TEAM_CD',editable: true, req: true, width: '100',cellEditor: 'customEditor', maxLength : '50'},
                  {headerName: '팀 명',      field: 'TEAM_NM',      colId: 'TEAM_NM',   editable: true,req: true, width: '100', cellEditor: 'customEditor', maxLength : '10'},
                  {headerName: '사용여부',      field: 'USE_FLAG',      colId: 'USE_FLAG',   editable: true,width: '100', req: true,defaultValue : 'Y', textAlign: 'center', singleClickEdit: true,
                     cellEditor: 'agSelectCellEditor',
                     cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'USE_FLAG')},
                     valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'USE_FLAG')
                  },
                  {headerName: '등록일자',      field: 'REG_DTM',      colId: 'REG_DTM',   editable: true,width: '100', resizable : false},
               ],
               
         },

         gridStndVal : {
            id : 'gridStndVal',
            areaName : '기준값정보',
            header :
               [
                  {headerName: '기준코드',      field: 'STND_CD',      colId: 'STND_CD',   editable: true, cellEditor: 'customEditor',maxLength : '5', width: '40',},
                  {headerName: '기준코드명',      field: 'STND_CD_NM',      colId: 'STND_CD_NM',   editable: true, cellEditor: 'customEditor', maxLength : '150', width: '150',},
                  {headerName: '기준값',      field: 'STND_VAL',      colId: 'STND_VAL',   editable: true,cellEditor: 'customEditor', maxLength : '20', width: '100',},
                  {headerName: '적용여부',      field: 'APY_FLAG',      colId: 'APY_FLAG',   editable: true, defaultValue : 'Y', width: '40',textAlign: 'center', singleClickEdit: true,
                     cellEditor: 'agSelectCellEditor',
                     cellEditorParams: { values : ComLib.getComCodeValue('CMN', 'APY_FLAG')},
                     valueFormatter : (param) => ComLib.getComCodeName('CMN', param.value, 'APY_FLAG')                  
                  },
                  {headerName: '기타속성1',      field: 'ETC1',      colId: 'ETC1',   editable: true, cellEditor: 'customEditor', maxLength : '30', width: '60',},
                  {headerName: '기타속성2',      field: 'ETC2',      colId: 'ETC2',   editable: true, resizable : false, cellEditor: 'customEditor', maxLength : '30', width: '60',},
                  {headerName: '센터수정가능여부',    field: 'CENT_SET_CHG_FLAG',      colId: 'CENT_SET_CHG_FLAG',   hide :  true, },
                  {headerName: '적용속성여부',        field: 'APY_PPTY_USE_FLAG',      colId: 'APY_PPTY_USE_FLAG',   hide :  true, },
                  {headerName: '기준값속성사용여부',   field: 'STND_PPTY_USE_FLAG',      colId: 'STND_PPTY_USE_FLAG',   hide :  true, },
                  {headerName: '기타속성1사용여부',    field: 'ETC1_PPTY_USE_FLAG',      colId: 'ETC1_PPTY_USE_FLAG',   hide :  true, },
                  {headerName: '기타속성2사용여부',    field: 'ETC2_PPTY_USE_FLAG',      colId: 'ETC2_PPTY_USE_FLAG',   hide :  true, },
               ],
               
         }
      }
      // 이벤트 바인딩
      this.event.button.onClick = this.event.button.onClick.bind(this);
      this.event.selectbox.onChange = this.event.selectbox.onChange.bind(this);
      this.event.input.onChange   = this.event.input.onChange.bind(this);
      this.event.grid.onInsertRow = this.event.grid.onInsertRow.bind(this);
   }
	/*------------------------------------------------------------------------------------------------*
		0) Custom Event Zone 
		rowFinder = 조회후 가장 마지막에 선택되어져 있던 행으로 재 포커싱을 하기 위한 함수
	 ------------------------------------------------------------------------------------------------*/
    rowFinder = (targetRecords, targetColumn, currentRow, secondColumn, secondRow) => {
		let rowNum = 0;

		if (targetRecords === undefined || targetRecords === null) {
			return rowNum;
		}

		if (StrLib.isNull(secondColumn)) {
			if (!StrLib.isNull(currentRow)) {
				for (let i = 0; i < targetRecords.length; i++) {
					if (targetRecords[i][targetColumn] === currentRow) {
						rowNum = i;

						break;
					}
				}
			}
			return rowNum;

		} else {
			if (!StrLib.isNull(secondRow)) {
				for (let i = 0; i < targetRecords.length; i++) {
					if (targetRecords[i][targetColumn] === currentRow && targetRecords[i][secondColumn] === secondRow) {
						rowNum = i;

						break;
					}
				}
			}
			return rowNum;
		}
	}

/*------------------------------------------------------------------------------------------------*
      1) componentDidMount () => init 함수 개념으로 이해하는게 빠름
      => 컴포넌트가 마운트된 직후, 호출 ->  해당 함수에서 this.setState를 수행할 시, 갱신이 두번 일어나 render()함수가 두번 발생 -> 성능 저하 가능성
    ------------------------------------------------------------------------------------------------*/
    componentDidMount () {
      if (this.validation("SYS050000_R01")) this.transaction("SYS050000_R01");
   }
/*------------------------------------------------------------------------------------------------*
      2) componentDidUpdate () => 갱신이 일어나 직후에 호춮 (최초 렌더링 시에는 호출되지 않음)
      => prevProps와 현재 props를 비교할 수 있음 -> 조건문으로 감싸지 않고 setState를 실행할 시, 무한 반복 가능성 -> 반드시 setState를 쓰려면 조건문으로 작성
 ------------------------------------------------------------------------------------------------*/
    componentDidUpdate (prevProps, prevState, snapshot) {
      //console.log("updated!!");
      //console.log(this.state.dsGrp);
   }
/*------------------------------------------------------------------------------------------------*
      3) componentWillUnmount () => 컴포넌트가 마운트 해제되어 제거되기 직전에 호출
      => 타이머 제거, 네트워크 요청 취소 등 수행 -> 마운트가 해제되기 때문에 setState를 호출하면 안됨
 ------------------------------------------------------------------------------------------------*/
    componentWillUnmount () {

   }

/*------------------------------------------------------------------------------------------------*/
   // [3. validation Event Zone]
   //  - validation 관련 정의
   //   SYS050000_R01 센터정보 조회
   //   SYS050000_R02 팀정보, 기준값정보 조회
   //   SYS050000_H01 센터정보 저장
   //   SYS050000_H02 팀정보 저장
   //   SYS050000_U03 기준값정보 저장
/*------------------------------------------------------------------------------------------------*/
   validation = (...params) => {
      let serviceid = params[0];
		let chkCnt  = 0;
		let returnVal = -1;

      switch (serviceid) {
      case 'SYS050000_R01': 
         break;
      case 'SYS050000_R02': 
         break;
      case 'SYS050000_H01':
         let centRecord = this.gridCent.gridDataset.records;
      
         outer : for (let intA = 0; intA < centRecord.length; intA ++) {
            if (centRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
               chkCnt++;
            }		
            
            let centHeader = this.state.gridCent.header.filter(item => item['req'] === true);//filter
           
            for (let i = 0; i < centHeader.length; i ++) {		

                  if (StrLib.isNull(centRecord[intA][centHeader[i].field])) {
                     let centRows = this.gridCentApi.rowModel.rowsToDisplay;
                     let centNum = 0;

                     for(let i = 0; i < centRows.length; i++) {
                        if(centRows[i].data.TEMP_CD === centRecord[intA].TEMP_CD) {
                           centNum = i;

                           break;
                        }
                     }
                     ComLib.openDialog('A', 'COME0001', [Number(centNum + 1) ,centHeader[i].headerName.replace(/\*/g,'')]);  //입력해주시기바랍니다
           
                     returnVal = intA;

                     break outer;
                  }
               }
               
            for ( let intB = 0; intB < centRecord.length; intB ++ ) {
                  if (intA !== intB
                        && centRecord[intA].CENT_CD === centRecord[intB].CENT_CD ) {


                  let centRows = this.gridCentApi.rowModel.rowsToDisplay;
                  let centNum = 0;

                  for (let i = 0; i < centRows.length; i++) {
                     if(centRows[i].data.TEMP_CD === centRecord[intA].TEMP_CD) {
                        centNum = i;

                        break;
                     }
                  }
                     
                  ComLib.openDialog('A', 'COME0012',[Number(centNum + 1) , Number(intB + 1) , '센터코드']); //중복되었습니다
                  
                  this.gridCent.moveRow(intB, true);
      
                  return false;
               }

                  
                  else if (intA !== intB 	&& centRecord[intA].CENT_NM === centRecord[intB].CENT_NM) {


                     let centRows = this.gridCentApi.rowModel.rowsToDisplay;
                     let centNum = 0;

                     for (let i = 0; i < centRows.length; i++) {
                        if(centRows[i].data.TEMP_CD === centRecord[intA].TEMP_CD) {
                           centNum = i;

                           break;
                        }
                  }
                  //중복
                  ComLib.openDialog('A', 'COME0012',[Number(centNum + 1) , Number(intB + 1) , '센터명']);
                  
                  this.gridCent.moveRow(intB, true);
         
                  return false;
               }
         
            }	
         }
            
            if (returnVal > -1) {
               this.gridCent.moveRow(returnVal, true);
               
               return false;
            }	
            if (centRecord.length < 1 || chkCnt === 0) {
               ComLib.openDialog('A', 'COME0005');//변경된 행이 없습니다

               return false;
            }

            break;

      case 'SYS050000_H02': 

         let teamRecord = this.gridTeam.gridDataset.records;

         outer : for ( let intA = 0; intA < teamRecord.length; intA ++ ) {

            if (teamRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
               console.log('teamRecord[intA].rowtype', teamRecord[intA].rowtype);
               chkCnt ++;
               console.log('TeamchkCnt',chkCnt);
            }	

            let teamHeader = this.state.gridTeam.header.filter(item => item['req'] === true); //filter
            
            for (let i = 0; i < teamHeader.length; i ++) {		
              
                  if (StrLib.isNull(teamRecord[intA][teamHeader[i].field])) {
                   
                     ComLib.openDialog('A', 'COME0001', [Number(intA + 1) , teamHeader[i].headerName.replace(/\*/g,'')]);  // 입력해 주시기 바랍니다.
      
                     returnVal = intA;

                     break outer;
                  }
               }
               
               for ( let intB = 0; intB < teamRecord.length; intB ++ ) {
                     if (intA !== intB && teamRecord[intA].TEAM_CD === teamRecord[intB].TEAM_CD) {
                        
                        ComLib.openDialog('A', 'COME0012', [Number(intA + 1), Number(intB + 1), '팀 코드']);//중복되었습니다
                        
                        this.gridTeam.moveRow(intB, true);
               
                        return false;
                     }
                  }
               }
      
               if (returnVal > -1) {
                  this.gridTeam.moveRow(returnVal, true);
               
                  return false;
               }
      
               if (teamRecord.length < 1 || chkCnt === 0) {
                  ComLib.openDialog('A', 'COME0005'); //변경된행이없습니다
      
                  return false;
               }
      
            
            break;
      case 'SYS050000_U03':
         let stndRecord = this.gridStndVal.gridDataset.records;

         for ( let intA = 0; intA < stndRecord.length; intA ++ ) {

            if (stndRecord[intA].rowtype !== newScrmObj.constants.crud.read) {
               chkCnt ++;           
            }
         }
         if (stndRecord.length < 1 || chkCnt === 0) {
            ComLib.openDialog('A', 'COME0005');//변경된행이없습니다
            return false;
         }
         
            break;
           
      default: break;

      }
      return true;
   }
/*------------------------------------------------------------------------------------------------*/
   // [4. transaction Event Zone]
   //  - transaction 관련 정의
   //   SYS050000_R01 센터정보 조회
   //   SYS050000_R02 팀정보, 기준값정보 조회
   //   SYS050000_H01 센터정보 저장
   //   SYS050000_H02 팀정보 저장
   //   SYS050000_U03 기준값정보 저장
/*------------------------------------------------------------------------------------------------*/
   transaction = (...params) => {
    
      let serviceid = params[0];
      let transManager = new TransManager();

      try {
         switch(serviceid) {
         case 'SYS050000_R01':
            transManager.setTransId (serviceid);
            transManager.setTransUrl(transManager.constants.url.common);
            transManager.setCallBack(this.callback);
            transManager.addConfig  ({
               dao        : transManager.constants.dao.base,
               crudh      : transManager.constants.crudh.read,
               sqlmapid   : "SYS.R_getCentList",
               datasetsend: "dsSearchParam",
               datasetrecv: "dsCentRecv",
            });   

            transManager.addDataset('dsSearchParam', [{"CENT_CD_NAME" :this.state.textFieldProps.iptCentCdNm.value
                                                   ,   "USE_FLAG": this.state.dsSel.records[0]["USE_FLAG"]}]);
            transManager.agent();

            break;

         case 'SYS050000_R02':
            transManager.setTransId (serviceid);
            transManager.setTransUrl(transManager.constants.url.common);
            transManager.setCallBack(this.callback);
            transManager.addConfig  ({
               dao        : transManager.constants.dao.base,
               crudh      : transManager.constants.crudh.read,
               sqlmapid   : "SYS.R_getTeamList",
               datasetsend: "dsSearchParam",
               datasetrecv: "dsTeamRecv",
            });

            transManager.addConfig  ({
               dao        : transManager.constants.dao.base,
               crudh      : transManager.constants.crudh.read,
               sqlmapid   : "SYS.R_dsCentStndValList",
               datasetsend: "dsSearchParam",
               datasetrecv: "dsStndValRecv",
            });

            transManager.addDataset('dsSearchParam', [{"CENT_CD": params[1]}]);
            
            transManager.agent();

         break;

         case 'SYS050000_H01':
            transManager.setTransId (serviceid);
            transManager.setTransUrl(transManager.constants.url.common);
            transManager.setCallBack(this.callback);
            transManager.addConfig  ({
               dao        : transManager.constants.dao.base,
               crudh      : transManager.constants.crudh.handle,
               sqlmapid   : "SYS.H_handleCentList",
               datasetsend: "dsCentList",
            });
            transManager.addDataset('dsCentList', this.gridCent.gridDataset.getTransRecords(newScrmObj.constants.rowtype.CREATE_OR_UPDATE));
            transManager.agent();
         
            break;
         
         case 'SYS050000_H02':
            transManager.setTransId (serviceid);
            transManager.setTransUrl(transManager.constants.url.common);
            transManager.setCallBack(this.callback);
            transManager.addConfig  ({
               dao        : transManager.constants.dao.base,
               crudh      : transManager.constants.crudh.handle,
               sqlmapid   : "SYS.H_handleTeamList",
               datasetsend: "dsTeamList",
            });
            for ( let intA = 0; intA < this.gridTeam.gridDataset.records.length; intA ++ ) {
               if (StrLib.isNull(this.gridTeam.gridDataset.records[intA]["CENT_CD"])) {
                  this.gridTeam.gridDataset.records[intA]["CENT_CD"] = this.gridCentApi.getSelectedRows()[0].CENT_CD;
                  
               }               
            }
            transManager.addDataset('dsTeamList', this.gridTeam.gridDataset.records);   
            transManager.agent();
            break;
         case 'SYS050000_U03':
            transManager.setTransId (serviceid);
            transManager.setTransUrl(transManager.constants.url.common);
            transManager.setCallBack(this.callback);
            transManager.addConfig  ({
               dao        : transManager.constants.dao.base,
               crudh      : transManager.constants.crudh.handle,
               sqlmapid   : "SYS.H_updateStndValList",
               datasetsend: "dsCentStndValList",
            });
      
            for ( let intA = 0; intA < this.gridStndVal.gridDataset.records.length; intA ++ ) {
               if (StrLib.isNull(this.gridStndVal.gridDataset.records[intA]["CENT_CD"])) {
                  this.gridStndVal.gridDataset.records[intA]["CENT_CD"] = this.gridCentApi.getSelectedRows()[0].CENT_CD;         
               }               
            }

            transManager.addDataset('dsCentStndValList', this.gridStndVal.gridDataset.records);
            transManager.agent();
            break;
         default: break;
         }
      }   catch (err) {

      }
   }
/*------------------------------------------------------------------------------------------------*/
   // [5. Callback Event Zone]
   //  - Callback 관련 정의
   //   SYS050000_R01 센터정보 조회
   //   SYS050000_R02 팀정보, 기준값정보 조회
   //   SYS050000_H01 센터정보 저장
   //   SYS050000_H02 팀정보 저장
   //   SYS050000_U03 기준값정보 저장
/*------------------------------------------------------------------------------------------------*/
   callback = (res) => {

      let centRows, teamRows;
      let centRow, teamRow;    

      switch (res.id) {
      case 'SYS050000_R01':
         if(res.data.dsCentRecv.length > 0) {
            let dsCentCd = res.data.dsCentRecv;
            let tempCentCd = 0;

            for(let i = 0; i < dsCentCd.length; i++) {
               dsCentCd[i].TEMP_CD = tempCentCd;
                  tempCentCd++;
            }

            this.maxCentTempCd = tempCentCd;

            ComLib.setStateInitRecords(this, "dsCentList", dsCentCd);

            centRows = this.gridCentApi.rowModel.rowsToDisplay;

            let centCd;

            for(let i = 0; i < centRows.length; i++) {
               if(centRows[i].data.CENT_CD === this.lastEditedCent) {
                  centRow = this.gridCentApi.rowModel.rowsToDisplay[i];
                  centCd = this.gridCentApi.rowModel.rowsToDisplay[i].data.CENT_CD;
                  this.gridCentApi.ensureIndexVisible(i, 'middle');
                  break;
               }
            }

            if(centRow === undefined) {
               centRow = this.gridCentApi.rowModel.rowsToDisplay[0];
               centCd = this.gridCentApi.rowModel.rowsToDisplay[0].data.CENT_CD;
            }
            if(centRow.selected !== true) {
               centRow.setSelected(true);
            }
            this.currentRowCent = centCd;

            if (this.validation("SYS050000_R02")) this.transaction("SYS050000_R02", centCd);
         
         } else {

            ComLib.setStateInitRecords(this, "dsCentList", []);
            ComLib.setStateInitRecords(this, "dsTeamList", []);
            ComLib.setStateInitRecords(this, "dsCentStndValList", []);
         }
         break;

      case 'SYS050000_R02': 
         if(res.data.dsTeamRecv.length > 0) {
            let dsTeamCd = res.data.dsTeamRecv;
            let tempTeamCd = 0;
            
            for(let i = 0; i < dsTeamCd.length; i++) {
               dsTeamCd[i].TEMP_CD = tempTeamCd;
               tempTeamCd++;
            }

            this.maxTeamTempCd = tempTeamCd;
            ComLib.setStateInitRecords(this, "dsTeamList", res.data.dsTeamRecv);
            teamRows = this.gridTeamApi.rowModel.rowsToDisplay;
            let teamCd;

            for(let i = 0; i < teamRows.length; i++) {
               if(teamRows[i].data.TEAM_CD === this.lastEditedTeam) {
                  teamRow = this.gridTeamApi.rowModel.rowsToDisplay[i];
                  teamCd = this.gridTeamApi.rowModel.rowsToDisplay[i].data.TEAM_CD;
                  this.gridTeamApi.ensureIndexVisible(i, 'middle');

                  break;
               }
            }
            if(teamRow === undefined) {
               teamRow = this.gridTeamApi.rowModel.rowsToDisplay[0];
               teamCd = this.gridTeamApi.rowModel.rowsToDisplay[0].data.TEAM_CD;
            }
            if(teamRow.selected !== true) {
               teamRow.setSelected(true);
            }

            this.currentRowTeam = teamCd;
         }
        
     
      else {
            ComLib.setStateInitRecords(this, "dsTeamList", []);
            ComLib.setStateInitRecords(this, "dsCentStndValList", []);

         }
         if (res.data.dsStndValRecv.length > 0) {
            ComLib.setStateInitRecords(this, "dsCentStndValList", res.data.dsStndValRecv);
            

         } else {
            ComLib.setStateRecords(this, "dsCentStndValList", []);
         }
      
      
         break;

      case 'SYS050000_H01':   
         ComLib.openDialog('A', 'COMI0001', ['센터 정보']);//정상적으로 저장되었습니다.         
         this.transaction("SYS050000_R01");
            
         break;
      case 'SYS050000_H02':   
         ComLib.openDialog('A', 'COMI0001', ['팀 정보']);//정상적으로 저장되었습니다.
         let centCd = this.gridCentApi.getSelectedRows()[0].CENT_CD;
         this.transaction("SYS050000_R02",centCd);

         break;
      case 'SYS050000_U03':   
         ComLib.openDialog('A', 'COMI0001', ['기준값 정보']);//정상적으로 저장되었습니다.
         centCd = this.gridCentApi.getSelectedRows()[0].CENT_CD;      
         this.transaction("SYS050000_R02", centCd);  

         break;

      default : break;
      }
   }
/*------------------------------------------------------------------------------------------------*/
   // [6. event Zone]
   //  - 각 Component의 event 처리
/*------------------------------------------------------------------------------------------------*/
   
   event = {
      button : {
         onClick : (e) => {
            switch (e.target.id) {
            case 'btnSearch': 
               if(this.validation("SYS050000_R01")) this.transaction("SYS050000_R01");

               break;

            case 'btnCentSave':
               if (this.validation("SYS050000_H01")) this.transaction('SYS050000_H01');
                           
               break;

            case 'btnTeamSave':
               if (this.validation("SYS050000_H02")) this.transaction('SYS050000_H02');
            
               break;

            case 'btnStndSave':
               if (this.validation("SYS050000_U03"))  this.transaction('SYS050000_U03');
               
               break;
               
            default: break;

            }
         }
      },
      input : {
         onChange : (e) => {
            switch(e.target.id) {
            case 'iptCentCdNm':
               let state = this.state;
               state['textFieldProps']['iptCentCdNm'].value = e.target.value;
               this.setState(state);

               break;
            default: break;
            }
         }
      },
      grid : {
         onGridReady : (e) => {
            switch (e.id) {
            case "gridCent":
               this.gridCentApi = e.gridApi;
               this.gridCent = e.grid;
         
               break;

            case "gridTeam":
      
               this.gridTeamApi = e.gridApi;
               this.gridTeam = e.grid;   
               
               break;

            case "gridStndVal":
            
               this.gridStndValApi = e.gridApi;   
               this.gridStndVal = e.grid;         
            
               break;

            default: break
            }
            
         },

         onRowClicked: (e) => { 
            switch(e.id) {
            case "gridCent":
               let centRows = this.gridCentApi.rowModel.rowsToDisplay;
               let centRow;
               
               for(let i = 0; i< centRows.length; i++) {
                  if(centRows[i].data.TEMP_CD === e.data.TEMP_CD) {
                     centRow = this.gridCentApi.rowModel.rowsToDisplay[i];
                     break;

                  }
               }
               if(centRow.selected !== true) {
                  centRow.setSelected(true);
               
               }

               break;

            case "gridTeam":

               let teamRows = this.gridTeamApi.rowModel.rowsToDisplay;
               let teamRow;
               for(let i = 0; i< teamRows.length; i++) {
                  if(teamRows[i].data.TEMP_CD === e.data.TEMP_CD) {
                     teamRow = this.gridTeamApi.rowModel.rowsToDisplay[i];
                     break;
  
                  }
               }
               if(teamRow.selected !== true) {
                  teamRow.setSelected(true);
                  
               }
               break;
            case "gridStndVal":   
             
               break;
            default: break;
            }

         },
         onCellFocused: () => {
         
         },
         onCellClicked: (e) => {
       
         },
         onCellDoubleClicked: () => {
           
         },
         onCellValueChanged: (e) => {
            switch (e.id) {
            case "gridCent":
               if(e.col === "CENT_CD" ) {

                  if(this.gridCent.gridDataset.records[e.index].rowtype !== newScrmObj.constants.crud.create) {
                     
                     ComLib.openDialog('A', 'COME0013', ['센터 코드']);//변경 하실 수 없습니다.
                     
                     this.gridCent.gridDataset.setValue(e.index, e.col, e.oldValue);
                     this.gridCentApi.setRowData(this.gridCent.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                  }
               }
               
               let centRows = this.gridCentApi.rowModel.rowsToDisplay;
               let centRow;

               for(let i = 0; i < centRows.length; i++) {
                  if(centRows[i].data.TEMP_CD === e.data[e.index].TEMP_CD) {
                     centRow = this.gridCentApi.rowModel.rowsToDisplay[i];
                     
                     break;
                  }
               }

               this.currentRowCent = centRow.data.CENT_CD;
               this.lastEditedCent =   this.currentRowCent;
               break;

            case "gridTeam":
               if(e.col === "TEAM_CD") {    
                  if(this.gridTeam.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create) {
                     
                     ComLib.openDialog('A', 'COME0013', ['팀 코드']);//{0}는 변경 하실 수 없습니다.
                     this.gridTeam.gridDataset.setValue(e.index, e.col, e.oldValue);

                     this.gridTeamApi.setRowData(this.gridTeam.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                  }
               }
               let teamRows = this.gridTeamApi.rowModel.rowsToDisplay;
               let teamRow;

               for(let i = 0; i < teamRows.length; i++) {
                  if(teamRows[i].data.TEMP_CD === e.data[e.index].TEMP_CD) {
                     teamRow = this.gridTeamApi.rowModel.rowsToDisplay[i];
                     this.gridTeamApi.ensureIndexVisible(i, 'middle');
                     break;
                  }
               }
               this.currentRowCent = this.gridCentApi.getSelectedRows()[0].CENT_CD;
				
					this.currentRowTeam = teamRow.data.TEAM_CD;
					
					this.lastEditedCent = this.currentRowCent;
               break;
            case "gridStndVal":    
               console.log("A")
               if(e.col === "STND_VAL" || e.col === "APY_FLAG" || e.col ==="ETC1" || e.col ==="ETC2") {
                  console.log("A")

                  if( (this.gridStndVal.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create)
                     && (this.gridStndVal.gridDataset.records[e.index].CENT_SET_CHG_FLAG ==='N')
                      && (ComLib.getSession("gdsUserInfo")[0]['AUTH_LV'] !== 1) ) {

                        console.log("A")
                      ComLib.openDialog('A', 'SYSI0010', ['수정이 불가능합니다.']);//센터수정가능여부 N

                     this.gridStndVal.gridDataset.setValue(e.index, e.col, e.oldValue);
                     this.gridStndValApi.setRowData(this.gridStndVal.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                 
                     return false;
                  }
               }
                      

               else if(e.col === "STND_CD") {
                  if(this.gridStndVal.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create) {
                     ComLib.openDialog('A', 'COME0013', ['기준 코드']);//변경할 수 없습니다

                     this.gridStndVal.gridDataset.setValue(e.index, e.col, e.oldValue);
                     this.gridStndValApi.setRowData(this.gridStndVal.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                  }
               }
               else if(e.col === "STND_CD_NM") {
                  if(this.gridStndVal.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create) {
                     ComLib.openDialog('A', 'COME0013', ['기준 코드명']);//변경할 수 없습니다

                     this.gridStndVal.gridDataset.setValue(e.index, e.col, e.oldValue);
                     this.gridStndValApi.setRowData(this.gridStndVal.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                  }
               }
               if(e.col === "STND_VAL" ) {
                  if((ComLib.getSession("gdsUserInfo")[0]['AUTH_LV'] === 1)
                        && (this.gridStndVal.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create)
                        && (this.gridStndVal.gridDataset.records[e.index].STND_PPTY_USE_FLAG ==='N') ) { //기준값속성사용여부 N
                        
                        ComLib.openDialog('A', 'SYSI0010', ['기준값 속성 사용여부를 확인하세요.']);

                        this.gridStndVal.gridDataset.setValue(e.index, e.col, e.oldValue);
                        this.gridStndValApi.setRowData(this.gridStndVal.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                    
                     return false;
                  
                  }
               }
               if(e.col === "APY_FLAG") {
                     if( (this.gridStndVal.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create)
                     && (this.gridStndVal.gridDataset.records[e.index].APY_PPTY_USE_FLAG ==='N') ) {//적용속성 사용여부 N
   
                         ComLib.openDialog('A', 'SYSI0010', ['적용속성 사용여부를 확인하세요.']);
   
                        this.gridStndVal.gridDataset.setValue(e.index, e.col, e.oldValue);
                        this.gridStndValApi.setRowData(this.gridStndVal.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                        return false;
                     }
                  }
                  if(e.col === "ETC1") {
                     if( (this.gridStndVal.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create)
                     && (this.gridStndVal.gridDataset.records[e.index].ETC1_PPTY_USE_FLAG ==='N') ) {//기타속성1 사용여부 N
   
                         ComLib.openDialog('A', 'SYSI0010', ['기타속성1 사용여부를 확인하세요.']);
   
                        this.gridStndVal.gridDataset.setValue(e.index, e.col, e.oldValue);
                        this.gridStndValApi.setRowData(this.gridStndVal.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                        
                        return false;
                     }
                  }
                  if(e.col === "ETC2") {
                     if( (this.gridStndVal.gridDataset.records[e.index].rowtype !==  newScrmObj.constants.crud.create)
                     && (this.gridStndVal.gridDataset.records[e.index].ETC2_PPTY_USE_FLAG ==='N') ) {//기타속성2 사용여부 N
   
                         ComLib.openDialog('A', 'SYSI0010', ['기타속성2 사용여부를 확인하세요.']);
   
                        this.gridStndVal.gridDataset.setValue(e.index, e.col, e.oldValue);
                        this.gridStndValApi.setRowData(this.gridStndVal.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                        return false;
                     }
                  }
   

        
           
               break;
            default: break;
            }
         },
         onRowDoubleClicked: () => {
         },
         onCellEditingStopped: () => {
         },
         onSelectionChanged: (e) => {      
            switch(e.id) {
            case "gridCent":
               console.log("selection chagend")
               console.log(this.currentRowCent)

               let centRow = this.gridCent.getSelectedRows()[0]
               let centCd = centRow.CENT_CD;
               let rowType = centRow.rowtype;

               
               console.log(centCd)
               
               console.log(this.currentRowCent !== centCd)


               if((rowType === 'r' || rowType === 'u') && (this.currentRowCent !== centCd)) {
                  if(this.validation("SYS050000_R02")) this.transaction("SYS050000_R02", centCd);
                  
               }else if(rowType === 'c') {
                  ComLib.setStateInitRecords(this, "dsTeamList", []);
               }

               this.currentRowCent = this.gridCentApi.getSelectedRows()[0].CENT_CD;

               break;
            case "gridTeam":
               break;
               
            case "gridStndVal":
               break;

            default: break;
               
            }
         },
         onRowSelected: (e) => {
            
         },
         onDeleteRow: (e) => {
            
            switch(e.id) {
            case "gridCent":
               
               let centCd   = this.gridCentApi.getSelectedRows()[0].CENT_CD
				
					let rowType = this.gridCentApi.getSelectedRows()[0].rowtype;					

					if ((rowType === 'r' || rowType === 'u') && (this.currentRowCent !== centCd )) {
						if (this.validation("SYS050000_R02")) this.transaction("SYS050000_R02", centCd);
							
					} else {
						ComLib.setStateInitRecords(this, "dsTeamList", []);
					}				
					this.currentRowCent = this.gridCentApi.getSelectedRows()[0].CENT_CD;       
               break;
            case "gridTeam":
               
               if (this.gridTeamApi.getSelectedRows().length > 0) {
						this.currentRowTeam = this.gridTeamApi.getSelectedRows()[0].TEAM_CD;

					} else {
						this.currentRowTeam = '';

					}
				

               break;

            default: break;
            }
            
         },
         onBeforeInsertRow : (e) => {
         },
         onInsertRow : (e) => {
            switch(e.id) {
               case "gridCent":
                  let centCdRecords = this.gridCent.gridDataset.records;
                  centCdRecords[e.index].TEMP_CD = this.maxCentTempCd + 1;
                  this.maxCentTempCd++;
                  this.gridCent.gridDataset.setRecords(centCdRecords);
                  this.gridCentApi.setRowData(this.gridCent.gridDataset.getRecords().filter(item => item['rowtype'] !== newScrmObj.constants.crud.destroy));
                  let centRows = this.gridCentApi.rowModel.rowsToDisplay;
                  let centRow;

                  for (let i = 0; i < centRows.length; i ++) {
                     if (centRows[i].data.TEMP_CD === this.maxCentTempCd){
                        centRow = this.gridCentApi.rowModel.rowsToDisplay[i];
                        this.gridCentApi.ensureIndexVisible(i, 'middle');
                        break;
                     }
                  }
   
                  if (centRow.selected !== true) {
                     centRow.setSelected(true);
                  }					
   
                  ComLib.setStateInitRecords(this, "dsTeamList", []);
                  
                  this.currentRowCent = '';

                  break;

               case "gridTeam":
            
            
                  break;

               case "gridStndVal":
                  
                  
                  break;
               default: break;
               } 
         
         }      
      },
      onKeyPress: (e) => {
         switch (e.target.id) {
         case 'iptCentCdNm':
            if (e.key === 'Enter') {
               if (this.validation("SYS050000_R01")) this.transaction("SYS050000_R01");
            }
            
            break;

         default: break;
         }

      },
      selectbox : {
         onChange : (e) => {
            switch (e.id) {
            case 'useYn': 
               ComLib.setStateValue(this, "dsSel", 0, "USE_FLAG", e.target.value);
               break;
            default: break;

            }

         }
      }
   
}
/*------------------------------------------------------------------------------------------------*/
   // [7. render Zone]
   //  - 화면 관련 내용 작성
/*------------------------------------------------------------------------------------------------*/
   render () {
      return (
         <React.Fragment>
            <FullPanel>
            <SearchPanel>
                  <RelativeGroup>
                     <LFloatArea>
                        <FlexPanel>
                           <Label value="센터코드/센터명"/>
                           <Textfield 
                              width={200}
                              id = {this.state.textFieldProps.iptCentCdNm.id}
                              name =  {this.state.textFieldProps.iptCentCdNm.name}
                              value =  {this.state.textFieldProps.iptCentCdNm.value}
                              placeholder =  {this.state.textFieldProps.iptCentCdNm.placeholder}
                              minLength =   {this.state.textFieldProps.iptCentCdNm.minLength}
                              maxLength =   {this.state.textFieldProps.iptCentCdNm.maxLength}
                              readOnly =  {this.state.textFieldProps.iptCentCdNm.readOnly}
                              disabled =  {this.state.textFieldProps.iptCentCdNm.disabled}
                              onChange = {this.event.input.onChange}
                           />
                           <Label value="사용여부"/>
                           <Selectbox
                              id = {"useYn"}
                              dataset = {ComLib.convComboList(ComLib.getCommCodeList('CMN', 'USE_FLAG'), newScrmObj.constants.select.argument.all)}
                              value = {this.state.dsSel.records[0]["USE_FLAG"]}
                              width = {200}
                              disabled = {false}
                              onChange = {this.event.selectbox.onChange}
                           />
                        </FlexPanel>
                     </LFloatArea>
                     <RFloatArea>
                        <Button 
                           id = {this.state.btnProps.btnSearch.id}
                           value = {this.state.btnProps.btnSearch.value}
                           disabled = {this.state.btnProps.btnSearch.disabled}
                           hidden = {this.state.btnProps.btnSearch.hidden}
                           onClick = {this.event.button.onClick}
                           color= 'blue' fiiled= {true} 
                           innerImage={true} icon = {'srch'} mt="5px"
                        />
                     </RFloatArea>
                  </RelativeGroup>
                  </SearchPanel>
               <SubFullPanel>
                  <FlexPanel>
                     <ComponentPanel>
                        <Grid
                           id = {this.state.gridCent.id}

                           areaName = {this.state.gridCent.areaName}
                           height= "200px"
                           header = {this.state.gridCent.header}
                           data = {this.state.dsCentList}
                           rowNum = {true}
                           onGridReady = {this.event.grid.onGridReady}
                           onDeleteRow = {this.event.grid.onDeleteRow}
                           onInsertRow = {this.event.grid.onInsertRow}   
                           onCellValueChanged   = {this.event.grid.onCellValueChanged}
                           onRowClicked = {this.event.grid.onRowClicked}
                           onCellFocused = {this.event.grid.onCellFocused}
                           onCellClicked = {this.event.grid.onCellClicked}
                           onCellDoubleClicked = {this.event.grid.onCellDoubleClicked}
                           onRowDoubleClicked = {this.event.grid.onRowDoubleClicked}
                           onCellEditingStopped = {this.event.grid.onCellEditingStopped}
                           onSelectionChanged = {this.event.grid.onSelectionChanged}
                           onRowSelected = {this.event.grid.onRowSelected}
                        
                        />
                        <RelativeGroup>
                           <RFloatArea>
                              <Button
                                 id = {this.state.btnProps.btnCentSave.id}
                                 value = {this.state.btnProps.btnCentSave.value}
                                 disabled = {this.state.btnProps.btnCentSave.disabled}
                                 hidden = {this.state.btnProps.btnCentSave.hidden}
								          onClick = {this.event.button.onClick}
								          color="purple" fiiled="o" mt="5px"
                                />
                           </RFloatArea>
                        </RelativeGroup>
                     </ComponentPanel>
                     <ComponentPanel>
                        <Grid
                           id = {this.state.gridTeam.id}

                           areaName = {this.state.gridTeam.areaName}
                           height= "200px"
                           rowNum = {true}
                           header = {this.state.gridTeam.header}
                           data = {this.state.dsTeamList}
                           onGridReady = {this.event.grid.onGridReady}
                           onRowClicked = {this.event.grid.onRowClicked}
                           onCellFocused = {this.event.grid.onCellFocused}
                           onCellClicked = {this.event.grid.onCellClicked}
                           onCellDoubleClicked = {this.event.grid.onCellDoubleClicked}
                           onCellValueChanged = {this.event.grid.onCellValueChanged}
                           onRowDoubleClicked = {this.event.grid.onRowDoubleClicked}
                           onCellEditingStopped = {this.event.grid.onCellEditingStopped}
                           onSelectionChanged = {this.event.grid.onSelectionChanged}
                           onRowSelected = {this.event.grid.onRowSelected}
                           onDeleteRow = {this.event.grid.onDeleteRow}
                           onInsertRow = {this.event.grid.onInsertRow}                    
                        />
                        <RelativeGroup>
                           <RFloatArea>
                              <Button
                                 id = {this.state.btnProps.btnTeamSave.id}
                                 value = {this.state.btnProps.btnTeamSave.value}
                                 disabled = {this.state.btnProps.btnTeamSave.disabled}
                                 hidden = {this.state.btnProps.btnTeamSave.hidden}
								         onClick = {this.event.button.onClick}
                                 color="purple" fiiled="o" mt="5px"
                              />
                           </RFloatArea>
                        </RelativeGroup>
                     </ComponentPanel>
                  </FlexPanel>
               </SubFullPanel>
               <SubFullPanel>
                  <ComponentPanel>
                     <Grid
                        id = {this.state.gridStndVal.id}
               
                        areaName = {this.state.gridStndVal.areaName}
                        height= "250px"
                        header = {this.state.gridStndVal.header}
                        addRowBtn = {false}
                        delRowBtn = {false}
                        rowNum = {true}
                        data = {this.state.dsCentStndValList}
                        onGridReady = {this.event.grid.onGridReady}
                        onRowClicked = {this.event.grid.onRowClicked}
                        onCellFocused = {this.event.grid.onCellFocused}
                        onCellClicked = {this.event.grid.onCellClicked}
                        onCellDoubleClicked = {this.event.grid.onCellDoubleClicked}
                        onCellValueChanged = {this.event.grid.onCellValueChanged}
                        onRowDoubleClicked = {this.event.grid.onRowDoubleClicked}
                        onCellEditingStopped = {this.event.grid.onCellEditingStopped}
                        onSelectionChanged = {this.event.grid.onSelectionChanged}
                        onRowSelected = {this.event.grid.onRowSelected}
                        onDeleteRow = {this.event.grid.onDeleteRow}
                        onInsertRow = {this.event.grid.onInsertRow}
                     />
                     <RelativeGroup>
                        <RFloatArea>
                           <Button 
                              id = {this.state.btnProps.btnStndSave.id}
                              value = {this.state.btnProps.btnStndSave.value}
                              disabled = {this.state.btnProps.btnStndSave.disabled}
                              hidden = {this.state.btnProps.btnStndSave.hidden}
                              onClick = {this.event.button.onClick}
                              color="purple" fiiled="o" mt="5px"
                           />
                        </RFloatArea>
                     </RelativeGroup>
                  </ComponentPanel>
               </SubFullPanel>
            </FullPanel>
         </React.Fragment>
      )
   }
}

export default View;



