import { PRICES } from '../storeType';
import { triggerToaster } from '../actionCreators';
import Config from '../../config';

function fiatRates(pricesJson) {
  return dispatch => {
    return fetch(`https://www.atomicexplorer.com/api/rates/kmd`, {
      method: 'GET',
    })
    .catch((error) => {
      console.log(error);
    })
    .then(response => response.json())
    .then(json => {
      let _coins = pricesJson.result;
      _coins.fiat = json.result;

      dispatch(pricesState(_coins));
    });
  }
}

export function prices() {
  return dispatch => {
    return fetch(`https://www.atomicexplorer.com/api/mm/prices`, {
      method: 'GET',
    })
    .catch((error) => {
      console.log(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(fiatRates(json));
    });
  }
}

function pricesState(json) {
  return {
    type: PRICES,
    prices: json,
  }
}