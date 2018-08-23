import Config from '../../config';
import appData from './appData';

export const shepherdElectrumLock = () => {
  return new Promise((resolve, reject) => {
    appData.auth.status = 'locked';
    appData.keys = {};
    resolve();
  });
}

export const shepherdElectrumLogout = () => {
  return new Promise((resolve, reject) => {
    appData.auth.status = 'locked';
    appData.keys = {};
    appData.coins = [];
    appData.allcoins = {
      spv: [],
      total: 0,
    };
    appData.servers = {};

    if (Config.whitelabel) {
      appData.allcoins = {
        spv: [Config.wlConfig.coin.ticker.toLowerCase()],
        total: 1,
      };
    }

    resolve();
  });
}