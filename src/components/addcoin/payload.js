// TODO: merge check functions
//			 move to nodejs
//			 cleanup

import Config from '../../config';

export function checkAC(coinVal) {
	if (coinVal === 'SUPERNET' ||
			coinVal === 'REVS' ||
			coinVal === 'WLC' ||
			coinVal === 'DEX' ||
			coinVal === 'PANGEA' ||
			coinVal === 'JUMBLR' ||
			coinVal === 'BET' ||
			coinVal === 'CRYPTO' ||
			coinVal === 'COQUI' ||
			coinVal === 'GLXT' ||
			coinVal === 'HODL' ||
			coinVal === 'MSHARK' ||
			coinVal === 'BOTS' ||
			coinVal === 'MGW' ||
			coinVal === 'MVP' ||
			coinVal === 'KV' ||
			coinVal === 'CEAL' ||
			coinVal === 'MESH' ||
			coinVal === 'MNZ' ||
			coinVal === 'AXO' ||
			coinVal === 'ETOMIC' ||
			coinVal === 'BTCH' ||
			coinVal === 'BEER' ||
			coinVal === 'PIZZA' ||
			coinVal === 'VOTE2018' ||
			coinVal === 'OOT' ||
			coinVal === 'PRLPAY' ||
			coinVal === 'NINJA' ||
			coinVal === 'CHAIN' ||
			coinVal === 'EQL' ||
			//coinVal === 'DSEC' ||
			(Config.whitelabel && coinVal === Config.wlConfig.coin))	{
		return true;
	} else {
		return false;
	}
}

export function checkCoinType(coin) {
	if (coin === 'USD' ||
			coin === 'RON' ||
			coin === 'RUB' ||
			coin === 'SEK' ||
			coin === 'SGD' ||
			coin === 'THB' ||
			coin === 'TRY' ||
			coin === 'ZAR' ||
			coin === 'CNY' ||
			coin === 'CZK' ||
			coin === 'DKK' ||
			coin === 'EUR' ||
			coin === 'GBP' ||
			coin === 'HKD' ||
			coin === 'HUF' ||
			coin === 'IDR' ||
			coin === 'ILS' ||
			coin === 'INR' ||
			coin === 'JPY' ||
			coin === 'KRW' ||
			coin === 'MXN' ||
			coin === 'MYR' ||
			coin === 'NOK' ||
			coin === 'NZD' ||
			coin === 'PHP' ||
			coin === 'PLN' ||
			coin === 'AUD' ||
			coin === 'BGN' ||
			coin === 'BRL' ||
			coin === 'CAD' ||
			coin === 'CHF') {
		return 'currency_ac';
	}

	if (coin === 'SUPERNET' ||
			coin === 'REVS' ||
			coin === 'SUPERNET' ||
			coin === 'PANGEA' ||
			coin === 'DEX' ||
			coin === 'JUMBLR' ||
			coin === 'BET' ||
			coin === 'CRYPTO' ||
			coin === 'COQUI' ||
			coin === 'GLXT' ||
			coin === 'HODL' ||
			coin === 'MSHARK' ||
			coin === 'BOTS' ||
			coin === 'MGW' ||
			coin === 'MVP' ||
			coin === 'KV' ||
			coin === 'CEAL' ||
			coin === 'MESH' ||
			coin === 'WLC' ||
			coin === 'MNZ' ||
			coin === 'AXO' ||
			coin === 'ETOMIC' ||
			coin === 'BTCH' ||
			coin === 'BEER' ||
			coin === 'PIZZA' ||
	    coin === 'OOT' ||
			coin === 'VOTE2018' ||
			coin === 'PRLPAY' ||
			coin === 'NINJA' ||
			coin === 'CHAIN' ||
			//coin === 'DSEC' ||
			coin === 'EQL' ||
			(Config.whitelabel && coinVal === Config.wlConfig.coin)) {
		return 'ac';
	}

	if (coin === 'ZEC' ||
			coin === 'KMD') {
		return 'crypto';
	}
}