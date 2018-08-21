// TODO: split

import { DASHBOARD_ELECTRUM_COINS } from '../storeType';
import Config from '../../config';
import appData from './appData';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import { stringToWif } from 'agama-wallet-lib/src/keys';

export const shepherdElectrumKeys = (seed) => {
  return new Promise((resolve, reject) => {
    const keys = stringToWif(seed, (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === Object.keys(appData.keys)[0]) ? btcNetworks.kmd : btcNetworks[Object.keys(appData.keys)[0]], true);

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