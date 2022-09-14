
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from 'containers/App.js';

import { createBrowserHistory } from 'history';
import { Router, Route } from 'react-router-dom';

const history = createBrowserHistory();

ReactDOM.render( <Router history={history}>  <Route path='/'  component= {App} /> </Router>, document.getElementById('root'))