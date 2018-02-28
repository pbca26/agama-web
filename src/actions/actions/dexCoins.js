import {
  triggerToaster,
  dashboardCoinsState,
} from '../actionCreators';
import Config from '../../config';
import appData from './appData';

// TODO: find out why it errors on slow systems
export function getDexCoins() {
  return dispatch => {
    return dispatch(
      dashboardCoinsState(appData.allcoins)
    );
  }
}