import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { shepherdElectrumBalance } from '../../../actions/actionCreators';
import Config from '../../../config';
import { formatValue } from 'agama-wallet-lib/src/utils';
import ReactTooltip from 'react-tooltip';
import Store from '../../../store';

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
    let _balance = 0;

    if (this.props.ActiveCoin.balance === 'connection error or incomplete data') {
      _balance = '-777';
    }

    if (this.props.ActiveCoin.balance.balance) {
      if (this.props.ActiveCoin.coin.toUpperCase() === 'KMD') {
        if (type === 'total' &&
            this.props.ActiveCoin.balance &&
            this.props.ActiveCoin.balance.total) {
          _balance = Number(this.props.ActiveCoin.balance.total) - Number(Math.abs(this.props.ActiveCoin.balance.unconfirmed));
        }

        if (type === 'interest' &&
            this.props.ActiveCoin.balance &&
            this.props.ActiveCoin.balance.interest) {
          _balance = this.props.ActiveCoin.balance.interest;
        }

        if (type === 'transparent' &&
            this.props.ActiveCoin.balance &&
            this.props.ActiveCoin.balance.balance) {
          _balance = Number(this.props.ActiveCoin.balance.balance) - Number(Math.abs(this.props.ActiveCoin.balance.unconfirmed));
        }
      } else {
        _balance = Number(this.props.ActiveCoin.balance.balance) - Number(Math.abs(this.props.ActiveCoin.balance.unconfirmed));
      }
    }

    _balance = Number(_balance.toFixed(8));

    if (Config.fiatRates &&
        this.props.Dashboard.prices &&
        returnFiatPrice) {
      const _prices = this.props.Dashboard.prices;
      let _fiatPriceTotal = 0;
      let _fiatPricePerCoin = 0;

      if (this.props.ActiveCoin.coin.toUpperCase() === 'KMD') {
        if (_prices.fiat &&
            _prices.fiat.USD) {
          _fiatPriceTotal = formatValue(_balance * _prices.fiat.USD);
          _fiatPricePerCoin = _prices.fiat.USD;
        }
      } else {
        if (_prices.fiat &&
            _prices.fiat.USD &&
            _prices[`${this.props.ActiveCoin.coin.toUpperCase()}/KMD`] &&
            _prices[`${this.props.ActiveCoin.coin.toUpperCase()}/KMD`].low) {
          _fiatPriceTotal = _balance * _prices.fiat.USD * _prices[`${this.props.ActiveCoin.coin.toUpperCase()}/KMD`].low;
          _fiatPricePerCoin = _prices.fiat.USD * _prices[`${this.props.ActiveCoin.coin.toUpperCase()}/KMD`].low;
        }
      }

      return (
        <div>
          <div className="text-right">{ _balance }</div>
          { _fiatPriceTotal > 0 &&
            _fiatPricePerCoin > 0 &&
            <div
              data-tip={ `${translate('INDEX.PRICE_PER')} ${this.props.ActiveCoin.coin.toUpperCase()} ~ $${formatValue(_fiatPricePerCoin)}` }
              className="text-right">${ formatValue(_fiatPriceTotal) }</div>
          }
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
      <span key={ `translate-${Math.random(0, 9) * 10}` }>
        {_translation}
        <br />
      </span>
    );
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