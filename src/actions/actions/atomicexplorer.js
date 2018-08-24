import { PRICES } from '../storeType';
import { triggerToaster } from '../actionCreators';
import Config from '../../config';

const fiatRates = (pricesJson) => {
  return dispatch => {
    return fetch('https://www.atomicexplorer.com/api/rates/kmd', {
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

export const prices = () => {
  return dispatch => {
    return fetch('https://www.atomicexplorer.com/api/mm/prices', {
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

const pricesState = (json) => {
  return {
    type: PRICES,
    prices: json,
  }
}

export const shepherdGetRemoteBTCFees = () => {
  return new Promise((resolve, reject) => {
    fetch('https://www.atomicexplorer.com/api/btc/fees', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.shepherdGetRemoteBTCFees'),
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export const shepherdGetRemoteTimestamp = () => {
  return new Promise((resolve, reject) => {
    fetch('https://www.atomicexplorer.com/api/timestamp/now', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
      resolve({ msg: 'error' });
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}