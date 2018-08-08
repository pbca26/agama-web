import { ACTIVE_HANDLE } from '../storeType';
import translate from '../../translate/translate';
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
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import { stringToWif } from 'agama-wallet-lib/src/keys';

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
  for (let i = 0; i < appData.coins.length; i++) {
    if (isKomodoCoin(appData.coins[i]) ||
        (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === appData.coins[i])) {
      appData.keys[appData.coins[i]] = stringToWif(seed, btcNetworks.kmd, true);
    } else {
      appData.keys[appData.coins[i]] = stringToWif(seed, btcNetworks[appData.coins[i]], true);
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
  if (!appData.coins[coin]) {
    appData.coins.push(coin);
    appData.allcoins.spv.push(coin);
    appData.allcoins.total++;

    if (Object.keys(appData.keys).length) {
      if (isKomodoCoin(coin) ||
          (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin)) {
        appData.keys[coin] = stringToWif(appData.keys[Object.keys(appData.keys)[0]].priv, btcNetworks.kmd, true);
      } else {
        appData.keys[coin] = stringToWif(appData.keys[Object.keys(appData.keys)[0]].priv, btcNetworks[coin], true);
      }
    }
  }

  return dispatch => {
    if (!Config.whitelabel ||
        (Config.whitelabel && coin !== Config.wlConfig.coin.ticker.toLowerCase())) {
      dispatch(
        triggerToaster(
          `${coin.toUpperCase()} ${translate('TOASTR.STARTED_IN')} ${translate('INDEX.LITE')} ${translate('TOASTR.MODE')}`,
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