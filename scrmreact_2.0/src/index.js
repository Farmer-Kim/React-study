import React from 'react';
import ReactDOM from 'react-dom';
import App from 'containers/App.js';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import { createBrowserHistory } from 'history';
import { Router, Route } from 'react-router-dom';

const history = createBrowserHistory();

//ReactDOM.render( <App />,  document.getElementById('root'));
ReactDOM.render( <Router history={history}>  <Route path='/'  component= {App} /> </Router>, document.getElementById('root'));