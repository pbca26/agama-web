// web app config
let Config = {
  version: '0.1.9-beta',
  debug: false,
  defaultLang: 'EN',
  roundValues: false,
  fiatRates: true,
  // single coin option
  whitelabel: false,
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