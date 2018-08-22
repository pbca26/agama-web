import Config from '../../config';
import appData from './appData';

const getCache = (coin, type, key, data) => {
  if (!appData.cache[coin]) {
    appData.cache[coin] = {
      blocks: {},
      txs: {},
      decodedTxs: {},
    };
  }

  console.warn('cache', appData.cache[coin]);

  if (!appData.cache[coin][type][key]) {
    Config.log(`not cached ${coin} ${type} ${key}`);
    appData.cache[coin][type][key] = data;
    return false;
  } else {
    Config.log(`cached ${coin} ${type} ${key}`);
    return appData.cache[coin][type][key];
  }
}

export default getCache;