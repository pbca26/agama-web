import translate from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import Store from '../../store';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import komodoInterest from 'agama-wallet-lib/src/komodo-interest';
import transactionType from 'agama-wallet-lib/src/transaction-type';
import { stringToWif } from 'agama-wallet-lib/src/keys';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import transactionDecoder from 'agama-wallet-lib/src/transaction-decoder';
import {
  fromSats,
  toSats,
} from 'agama-wallet-lib/src/utils';
import urlParams from '../../util/url';
import { getCache } from './cache';
import { triggerToaster } from '../actionCreators';

export const shepherdElectrumListunspent = (coin, address, full = true, verify = false) => {
  const CONNECTION_ERROR_OR_INCOMPLETE_DATA = 'connection error or incomplete data';
  let _atLeastOneDecodeTxFailed = false;
  let _urlParams = {
    ip: appData.servers[coin].ip,
    port: appData.servers[coin].port,
    proto: appData.servers[coin].proto,
    address,
  };

  if (full) {
    const _serverEndpoint = `${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}`;

    return new Promise((resolve, reject) => {
      fetch(`${_serverEndpoint}/api/listunspent${urlParams(_urlParams)}`, {
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

            _urlParams = {
              ip: appData.servers[coin].ip,
              port: appData.servers[coin].port,
              proto: appData.servers[coin].proto,
            };

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
                        const _cachedTx = getCache(coin, 'txs', _utxoItem.tx_hash);

                        if (_cachedTx) {
                          // decode tx
                          const _network = btcNetworks[coin] || (isKomodoCoin(coin) ? btcNetworks.kmd : btcNetworks[coin]);
                          const decodedTx = getCache(coin, 'decodedTxs', _utxoItem.tx_hash) ? getCache(coin, 'decodedTxs', _utxoItem.tx_hash) : transactionDecoder(_cachedTx, _network);

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
                                interest = komodoInterest(decodedTx.format.locktime, _utxoItem.value, _utxoItem.height);
                                Config.log('interest', interest);
                              }

                              let _resolveObj = {
                                txid: _utxoItem.tx_hash,
                                vout: _utxoItem.tx_pos,
                                address,
                                amount: Number(fromSats(_utxoItem.value)),
                                amountSats: _utxoItem.value,
                                interest: interest,
                                interestSats: Math.floor(toSats(interest)),
                                confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                spendable: true,
                                verified: false,
                                locktime: decodedTx.format.locktime,
                                currentHeight,
                              };

                              // merkle root verification agains another electrum server
                              if (verify) {
                                verifyMerkleByCoin(
                                  _utxoItem.tx_hash,
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
                                txid: _utxoItem.tx_hash,
                                vout: _utxoItem.tx_pos,
                                address,
                                amount: Number(fromSats(_utxoItem.value)),
                                amountSats: _utxoItem.value,
                                confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                spendable: true,
                                verified: false,
                                currentHeight,
                              };

                              // merkle root verification agains another electrum server
                              if (verify) {
                                verifyMerkleByCoin(
                                  _utxoItem.tx_hash,
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
                          _urlParams = {
                            ip: appData.servers[coin].ip,
                            port: appData.servers[coin].port,
                            proto: appData.servers[coin].proto,
                            address,
                            txid: _utxoItem.tx_hash,
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


                              Config.log('electrum gettransaction ==>');
                              Config.log(`${index} | ${(_rawtxJSON.length - 1)}`);
                              Config.log(_rawtxJSON);

                              // decode tx
                              const _network = btcNetworks[coin] || (isKomodoCoin(coin) || (Config.whitelabel && Config.wlConfig.coin.ticker.toLowerCase() === coin && !Config.wlConfig.coin.type) ? btcNetworks.kmd : btcNetworks[coin]);
                              const decodedTx = transactionDecoder(_rawtxJSON, _network);
                              getCache(coin, 'txs', _utxoItem.tx_hash, _rawtxJSON);
                              getCache(coin, 'decodedTxs', _utxoItem.tx_hash, decodedTx);

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
                                    txid: _utxoItem.tx_hash,
                                    vout: _utxoItem.tx_pos,
                                    address,
                                    amount: Number(fromSats(_utxoItem.value)),
                                    amountSats: _utxoItem.value,
                                    interest: interest,
                                    interestSats: Math.floor(toSats(interest)),
                                    confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                    spendable: true,
                                    verified: false,
                                    locktime: decodedTx.format.locktime,
                                    currentHeight,
                                  };

                                  // merkle root verification agains another electrum server
                                  if (verify) {
                                    verifyMerkleByCoin(
                                      _utxoItem.tx_hash,
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
                                    txid: _utxoItem.tx_hash,
                                    vout: _utxoItem.tx_pos,
                                    address,
                                    amount: Number(fromSats(_utxoItem.value)),
                                    amountSats: _utxoItem.value,
                                    confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                                    spendable: true,
                                    verified: false,
                                    currentHeight,
                                  };

                                  // merkle root verification agains another electrum server
                                  if (verify) {
                                    verifyMerkleByCoin(
                                      _utxoItem.tx_hash,
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
      _urlParams = {
        ip: appData.servers[coin].ip,
        port: appData.servers[coin].port,
        proto: appData.servers[coin].proto,
        address,
      };

      fetch(`${_serverEndpoint}/api/listunspent${urlParams(_urlParams)}`, {
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