import translate from '../../translate/translate';
import { cryptoCoins } from '../../util/coinHelper';
import { sortObject } from 'agama-wallet-lib/src/utils';
import appData from '../../actions/actions/appData';

const addCoinOptionsCrypto = () => {
  // sort coins by their title
  let coinsList = [];
  let _coins = {};

  for (let i = 0; i < cryptoCoins.length; i++) {    
    if (appData.coins.indexOf(cryptoCoins[i].toLowerCase()) === -1) { // filter out active coins
      _coins[translate('CRYPTO.' + cryptoCoins[i].toUpperCase())] = cryptoCoins[i];
    }
  }

  _coins = sortObject(_coins);

  for (let key in _coins) {
    coinsList.push(_coins[key]);
  }

  _coins = [];

  if (!appData.isTrezor) {
    for (let i = 0; i < coinsList.length; i++) {
      _coins.push({
        label: `${translate('CRYPTO.' + coinsList[i])} (${coinsList[i]})`,
        icon: coinsList[i],
        value: `${coinsList[i]}|spv`,
      });
    }
  }

  return _coins;
}

export default addCoinOptionsCrypto;