import React from 'react';
import { connect } from 'react-redux';
import WalletsMainRender from './walletsMain.render';
import translate from '../../../translate/translate';
import {
  triggerToaster,
} from '../../../actions/actionCreators';
import { getCoinTitle } from '../../../util/coinHelper';
import Config from '../../../config';
import Store from '../../../store';
import assetsPath from '../../../util/assetsPath';
import appData from '../../../actions/actions/appData';


class WalletsMain extends React.Component {
  constructor() {
    super();
    this.getCoinStyle = this.getCoinStyle.bind(this);
  }

  componentWillMount() {
    if (appData.createSeed.triggered &&
        !appData.createSeed.secondaryLoginPH) {
      Store.dispatch(
        triggerToaster(
          translate('INDEX.PLEASE_WRITE_DOWN_YOUR_PUB'),
          translate('INDEX.FIRST_TIME_SEED_USE'),
          'info',
          false
        )
      );
    } else if (
      appData.createSeed.triggered &&
      appData.createSeed.secondaryLoginPH
    ) {
      if (appData.createSeed.secondaryLoginPH === appData.createSeed.firstLoginPH) {
        Store.dispatch(
          triggerToaster(
            translate('INDEX.YOUR_SEED_IS_CORRECT'),
            translate('INDEX.CONGRATS_YOURE_ALL_SET'),
            'success',
            false
          )
        );
        appData.createSeed = {
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
        appData.createSeed = {
          triggered: false,
          firstLoginPH: null,
          secondaryLoginPH: null,
        };
      }
    } else {
      appData.createSeed = {
        triggered: false,
        firstLoginPH: null,
        secondaryLoginPH: null,
      };
    }
  }

  getCoinStyle(type) {
    const _coin = this.props.ActiveCoin.coin;
    const _logoData = getCoinTitle(_coin.toUpperCase());

    if (type === 'transparent') {
      if (_logoData.transparentBG &&
          _logoData.logo) {
        return { 'backgroundImage': `url("${assetsPath.bg}/${_logoData.logo.toLowerCase()}_transparent_header_bg.png")` };
      }
    } else if (type === 'title') {
      let _iconPath;

      if (_logoData.titleBG) {
        _iconPath = `${assetsPath.native}/${_logoData.logo.toLowerCase()}_header_title_logo.png`;
      } else if (!_logoData.titleBG) {
        _iconPath = `${assetsPath.coinLogo}/${_coin.toLowerCase()}.png`;
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