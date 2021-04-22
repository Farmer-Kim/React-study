import LOGIN from 'containers/base/common/login.js';
import COM010000 from 'containers/com/COM010000';
export const sampleRoute = [
	{ id: 'LOGIN',		path: "/",				exact: true,	component: LOGIN },
	{ id: 'COM010000',	path: "/com/COM010000",	exact: true,	component: COM010000 },
];