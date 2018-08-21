import { DASHBOARD_ELECTRUM_TRANSACTIONS } from '../storeType';
import translate from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import { triggerToaster } from '../actionCreators';
import Store from '../../store';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import transactionType from 'agama-wallet-lib/src/transaction-type';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import transactionDecoder from 'agama-wallet-lib/src/transaction-decoder';
import {
  fromSats,
  toSats,
} from 'agama-wallet-lib/src/utils';
import urlParams from '../../util/url';
import getCache from './cache';

export const shepherdElectrumTransactions = (coin, address, full = true, verify = false) => {
  return dispatch => {
    // get current height
    fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/getcurrentblock?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.shepherdElectrumTransactions+getcurrentblock-remote'),
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (window.activeCoin === coin) {
        let result = json;

        if (result.msg === 'error') {
          Store.dispatch(shepherdElectrumTransactionsState({ error: 'error' }));
        } else {
          const currentHeight = result.result;

          Config.log('currentHeight =>');
          Config.log(currentHeight);

          fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/listtransactions?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}&address=${address}&raw=true`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .catch((error) => {
            console.log(error);
            Store.dispatch(
              triggerToaster(
                translate('API.shepherdElectrumTransactions+listtransactions'),
                'Error',
                'error'
              )
            );
          })
          .then(response => response.json())
          .then(json => {
            result = json;

            if (result.msg !== 'error') {
              // parse listtransactions
              const json = result.result;
              let _transactions = [];

              if (json &&
                  json.length) {
                let _rawtx = [];

                Promise.all(json.map((transaction, index) => {
                  return new Promise((resolve, reject) => {
                    fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/getblockinfo?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}&address=${address}&height=${transaction.height}`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    })
                    .catch((error) => {
                      console.log(error);
                      Store.dispatch(
                        triggerToaster(
                          translate('API.shepherdElectrumTransactions+getblockinfo'),
                          'Error',
                          'error'
                        )
                      );
                    })
                    .then(response => response.json())
                    .then(json => {
                      result = json;

                      Config.log('getblock =>');
                      Config.log(result);

                      if (result.msg !== 'error') {
                        const blockInfo = result.result;

                        Config.log('electrum gettransaction ==>');
                        Config.log(`${index} | ${(transaction.raw.length - 1)}`);
                        Config.log(transaction.raw);

                        // decode tx
                        const _network = isKomodoCoin(coin) || (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin) ? btcNetworks.kmd : btcNetworks[coin];
                        const decodedTx = transactionDecoder(transaction.raw, _network);

                        let txInputs = [];

                        Config.log(_network);
                        Config.log('decodedtx =>');
                        Config.log(decodedTx.outputs);

                        if (decodedTx &&
                            decodedTx.inputs) {
                          Promise.all(decodedTx.inputs.map((_decodedInput, index) => {
                            return new Promise((_resolve, _reject) => {
                              if (_decodedInput.txid !== '0000000000000000000000000000000000000000000000000000000000000000') {
                                const _cachedTx = getCache(coin, 'txs', _decodedInput.txid);

                                if (_cachedTx) {
                                  const decodedVinVout = transactionDecoder(_cachedTx, _network);

                                  Config.log('electrum raw input tx ==>');

                                  if (decodedVinVout) {
                                    Config.log(decodedVinVout.outputs[_decodedInput.n], true);
                                    txInputs.push(decodedVinVout.outputs[_decodedInput.n]);
                                    _resolve(true);
                                  } else {
                                    _resolve(true);
                                  }
                                } else {
                                  fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/gettransaction?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}&address=${address}&txid=${_decodedInput.txid}`, {
                                    method: 'GET',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                  })
                                  .catch((error) => {
                                    console.log(error);
                                    Store.dispatch(
                                      triggerToaster(
                                        translate('API.shepherdElectrumTransactions+getblockinfo'),
                                        'Error',
                                        'error'
                                      )
                                    );
                                  })
                                  .then(response => response.json())
                                  .then(json => {
                                    result = json;

                                    Config.log('gettransaction =>');
                                    Config.log(result);

                                    if (result.msg !== 'error') {
                                      const decodedVinVout = transactionDecoder(result.result, _network);

                                      getCache(coin, 'txs', _decodedInput.txid, result.result);
                                      Config.log('electrum raw input tx ==>');

                                      if (decodedVinVout) {
                                        Config.log(decodedVinVout.outputs[_decodedInput.n], true);
                                        txInputs.push(decodedVinVout.outputs[_decodedInput.n]);
                                        _resolve(true);
                                      } else {
                                        _resolve(true);
                                      }
                                    }
                                  });
                                }
                              } else {
                                _resolve(true);
                              }
                            });
                          }))
                          .then(promiseResult => {
                            const _parsedTx = {
                              network: decodedTx.network,
                              format: decodedTx.format,
                              inputs: txInputs,
                              outputs: decodedTx.outputs,
                              height: transaction.height,
                              timestamp: Number(transaction.height) === 0 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp,
                              confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height,
                            };

                            const formattedTx = transactionType(_parsedTx, address, coin === 'kmd' ? true : false);

                            if (formattedTx.type) {
                              formattedTx.height = transaction.height;
                              formattedTx.blocktime = blockInfo.timestamp;
                              formattedTx.timereceived = blockInfo.timereceived;
                              formattedTx.hex = transaction.raw;
                              formattedTx.inputs = decodedTx.inputs;
                              formattedTx.outputs = decodedTx.outputs;
                              formattedTx.locktime = decodedTx.format.locktime;
                              _rawtx.push(formattedTx);
                            } else {
                              formattedTx[0].height = transaction.height;
                              formattedTx[0].blocktime = blockInfo.timestamp;
                              formattedTx[0].timereceived = blockInfo.timereceived;
                              formattedTx[0].hex = transaction.raw;
                              formattedTx[0].inputs = decodedTx.inputs;
                              formattedTx[0].outputs = decodedTx.outputs;
                              formattedTx[0].locktime = decodedTx.format.locktime;
                              formattedTx[1].height = transaction.height;
                              formattedTx[1].blocktime = blockInfo.timestamp;
                              formattedTx[1].timereceived = blockInfo.timereceived;
                              formattedTx[1].hex = transaction.raw;
                              formattedTx[1].inputs = decodedTx.inputs;
                              formattedTx[1].outputs = decodedTx.outputs;
                              formattedTx[1].locktime = decodedTx.format.locktime;
                              _rawtx.push(formattedTx[0]);
                              _rawtx.push(formattedTx[1]);
                            }
                            resolve(true);
                          });
                        } else {
                          const _parsedTx = {
                            network: decodedTx.network,
                            format: 'cant parse',
                            inputs: 'cant parse',
                            outputs: 'cant parse',
                            height: transaction.height,
                            timestamp: Number(transaction.height) === 0 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp,
                            confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height,
                          };

                          const formattedTx = transactionType(_parsedTx, address, coin === 'kmd' ? true : false);
                          _rawtx.push(formattedTx);
                          resolve(true);
                        }
                      } else {
                        const _parsedTx = {
                          network: 'cant parse',
                          format: 'cant parse',
                          inputs: 'cant parse',
                          outputs: 'cant parse',
                          height: transaction.height,
                          timestamp: 'cant get block info',
                          confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height,
                        };
                        const formattedTx = transactionType(_parsedTx, address, coin === 'kmd' ? true : false);
                        _rawtx.push(formattedTx);
                        resolve(true);
                      }
                    });
                  });
                }))
                .then(promiseResult => {
                  Store.dispatch(shepherdElectrumTransactionsState({ result: _rawtx }));
                });
              } else {
                // empty history
                Store.dispatch(shepherdElectrumTransactionsState({ result: [] }));
              }
            } else {
              Store.dispatch(shepherdElectrumTransactionsState({ error: 'error' }));
            }
          });
        }
      }
    });
  }
}

export const shepherdElectrumTransactionsState = (json) => {
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