import appData from './appData';

export const shepherdRemoveCoin = (coin, mode) => {
  return new Promise((resolve, reject, dispatch) => {
    delete appData.keys[coin];
    appData.coins = appData.coins.filter(item => item !== coin);
    appData.allcoins = {
      spv: appData.coins,
      total: appData.coins.length,
    };
    delete appData.servers[coin];

    if (!appData.coins ||
        !appData.coins.length) {
      appData.auth.status = 'locked';
    }
    resolve();
  });
}