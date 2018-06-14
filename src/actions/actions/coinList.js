import { triggerToaster } from '../actionCreators';
import Config from '../../config';
import Store from '../../store';
import { translate } from '../../translate/translate';
import appData from './appData';

export const shepherdStopCoind = (coin) => {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/coind/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: coin === 'KMD' ? JSON.stringify({ token: Config.token }) : JSON.stringify({ chain: coin, token: Config.token }),
    })
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          'shepherdStopCoind',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
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

export const shepherdGetCoinList = () => {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/coinslist?token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdGetCoinList',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const shepherdPostCoinList = (data) => {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/coinslist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: data,
        token: Config.token,
      }),
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdPostCoinList',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const shepherdClearCoindFolder = (coin, keepWalletDat) => {
  return new Promise((resolve, reject) => {
    fetch(keepWalletDat ? `http://127.0.0.1:${Config.agamaPort}/shepherd/kick?coin=${coin}&keepwallet=true&token=${Config.token}` : `http://127.0.0.1:${Config.agamaPort}/shepherd/kick?coin=${coin}&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdClearCoindFolder',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}