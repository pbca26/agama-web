import React from 'react';
import { connect } from 'react-redux';
import WalletsMainRender from './walletsMain.render';
import { translate } from '../../../translate/translate';
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

    /*if (mainWindow.createSeed.triggered &&
        !mainWindow.createSeed.secondaryLoginPH) {
      Store.dispatch(
        triggerToaster(
          'Please write down your public address, logout and login into Agama again to verify that your seed is correct.',
          'First time seed use',
          'info',
          false
        )
      );
    } else if (mainWindow.createSeed.triggered && mainWindow.createSeed.secondaryLoginPH) {
      if (mainWindow.createSeed.secondaryLoginPH === mainWindow.createSeed.firstLoginPH) {
        Store.dispatch(
          triggerToaster(
            'Your seed appears to be correct. As a final check up please double check that the public address you wrote down earlier is matching the one you see right now.',
            'Congrats, you are all set!',
            'success',
            false
          )
        );
        mainWindow.createSeed = {
          triggered: false,
          firstLoginPH: null,
          secondaryLoginPH: null,
        };
      } else {
        Store.dispatch(
          triggerToaster(
            'Your seed doesn\'t seem to be correct. Please logout and repeat wallet creation procedure again.',
            'Seed verification error!',
            'error',
            false
          )
        );
        mainWindow.createSeed = {
          triggered: false,
          firstLoginPH: null,
          secondaryLoginPH: null,
        };
      }
    }*/
  }

  getCoinStyle(type) {
    if (type === 'transparent') {
      if (getCoinTitle(this.props.ActiveCoin.coin.toUpperCase()).transparentBG && getCoinTitle().logo) {
        return { 'backgroundImage': `url("assets/images/bg/${getCoinTitle().logo.toLowerCase()}_transparent_header_bg.png")` };
      }
    } else if (type === 'title') {
      let _iconPath;

      if (getCoinTitle(this.props.ActiveCoin.coin.toUpperCase()).titleBG) {
        _iconPath = `assets/images/native/${getCoinTitle(this.props.ActiveCoin.coin.toUpperCase()).logo.toLowerCase()}_header_title_logo.png`;
      } else if (!getCoinTitle(this.props.ActiveCoin.coin.toUpperCase()).titleBG && getCoinTitle(this.props.ActiveCoin.coin.toUpperCase()).logo) {
        _iconPath = `assets/images/cryptologo/${getCoinTitle(this.props.ActiveCoin.coin.toUpperCase()).logo.toLowerCase()}.png`;
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
