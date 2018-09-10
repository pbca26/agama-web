import translate from '../../translate/translate';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import { kmdAssetChains } from 'agama-wallet-lib/src/coin-helpers';
import { sortObject } from '../../util/coinHelper';
import appData from '../../actions/actions/appData';

const disabledAssets = [
  'DSEC',
  'CEAL',
  'MESH',
  'AXO',
  'ETOMIC',
];

const addCoinOptionsAC = () => {
  // filter out disabled assets
  let _assetChains = [];
  let _items = [];

  for (let i = 0; i < kmdAssetChains.length; i++) {
    const _ac = kmdAssetChains[i];

    if (electrumServers[_ac.toLowerCase()] &&
        disabledAssets.indexOf(_ac) === -1 &&
        appData.coins.indexOf(_ac.toLowerCase()) === -1) { // filter out active coins
      _assetChains.push(_ac);
    }
  }

  // sort coins by their title
  let coinsList = [];
  let _coins = {};

  for (let i = 0; i < _assetChains.length; i++) {
    _coins[translate('ASSETCHAINS.' + _assetChains[i].toUpperCase())] = _assetChains[i];
  }

  _coins = sortObject(_coins);

  for (let key in _coins) {
    coinsList.push(_coins[key]);
  }

  for (let i = 0; i < coinsList.length; i++) {
    const _title = translate('ASSETCHAINS.' + coinsList[i].toUpperCase());

    _items.push({
      label: `${_title}${_title.indexOf('(') === -1 && _title !== coinsList[i].toUpperCase() ? ' (' + coinsList[i].toUpperCase() + ')' : ''}`,
      icon: coinsList[i],
      value: `${coinsList[i].toUpperCase()}|spv`,
    });
  }

  return _items;
}

export default addCoinOptionsAC;