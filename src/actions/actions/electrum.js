// TODO: split

import {
  DASHBOARD_ELECTRUM_BALANCE,
  DASHBOARD_ELECTRUM_TRANSACTIONS,
  DASHBOARD_ELECTRUM_COINS,
} from '../storeType';
import translate from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import {
  triggerToaster,
  sendToAddressState,
} from '../actionCreators';
import Store from '../../store';

import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import komodoInterest from 'agama-wallet-lib/src/komodo-interest';
import transactionType from 'agama-wallet-lib/src/transaction-type';
import transactionBuilder from 'agama-wallet-lib/src/transaction-type';
import { stringToWif } from 'agama-wallet-lib/src/keys';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import transactionDecoder from 'agama-wallet-lib/src/transaction-decoder';
import {
  fromSats,
  toSats,
  getRandomIntInclusive,
} from 'agama-wallet-lib/src/utils';
import proxyServers from '../../util/proxyServers';

let proxyConErr = false;

const getCache = (coin, type, key, data) => {
  if (!appData.cache[coin]) {
    appData.cache[coin] = {
      blocks: {},
      txs: {},
    };
  }

  if (!appData.cache[coin][type][key]) {
    Config.log(`not cached ${coin} ${type} ${key}`);
    appData.cache[coin][type][key] = data;
    return false;
  } else {
    Config.log(`cached ${coin} ${type} ${key}`);
    return appData.cache[coin][type][key];
  }
}

export const shepherdSelectProxy = () => {
  // pick a random proxy server
  const _randomServer = proxyServers[getRandomIntInclusive(0, proxyServers.length - 1)];
  appData.proxy = {
    ip: _randomServer.ip,
    port: _randomServer.port,
    ssl: _randomServer.ssl,
  };
}

export const shepherdSelectRandomCoinServer = (coin) => {
  // pick a random proxy server
  let _randomServer = electrumServers[coin].serverList[getRandomIntInclusive(0, electrumServers[coin].serverList.length - 1)].split(':');

  if (Config.whitelabel &&
      Config.wlConfig.coin.ticker.toLowerCase() === coin) {
    _randomServer = Config.wlConfig.serverList[getRandomIntInclusive(0, Config.wlConfig.serverList.length - 1)].split(':');
  }

  appData.servers[coin] = {
    ip: _randomServer[0],
    port: _randomServer[1],
    proto: _randomServer[2],
  };
}

export const shepherdElectrumLock = () => {
  return new Promise((resolve, reject) => {
    appData.auth.status = 'locked';
    appData.keys = {};
    resolve();
  });
}

export const shepherdElectrumLogout = () => {
  return new Promise((resolve, reject) => {
    appData.auth.status = 'locked';
    appData.keys = {};
    appData.coins = [];
    appData.allcoins = {
      spv: [],
      total: 0,
    };
    appData.servers = {};

    if (Config.whitelabel) {
      appData.allcoins = {
        spv: [Config.wlConfig.coin.ticker.toLowerCase()],
        total: 1,
      };
    }

    resolve();
  });
}

export const shepherdElectrumSetServer = (coin, address, port) => {
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
          translate('API.shepherdElectrumSetServer'),
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

export const shepherdElectrumCheckServerConnection = (address, port) => {
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
          translate('API.shepherdElectrumCheckServerConnection'),
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

export const shepherdElectrumKeys = (seed) => {
  return new Promise((resolve, reject) => {
    const keys = stringToWif(seed, btcNetworks[Object.keys(appData.keys)[0]], true);

    if (keys.priv === appData.keys[Object.keys(appData.keys)[0]].priv) {
      resolve({ result: appData.keys });
    } else {
      resolve('error');
    }
  });
}

export const shepherdElectrumBalance = (coin, address) => {
  proxyConErr = true;

  setTimeout(() => {
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
  }, 20000);

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

            proxyConErr = false;
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
          proxyConErr = false;
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
        proxyConErr = false;
        json = {
          msg: 'error',
          result: 'error',
        };
        dispatch(shepherdElectrumBalanceState(json));
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
              const successObj = {
                msg: 'error',
                result: translate('API.BAD_TX_INPUTS_SPENT'),
                raw: _rawObj,
              };

              Store.dispatch(sendToAddressState(successObj));
            } else {
              if (txid &&
                  txid.length === 64) {
                if (txid.indexOf('bad-txns-in-belowout') > -1) {
                  const successObj = {
                    msg: 'error',
                    result: translate('API.BAD_TX_INPUTS_SPENT'),
                    raw: _rawObj,
                  };

                  Store.dispatch(sendToAddressState(successObj));
                } else {
                  const successObj = {
                    result: _rawObj,
                    txid: _rawObj.txid,
                  };

                  Store.dispatch(sendToAddressState(successObj));
                }
              } else {
                if (txid &&
                    txid.indexOf('bad-txns-in-belowout') > -1) {
                  const successObj = {
                    msg: 'error',
                    result: translate('API.BAD_TX_INPUTS_SPENT'),
                    raw: _rawObj,
                  };

                  dispatch(sendToAddressState(successObj));
                } else {
                  const successObj = {
                    msg: 'error',
                    result: translate('API.CANT_BROADCAST_TX'),
                    raw: _rawObj,
                  };

                  Store.dispatch(sendToAddressState(successObj));
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

export const shepherdElectrumListunspent = (coin, address, full = true, verify = false) => {
  const CONNECTION_ERROR_OR_INCOMPLETE_DATA = 'connection error or incomplete data';
  let _atLeastOneDecodeTxFailed = false;

  if (full) {
    return new Promise((resolve, reject) => {
      fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/listunspent?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}&address=${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .catch((error) => {
        console.log(error);
        Store.dispatch(
          triggerToaster(
            translate('API.shepherdElectrumListunspent+listunspent-remote'),
            'Error',
            'error'
          )
        );
      })
      .then(response => response.json())
      .then(json => {
        let result = json;

        Config.log('shepherdElectrumListunspent', json);

        if (result.msg === 'error') {
          resolve('error');
        } else {
          const _utxoJSON = result.result;

          if (_utxoJSON &&
              _utxoJSON.length) {
            let formattedUtxoList = [];
            let _utxo = [];

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
              result = json;
              // get current height

              if (result.msg === 'error') {
                resolve('cant get current height');
              } else {
                const currentHeight = result.result;

                if (currentHeight &&
                    Number(currentHeight) > 0) {
                  // filter out unconfirmed utxos
                  for (let i = 0; i < _utxoJSON.length; i++) {
                    if (Number(currentHeight) - Number(_utxoJSON[i].height) !== 0) {
                      _utxo.push(_utxoJSON[i]);
                    }
                  }

                  if (!_utxo.length) { // no confirmed utxo
                    resolve('no valid utxo');
                  } else {
                    Promise.all(_utxo.map((_utxoItem, index) => {
                      return new Promise((resolve, reject) => {
                        const _cachedTx = getCache(coin, 'txs', _utxoItem['tx_hash']);

                        if (_cachedTx) {
                          // decode tx
                          const _network = isKomodoCoin(coin) ? btcNetworks.kmd : btcNetworks[coin];
                          const decodedTx = transactionDecoder(_cachedTx, _network);

                          Config.log('decoded tx =>');
                          Config.log(decodedTx);

                          if (!decodedTx) {
                            _atLeastOneDecodeTxFailed = true;
                            resolve('cant decode tx');
                          } else {
                            if (coin === 'kmd') {
                              let interest = 0;

                              if (Number(fromSats(_utxoItem.value)) >= 10 &&
                                  decodedTx.format.locktime > 0) {
                                Config.log('interest', komodoInterest);
                                interest = komodoInterest(decodedTx.format.locktime, _utxoItem.value, _utxoItem.height);
                              }

                              let _resolveObj = {
                                txid: _utxoItem['tx_hash'],
                                vout: _utxoItem['tx_pos'],
                                address,
                                amount: Number(fromSats(_utxoItem.value)),
                                amountSats: _utxoItem.value,
                                interest: interest,
                                interestSats: Math.floor(toSats(interest)),
                                confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                spendable: true,
                                verified: false,
                                locktime: decodedTx.format.locktime,
                              };

                              // merkle root verification agains another electrum server
                              if (verify) {
                                verifyMerkleByCoin(
                                  _utxoItem['tx_hash'],
                                  _utxoItem.height,
                                  electrumServer,
                                  proxyServer
                                )
                                .then((verifyMerkleRes) => {
                                  if (verifyMerkleRes &&
                                      verifyMerkleRes === CONNECTION_ERROR_OR_INCOMPLETE_DATA) {
                                    verifyMerkleRes = false;
                                  }

                                  _resolveObj.verified = verifyMerkleRes;
                                  resolve(_resolveObj);
                                });
                              } else {
                                resolve(_resolveObj);
                              }
                            } else {
                              let _resolveObj = {
                                txid: _utxoItem['tx_hash'],
                                vout: _utxoItem['tx_pos'],
                                address,
                                amount: Number(fromSats(_utxoItem.value)),
                                amountSats: _utxoItem.value,
                                confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                spendable: true,
                                verified: false,
                              };

                              // merkle root verification agains another electrum server
                              if (verify) {
                                verifyMerkleByCoin(
                                  _utxoItem['tx_hash'],
                                  _utxoItem.height,
                                  electrumServer,
                                  proxyServer
                                )
                                .then((verifyMerkleRes) => {
                                  if (verifyMerkleRes &&
                                      verifyMerkleRes === CONNECTION_ERROR_OR_INCOMPLETE_DATA) {
                                    verifyMerkleRes = false;
                                  }

                                  _resolveObj.verified = verifyMerkleRes;
                                  resolve(_resolveObj);
                                });
                              } else {
                                resolve(_resolveObj);
                              }
                            }
                          }
                        } else {
                          fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/gettransaction?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}&address=${address}&txid=${_utxoItem['tx_hash']}`, {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          })
                          .catch((error) => {
                            console.log(error);
                            Store.dispatch(
                              triggerToaster(
                                translate('API.shepherdElectrumTransactions+gettransaction-remote'),
                                'Error',
                                'error'
                              )
                            );
                          })
                          .then(response => response.json())
                          .then(json => {
                            result = json;

                            Config.log(result);

                            if (result.msg !== 'error') {
                              const _rawtxJSON = result.result;

                              Config.log('gettransaction =>');

                              getCache(coin, 'txs', _utxoItem['tx_hash'], _rawtxJSON);

                              Config.log('electrum gettransaction ==>');
                              Config.log(`${index} | ${(_rawtxJSON.length - 1)}`);
                              Config.log(_rawtxJSON);

                              // decode tx
                              const _network = isKomodoCoin(coin) || (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin) ? btcNetworks.kmd : btcNetworks[coin];
                              const decodedTx = transactionDecoder(_rawtxJSON, _network);

                              Config.log('decoded tx =>');
                              Config.log(decodedTx);

                              if (!decodedTx) {
                                _atLeastOneDecodeTxFailed = true;
                                resolve('cant decode tx');
                              } else {
                                if (coin === 'kmd') {
                                  let interest = 0;

                                  if (Number(fromSats(_utxoItem.value)) >= 10 &&
                                      decodedTx.format.locktime > 0) {
                                    Config.log('interest', komodoInterest);
                                    interest = komodoInterest(decodedTx.format.locktime, _utxoItem.value, _utxoItem.height);
                                  }

                                  let _resolveObj = {
                                    txid: _utxoItem['tx_hash'],
                                    vout: _utxoItem['tx_pos'],
                                    address,
                                    amount: Number(fromSats(_utxoItem.value)),
                                    amountSats: _utxoItem.value,
                                    interest: interest,
                                    interestSats: Math.floor(toSats(interest)),
                                    confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                    spendable: true,
                                    verified: false,
                                    locktime: decodedTx.format.locktime,
                                  };

                                  // merkle root verification agains another electrum server
                                  if (verify) {
                                    verifyMerkleByCoin(
                                      _utxoItem['tx_hash'],
                                      _utxoItem.height,
                                      electrumServer,
                                      proxyServer
                                    )
                                    .then((verifyMerkleRes) => {
                                      if (verifyMerkleRes &&
                                          verifyMerkleRes === CONNECTION_ERROR_OR_INCOMPLETE_DATA) {
                                        verifyMerkleRes = false;
                                      }

                                      _resolveObj.verified = verifyMerkleRes;
                                      resolve(_resolveObj);
                                    });
                                  } else {
                                    resolve(_resolveObj);
                                  }
                                } else {
                                  let _resolveObj = {
                                    txid: _utxoItem['tx_hash'],
                                    vout: _utxoItem['tx_pos'],
                                    address,
                                    amount: Number(fromSats(_utxoItem.value)),
                                    amountSats: _utxoItem.value,
                                    confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                    spendable: true,
                                    verified: false,
                                  };

                                  // merkle root verification agains another electrum server
                                  if (verify) {
                                    verifyMerkleByCoin(
                                      _utxoItem['tx_hash'],
                                      _utxoItem.height,
                                      electrumServer,
                                      proxyServer
                                    )
                                    .then((verifyMerkleRes) => {
                                      if (verifyMerkleRes &&
                                          verifyMerkleRes === CONNECTION_ERROR_OR_INCOMPLETE_DATA) {
                                        verifyMerkleRes = false;
                                      }

                                      _resolveObj.verified = verifyMerkleRes;
                                      resolve(_resolveObj);
                                    });
                                  } else {
                                    resolve(_resolveObj);
                                  }
                                }
                              }
                            } else {
                              resolve(false);
                              _atLeastOneDecodeTxFailed = true;
                              Config.log('getcurrentblock error =>');
                            }
                          });
                        }
                      });
                    }))
                    .then(promiseResult => {
                      if (!_atLeastOneDecodeTxFailed) {
                        Config.log(promiseResult);
                        resolve(promiseResult);
                      } else {
                        Config.log('listunspent error, cant decode tx(s)');
                        resolve('decode error');
                      }
                    });
                  }
                } else {
                  resolve('cant get current height');
                }
              }
            });
          } else {
            resolve(CONNECTION_ERROR_OR_INCOMPLETE_DATA);
          }
        }
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      fetch(`${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}/api/listunspent?port=${appData.servers[coin].port}&ip=${appData.servers[coin].ip}&proto=${appData.servers[coin].proto}&address=${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .catch((error) => {
        console.log(error);
        Store.dispatch(
          triggerToaster(
            translate('API.shepherdElectrumListunspent+listunspent-remote'),
            'Error',
            'error'
          )
        );
      })
      .then(response => response.json())
      .then(json => {
        resolve(json.msg === 'error' ? 'error' : json.result);
      });
    });
  }
}

export const shepherdElectrumBip39Keys = (seed, match, addressdepth, accounts) => {
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
          'shepherdElectrumBip39Keys',
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
export const shepherdElectrumSplitUtxoPromise = (payload) => {
  Config.log(payload);

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