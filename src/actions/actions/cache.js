import Config from '../../config';
import appData from './appData';

export const getCache = (coin, type, key, data) => {
  if (!appData.cache[coin]) {
    appData.cache[coin] = {
      blocks: {},
      txs: {},
      decodedTxs: {},
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

export const getCachePromise = (coin, type, key, data) => {
  return new Promise((resolve, reject) => {
    if (!appData.cache[coin]) {
      appData.cache[coin] = {
        blocks: {},
        txs: {},
        decodedTxs: {},
      };
    }

    if (!appData.cache[coin][type][key]) {
      Config.log(`not cached ${coin} ${type} ${key}`);
      appData.cache[coin][type][key] = data;
      resolve(false);
    } else {
      Config.log(`cached ${coin} ${type} ${key}`);
      resolve(appData.cache[coin][type][key]);
    }
  });
}