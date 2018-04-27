// TODO: merge check functions
//			 move to nodejs
//			 cleanup

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
			coinVal === 'VOTE' ||
	    		coinVal === 'OOT' ||
			coinVal === 'USD' ||
			coinVal === 'RON' ||
			coinVal === 'EUR' ||
			coinVal === 'JPY' ||
			coinVal === 'GBP' ||
			coinVal === 'AUD' ||
			coinVal === 'CAD' ||
			coinVal === 'CHF' ||
			coinVal === 'NZD' ||
			coinVal === 'CNY' ||
			coinVal === 'RUB' ||
			coinVal === 'MXN' ||
			coinVal === 'BRL' ||
			coinVal === 'INR' ||
			coinVal === 'HKD' ||
			coinVal === 'TRY' ||
			coinVal === 'ZAR' ||
			coinVal === 'PLN' ||
			coinVal === 'NOK' ||
			coinVal === 'SEK' ||
			coinVal === 'DKK' ||
			coinVal === 'CZK' ||
			coinVal === 'HUF' ||
			coinVal === 'ILS' ||
			coinVal === 'KRW' ||
			coinVal === 'MYR' ||
			coinVal === 'PHP' ||
			coinVal === 'SGD' ||
			coinVal === 'THB' ||
			coinVal === 'BGN' ||
			coinVal === 'IDR' ||
			coinVal === 'HRK')	{
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
			coin === 'VOTE') {
		return 'ac';
	}

	if (coin === 'ZEC' ||
			coin === 'KMD') {
		return 'crypto';
	}
}
