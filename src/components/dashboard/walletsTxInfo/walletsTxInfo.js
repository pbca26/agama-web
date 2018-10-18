import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { sortByDate } from 'agama-wallet-lib/src/utils';
import { toggleDashboardTxInfoModal } from '../../../actions/actionCreators';
import Store from '../../../store';
import WalletsTxInfoRender from './walletsTxInfo.render';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';
import Config from '../../../config';

class WalletsTxInfo extends React.Component {
  constructor() {
    super();
    this.state = {
      activeTab: 0,
      txDetails: null,
      rawTxDetails: null,
      className: 'hide',
    };
    this.toggleTxInfoModal = this.toggleTxInfoModal.bind(this);
  }

  toggleTxInfoModal() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      Store.dispatch(toggleDashboardTxInfoModal(false));

      this.setState(Object.assign({}, this.state, {
        activeTab: 0,
      }));
    }, 300);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ActiveCoin &&
        nextProps.ActiveCoin.showTransactionInfo &&
        nextProps.ActiveCoin.showTransactionInfoTxIndex &&
        nextProps.ActiveCoin.showTransactionInfoTxIndex !== this.state.txDetails) {
      this.setState(Object.assign({}, this.state, {
        txDetails: nextProps.ActiveCoin.showTransactionInfoTxIndex,
        rawTxDetails: nextProps.ActiveCoin.showTransactionInfoTxIndex,
        className: nextProps.ActiveCoin.showTransactionInfo ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          className: nextProps.ActiveCoin.showTransactionInfo ? 'show in' : 'hide',
        }));
      }, nextProps.ActiveCoin.showTransactionInfo ? 50 : 300);
    }
  }

  openTab(tab) {
    this.setState(Object.assign({}, this.state, {
      activeTab: tab,
    }));
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.toggleTxInfoModal();
    }
  }

  openExplorerWindow(txid) {
    const _coin = this.props.ActiveCoin.coin.toUpperCase();
    let url;

    if (explorerList[_coin].split('/').length - 1 > 2) {
      url = `${explorerList[_coin]}${this.state.txDetails.txid}`;
    } else {
      url = `${explorerList[_coin]}/tx/${this.state.txDetails.txid}`;
    }

    if (Config.whitelabel) {
      url = `${Config.wlConfig.explorer}/tx/${this.state.txDetails.txid}`;
    }

    return url;
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin &&
        this.props.ActiveCoin.showTransactionInfo &&
        this.props.ActiveCoin.activeSection === 'default') {
      return WalletsTxInfoRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
      txhistory: state.ActiveCoin.txhistory,
      showTransactionInfo: state.ActiveCoin.showTransactionInfo,
      activeSection: state.ActiveCoin.activeSection,
      activeAddress: state.ActiveCoin.activeAddress,
      showTransactionInfoTxIndex: state.ActiveCoin.showTransactionInfoTxIndex,
    },
  };
};

export default connect(mapStateToProps)(WalletsTxInfo);