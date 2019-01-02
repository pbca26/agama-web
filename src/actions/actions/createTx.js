import translate from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import Store from '../../store';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import transactionBuilder from 'agama-wallet-lib/src/transaction-builder';
import urlParams from '../../util/url';
import {
  triggerToaster,
  sendToAddressState,
} from '../actionCreators';
import { shepherdElectrumListunspent } from './listunspent';

export const shepherdElectrumSendPromise = (coin, value, sendToAddress, changeAddress, fee, push) => {
  const _serverEndpoint = `${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}`;
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    shepherdElectrumListunspent(coin, changeAddress)
    .then((utxoList) => {
      let _network;

      if (isKomodoCoin(coin) ||
          (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin && !Config.wlConfig.coin.type)) {
        _network = btcNetworks[coin] || btcNetworks.kmd;
      } else {
        _network = btcNetworks[coin];
      }

      if (Config.whitelabel &&
          Config.wlConfig.coin.ticker.toLowerCase() === coin &&
          Config.wlConfig.coin.network) {
        _network = Config.wlConfig.coin.network;
      }

      let _data = transactionBuilder.data(
        _network,
        value,
        fee,
        sendToAddress,
        changeAddress,
        utxoList
      );

      Config.log('send data', _data);

      let _tx = transactionBuilder.transaction(
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

      if (coin.toUpperCase() === 'KMD' &&
          _data.totalInterest > 0) {
        fee = fee * 2;
        value = value - 10000;
        Config.log('double kmd interest fee');

        _data = transactionBuilder.data(
          _network,
          value,
          fee,
          sendToAddress,
          changeAddress,
          utxoList
        );

        Config.log('send data', _data);

        _tx = transactionBuilder.transaction(
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
      }

      if (push) {
        fetch(`${_serverEndpoint}/api/pushtx`, {
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
                JSON.stringify(txid).indexOf('bad-txns-inputs-spent') > -1) {
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
                if (JSON.stringify(txid).indexOf('bad-txns-in-belowout') > -1) {
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
                    JSON.stringify(txid).indexOf('bad-txns-in-belowout') > -1) {
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
            totalInterest: _data.totalInterest,
          },
        });
      }
    });
  });
}