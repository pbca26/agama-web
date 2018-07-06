import { ACTIVE_HANDLE } from '../storeType';
import { translate } from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import {
  triggerToaster,
  toggleAddcoinModal,
  getDexCoins,
  shepherdElectrumCoins,
  shepherdSelectRandomCoinServer,
} from '../actionCreators';
import {
  checkCoinType,
  checkAC,
} from '../../components/addcoin/payload';
import {
  keys,
  coin as _coin,
  btcnetworks,
} from 'agama-wallet-lib/src/index-fe';

const iguanaActiveHandleState = (json) => {
  return {
    type: ACTIVE_HANDLE,
    isLoggedIn: json.status === 'unlocked' ? true : false,
    handle: json,
  }
}

export const activeHandle = () => {
  return dispatch => {
    return dispatch(
      iguanaActiveHandleState(appData.auth)
    );
  }
}

export const shepherdElectrumAuth = (seed) => {
  let _pubKeys = {};

  for (let i = 0; i < appData.coins.length; i++) {
    if (_coin.isKomodoCoin(appData.coins[i]) || Config.whitelabel) {
      appData.keys[appData.coins[i]] = keys.stringToWif(seed, btcnetworks.kmd, true);
    } else {
      appData.keys[appData.coins[i]] = keys.stringToWif(seed, btcnetworks[appData.coins[i]], true);
    }
  }

  appData.auth.status = 'unlocked';

  return dispatch => {
    dispatch(activeHandle());
    dispatch(shepherdElectrumCoins());
  };
}

export const shepherdElectrumAddCoin = (coin) => {
  return dispatch => {
    return dispatch(
      addCoinResult(coin, '0')
    );
  }
}

export const addCoin = (coin, mode, startupParams) => {
  return dispatch => {
    dispatch(shepherdElectrumAddCoin(coin.toLowerCase()));
  }
}

export const addCoinResult = (coin, mode) => {
  const modeToValue = {
    '0': 'spv',
  };

  if (!appData.coins[coin]) {
    appData.coins.push(coin);
    appData.allcoins.spv.push(coin);
    appData.allcoins.total++;

    if (Object.keys(appData.keys).length) {
      if (_coin.isKomodoCoin(coin) || Config.whitelabel) {
        appData.keys[coin] = keys.stringToWif(appData.keys[Object.keys(appData.keys)[0]].priv, btcnetworks.kmd, true);
      } else {
        appData.keys[coin] = keys.stringToWif(appData.keys[Object.keys(appData.keys)[0]].priv, btcnetworks[coin], true);
      }
    }
  }

  return dispatch => {
    if (!Config.whitelabel) {
      dispatch(
        triggerToaster(
          `${coin.toUpperCase()} ${translate('TOASTR.STARTED_IN')} ${modeToValue[mode].toUpperCase()} ${translate('TOASTR.MODE')}`,
          translate('TOASTR.COIN_NOTIFICATION'),
          'success'
        )
      );
    }
    dispatch(toggleAddcoinModal(false, false));

    shepherdSelectRandomCoinServer(coin);
    dispatch(activeHandle());
    dispatch(shepherdElectrumCoins());
    dispatch(getDexCoins());
  }
}