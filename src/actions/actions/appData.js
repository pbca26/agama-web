import Config from '../../config';

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
  proxy: {},
  cache: {},
};

export default appData;