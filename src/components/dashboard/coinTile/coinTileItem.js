import React from 'react';
import { connect } from 'react-redux';
import {
  dashboardChangeActiveCoin,
  getAddressesByAccount,
  startInterval,
  stopInterval,
  getKMDAddressesNative,
  changeActiveAddress,
  getKMDBalanceTotal,
  shepherdElectrumBalance,
  shepherdElectrumTransactions,
  shepherdElectrumCoins,
  shepherdElectrumListunspent,
  electrumServerChanged,
  getDexCoins,
  activeHandle,
  triggerToaster,
  shepherdRemoveCoin,
  dashboardRemoveCoin,
  prices,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import translate from '../../../translate/translate';

import CoinTileItemRender from './coinTileItem.render';

const SPV_DASHBOARD_UPDATE_TIMEOUT = 60000;
const PRICES_UPDATE_INTERVAL = 120000; // every 2m

class CoinTileItem extends React.Component {
  constructor() {
    super();
    this.state = {
      activeCoin: null,
      activeCoinMode: null,
      toggledCoinMenu: null,
    };
    this.pricesInterval = null;
    this.autoSetActiveCoin = this.autoSetActiveCoin.bind(this);
    this.toggleCoinMenu = this.toggleCoinMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentWillMount() {
    if (!this.props.ActiveCoin.coin) {
      this.autoSetActiveCoin();
    }

    document.addEventListener(
      'click',
      this.handleClickOutside,
      false
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      this.handleClickOutside,
      false
    );
  }

  handleClickOutside(e) {
    const _srcElement = e ? e.srcElement : null;

    if (e &&
        _srcElement &&
        _srcElement.offsetParent &&
        _srcElement.offsetParent.className.indexOf('dropdown') === -1 &&
        (_srcElement.offsetParent && _srcElement.offsetParent.className.indexOf('dropdown') === -1)) {
      this.setState({
        toggledCoinMenu: _srcElement.className.indexOf('coin-tile-context-menu-trigger') === -1 ? null : this.state.toggledCoinMenu,
      });
    }
  }

  toggleCoinMenu(coin) {
    this.setState({
      toggledCoinMenu: this.state.toggledCoinMenu === coin ? null : coin,
    });
  }

  openCoindDownModal() {
    Store.dispatch(toggleCoindDownModal(true));
  }

  autoSetActiveCoin(skipCoin) {
    const modes = [
      'spv',
    ];
    const allCoins = this.props.Main.coins;
    let _coinSelected = false;
    let _coinMode = {};
    let _mode;
    let _coin;

    if (allCoins) {
      modes.map((mode) => {
        allCoins[mode].map((coin) => {
          if (!_coinSelected &&
              coin !== skipCoin) {
            _coinSelected = true;
            _coin = coin;
            _mode = mode;
          }
          _coinMode[coin] = mode;
        });

        if (_coinMode.kmd &&
            _coinMode.kmd === 'spv' &&
            skipCoin !== 'kmd') {
          _coin = 'kmd';
          _mode = 'spv';
        }
      });

      setTimeout(() => {
        this._dashboardChangeActiveCoin(_coin, _mode, true);
      }, 100);
    }
  }

  removeCoin(coin, mode) {
    this.setState({
      toggledCoinMenu: null,
    });

    shepherdRemoveCoin(coin, mode)
    .then((res) => {
      Store.dispatch(
        triggerToaster(
          `${coin.toUpperCase()} ${translate('TOASTR.COIN_IS_REMOVED')}`,
          translate('TOASTR.COIN_NOTIFICATION'),
          'success'
        )
      );

      Store.dispatch(dashboardRemoveCoin(coin));
      this.autoSetActiveCoin(coin);
      
      setTimeout(() => {
        Store.dispatch(getDexCoins());
        Store.dispatch(activeHandle());
      }, 500);
    });
  }

  dispatchCoinActions(coin, mode) {
    if (this.props.Dashboard &&
        this.props.Dashboard.activeSection === 'wallets') {
      const _coinData = this.props.Dashboard.electrumCoins[coin];

      if (this.props.Dashboard.electrumCoins &&
          _coinData &&
          _coinData.pub) {
        Store.dispatch(shepherdElectrumBalance(coin, _coinData.pub));
        shepherdElectrumListunspent(coin, _coinData.pub);

        if (this.props.ActiveCoin.activeSection === 'default') {
          Store.dispatch(shepherdElectrumTransactions(coin, _coinData.pub));
        }
      }
    }
  }

  _dashboardChangeActiveCoin(coin, mode, skipCoinsArrUpdate) {
    if (coin !== this.props.ActiveCoin.coin) {
      Store.dispatch(dashboardChangeActiveCoin(coin, mode, skipCoinsArrUpdate));
      setTimeout(() => {
        this.dispatchCoinActions(coin, mode);
      }, 100);

      setTimeout(() => {
        this.dispatchCoinActions(coin, mode);
      }, 1000);

      if (this.props.Interval.interval.sync) {
        Store.dispatch(
          stopInterval(
            'sync',
            this.props.Interval.interval
          )
        );
      }

      if (this.props.Interval.interval.prices) {
        Store.dispatch(
          stopInterval(
            'prices',
            this.props.Interval.interval
          )
        );
      }

      const _iguanaActiveHandle = setInterval(() => {
        this.dispatchCoinActions(coin, mode);
      }, SPV_DASHBOARD_UPDATE_TIMEOUT);

      Store.dispatch(startInterval('sync', _iguanaActiveHandle));

      if (Config.fiatRates) {  
        Store.dispatch(prices(coin, Config.defaultFiatCurrency));

        const _pricesInterval = this.pricesInterval = setInterval(() => {
          Store.dispatch(prices(coin, Config.defaultFiatCurrency));
        }, PRICES_UPDATE_INTERVAL);

        Store.dispatch(startInterval('prices', _pricesInterval));
      }
    }
  }

  componentWillReceiveProps(props) {
    if (this.props &&
        this.props.Dashboard &&
        this.props.Dashboard.eletrumServerChanged &&
        this.props.Dashboard &&
        this.props.Dashboard.activeSection === 'wallets') {
      const _coin = this.props.ActiveCoin.coin;
      const _pub = this.props.Dashboard.electrumCoins[_coin].pub;

      Store.dispatch(shepherdElectrumBalance(_coin, _pub));
      Store.dispatch(shepherdElectrumTransactions(_coin, _pub));
      Store.dispatch(electrumServerChanged(false));
      setTimeout(() => {
        Store.dispatch(electrumServerChanged(false));
      }, 100);
    }

    this.setState({
      activeCoin: props.ActiveCoin.coin,
      activeCoinMode: props.ActiveCoin.mode,
    });
  }

  render() {
    return CoinTileItemRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      coins: state.ActiveCoin.coins,
      mode: state.ActiveCoin.mode,
      addresses: state.ActiveCoin.addresses,
      mainBasiliskAddress: state.ActiveCoin.mainBasiliskAddress,
      progress: state.ActiveCoin.progress,
      rescanInProgress: state.ActiveCoin.rescanInProgress,
      getinfoFetchFailures: state.ActiveCoin.getinfoFetchFailures,
      activeSection: state.ActiveCoin.activeSection,
    },
    Dashboard: state.Dashboard,
    Interval: {
      interval: state.Interval.interval,
    },
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(CoinTileItem);