import {
  GET_WIF_KEY,
  LOAD_APP_CONFIG,
  LOAD_APP_INFO,
} from '../actions/storeType';

const Settings = (state = {
  wifkey: null,
  address: null,
  appSettings: null,
  appInfo: null,
}, action) => {
  switch (action.type) {
    case GET_WIF_KEY:
      return {
        ...state,
        wifkey: action.wifkey,
        address: action.address,
      };
    case LOAD_APP_CONFIG:
      return {
        ...state,
        appSettings: action.config,
      };
    case LOAD_APP_INFO:
      return {
        ...state,
        appInfo: action.info,
      };
    default:
      return state;
  }
}

export default Settings;