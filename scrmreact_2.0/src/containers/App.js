import React from 'react';
import Login from 'containers/base/common/login.js'

import {Player} from 'components';
import AppMain from 'containers/base';

import { Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../store';

// const NotFound = () => <h1>404.. This page is not found!</h1>

class App extends React.Component{
	componentDidMount(){

	}
	componentWillUnmount() {
		
	}
	render () {
		const token = sessionStorage.getItem('token');
		const token_TA = sessionStorage.getItem('token_TA');
		let option = { width: '600px', height: '740px', modaless: true, UUID : "2a7db5cc-bc32-11eb-ac33-e0071bf4b204", useUuid: true, JOB_TP: "11", srchText: null, disAllowEdit: true}
		
		// UUID 는 session 으로 들고 들어 가는게 가장 간단한 방법일듯
		// JOB_TP === 'C' > sftp 통신으로 파일 받아야함
		return (
			<React.Fragment>
				{ token !== "true" ? 
					<Route path={'/'} exact={false} component={Login}/>
					: 
					token_TA !== "true" ? 
						<Provider store={store}><AppMain/></Provider> 
						:
						<div style={{width: '600px', height: '740px'}}>
							<Player ctrNo={11} callId = {11} options ={option} popupdivid ={"qwe"}/>
						</div>
				}
			</React.Fragment>
		);
	}
}
export default App;
