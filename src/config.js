// web app config
let Config = {
  version: '0.2.3-beta',
  debug: false,
  defaultLang: 'EN',
  roundValues: false,
  fiatRates: true,
  // single coin option
  whitelabel: false,
  sendCoinAllowFiatEntry: false,
  /*preload: {
    seed: '',
    coins: ['kmd', 'chips'],
  },*/
};

export const devlog = (msg, data) => {
  if (Config.dev ||
      Config.debug) {
    if (data) {
      console.warn(msg, data);
    } else {
      console.warn(msg);
    }
  }
};

Config.log = devlog;

export default Config;