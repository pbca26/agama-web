import {
  GET_ACTIVE_COINS,
  LOGIN,
  ACTIVE_HANDLE,
  DISPLAY_LOGIN_SETTINGS_MODAL,
} from '../actions/storeType';

const Main = (state = {
  isLoggedIn: false,
  displayLoginSettingsModal: false,
  total: 0,
}, action) => {
  switch (action.type) {
    case GET_ACTIVE_COINS:
      return {
        ...state,
        coins: action.coins,
        total: action.total,
      };
    case LOGIN:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
      };
    case ACTIVE_HANDLE:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        activeHandle: action.handle,
      };
    case DISPLAY_LOGIN_SETTINGS_MODAL:
      return {
        ...state,
        displayLoginSettingsModal: action.displayLoginSettingsModal,
      };
    default:
      return state;
  }
}

export default Main;