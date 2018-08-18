import React from 'react';
import { connect } from 'react-redux';
import {
  copyCoinAddress,
  toggleDashboardActiveSection,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import { WalletsNavWithWalletRender } from './walletsNav.render';

const NET_INFO_INTERVAL = 10000;

class WalletsNav extends React.Component {
  constructor() {
    super();
    this.checkTotalBalance = this.checkTotalBalance.bind(this);
  }

  copyMyAddress(address) {
    Store.dispatch(copyCoinAddress(address));
  }

  checkTotalBalance() {
    const _mode = this.props.ActiveCoin.mode;
    let _balance = '0';

    if (this.props.ActiveCoin.balance.balance) {
      _balance = this.props.ActiveCoin.balance.balance;
    }

    return _balance;
  }

  toggleSection(section, def) {
    if (def) {
      Store.dispatch(toggleDashboardActiveSection(section));
    } else {
      Store.dispatch(
        toggleDashboardActiveSection(
          this.props.ActiveCoin.activeSection === section ? 'default' : section
        )
      );
    }
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin &&
        !this.props.ActiveCoin.coin) {
      return null;
    }

    return WalletsNavWithWalletRender.call(this);
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
      activeSection: state.ActiveCoin.activeSection,
      activeAddress: state.ActiveCoin.activeAddress,
    },
    Dashboard: state.Dashboard,
    nativeOnly: Config.iguanaLessMode,
  };
};

export default connect(mapStateToProps)(WalletsNav);