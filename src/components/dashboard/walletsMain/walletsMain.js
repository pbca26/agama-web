import React from 'react';
import { connect } from 'react-redux';
import WalletsMainRender from './walletsMain.render';
import translate from '../../../translate/translate';
import {
  triggerToaster,
  prices,
} from '../../../actions/actionCreators';
import { getCoinTitle } from '../../../util/coinHelper';
import Config from '../../../config';
import Store from '../../../store';

const PRICES_UPDATE_INTERVAL = 120000; // every 2m

class WalletsMain extends React.Component {
  constructor() {
    super();
    this.getCoinStyle = this.getCoinStyle.bind(this);
    this.pricesInterval = null;
  }

  componentWillUnmount() {
    if (this.pricesInterval) {
      clearInterval(this.pricesInterval);
    }
  }

  componentWillMount() {
    if (Config.fiatRates) {
      Store.dispatch(prices());
      this.pricesInterval = setInterval(() => {
        Store.dispatch(prices());
      }, PRICES_UPDATE_INTERVAL);
    }

    if (window.createSeed.triggered &&
        !window.createSeed.secondaryLoginPH) {
      Store.dispatch(
        triggerToaster(
          translate('INDEX.PLEASE_WRITE_DOWN_YOUR_PUB'),
          translate('INDEX.FIRST_TIME_SEED_USE'),
          'info',
          false
        )
      );
    } else if (window.createSeed.triggered && window.createSeed.secondaryLoginPH) {
      if (window.createSeed.secondaryLoginPH === window.createSeed.firstLoginPH) {
        Store.dispatch(
          triggerToaster(
            translate('INDEX.YOUR_SEED_IS_CORRECT'),
            translate('INDEX.CONGRATS_YOURE_ALL_SET'),
            'success',
            false
          )
        );
        window.createSeed = {
          triggered: false,
          firstLoginPH: null,
          secondaryLoginPH: null,
        };
      } else {
        Store.dispatch(
          triggerToaster(
            translate('INDEX.YOUR_SEED_IS_INCORRECT'),
            translate('INDEX.SEED_VERIFICATION_ERROR'),
            'error',
            false
          )
        );
        window.createSeed = {
          triggered: false,
          firstLoginPH: null,
          secondaryLoginPH: null,
        };
      }
    } else {
      window.createSeed = {
        triggered: false,
        firstLoginPH: null,
        secondaryLoginPH: null,
      };
    }
  }

  getCoinStyle(type) {
    const _coin = this.props.ActiveCoin.coin;

    if (type === 'transparent') {
      if (getCoinTitle(_coin.toUpperCase()).transparentBG &&
          getCoinTitle().logo) {
        return { 'backgroundImage': `url("assets/images/bg/${getCoinTitle().logo.toLowerCase()}_transparent_header_bg.png")` };
      }
    } else if (type === 'title') {
      let _iconPath;

      if (getCoinTitle(_coin.toUpperCase()).titleBG) {
        _iconPath = `assets/images/native/${getCoinTitle(_coin.toUpperCase()).logo.toLowerCase()}_header_title_logo.png`;
      } else if (!getCoinTitle(_coin.toUpperCase()).titleBG) {
        _iconPath = `assets/images/cryptologo/${_coin.toLowerCase()}.png`;
      }

      return _iconPath;
    }
  }

  render() {
    if (this.props.ActiveCoin &&
        this.props.ActiveCoin.mode) {
      return WalletsMainRender.call(this);
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      mode: state.ActiveCoin.mode,
    },
  };
};

export default connect(mapStateToProps)(WalletsMain);