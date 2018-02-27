import { translate } from '../../translate/translate';

const addCoinOptionsAC = () => {
  const _assetChains = [
    'bet',
    'bots',
    'ceal',
    'coqui',
    'crypto',
    'hodl',
    'dex',
    'jumblr',
    //'kv',
    'mgw',
    //'mvp',
    'mnz',
    'pangea',
    'revs',
    'mshark',
    'supernet',
    'wlc',
    //'axo',
    //'etomic',
    'btch',
    'beer',
    'pizza',
    'vote'
  ];
  let _items = [];

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
