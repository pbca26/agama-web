import { DASHBOARD_ELECTRUM_BALANCE } from '../storeType';
import translate from '../../translate/translate';
import { shepherdElectrumListunspent } from './listunspent';
import {
  fromSats,
  toSats,
} from 'agama-wallet-lib/src/utils';
import Config from '../../config';
import appData from './appData';

export const shepherdElectrumBalance = (coin, address) => {
  // proxyConErr = true;

  /*setTimeout(() => {
    if (proxyConErr) {
      Store.dispatch(
        triggerToaster(
          translate('INDEX.PROXY_CON_ERR'),
          translate('INDEX.ERROR'),
          'error',
          false
        )
      );
    }
  }, 20000);*/

  return dispatch => {
    fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/getbalance?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}&address=${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.shepherdElectrumBalance'),
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (appData.activeCoin === coin) {
        json = json.result;

        if (json &&
            json.hasOwnProperty('confirmed') &&
            json.hasOwnProperty('unconfirmed')) {
          if (coin === 'kmd') {
            shepherdElectrumListunspent(coin, address)
            .then((_utxoList) => {
              let _totalInterest = 0;

              for (let i = 0; i < _utxoList.length; i++) {
                if (Number(_utxoList[i].interest) > 0) {
                  _totalInterest += Number(_utxoList[i].interest);
                }
              }

              // proxyConErr = false;
              json = {
                msg: 'success',
                result: {
                  balance: Number(fromSats(json.confirmed).toFixed(8)),
                  balanceSats: json.confirmed,
                  unconfirmed: Number(fromSats(json.unconfirmed).toFixed(8)),
                  unconfirmedSats: json.unconfirmed,
                  interest: Number(_totalInterest.toFixed(8)),
                  interestSats: Math.floor(toSats(_totalInterest)),
                  total: _totalInterest > 0 ? Number((fromSats(json.confirmed) + _totalInterest).toFixed(8)) : 0,
                  totalSats: _totalInterest > 0 ? json.confirmed + Math.floor(toSats(_totalInterest)) : 0,
                },
              };
              dispatch(shepherdElectrumBalanceState(json));
            });
          } else {
            // proxyConErr = false;
            json = {
              msg: 'success',
              result: {
                balance: Number(fromSats(json.confirmed).toFixed(8)),
                balanceSats: json.confirmed,
                unconfirmed: Number(fromSats(json.unconfirmed).toFixed(8)),
                unconfirmedSats: json.unconfirmed,
              },
            };
            dispatch(shepherdElectrumBalanceState(json));
          }
        } else {
          // proxyConErr = false;
          json = {
            msg: 'error',
            result: 'error',
          };
          dispatch(shepherdElectrumBalanceState(json));
        }
      }
    });
  }
}

export const shepherdElectrumBalanceState = (json) => {
  return {
    type: DASHBOARD_ELECTRUM_BALANCE,
    balance: json.result,
  }
}