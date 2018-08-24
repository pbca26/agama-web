// https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
export const sortObject = (o) => {
  return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
}

export const getCoinTitle = (coin) => {
  let coinlogo;
  let coinname;
  let transparentBG = false;
  let titleBG = false;
  let hideTitle = false;

  switch (coin) {
    case 'KMD':
      hideTitle = true;
      titleBG = true;
      transparentBG = true;
      coinlogo = 'kmd';
      coinname = 'Komodo';
      break;
    case 'WLC':
      titleBG = true;
      transparentBG = true;
      coinlogo = 'WLC';
      coinname = 'WIRELESS';
      break;
    case 'PANGEA':
      titleBG = true;
      coinlogo = 'PANGEA';
      coinname = 'PANGEA';
      break;
    case 'JUMBLR':
      titleBG = true;
      transparentBG = true;
      hideTitle = true;
      coinlogo = 'JUMBLR';
      coinname = 'JUMBLR';
      break;
    case 'MVP':
      hideTitle = true;
      titleBG = true;
      transparentBG = true;
      coinlogo = 'MVP';
      coinname = 'MVP Lineup';
      break;
    case 'CEAL':
      titleBG = true;
      transparentBG = true;
      coinlogo = 'CEAL';
      coinname = 'CEAL NET';
      break;
    case 'MESH':
      hideTitle = true;
      titleBG = true;
      transparentBG = true;
      coinlogo = 'MESH';
      coinname = 'SpaceMesh';
      break;
  }

  return {
    logo: coinlogo,
    name: coinname,
    titleBG,
    transparentBG,
  };
}

export const cryptoCoins = [
  'KMD',
  'CHIPS',
  'FTC',
  'GBX',
  'XZC',
  'FJC',
  'GAME',
  'CRW',
  'BCBC',
  'BTG',
  'BCH',
  'BTC',
  'DASH',
  'DNR',
  'DGB',
  'FAIR',
  'ARG',
  'LTC',
  'MONA',
  'NMC',
  'VTC',
  'VIA',
  'SIB',
  'BLK',
  'DOGE',
  'ZEC',
  'HUSH',
  'SNG',
  'ZCL',
  'XMY',
  'HODLC',
  'BTX',
  'QTUM',
  'BTCZ'
];