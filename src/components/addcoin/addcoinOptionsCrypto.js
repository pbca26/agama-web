import translate from '../../translate/translate';
import { cryptoCoins } from '../../util/coinHelper';

const addCoinOptionsCrypto = () => {
  let _coins = [];

  for (let i = 0; i < cryptoCoins.length; i++) {
    _coins.push({
      label: `${translate('CRYPTO.' + cryptoCoins[i])} (${cryptoCoins[i]})`,
      icon: cryptoCoins[i],
      value: `${cryptoCoins[i]}|spv`,
    });
  }

  return _coins;
}

export default addCoinOptionsCrypto;