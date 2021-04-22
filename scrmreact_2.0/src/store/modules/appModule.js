import { createAction, handleActions} from 'redux-actions';

const ADD_POP = 'base/ADD_POP';
const DELETE_POP = 'base/DELETE_POP';
const DELETE_ALL_POP = 'base/DELETE_ALL_POP';
const SELECT_POP = 'base/SELECT_POP';
const ADD_TRAY = 'base/ADD_TRAY';
const DELETE_TRAY = 'base/DELETE_TRAY';
const DELETE_ALL_TRAY = 'base/DELETE_ALL_TRAY';
const SELECT_TRAY = 'base/SELECT_TRAY';
const PREVIOUS_TRAY = 'base/PREVIOUS_TRAY';
const NEXT_TRAY = 'base/NEXT_TRAY';

export const addTray	= createAction(ADD_TRAY);
export const delTray	= createAction(DELETE_TRAY);
export const delAllTray	= createAction(DELETE_ALL_TRAY);
export const selectTray	= createAction(SELECT_TRAY);
export const prevTray	= createAction(PREVIOUS_TRAY);
export const nextTray	= createAction(NEXT_TRAY);

export const addPop		= createAction(ADD_POP);
export const delPop		= createAction(DELETE_POP);
export const delAllPop	= createAction(DELETE_ALL_POP);
export const selectPop	= createAction(SELECT_POP);

const initState = {
	selected : '',
	tray : [],
	popupList : []
}

export default handleActions ({
	[ADD_POP] : (state, { payload : popup }) => {
		return { ...state, popupList : state.popupList.concat(popup) };
	},
	[DELETE_POP] : (state, { payload : popup }) => {
		return { ...state, popupList : state.popupList.filter(item => item.id !== popup.id) };
	},
	[DELETE_ALL_POP] : (state, action) => {
		return { ...state , popupList : [] };
	},
	[SELECT_POP] : (state, { payload : popup }) => {
		return { ...state, popupList : state.popupList.filter(item => item.id !== popup.id) };
	},
	[ADD_TRAY] : (state, { payload : menu }) => {
		if (state.tray.indexOf(state.tray.filter(item => item.MNU_ID === menu.MNU_ID)[0]) < 0) {
			return {
				...state,
				tray: state.tray.concat(menu),
				selected : menu
			}
		} else {
			return {
				...state,
				tray: state.tray,
				selected : menu
			}
		}
	},
	[DELETE_TRAY] : (state, { payload : menu }) => {
		if (parseInt(state.tray.findIndex(element => element === menu)) !== 0) {
			return {
				...state,
				tray : state.tray.filter(item => item.MNU_ID !== menu.MNU_ID),
				selected : state.tray[parseInt(state.tray.findIndex(element => element.MNU_ID === menu.MNU_ID)) - 1]
			};
		} else {
			return state;
		}
	},
	[DELETE_ALL_TRAY] : (state, action) => {
		return {
			...state,
			tray : [state.tray[0]],
			selected : state.tray[0]
		};
	},
	[SELECT_TRAY] : (state, { payload : menu }) => {
		return {
			...state,
			tray: state.tray,
			selected : menu
		}
	},
	[PREVIOUS_TRAY] : (state, { payload : menu }) => {
		if (parseInt(state.tray.findIndex(element => element === menu)) === 0) {
			return {
				...state,
				tray: state.tray,
				selected : menu
			}
		} else {
			return {
				...state,
				tray: state.tray,
				selected : state.tray[parseInt(state.tray.findIndex(element => element === menu)) - 1]
			}
		}
	},
	[NEXT_TRAY] : (state, { payload : menu }) => {
		if(parseInt(state.tray.findIndex(element => element === menu)) === state.tray.length-1) {
			return {
				...state,
				tray: state.tray,
				selected : menu
			}
		} else {
			return {
				...state,
				tray: state.tray,
				selected : state.tray[parseInt(state.tray.findIndex(element => element === menu)) + 1]
			}
		}
	}
}, initState);

