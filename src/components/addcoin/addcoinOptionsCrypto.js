import translate from '../../translate/translate';
import {
  cryptoCoins,
  sortObject,
} from '../../util/coinHelper';

const addCoinOptionsCrypto = () => {
  // sort coins by their title
  let coinsList = [];
  let _coins = {};

  for (let i = 0; i < cryptoCoins.length; i++) {
    _coins[translate('CRYPTO.' + cryptoCoins[i].toUpperCase())] = cryptoCoins[i];
  }

  _coins = sortObject(_coins);

  for (let key in _coins) {
    coinsList.push(_coins[key]);
  }

  _coins = [];

  for (let i = 0; i < coinsList.length; i++) {
    _coins.push({
      label: `${translate('CRYPTO.' + coinsList[i])} (${coinsList[i]})`,
      icon: coinsList[i],
      value: `${coinsList[i]}|spv`,
    });
  }

  return _coins;
}

export default addCoinOptionsCrypto;