import translate from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import Store from '../../store';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import urlParams from '../../util/url';
import {
  triggerToaster,
  sendToAddressState,
} from '../actionCreators';

// value in sats
export const shepherdElectrumSend = (coin, value, sendToAddress, changeAddress, btcFee) => {
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
          translate('API.shepherdElectrumSend'),
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

export const shepherdElectrumSendPromise = (coin, value, sendToAddress, changeAddress, fee, push) => {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    shepherdElectrumListunspent(coin, changeAddress)
    .then((utxoList) => {
      let _network;

      if (isKomodoCoin(coin) ||
          (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin)) {
        _network = btcNetworks.kmd;
      } else {
        _network = btcNetworks[coin];
      }

      const _data = transactionBuilder.data(
        _network,
        value,
        fee,
        sendToAddress,
        changeAddress,
        utxoList
      );

      Config.log('send data', _data);

      const _tx = transactionBuilder.transaction(
        sendToAddress,
        changeAddress,
        appData.keys[coin].priv,
        _network,
        _data.inputs,
        _data.change,
        _data.value
      );

      // TODO: err
      Config.log('send tx', _tx);

      if (push) {
        fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/pushtx`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            port: appData.servers[coin].port,
            ip: appData.servers[coin].ip,
            proto: appData.servers[coin].proto,
            rawtx: _tx,
          }),
        })
        .catch((error) => {
          console.log(error);
          Store.dispatch(
            triggerToaster(
              translate('API.shepherdElectrumSend'),
              'Error',
              'error'
            )
          );
        })
        .then(response => response.json())
        .then(json => {
          let result = json;

          if (result.msg === 'error') {
            const _err = {
              msg: 'error',
              result: translate('API.PUSH_ERR'),
            };
            Store.dispatch(sendToAddressState(_err));
            resolve(_err);
          } else {
            const txid = json.result;
            const _rawObj = {
              utxoSet: _data.inputs,
              change: _data.change,
              changeAdjusted: _data.change,
              totalInterest: _data.totalInterest,
              fee: _data.fee,
              value: _data.value,
              outputAddress: sendToAddress,
              changeAddress,
              rawtx: _tx,
              txid,
              utxoVerified: _data.utxoVerified,
            };

            if (txid &&
                txid.indexOf('bad-txns-inputs-spent') > -1) {
              const retObj = {
                msg: 'error',
                result: translate('API.BAD_TX_INPUTS_SPENT'),
                raw: _rawObj,
              };

              Store.dispatch(sendToAddressState(retObj));
              resolve(retObj);
            } else {
              if (txid &&
                  txid.length === 64) {
                if (txid.indexOf('bad-txns-in-belowout') > -1) {
                  const retObj = {
                    msg: 'error',
                    result: translate('API.BAD_TX_INPUTS_SPENT'),
                    raw: _rawObj,
                  };

                  Store.dispatch(sendToAddressState(retObj));
                  resolve(retObj);
                } else {
                  const retObj = {
                    msg: 'success',
                    result: _rawObj,
                    txid: _rawObj.txid,
                  };

                  Store.dispatch(sendToAddressState(retObj));
                  resolve(retObj);
                }
              } else {
                if (txid &&
                    txid.indexOf('bad-txns-in-belowout') > -1) {
                  const retObj = {
                    msg: 'error',
                    result: translate('API.BAD_TX_INPUTS_SPENT'),
                    raw: _rawObj,
                  };

                  dispatch(sendToAddressState(retObj));
                  resolve(retObj);
                } else {
                  const retObj = {
                    msg: 'error',
                    result: translate('API.CANT_BROADCAST_TX'),
                    raw: _rawObj,
                  };

                  Store.dispatch(sendToAddressState(retObj));
                  resolve(retObj);
                }
              }
            }
          }
        });
      } else {
        resolve({
          msg: 'success',
          result: {
            fee: _data.fee,
            value: _data.value,
            change: _data.change,
            utxoVerified: _data.utxoVerified,
            estimatedFee: _data.estimatedFee,
          },
        });
      }
    });
  });
}