import { ACTIVE_HANDLE } from '../storeType';
import { translate } from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import {
  triggerToaster,
  toggleAddcoinModal,
  getDexCoins,
  shepherdElectrumCoins,
} from '../actionCreators';
import {
  checkCoinType,
  checkAC,
} from '../../components/addcoin/payload';
import agamalib from '../../agamalib';

function iguanaActiveHandleState(json) {
  return {
    type: ACTIVE_HANDLE,
    isLoggedIn: json.status === 'unlocked' ? true : false,
    handle: json,
  }
}

export function activeHandle() {
  return dispatch => {
    return dispatch(
      iguanaActiveHandleState(appData.auth)
    );
  }
}

export function shepherdElectrumAuth(seed) {
  let _pubKeys = {};

  for (let i = 0; i < appData.coins.length; i++) {
    if (agamalib.coin.isKomodoCoin(appData.coins[i])) {
      appData.keys[appData.coins[i]] = agamalib.keys.stringToWif(seed, agamalib.btcnetworks.kmd, true);
    } else {
      appData.keys[appData.coins[i]] = agamalib.keys.stringToWif(seed, agamalib.btcnetworks[appData.coins[i]], true);
    }
  }

  appData.auth.status = 'unlocked';

  return dispatch => {
    dispatch(activeHandle());
    dispatch(shepherdElectrumCoins());
  };
  /*
  return dispatch => {
    return fetch(`http://127.0.0.1:${Config.agamaPort}/shepherd/electrum/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seed,
        iguana: true,
        token: Config.token,
      }),
    })
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          'shepherdElectrumAuth',
          'Error',
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (json.msg !== 'error') {
        dispatch(activeHandle());
        dispatch(shepherdElectrumCoins());
      } else {
        dispatch(
          triggerToaster(
            translate('TOASTR.INCORRECT_WIF'),
            'Error',
            'error'
          )
        );
      }
    });
  }*/
}

export function shepherdElectrumAddCoin(coin) {
  return dispatch => {
    return dispatch(
      addCoinResult(coin, '0')
    );
  }
}

export function addCoin(coin, mode, startupParams) {
  return dispatch => {
    dispatch(shepherdElectrumAddCoin(coin));
  }
}

export function addCoinResult(coin, mode) {
  const modeToValue = {
    '0': 'spv',
    '-1': 'native',
  };

  if (!appData.coins[coin]) {
    appData.coins.push(coin);
    appData.allcoins.spv.push(coin);
    appData.allcoins.total++;
  }

  return dispatch => {
    dispatch(
      triggerToaster(
        `${coin} ${translate('TOASTR.STARTED_IN')} ${modeToValue[mode].toUpperCase()} ${translate('TOASTR.MODE')}`,
        translate('TOASTR.COIN_NOTIFICATION'),
        'success'
      )
    );
    dispatch(toggleAddcoinModal(false, false));

    if (Number(mode) === 0) {
      dispatch(activeHandle());
      dispatch(shepherdElectrumCoins());
      dispatch(getDexCoins());

      /*setTimeout(() => {
        dispatch(activeHandle());
        dispatch(shepherdElectrumCoins());
        dispatch(getDexCoins());
      }, 500);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(shepherdElectrumCoins());
        dispatch(getDexCoins());
      }, 1000);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(shepherdElectrumCoins());
        dispatch(getDexCoins());
      }, 2000);*/
    }
  }
}