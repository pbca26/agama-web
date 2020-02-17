import {
  ACTIVE_HANDLE,
  DASHBOARD_ELECTRUM_COINS,
} from '../storeType';
import translate from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import {
  triggerToaster,
  toggleAddcoinModal,
  shepherdSelectRandomCoinServer,
  dashboardCoinsState,
} from '../actionCreators';
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
        (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === appData.coins[i] && !Config.wlConfig.coin.type)) {
      appData.keys[appData.coins[i]] = stringToWif(seed, btcNetworks.kmd, true);
    } else {
      appData.keys[appData.coins[i]] = stringToWif(seed, btcNetworks[appData.coins[i]], true);
    }
    appData.isWatchOnly = appData.keys[appData.coins[i]].priv === appData.keys[appData.coins[i]].pub ? true : false;
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
          (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin && !Config.wlConfig.coin.type)) {
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
          `${coin.toUpperCase()} ${translate('TOASTR.STARTED_IN')}`,
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

export const shepherdRemoveCoin = (coin, mode) => {
  return new Promise((resolve, reject, dispatch) => {
    delete appData.keys[coin];
    appData.coins = appData.coins.filter(item => item !== coin);
    appData.allcoins = {
      spv: appData.coins,
      total: appData.coins.length,
    };
    delete appData.servers[coin];

    if (!appData.coins ||
        !appData.coins.length) {
      appData.auth.status = 'locked';
    }
    resolve();
  });
}

export const shepherdElectrumKeys = (seed) => {
  return new Promise((resolve, reject) => {
    const keys = stringToWif(seed, (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === Object.keys(appData.keys)[0] && !Config.wlConfig.coin.type) ? btcNetworks.kmd : btcNetworks[Object.keys(appData.keys)[0]], true);

    if (keys.priv === appData.keys[Object.keys(appData.keys)[0]].priv) {
      resolve({ result: appData.keys });
    } else {
      resolve('error');
    }
  });
}

export const shepherdElectrumCoins = () => {
  let _coins = {};

  for (let i = 0; i < appData.coins.length; i++) {
    if (appData.keys[appData.coins[i]]) {
      _coins[appData.coins[i]] = {
        pub: appData.keys[appData.coins[i]].pub,
      };
    } else {
      _coins[appData.coins[i]] = {};
    }
  }

  return dispatch => {
    return dispatch(shepherdElectrumCoinsState({ result: _coins }));
  }
}

export const shepherdElectrumCoinsState = (json) => {
  return {
    type: DASHBOARD_ELECTRUM_COINS,
    electrumCoins: json.result,
  }
}

export const getDexCoins = () => {
  return dispatch => {
    return dispatch(
      dashboardCoinsState(appData.allcoins)
    );
  }
}