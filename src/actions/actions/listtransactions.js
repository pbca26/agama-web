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
import {
  getCache,
  getCachePromise,
} from './cache';
import getServerVersion from './getServerVersion';
import { pubToElectrumScriptHashHex } from 'agama-wallet-lib/src/keys';
import {
  parseBlock,
  electrumMerkleRoot,
} from 'agama-wallet-lib/src/block';

export const shepherdElectrumTransactions = (coin, address, full = true, verify = false) => {
  return dispatch => {
    (async function() {
      const _serverEndpoint = `${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}`;
      let _urlParams = {
        ip: appData.servers[coin].ip,
        port: appData.servers[coin].port,
        proto: appData.servers[coin].proto,
      };
      const protocolVersion = await getServerVersion(coin, _urlParams);
      const _address = protocolVersion && Number(protocolVersion) >= 1.2 ? pubToElectrumScriptHashHex(address, btcNetworks[coin.toLowerCase()] || btcNetworks.kmd) : address;

      // get current height
      fetch(`${_serverEndpoint}/api/getcurrentblock${urlParams(_urlParams)}`, {
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
        if (appData.activeCoin === coin) {
          let result = json;

          if (result.msg === 'error') {
            Store.dispatch(shepherdElectrumTransactionsState({
              result: {
                error: 'error',
              },
            }));
          } else {
            const currentHeight = result.result;

            Config.log('currentHeight =>');
            Config.log(currentHeight);

            _urlParams = {
              ip: appData.servers[coin].ip,
              port: appData.servers[coin].port,
              proto: appData.servers[coin].proto,
              address,
              raw: true,
            };

            _urlParams.address = _address;
            
            if (protocolVersion &&
                Number(protocolVersion) >= 1.2) {
              _urlParams.eprotocol = 1.4;
            }

            fetch(`${_serverEndpoint}/api/listtransactions${urlParams(_urlParams)}`, {
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
                      const _processHistory = (json) => {
                        result = json;

                        Config.log('getblock =>');
                        Config.log(result);

                        if (result.msg !== 'error') {
                          let blockInfo = result.result;
                          // decode tx
                          let _network = btcNetworks[coin] || (isKomodoCoin(coin) || (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin) ? btcNetworks.kmd : btcNetworks[coin]);
                          
                          if (typeof blockInfo === 'string') {         
                            blockInfo = parseBlock(blockInfo, _network);
              
                            if (blockInfo.merkleRoot) {
                              blockInfo.merkle_root = electrumMerkleRoot(blockInfo);
                            }
                          }

                          getCache(coin, 'blocks', transaction.height, blockInfo);

                          Config.log('electrum gettransaction ==>');
                          Config.log(`${index} | ${(transaction.raw.length - 1)}`);
                          Config.log(transaction.raw);

                          if (Config.whitelabel &&
                              Config.wlConfig.coin.ticker.toLowerCase() === coin &&
                              Config.wlConfig.coin.network) {
                            _network = Config.wlConfig.coin.network;
                          }

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
                                    const decodedVinVout = getCache(coin, 'decodedTxs', _decodedInput.txid) ? getCache(coin, 'decodedTxs', _decodedInput.txid) : transactionDecoder(_cachedTx, _network);

                                    Config.log('electrum raw input tx ==>');

                                    if (decodedVinVout) {
                                      Config.log(decodedVinVout.outputs[_decodedInput.n], true);
                                      txInputs.push(decodedVinVout.outputs[_decodedInput.n]);
                                      _resolve(true);
                                    } else {
                                      _resolve(true);
                                    }
                                  } else {
                                    _urlParams = {
                                      ip: appData.servers[coin].ip,
                                      port: appData.servers[coin].port,
                                      proto: appData.servers[coin].proto,
                                      address,
                                      txid: _decodedInput.txid,
                                    };

                                    fetch(`${_serverEndpoint}/api/gettransaction${urlParams(_urlParams)}`, {
                                      method: 'GET',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                    })
                                    .catch((error) => {
                                      console.log(error);
                                      Store.dispatch(
                                        triggerToaster(
                                          translate('API.shepherdElectrumTransactions+gettransaction'),
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
                                        getCache(coin, 'decodedTxs', _decodedInput.txid, decodedVinVout);
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
                                confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height + 1,
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
                              confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height + 1,
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
                            confirmations: Number(transaction.height) === 0 ? 0 : currentHeight - transaction.height + 1,
                          };
                          const formattedTx = transactionType(_parsedTx, address, coin === 'kmd' ? true : false);
                          _rawtx.push(formattedTx);
                          resolve(true);
                        }
                      };

                      getCachePromise(coin, 'blocks', transaction.height)
                      .then((res) => {
                        if (res) {
                          _processHistory({
                            msg: 'success',
                            result: res,
                          });
                        } else {
                          _urlParams = {
                            ip: appData.servers[coin].ip,
                            port: appData.servers[coin].port,
                            proto: appData.servers[coin].proto,
                            height: transaction.height,
                          };

                          if (protocolVersion &&
                              Number(protocolVersion) >= 1.2) {
                            _urlParams.eprotocol = 1.4;
                          }
                          
                          fetch(`${_serverEndpoint}/api/getblockinfo${urlParams(_urlParams)}`, {
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
                            _processHistory(json);
                          });
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
                Store.dispatch(shepherdElectrumTransactionsState({
                  result: {
                    error: 'error',
                  },
                }));
              }
            });
          }
        }
      });
    })();
  }
}

export const shepherdElectrumTransactionsState = (json) => {
  json = json.result;

  if (json &&
      json.error) {
    json = 'connection error or incomplete data';
  } else if (!json || !json.length) {
    json = 'no data';
  }

  return {
    type: DASHBOARD_ELECTRUM_TRANSACTIONS,
    txhistory: json,
  }
}