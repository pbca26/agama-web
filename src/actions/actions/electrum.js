import {
  DASHBOARD_ELECTRUM_BALANCE,
  DASHBOARD_ELECTRUM_TRANSACTIONS,
  DASHBOARD_ELECTRUM_COINS,
} from '../storeType';
import { translate } from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import {
  triggerToaster,
  sendToAddressState,
} from '../actionCreators';
import Store from '../../store';
import agamalib from '../../agamalib';
import proxyServers from '../../util/proxyServers';

export function shepherdSelectProxy() {
  // pick a random proxy server
  const _randomServer = proxyServers[agamalib.utils.getRandomIntInclusive(0, proxyServers.length - 1)];
  appData.proxy = {
    ip: _randomServer.ip,
    port: _randomServer.port,
  };
  console.warn('shepherdSelectProxy', appData);
}

export function shepherdElectrumLock() {
  return new Promise((resolve, reject) => {
    appData.auth.status = 'locked';
    appData.keys = {};
    resolve();
  });
}

export function shepherdElectrumLogout() {
  return new Promise((resolve, reject) => {
    appData.auth.status = 'locked';
    appData.keys = {};
    appData.coins = {};
    appData.allcoins = {
      spv: [],
      total: 0,
    };
    appData.servers = {};
    resolve();
  });
}

// src: atomicexplorer
export function shepherdGetRemoteBTCFees() {
  return new Promise((resolve, reject) => {
    fetch(`http://atomicexplorer.com/api/btc/fees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdGetRemoteBTCFees',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export function shepherdElectrumSetServer(coin, address, port) {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/coins/server/set?address=${address}&port=${port}&coin=${coin}&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumSetServer',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export function shepherdElectrumCheckServerConnection(address, port) {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/servers/test?address=${address}&port=${port}&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumCheckServerConnection',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export function shepherdElectrumKeys(seed) {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seed,
        active: true,
        iguana: true,
        token: Config.token,
      }),
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumKeys',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export function shepherdElectrumBalance(coin, address) {
  return dispatch => {
    return fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/getbalance?coin=${coin}&address=${address}&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          'shepherdElectrumBalance',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(shepherdElectrumBalanceState(json));
    });
  }
}

export function shepherdElectrumBalanceState(json) {
  return {
    type: DASHBOARD_ELECTRUM_BALANCE,
    balance: json.result,
  }
}

export function shepherdElectrumTransactions(coin, address) {
  return dispatch => {
    return fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/listtransactions?coin=${coin}&address=${address}&full=true&maxlength=20&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          'shepherdElectrumTransactions',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(shepherdElectrumTransactionsState(json));
    });
  }
}

export function shepherdElectrumTransactionsState(json) {
  json = json.result;

  if (json &&
      json.error) {
    json = null;
  } else if (!json || !json.length) {
    json = 'no data';
  }

  return {
    type: DASHBOARD_ELECTRUM_TRANSACTIONS,
    txhistory: json,
  }
}

export function shepherdElectrumCoins() {
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

export function shepherdElectrumCoinsState(json) {
  return {
    type: DASHBOARD_ELECTRUM_COINS,
    electrumCoins: json.result,
  }
}

// value in sats
export function shepherdElectrumSend(coin, value, sendToAddress, changeAddress, btcFee) {
  value = Math.floor(value);

  return dispatch => {
    return fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/createrawtx?coin=${coin}&address=${sendToAddress}&value=${value}&change=${changeAddress}${btcFee ? '&btcfee=' + btcFee : ''}&gui=true&push=true&verify=true&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          'shepherdElectrumSend',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(sendToAddressState(json.msg === 'error' ? json : json.result));
    });
  }
}

export function shepherdElectrumSendPromise(coin, value, sendToAddress, changeAddress, btcFee) {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    return fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/createrawtx?coin=${coin}&address=${sendToAddress}&value=${value}&change=${changeAddress}${btcFee ? '&btcfee=' + btcFee : ''}&gui=true&push=true&verify=true&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumSendPromise',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export function shepherdElectrumSendPreflight(coin, value, sendToAddress, changeAddress, btcFee) {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/createrawtx?coin=${coin}&address=${sendToAddress}&value=${value}&change=${changeAddress}${btcFee ? '&btcfee=' + btcFee : ''}&gui=true&push=false&verify=true&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumSendPreflight',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export function shepherdElectrumListunspent(coin, address) {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/listunspent?coin=${coin}&address=${address}&full=true&token=${Config.token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumListunspent',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export function shepherdElectrumBip39Keys(seed, match, addressdepth, accounts) {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/seed/bip39/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seed,
        match,
        addressdepth,
        accounts,
        token: Config.token,
      }),
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumSetServer',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

// split utxo
export function shepherdElectrumSplitUtxoPromise(payload) {
  console.warn(payload);

  return new Promise((resolve, reject) => {
    return fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/createrawtx-split`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload,
        token: Config.token,
      }),
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          'shepherdElectrumSendPromise',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}