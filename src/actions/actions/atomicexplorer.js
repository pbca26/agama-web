import { PRICES } from '../storeType';
import { triggerToaster } from '../actionCreators';
import Config from '../../config';

export const prices = (coins, currency) => {
  return dispatch => {
    return fetch(
      `https://www.atomicexplorer.com/api/mm/prices/v2?currency=${currency}&coins=${typeof coins === 'object' ? coins.join(',') : coins}&pricechange=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.log(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(json && json.msg === 'success' ? pricesState(json.result) : pricesState('error'));
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