import React from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import Store from '../../../store';
import {
  toggleClaimInterestModal,
  getListUnspent,
  getRawTransaction,
  copyString,
  sendToAddressPromise,
  triggerToaster,
  shepherdElectrumListunspent,
  shepherdElectrumSendPromise,
  validateAddressPromise,
  shepherdGetRemoteTimestamp,
} from '../../../actions/actionCreators';
import translate from '../../../translate/translate';
import {
  ClaimInterestModalRender,
  _ClaimInterestTableRender,
} from './claimInterestModal.render';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import {
  secondsToString,
  checkTimestamp,
} from 'agama-wallet-lib/src/time';

const SPV_MAX_LOCAL_TIMESTAMP_DEVIATION = 60; // seconds

class ClaimInterestModal extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      isLoading: true,
      transactionsList: [],
      displayShowZeroInterestToggle: false,
      showZeroInterest: true,
      totalInterest: 0,
      spvPreflightSendInProgress: false,
      spvVerificationWarning: false,
      loading: false,
      className: 'hide',
    };
    this.claimInterestTableRender = this.claimInterestTableRender.bind(this);
    this.toggleZeroInterest = this.toggleZeroInterest.bind(this);
    this.loadListUnspent = this.loadListUnspent.bind(this);
    this.checkTransactionsListLength = this.checkTransactionsListLength.bind(this);
    this.cancelClaimInterest = this.cancelClaimInterest.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.confirmClaimInterest = this.confirmClaimInterest.bind(this);
  }

  loadListUnspent() {
    let _transactionsList = [];
    let _totalInterest = 0;
    let _zeroInterestUtxo = false;

    this.setState({
      loading: true,
    });
    setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 1000);

    shepherdElectrumListunspent(
      this.props.ActiveCoin.coin,
      this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub
    )
    .then((json) => {
      if (json &&
          json !== 'error' &&
          typeof json.result !== 'string' &&
          json.length) {
        for (let i = 0; i < json.length; i++) {
          if (Number(json[i].interest) === 0) {
            _zeroInterestUtxo = true;
          }

          _transactionsList.push({
            address: json[i].address,
            locktime: json[i].locktime,
            amount: Number(Number(json[i].amount).toFixed(8)),
            interest: Number(Number(json[i].interest).toFixed(8)),
            txid: json[i].txid,
          });
          _totalInterest += Number(Number(json[i].interest).toFixed(8));
        }

        this.setState({
          transactionsList: _transactionsList,
          isLoading: false,
          totalInterest: _totalInterest,
          displayShowZeroInterestToggle: _zeroInterestUtxo,
        });
      } else {
        this.setState({
          transactionsList: [],
          isLoading: false,
          totalInterest: 0,
        });
      }
    });
  }

  cancelClaimInterest() {
    this.setState(Object.assign({}, this.state, {
      spvVerificationWarning: false,
      spvPreflightSendInProgress: false,
    }));
  }

  confirmClaimInterest() {
    const _coin = this.props.ActiveCoin.coin;
    const _pub = this.props.Dashboard.electrumCoins[_coin].pub

    shepherdElectrumSendPromise(
      _coin,
      this.props.ActiveCoin.balance.balanceSats,
      _pub,
      _pub,
      electrumServers[_coin].txfee,
      true
    )
    .then((res) => {
      if (res.msg === 'error') {
        Store.dispatch(
          triggerToaster(
            res.result,
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      } else {
        Store.dispatch(
          triggerToaster(
            `${translate('TOASTR.CLAIM_INTEREST_BALANCE_SENT_P1')} ${_pub}. ${translate('TOASTR.CLAIM_INTEREST_BALANCE_SENT_P2')}`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success',
            false
          )
        );
        this.closeModal();
      }
    });
  }

  claimInterest() {
    const _coin = this.props.ActiveCoin.coin;
    const _pub = this.props.Dashboard.electrumCoins[_coin].pub;

    if (this.props.ActiveCoin.coin === 'kmd') {
      this.setState(Object.assign({}, this.state, {
        spvVerificationWarning: false,
        spvPreflightSendInProgress: true,
      }));

      shepherdElectrumSendPromise(
        _coin,
        this.props.ActiveCoin.balance.balanceSats,
        _pub,
        _pub,
        electrumServers[_coin].txfee
      )
      .then((sendPreflight) => {
        if (sendPreflight &&
            sendPreflight.msg === 'success') {
          this.setState(Object.assign({}, this.state, {
            spvVerificationWarning: !sendPreflight.result.utxoVerified,
            spvPreflightSendInProgress: false,
          }));

          if (sendPreflight.result.utxoVerified) {
            this.confirmClaimInterest();
          }
        } else {
          Store.dispatch(
            triggerToaster(
              sendPreflight.result,
              'Error',
              'error'
            )
          );
          this.setState(Object.assign({}, this.state, {
            spvPreflightSendInProgress: false,
          }));
        }
      });
    }
  }

  checkTransactionsListLength() {
    if (this.state.transactionsList &&
        this.state.transactionsList.length) {
      return true;
    } else if (
      !this.state.transactionsList ||
      !this.state.transactionsList.length
    ) {
      return false;
    }
  }

  toggleZeroInterest() {
    this.setState({
      showZeroInterest: !this.state.showZeroInterest,
    });
  }

  copyTxId(txid) {
    Store.dispatch(copyString(txid, translate('TOASTR.TXID_COPIED')));
  }

  claimInterestTableRender() {
    return _ClaimInterestTableRender.call(this);
  }

  componentWillReceiveProps(props) {
    if (props.Dashboard.displayClaimInterestModal !== this.state.open) {
      this.setState({
        className: props.Dashboard.displayClaimInterestModal ? 'show fade' : 'show out',
      });

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: props.Dashboard.displayClaimInterestModal,
          className: props.Dashboard.displayClaimInterestModal ? 'show in' : 'hide',
        }));
      }, props.Dashboard.displayClaimInterestModal ? 50 : 300);
    }

    if (!this.state.open &&
        props.Dashboard.displayClaimInterestModal) {
      this.loadListUnspent();

      shepherdGetRemoteTimestamp()
      .then((res) => {
        if (res.msg === 'success') {
          if (Math.abs(checkTimestamp(res.result)) > SPV_MAX_LOCAL_TIMESTAMP_DEVIATION) {
            Store.dispatch(
              triggerToaster(
                translate('SEND.CLOCK_OUT_OF_SYNC'),
                translate('TOASTR.WALLET_NOTIFICATION'),
                'warning',
                false
              )
            );
          }
        }
      });
    }
  }

  closeModal() {
    this.setState({
      isLoading: true,
      transactionsList: [],
      showZeroInterest: true,
      totalInterest: 0,
      spvPreflightSendInProgress: false,
      spvVerificationWarning: false,
    });
    Store.dispatch(toggleClaimInterestModal(false));
  }

  render() {
    if (this.props.ActiveCoin &&
        this.props.ActiveCoin.coin &&
        this.props.ActiveCoin.coin === 'kmd') {
      return ClaimInterestModalRender.call(this);
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
      balance: state.ActiveCoin.balance,
      activeSection: state.ActiveCoin.activeSection,
      progress: state.ActiveCoin.progress,
    },
    Dashboard: {
      displayClaimInterestModal: state.Dashboard.displayClaimInterestModal,
      electrumCoins: state.Dashboard.electrumCoins,
    },
  };
};

export default connect(mapStateToProps)(ClaimInterestModal);