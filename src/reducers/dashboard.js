import {
  DASHBOARD_SECTION_CHANGE,
  GET_MAIN_ADDRESS,
  DISPLAY_CLAIM_INTEREST_MODAL,
  DISPLAY_IMPORT_KEY_MODAL,
  DASHBOARD_ELECTRUM_COINS,
  ELECTRUM_SERVER_CHANGED,
  DISPLAY_WALLET_RISKS_MODAL,
  PRICES,
} from '../actions/storeType';

const Dashboard = (state = {
  activeSection: 'wallets',
  activeHandle: null,
  displayClaimInterestModal: false,
  displayImportKeyModal: false,
  electrumCoins: {},
  eletrumServerChanged: false,
  displayWalletRisksModal: false,
  prices: null,
}, action) => {
  switch (action.type) {
    case DASHBOARD_ELECTRUM_COINS:
      return {
        ...state,
        electrumCoins: action.electrumCoins,
      };
    case DASHBOARD_SECTION_CHANGE:
      return {
        ...state,
        activeSection: action.activeSection,
      };
    case GET_MAIN_ADDRESS:
      return {
        ...state,
        activeHandle: action.activeHandle,
      };
    case DISPLAY_WALLET_RISKS_MODAL:
      return {
        ...state,
        displayWalletRisksModal: action.displayWalletRisksModal,
      };
    case DISPLAY_CLAIM_INTEREST_MODAL:
      return {
        ...state,
        displayClaimInterestModal: action.displayClaimInterestModal,
      };
      break;
    case DISPLAY_IMPORT_KEY_MODAL:
      return {
        ...state,
        displayImportKeyModal: action.displayImportKeyModal,
      };
      break;
    case ELECTRUM_SERVER_CHANGED:
      return {
        ...state,
        eletrumServerChanged: action.eletrumServerChanged,
      };
    case PRICES:
      return {
        ...state,
        prices: action.prices,
      };
    default:
      return state;
  }
}

export default Dashboard;