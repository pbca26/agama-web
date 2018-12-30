// web app config
let Config = {
  version: '0.2.5-beta',
  debug: false,
  defaultLang: 'EN',
  roundValues: false,
  fiatRates: true,
  // single coin option
  sendCoinAllowFiatEntry: false,
  whitelabel: true,
  wlConfig: {
    enableAllCoins: false,
    title: 'Komodo web wallet', // app title
    mainLogo: 'native/kmd_header_title_logo.png', // login logo
    coin: {
      ticker: 'KMD',
      name: 'Komodo',
      logo: 'cryptologo/kmd.png', // dashboard coin logo
      // network: {}, // custom network params
      // type: true // uncomment this line if your coin is a btc fork (non kmd asset)
    },
    explorer: 'https://kmdexplorer.ru', // insight or iquidus
    serverList: [ // electrum servers list
      'electrum1.cipig.net:10001:tcp',
      'electrum2.cipig.net:10001:tcp',
    ],
    fee: 10000,
    support: {
      onlineLink: {
        url: 'https://www.atomicexplorer.com/wallet',
        title: 'https://www.atomicexplorer.com/wallet',
      },
      standaloneLink: 'https://www.atomicexplorer.com/wallet.zip',
      chatApp: {
        url: 'https://discordapp.com/channels/412898016371015680/453204571393622027',
        channel: '#agama-wallet',
        name: 'Discord',
        inviteUrl: 'https://komodoplatform.com/discord',
      },
      ticketsLink: {
        url: 'http://support.komodoplatform.com',
        title: 'support.komodoplatform.com',
        urlNewTicket: 'https://support.komodoplatform.com/support/tickets/new',
      },
      gitLink: {
        title: 'github.com/pbca26/agama-web',
        url: 'https://github.com/pbca26/agama-web',
      },
    },
  },
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
