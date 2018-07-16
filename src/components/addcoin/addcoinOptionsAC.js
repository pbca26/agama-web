import translate from '../../translate/translate';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import { kmdAssetChains } from 'agama-wallet-lib/src/coin-helpers';

const addCoinOptionsAC = () => {
  let _assetChains = [];
  let _items = [];

  for (let i = 0; i < kmdAssetChains.length; i++) {
    const _ac = kmdAssetChains[i];

    if (electrumServers[_ac.toLowerCase()] &&
        _ac !== 'VRSC' &&
        _ac !== 'DSEC' &&
        _ac !== 'CEAL' &&
        _ac !== 'MESH' &&
        _ac !== 'AXO' &&
        _ac !== 'ETOMIC') {
      _assetChains.push(_ac);
    }
  }

  for (let i = 0; i < _assetChains.length; i++) {
    _items.push({
      label: `${translate(`ASSETCHAINS.${_assetChains[i].toUpperCase()}`)}${translate(`ASSETCHAINS.${_assetChains[i].toUpperCase()}`).indexOf('(') === -1 && translate(`ASSETCHAINS.${_assetChains[i].toUpperCase()}`) !== _assetChains[i].toUpperCase() ? ' (' + _assetChains[i].toUpperCase() + ')' : ''}`,
      icon: _assetChains[i],
      value: `${_assetChains[i].toUpperCase()}|spv`,
    });
  }

  return _items;
}

export default addCoinOptionsAC;