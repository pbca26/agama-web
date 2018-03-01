import { ACTIVE_HANDLE } from '../storeType';
import { translate } from '../../translate/translate';
import Config from '../../config';
import appData from './appData';
import {
  triggerToaster,
  toggleAddcoinModal,
  getDexCoins,
  shepherdElectrumCoins,
  shepherdSelectRandomCoinServer,
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
    dispatch(shepherdElectrumAddCoin(coin.toLowerCase()));
  }
}

export function addCoinResult(coin, mode) {
  const modeToValue = {
    '0': 'spv',
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
      shepherdSelectRandomCoinServer(coin);
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