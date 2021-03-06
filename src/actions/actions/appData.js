let appData = {
  auth: {
    status: 'locked',
  },
  coins: [],
  allcoins: {
    spv: [],
    total: 0,
  },
  activeCoin: null,
  createSeed: { // seed hash check
    triggered: false,
    firstLoginPH: null,
    secondaryLoginPH: null,
  },
  keys: {},
  servers: {},
  serverProtocol: {},
  proxy: {},
  cache: {},
  isWatchOnly: false,
  isTrezor: false,
};

export default appData;