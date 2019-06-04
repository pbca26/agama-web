import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { shepherdElectrumBalance } from '../../../actions/actionCreators';
import Config from '../../../config';
import { formatValue } from 'agama-wallet-lib/src/utils';
import ReactTooltip from 'react-tooltip';
import Store from '../../../store';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';

import WalletsBalanceRender from './walletsBalance.render';

class WalletsBalance extends React.Component {
  constructor() {
    super();
    this.state = {
      currentAddress: null,
      loading: false,
    };
    this.refreshBalance = this.refreshBalance.bind(this);
  }

  componentWillReceiveProps(props) {
    if (this.props.ActiveCoin.activeAddress) {
      this.setState(Object.assign({}, this.state, {
        currentAddress: this.props.ActiveCoin.activeAddress,
      }));
    }
  }

  refreshBalance() {
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 1000);

    Store.dispatch(
      shepherdElectrumBalance(
        this.props.ActiveCoin.coin,
        this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub
      )
    );
  }

  renderBalance(type, returnFiatPrice) {
    const _mode = this.props.ActiveCoin.mode;
    const _balanceProps = this.props.ActiveCoin.balance;
    const _coin = this.props.ActiveCoin.coin.toUpperCase();
    let _balance = 0;

    if (_balanceProps === 'connection error or incomplete data') {
      _balance = '-777';
    }

    if (_balanceProps.balance) {
      if (_coin === 'KMD') {
        if (type === 'total' &&
            _balanceProps &&
            _balanceProps.total) {
          _balance = Number(_balanceProps.total) + Number(_balanceProps.unconfirmed);
        }

        if (type === 'interest' &&
            _balanceProps &&
            _balanceProps.interest) {
          _balance = _balanceProps.interest;
        }

        if (type === 'transparent' &&
            _balanceProps &&
            _balanceProps.balance) {
          _balance = Number(_balanceProps.balance) + Number(_balanceProps.unconfirmed);
        }
      } else {
        _balance = Number(_balanceProps.balance) + Number(_balanceProps.unconfirmed);
      }
    }

    _balance = Number(_balance.toFixed(8));

    if (Config.fiatRates &&
        this.props.Dashboard.prices &&
        this.props.Dashboard.prices[_coin] &&
        returnFiatPrice) {
      const _prices = this.props.Dashboard.prices;
      const _defaultFiat = Config.defaultFiatCurrency.toUpperCase();
      let _fiatPriceTotal = _balance * _prices[_coin][_defaultFiat];
      let _fiatPricePerCoin = _prices[_coin][_defaultFiat];
      let _priceChangeColor = 'green';

      if (isKomodoCoin(_coin.toUpperCase()) &&
          _prices[_coin.toUpperCase()].hasOwnProperty('KIC')) {
        _fiatPricePerCoin = 0;
        _fiatPricePerCoin = 0;
      }

      if (_prices[_coin].priceChange &&
          _prices[_coin].priceChange.data &&
          _prices[_coin].priceChange.data.hasOwnProperty('percent_change_1h') &&
          _prices[_coin].priceChange.data.percent_change_1h < 0) {
        _priceChangeColor = 'red';
      }

      if (_prices[_coin].priceChange &&
          _prices[_coin].priceChange.data &&
          _prices[_coin].priceChange.data.hasOwnProperty('percent_change_24h') &&
          _prices[_coin].priceChange.data.percent_change_24h < 0) {
        _priceChangeColor = 'red';
      }

      return (
        <div>
          <div className="text-right">{ _balance }</div>
          { _fiatPriceTotal > 0 &&
            _fiatPricePerCoin > 0 &&
            <div
              data-tip={ `${translate('INDEX.PRICE_PER')} ${_coin} ~ $${formatValue(_fiatPricePerCoin)}` }
              data-for="balance1"
              className="text-right">${ formatValue(_fiatPriceTotal) }</div>
          }
          <ReactTooltip
            id="balance1"
            effect="solid"
            className="text-left" />
        </div>
      );
    } else {
      if (Config.roundValues) {
        return formatValue(_balance);
      } else {
        return Number(_balance);
      }
    }
  }

  isActiveCoinMode(coinMode) {
    return this.props.ActiveCoin.mode === coinMode;
  }

  renderLB(_translationID) {
    const _translationComponents = translate(_translationID).split('<br>');

    return _translationComponents.map((_translation) =>
      <span
        className="display--block"
        key={ `translate-${Math.random(0, 9) * 10}` }>
        {_translation}
        <br />
      </span>
    );
  }

  renderUnconfBalanceIcon() {
    if (this.props.ActiveCoin.balance.unconfirmed &&
        Number(this.props.ActiveCoin.balance.unconfirmed) !== 0) {
      return true;
    }
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin &&
        this.props.ActiveCoin.coin &&
        this.props.ActiveCoin.activeSection === 'default' &&
        !this.props.ActiveCoin.send &&
        !this.props.ActiveCoin.receive) {
      return WalletsBalanceRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      mode: state.ActiveCoin.mode,
      send: state.ActiveCoin.send,
      receive: state.ActiveCoin.receive,
      balance: state.ActiveCoin.balance,
      cache: state.ActiveCoin.cache,
      activeSection: state.ActiveCoin.activeSection,
      activeAddress: state.ActiveCoin.activeAddress,
      progress: state.ActiveCoin.progress,
    },
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(WalletsBalance);