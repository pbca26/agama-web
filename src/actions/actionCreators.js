import 'whatwg-fetch';
import 'bluebird';

import translate from '../translate/translate';
import {
  GET_ACTIVE_COINS,
  DASHBOARD_ACTIVE_ADDRESS,
  DASHBOARD_ACTIVE_SECTION,
  DASHBOARD_ACTIVE_TXINFO_MODAL,
  DASHBOARD_ACTIVE_COIN_SEND_FORM,
  DASHBOARD_ACTIVE_COIN_RECEIVE_FORM,
  DASHBOARD_ACTIVE_COIN_RESET_FORMS,
  ADD_TOASTER_MESSAGE,
  REMOVE_TOASTER_MESSAGE,
  DISPLAY_ADDCOIN_MODAL,
  GET_MAIN_ADDRESS,
  DASHBOARD_SECTION_CHANGE,
  DASHBOARD_ACTIVE_COIN_CHANGE,
  ACTIVE_COIN_GET_ADDRESSES,
  DISPLAY_LOGIN_SETTINGS_MODAL,
  DISPLAY_CLAIM_INTEREST_MODAL,
  START_INTERVAL,
  STOP_INTERVAL,
  GET_PIN_LIST,
  DISPLAY_IMPORT_KEY_MODAL,
  ELECTRUM_SERVER_CHANGED,
  DASHBOARD_REMOVE_COIN,
  DASHBOARD_ACTIVE_COIN_SENDTO,
  DISPLAY_WALLET_RISKS_MODAL,
} from './storeType';

export * from './actions/coinList';
export * from './actions/addCoin';
export * from './actions/copyAddress';
export * from './actions/dexCoins';
export * from './actions/electrum';
export * from './actions/atomicexplorer';
// export * from './actions/tools';

export const changeActiveAddress = (address) => {
  return {
    type: DASHBOARD_ACTIVE_ADDRESS,
    address,
  }
}

export const toggleDashboardActiveSection = (name) => {
  return {
    type: DASHBOARD_ACTIVE_SECTION,
    section: name,
  }
}

export const toggleDashboardTxInfoModal = (display, txIndex) => {
  return {
    type: DASHBOARD_ACTIVE_TXINFO_MODAL,
    showTransactionInfo: display,
    showTransactionInfoTxIndex: txIndex,
  }
}

export const toggleSendCoinFormState = (display) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_SEND_FORM,
    send: display,
  }
}

export const toggleReceiveCoinFormState = (display) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_RECEIVE_FORM,
    receive: display,
  }
}

export const triggerToaster = (message, title, _type, autoClose = true, className) => {
  return {
    type: ADD_TOASTER_MESSAGE,
    message,
    title,
    _type,
    autoClose,
    className,
  }
}

// triggers removing of the toast with the provided toastId
export const dismissToaster = (toastId) => {
  return {
    type: REMOVE_TOASTER_MESSAGE,
    toastId: toastId,
  }
}

export const toggleAddcoinModalState = (display, isLogin) => {
  return {
    type: DISPLAY_ADDCOIN_MODAL,
    display: display,
    isLogin: isLogin,
  }
}

export const dashboardCoinsState = (json) => {
  return {
    type: GET_ACTIVE_COINS,
    coins: json,
    total: json.total,
  }
}

export const getMainAddressState = (json) => {
  return {
    type: GET_MAIN_ADDRESS,
    activeHandle: json,
  }
}

export const toggleSendCoinForm = (display) => {
  return dispatch => {
    dispatch(toggleSendCoinFormState(display));
  }
}

export const toggleReceiveCoinForm = (display) => {
  return dispatch => {
    dispatch(toggleReceiveCoinFormState(display));
  }
}

export const dashboardChangeSectionState = (sectionName) => {
  return {
    type: DASHBOARD_SECTION_CHANGE,
    activeSection: sectionName,
  }
}

export const dashboardChangeSection = (sectionName) => {
  return dispatch => {
    dispatch(dashboardChangeSectionState(sectionName));
  }
}

export const dashboardChangeActiveCoinState = (coin, mode, skipCoinsArrayUpdate) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_CHANGE,
    coin: coin,
    mode: mode,
    skip: skipCoinsArrayUpdate,
  }
}

export const dashboardChangeActiveCoin = (coin, mode, skipCoinsArrayUpdate) => {
  window.activeCoin = coin;

  return dispatch => {
    dispatch(dashboardChangeActiveCoinState(coin, mode, skipCoinsArrayUpdate));
  }
}

export const toggleAddcoinModal = (display, isLogin) => {
  return dispatch => {
    dispatch(toggleAddcoinModalState(display, isLogin));
  }
}

export const dismissToasterMessage = (toastId) => {
  return dispatch => {
    dispatch(dismissToaster(toastId));
  }
}

export const getNativeTxHistoryState = (json) => {
  if (json &&
      json.error) {
    json = null;
  } else if (json && json.result && json.result.length) {
    json = json.result;
  } else if (!json || (!json.result || !json.result.length)) {
    json = 'no data';
  }

  return {
    type: DASHBOARD_ACTIVE_COIN_NATIVE_TXHISTORY,
    txhistory: json,
  }
}

export const startInterval = (name, handle) => {
  return {
    type: START_INTERVAL,
    name,
    handle,
  }
}

export const stopInterval = (name, intervals) => {
  clearInterval(intervals[name]);

  return {
    type: STOP_INTERVAL,
    name,
  }
}

export const toggleLoginSettingsModal = (display) => {
  return {
    type: DISPLAY_LOGIN_SETTINGS_MODAL,
    displayLoginSettingsModal: display,
  }
}

export const toggleClaimInterestModal = (display) => {
  return {
    type: DISPLAY_CLAIM_INTEREST_MODAL,
    displayClaimInterestModal: display,
  }
}

export const getPinList = (pinList) => {
  return {
    type: GET_PIN_LIST,
    pinList: pinList,
  }
}

export const displayImportKeyModal = (display) => {
  return {
    type: DISPLAY_IMPORT_KEY_MODAL,
    displayImportKeyModal: display,
  }
}

export const electrumServerChanged = (isChanged) => {
  return {
    type: ELECTRUM_SERVER_CHANGED,
    eletrumServerChanged: isChanged,
  }
}

export const dashboardRemoveCoin = (coin) => {
  return {
    type: DASHBOARD_REMOVE_COIN,
    coin,
  }
}

export const toggleWalletRisksModal = (display) => {
  return {
    type: DISPLAY_WALLET_RISKS_MODAL,
    displayWalletRisksModal: display,
  }
}

export const clearLastSendToResponseState = () => {
  return {
    type: DASHBOARD_ACTIVE_COIN_SENDTO,
    lastSendToResponse: null,
  }
}

export const sendToAddressState = (json) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_SENDTO,
    lastSendToResponse: json,
  }
}