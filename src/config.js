// web app config
let Config = {
  version: '0.1.5-beta',
  debug: true,
  defaultLang: 'EN',
  roundValues: false,
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
  },
};

export default Config;