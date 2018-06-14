import { translate } from '../../translate/translate';
import {
  eservers,
  coin,
} from 'agama-wallet-lib/src/index-fe';

const addCoinOptionsAC = () => {
  let _assetChains = [];
  let _items = [];

  for (let i = 0; i < coin.kmdAssetChains.length; i++) {
    const _ac = coin.kmdAssetChains[i].toLowerCase();

    if (eservers[_ac] &&
        _ac !== 'chips' &&
        _ac !== 'kmd' &&
        _ac !== 'komodo') {
      _assetChains.push(_ac);
    }
  }

  for (let i = 0; i < _assetChains.length; i++) {
    let availableModes = 'spv';

    _items.push({
      label: translate(`ASSETCHAINS.${_assetChains[i].toUpperCase()}`),
      icon: _assetChains[i],
      value: `${_assetChains[i].toUpperCase()}|${availableModes}`,
    });
  }

  return _items;
}

export default addCoinOptionsAC;