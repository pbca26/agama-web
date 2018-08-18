import translate from '../../translate/translate';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import { kmdAssetChains } from 'agama-wallet-lib/src/coin-helpers';

const disabledAssets = [
  'VRSC',
  'DSEC',
  'CEAL',
  'MESH',
  'AXO',
  'ETOMIC',
];

const addCoinOptionsAC = () => {
  let _assetChains = [];
  let _items = [];

  for (let i = 0; i < kmdAssetChains.length; i++) {
    const _ac = kmdAssetChains[i];

    if (electrumServers[_ac.toLowerCase()] && disabledAssets.indexOf(_ac) === -1) {
      _assetChains.push(_ac);
    }
  }

  for (let i = 0; i < _assetChains.length; i++) {
    const _title = translate('ASSETCHAINS.' + _assetChains[i].toUpperCase());

    _items.push({
      label: `${_title}${_title.indexOf('(') === -1 && _title !== _assetChains[i].toUpperCase() ? ' (' + _assetChains[i].toUpperCase() + ')' : ''}`,
      icon: _assetChains[i],
      value: `${_assetChains[i].toUpperCase()}|spv`,
    });
  }

  return _items;
}

export default addCoinOptionsAC;