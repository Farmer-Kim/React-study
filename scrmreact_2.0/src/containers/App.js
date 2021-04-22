import React from 'react';
import Login from 'containers/base/common/login.js'
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
		return (
			<React.Fragment>
				{ token === "true" ? 
					( <Provider store={store}><AppMain/></Provider> )
					: 
					( <Route path={'/'} exact={false} component={Login}/> )
				}
			</React.Fragment>
		);
	}
}
export default App;
