import Config from '../../config';
import appData from './appData';
import { getRandomIntInclusive } from 'agama-wallet-lib/src/utils';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import proxyServers from '../../util/proxyServers';
import translate from '../../translate/translate';
import Store from '../../store';
import urlParams from '../../util/url';

export const shepherdSelectProxy = () => {
  // pick a random proxy server
  const _randomServer = proxyServers[getRandomIntInclusive(0, proxyServers.length - 1)];
  appData.proxy = {
    ip: _randomServer.ip,
    port: _randomServer.port,
    ssl: _randomServer.ssl,
  };
}

export const shepherdSelectRandomCoinServer = (coin) => {
  // pick a random proxy server
  let _randomServer;

  if (Config.whitelabel &&
      Config.wlConfig.coin.ticker.toLowerCase() === coin) {
    _randomServer = Config.wlConfig.serverList[getRandomIntInclusive(0, Config.wlConfig.serverList.length - 1)].split(':');
  } else {
    _randomServer = electrumServers[coin].serverList[getRandomIntInclusive(0, electrumServers[coin].serverList.length - 1)].split(':');    
  }

  appData.servers[coin] = {
    ip: _randomServer[0],
    port: _randomServer[1],
    proto: _randomServer[2],
    serverList: Config.whitelabel ? Config.wlConfig.serverList : electrumServers[coin].serverList,
  };
}

export const shepherdElectrumCheckServerConnection = (ip, port, proto) => {
  return new Promise((resolve, reject) => {
    const _serverEndpoint = `${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}`;
    const _urlParams = {
      port,
      ip,
      proto,
    };

    fetch(`${_serverEndpoint}/api/server/version${urlParams(_urlParams)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.shepherdElectrumCheckServerConnection'),
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}