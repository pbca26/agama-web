import { dashboardCoinsState } from '../actionCreators';
import Config from '../../config';
import appData from './appData';

export const getDexCoins = () => {
  return dispatch => {
    return dispatch(
      dashboardCoinsState(appData.allcoins)
    );
  }
}