import React from 'react'
import {ComLib, TransManager, StrLib} from 'common';

class PwdInit extends React.Component {
    constructor(props){
        super(props);
        // state 초기화
        this.state = {
            open : false,
            param : {
                id : '',
                name : '',
                telNo : ''
             }
        }
        // 이벤트 바인딩
        this.event.button.onClick = this.event.button.onClick.bind(this);
        this.event.input.onChange = this.event.input.onChange.bind(this)
    }
    /*------------------------------------------------------------------------------------------------*/
    // [2. OnLoad Event Zone]
    /*------------------------------------------------------------------------------------------------*/
    /*------------------------------------------------------------------------------------------------*/
    // [3. validation Event Zone]
    //  - validation 관련 정의
    /*------------------------------------------------------------------------------------------------*/
    validation = (id) => {
        switch (id) {
            // 로그인 체크
            case 'PWD_INIT_C01' :
                if (StrLib.isNull(this.state.param.id)) {
                    ComLib.openDialog('A', 'ID를 입력해 주세요.');
                    return false;
                }
                if (StrLib.isNull(this.state.param.name)) {
                    ComLib.openDialog('A', '사용자 성명을 입력해 주세요.');
                    return false;
                }
                if (StrLib.isNull(this.state.param.telNo)) {
                    ComLib.openDialog('A', '전화번호를 입력해 주세요.');
                    return false;
                }
                return true;
            default :
                break;
        }
    }
    /*------------------------------------------------------------------------------------------------*/
    // [4. transaction Event Zone]
    //  - transaction 관련 정의
    /*------------------------------------------------------------------------------------------------*/
    transaction = (transId) => {
        console.log('transaction start');
        let transManager = new TransManager();
        try  {
            switch (transId) {
                // 로그인 체크
                case 'PWD_INIT_C01' :
                    transManager.setTransId(transId);
                    transManager.setTransUrl(transManager.constants.url.init);
                    transManager.setCallBack(this.callback);
                    transManager.addConfig({
                        dao: transManager.constants.dao.base,
                        crudh: transManager.constants.crudh.create,
                        // sqlmapid:"COM.C_doInitPwd",
                        datasetsend:"dsSendData",
                        datasetrecv:"dsRecvData",
                    });
                    transManager.addDataset('dsSendData', [{ USR_ID : this.state.param.id, USR_NM: this.state.param.name, TEL_NO: this.state.param.birth }]);
                    transManager.agent();
                    break;

                default :
                    break;
            }
        } catch (err) {
            console.log(err);
            alert(err);
        }
    }

    /*------------------------------------------------------------------------------------------------*/
    // [5. Callback Event Zone]
    //  - Callback 관련 정의
    /*------------------------------------------------------------------------------------------------*/
    callback = (res) => {
        console.log('callback start');
        console.log(res);
        try  {
            switch (res.id) {
                case 'PWD_INIT_C01' :
                    console.log(res.data);
                    alert(res.data.dsRecvData.password);
                    this.props.onClose();
                    break;
                default :
                    break;
            }
        } catch (err) {
            console.log(err);
            alert(err);
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
                    case 'btnPwdInitConfirm' : 
                        if (this.validation('PWD_INIT_C01')) {
                            this.transaction('PWD_INIT_C01');
                        }
                        break;
                    case 'btnPwdInitCancel' :
                        this.props.onClose();
                        break;
                    default : break;
                }
            }
        },
        input : {
            onChange : (e) => {
                switch (e.target.id) {
                    case 'txtInitId'    : this.setState({...this.state, param : {...this.state.param, id : e.target.value}}); break;
                    case 'txtInitPwd'   : this.setState({...this.state, param : {...this.state.param, name : e.target.value}}); break;
                    case 'txtInitTelNo' : this.setState({...this.state, param : {...this.state.param, telNo : e.target.value}}); break;
                    default: break;
                }
            }
        }
    }
    componentDidMount(){
    }
    render () {
        return (
            <div className="scrm-pwdinit">
                <div className="scrm-pwd-init-div">
                    <div className = 'scrm-login-input'>
                        <label>ID</label>
                        <input style={{width: '100%'}} type="text" id = 'txtInitId' value={this.state.param.id} placeholder={'사용자 ID를 입력하세요.'} onChange = {this.event.input.onChange}/>
                    </div> 
                    <div className = 'scrm-login-input'>
                        <label>성명</label>
                        <input style={{width: '100%'}} type="text" id = 'txtInitPwd' value={this.state.param.name} placeholder={'성명을 입력하세요.'} onChange = {this.event.input.onChange}/>
                    </div>
                    <div className = 'scrm-login-input'>
                        <label>전화번호</label>
                        <input style={{width: '100%'}} type="text" id = 'txtInitTelNo' value={this.state.param.telNo} placeholder={'전화번호를 입력하세요.'} onChange = {this.event.input.onChange}/>
                    </div>
                    <div className = 'scrm-login-btn-div'>
                        <div className = 'scrm-login-btn'><button id='btnPwdInitConfirm' onClick = {this.event.button.onClick}>{'확인'}</button></div>
                        <div className = 'scrm-login-btn'><button id='btnPwdInitCancel' onClick = {this.event.button.onClick}>{'취소'}</button></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PwdInit;