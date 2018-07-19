// web app config
let Config = {
  version: '0.1.8-beta',
  debug: false,
  defaultLang: 'EN',
  roundValues: false,
  fiatRates: true,
  // single coin option
  whitelabel: true,
  wlConfig: {
    title: 'Komodo web wallet', // app title
    mainLogo: 'native/kmd_header_title_logo.png', // login logo
    coin: {
      ticker: 'KMD',
      name: 'Komodo',
      logo: 'cryptologo/kmd.png', // dashboard coin logo
    },
    explorer: 'https://kmdexplorer.ru', // insight or iquidus
    serverList: [ // electrum servers list
      'electrum1.cipig.net:10001:tcp',
      'electrum2.cipig.net:10001:tcp',
    ],
  },
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