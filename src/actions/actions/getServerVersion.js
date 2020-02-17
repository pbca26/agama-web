import 'babel-polyfill';
import Config from '../../config';
import appData from './appData';
import urlParams from '../../util/url';

const getServerVersion = async function (coin, electrumServer) {
  return new Promise((resolve, reject) => {
    const _serverEndpoint = `${appData.proxy.ssl ? 'https' : 'http'}://${appData.proxy.ip}:${appData.proxy.port}`;
    
    if (!appData.serverProtocol[coin] ||
        (appData.serverProtocol[coin] && appData.serverProtocol[coin][`${electrumServer.ip}:${electrumServer.port}:${electrumServer.proto}`] && isNaN(appData.serverProtocol[coin][`${electrumServer.ip}:${electrumServer.port}:${electrumServer.proto}`]))) {
      const _urlParams = {
        ip: electrumServer.ip,
        port: electrumServer.port,
        proto: electrumServer.proto,
      };

      fetch(`${_serverEndpoint}/api/server/version${urlParams(_urlParams)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .catch((error) => {
        console.warn('getServerVersion error', error);
      })
      .then(response => response.json())
      .then(json => {
        console.warn('getServerVersion', json);
        
        if (json.result &&
          typeof json.result === 'object' &&
          json.result.length === 2 &&
          json.result[0].indexOf('ElectrumX') > -1 &&
          Number(json.result[1])) {
          
          if (!appData.serverProtocol[coin]) {
            appData.serverProtocol[coin] = {};
          }
          appData.serverProtocol[coin][`${electrumServer.ip}:${electrumServer.port}:${electrumServer.proto}`] = Number(json.result[1]);

          resolve(Number(json.result[1]));
        } else {
          resolve(1.0);
        }
      });
    } else {
      resolve(appData.serverProtocol[coin][`${electrumServer.ip}:${electrumServer.port}:${electrumServer.proto}`]);
    }
  });
}

export default getServerVersion;