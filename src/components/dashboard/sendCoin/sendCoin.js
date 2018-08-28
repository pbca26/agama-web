import React from 'react';
import { connect } from 'react-redux';
import Config from '../../../config';
import translate from '../../../translate/translate';
import {
  triggerToaster,
  clearLastSendToResponseState,
  shepherdElectrumSendPromise,
  shepherdElectrumSend,
  shepherdGetRemoteBTCFees,
  shepherdGetRemoteTimestamp,
  copyString,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import {
  AddressListRender,
  SendRender,
  SendFormRender,
  _SendFormRender,
} from './sendCoin.render';
import {
  isPositiveNumber,
  toSats,
  fromSats,
} from 'agama-wallet-lib/src/utils';
import {
  explorerList,
  isKomodoCoin,
} from 'agama-wallet-lib/src/coin-helpers';
import {
  secondsToString,
  checkTimestamp,
} from 'agama-wallet-lib/src/time';
import Slider, { Range } from 'rc-slider';
import ReactTooltip from 'react-tooltip';
import electrumServers from 'agama-wallet-lib/src/electrum-servers';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import { addressVersionCheck } from 'agama-wallet-lib/src/keys';

const SPV_MAX_LOCAL_TIMESTAMP_DEVIATION = 60; // seconds

const _feeLookup = [
  'fastestFee',
  'halfHourFee',
  'hourFee',
  'advanced'
];

class SendCoin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      addressType: null,
      sendFrom: null,
      sendFromAmount: 0,
      sendTo: '',
      amount: 0,
      fee: 0,
      lastSendToResponse: null,
      coin: null,
      spvVerificationWarning: false,
      spvPreflightSendInProgress: false,
      btcFees: {},
      btcFeesType: 'halfHourFee',
      btcFeesAdvancedStep: 9,
      btcFeesSize: 0,
      btcFeesTimeBasedStep: 1,
      spvPreflightRes: null,
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.updateInput = this.updateInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setRecieverFromScan = this.setRecieverFromScan.bind(this);
    this.SendFormRender = _SendFormRender.bind(this);
    this.setSendAmountAll = this.setSendAmountAll.bind(this);
    this.setSendToSelf = this.setSendToSelf.bind(this);
    this.fetchBTCFees = this.fetchBTCFees.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.onSliderChangeTime = this.onSliderChangeTime.bind(this);
  }

  setSendAmountAll() {
    const _amount = this.state.amount;
    const _amountSats = toSats(this.state.amount);
    const _balanceSats = this.props.ActiveCoin.balance.balanceSats - Math.abs(this.props.ActiveCoin.balance.unconfirmedSats);
    const fee = this.props.ActiveCoin.coin !== 'btc' ? electrumServers[this.props.ActiveCoin.coin].txfee : 0;

    this.setState({
      amount: Number((fromSats(_balanceSats - fee)).toFixed(8)),
    });
  }

  setSendToSelf() {
    this.setState({
      sendTo: this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub,
    });
  }

  copyTXID(txid) {
    Store.dispatch(copyString(txid, translate('SEND.TXID_COPIED')));
  }

  openExplorerWindow() {
    const _coin = this.props.ActiveCoin.coin;
    const txid = this.props.ActiveCoin.lastSendToResponse.txid;
    let url = explorerList[_coin.toUpperCase()].split('/').length - 1 > 2 ? `${explorerList[_coin.toUpperCase()]}${txid}` : `${explorerList[_coin.toUpperCase()]}/tx/${txid}`;

    if (Config.whitelabel) {
      url = `${Config.wlConfig.explorer}/tx/${txid}`;
    }

    return url;
  }

  SendFormRender() {
    return _SendFormRender.call(this);
  }

  componentWillReceiveProps(props) {
    if (this.props.ActiveCoin.coin !== props.ActiveCoin.coin &&
        this.props.ActiveCoin.lastSendToResponse) {
      Store.dispatch(clearLastSendToResponseState());
    }

    if (this.props.ActiveCoin.activeSection !== props.ActiveCoin.activeSection &&
        this.props.ActiveCoin.activeSection !== 'send') {
      this.fetchBTCFees();

      if (this.props.ActiveCoin.coin === 'kmd') {
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
  }

  setRecieverFromScan(receiver) {
    try {
      const recObj = JSON.parse(receiver);

      if (recObj &&
          typeof recObj === 'object') {
        if (recObj.coin === this.props.ActiveCoin.coin) {
          if (recObj.amount) {
            this.setState({
              amount: recObj.amount,
            });
          }
          if (recObj.address) {
            this.setState({
              sendTo: recObj.address,
            });
          }
        } else {
          Store.dispatch(
            triggerToaster(
              translate('SEND.QR_COIN_MISMATCH_MESSAGE_IMPORT_COIN') +
              recObj.coin +
              translate('SEND.QR_COIN_MISMATCH_MESSAGE_ACTIVE_COIN') +
              this.props.ActiveCoin.coin +
              translate('SEND.QR_COIN_MISMATCH_MESSAGE_END'),
              translate('SEND.QR_COIN_MISMATCH_TITLE'),
              'warning'
            )
          );
        }
      }
    } catch (e) {
      this.setState({
        sendTo: receiver,
      });
    }

    document.getElementById('kmdWalletSendTo').focus();
  }

  renderSelectorCurrentLabel() {
    const _balance = this.props.ActiveCoin.balance.balance - Math.abs(this.props.ActiveCoin.balance.unconfirmed);
    const _coin = this.props.ActiveCoin.coin;

    if (this.state.sendFrom) {
      return (
        <span>
          <span className="text">
            [ { this.state.sendFromAmount } { _coin.toUpperCase() } ]  
            { this.state.sendFrom }
          </span>
        </span>
      );
    } else {
      return (
        <span>
          { `[ ${_balance} ${_coin.toUpperCase()} ] ${this.props.Dashboard.electrumCoins[_coin].pub}` }
        </span>
      );
    }
  }

  renderAddressList() {
    return AddressListRender.call(this);
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  fetchBTCFees() {
    if (this.props.ActiveCoin.coin === 'btc') {
      shepherdGetRemoteBTCFees()
      .then((res) => {
        if (res.msg === 'success') {
          // TODO: check, approx fiat value
          this.setState({
            btcFees: res.result,
            btcFeesSize: this.state.btcFeesType === 'advanced' ? res.result.electrum[this.state.btcFeesAdvancedStep] : res.result.recommended[_feeLookup[this.state.btcFeesTimeBasedStep]],
          });
        } else {
          Store.dispatch(
            triggerToaster(
              translate('SEND.UNABLE_TO_GET_BTC_FEE_RATES'),
              translate('SEND.BTC_FEES_FETCH'),
              'error'
            )
          );
        }
      });
    }
  }

  changeSendCoinStep(step, back) {
    if (this.props.ActiveCoin.coin === 'kmd') {
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

    if (step === 0) {
      this.fetchBTCFees();

      if (back) {
        this.setState({
          currentStep: 0,
          spvVerificationWarning: false,
          spvPreflightSendInProgress: false,
        });
      } else {
        Store.dispatch(clearLastSendToResponseState());

        this.setState(this.defaultState);
      }
    }

    if (step === 1) {
      if (!this.validateSendFormData()) {
        return;
      } else {
        this.setState(Object.assign({}, this.state, {
          spvPreflightSendInProgress: true,
          currentStep: step,
        }));

        // spv pre tx push request
        const _coin = this.props.ActiveCoin.coin;
        const fee = _coin !== 'btc' ? electrumServers[_coin].txfee : 0;

        shepherdElectrumSendPromise(
          _coin,
          toSats(this.state.amount),
          this.state.sendTo,
          this.props.Dashboard.electrumCoins[_coin].pub,
          _coin === 'btc' ? { perbyte: true, value: this.state.btcFeesSize } : fee
        )
        .then((sendPreflight) => {
          if (sendPreflight &&
              sendPreflight.msg === 'success') {
            this.setState(Object.assign({}, this.state, {
              spvVerificationWarning: !sendPreflight.result.utxoVerified,
              spvPreflightSendInProgress: false,
              spvPreflightRes: {
                fee: sendPreflight.result.fee,
                value: sendPreflight.result.value,
                change: sendPreflight.result.change,
                estimatedFee: sendPreflight.result.estimatedFee,
              },
            }));
          } else {
            this.setState(Object.assign({}, this.state, {
              spvPreflightSendInProgress: false,
            }));
          }
        });
      }
    }

    if (step === 2) {
      this.setState(Object.assign({}, this.state, {
        currentStep: step,
      }));
      this.handleSubmit();
    }
  }

  handleSubmit() {
    if (!this.validateSendFormData()) {
      return;
    }

    const _coin = this.props.ActiveCoin.coin;
    const _pub = this.props.Dashboard.electrumCoins[_coin].pub;
    // no op
    if (_pub) {
      const fee = _coin !== 'btc' ? electrumServers[_coin].txfee : 0;

      shepherdElectrumSendPromise(
        _coin,
        toSats(this.state.amount),
        this.state.sendTo,
        _pub,
        _coin === 'btc' ? { perbyte: true, value: this.state.btcFeesSize } : fee,
        true
      );
    }
  }

  // TODO: reduce to a single toast
  validateSendFormData() {
    let valid = true;
    const _coin = this.props.ActiveCoin.coin;
    const _amount = this.state.amount;
    const _amountSats = Math.floor(toSats(this.state.amount));
    const _balanceSats = this.props.ActiveCoin.balance.balanceSats - Math.abs(this.props.ActiveCoin.balance.unconfirmedSats);
    const fee = _coin !== 'btc' ? electrumServers[_coin].txfee : 0;

    if ((Number(_amountSats) + fee) > _balanceSats) {
      Store.dispatch(
        triggerToaster(
          `${translate('SEND.INSUFFICIENT_FUNDS')} ${translate('SEND.MAX_AVAIL_BALANCE')}` +
          `${Number(fromSats((_balanceSats - fee)).toFixed(8))} ${_coin.toUpperCase()}`,
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    } else if (Number(_amountSats) < fee) {
      Store.dispatch(
        triggerToaster(
          `${translate('SEND.AMOUNT_IS_TOO_SMALL', this.state.amount)}, ${translate('SEND.MIN_AMOUNT_IS', _coin.toUpperCase())} ${Number(fromSats(fee))}`,
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    }

    if (!this.state.sendTo) {
      let _validateAddress;
      let _msg;

      if (isKomodoCoin(_coin) || Config.whitelabel) {
        _validateAddress = addressVersionCheck(btcNetworks.kmd, this.state.sendTo);
      } else {
        _validateAddress = addressVersionCheck(btcNetworks[_coin], this.state.sendTo);
      }

      if (_validateAddress === 'Invalid pub address') {
        _msg = _validateAddress;
      } else if (!_validateAddress) {
        _msg = `${this.state.sendTo} ${translate('SEND.IS_NOT_A_VALID_ADDR', _coin.toUpperCase())}`;
      }

      if (_msg) {
        Store.dispatch(
          triggerToaster(
            _msg,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
        valid = false;
      }
    }

    if (!isPositiveNumber(this.state.amount)) {
      Store.dispatch(
        triggerToaster(
          translate('SEND.AMOUNT_POSITIVE_NUMBER'),
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    }

    return valid;
  }

  onSliderChange(value) {
    this.setState({
      btcFeesSize: this.state.btcFees.electrum[value],
      btcFeesAdvancedStep: value,
    });
  }

  onSliderChangeTime(value) {
    this.setState({
      btcFeesSize: _feeLookup[value] === 'advanced' ? this.state.btcFees.electrum[this.state.btcFeesAdvancedStep] : this.state.btcFees.recommended[_feeLookup[value]],
      btcFeesType: _feeLookup[value] === 'advanced' ? 'advanced' : null,
      btcFeesTimeBasedStep: value,
    });
  }

  renderBTCFees() {
    if (this.props.ActiveCoin.coin === 'btc' &&
        !this.state.btcFees.lastUpdated) {
      return (
        <div className="col-lg-6 form-group form-material">
          { translate('SEND.FETCHING_BTC_FEES') }...
        </div>
      );
    } else if (
      this.props.ActiveCoin.coin === 'btc' &&
      this.state.btcFees.lastUpdated
    ) {
      const _blockBased = {
        min: 0,
        max: this.state.btcFees.electrum.length - 1,
      };
      const _confTime = [
        translate('SEND.CONF_TIME_LESS_THAN_30_MIN'),
        translate('SEND.CONF_TIME_WITHIN_3O_MIN'),
        translate('SEND.CONF_TIME_WITHIN_60_MIN'),
      ];
      const _timeBased = {
        min: 0,
        max: 3,
      };
      let _toolTipContent;

      if (this.state.btcFeesType === 'advanced') {
        _toolTipContent = translate('SEND.BTC_FEES_DESC_P1') + '.<br />' + translate('SEND.BTC_FEES_DESC_P2');
      } else {
        _toolTipContent = translate('SEND.BTC_FEES_DESC_P3') + '<br />' + translate('SEND.BTC_FEES_DESC_P4');
      }

      return (
        <div className="col-lg-12 form-group form-material">
          <div>
            <div>
              Fee
              <span>
                <i
                  className="icon fa-question-circle settings-help"
                  data-html={ true }
                  data-tip={ _toolTipContent }></i>
                <ReactTooltip
                  effect="solid"
                  className="text-left" />
              </span>
            </div>
            <div className="send-target-block">
              { this.state.btcFeesType !== 'advanced' &&
                <span>
                  { translate('SEND.CONF_TIME') } <strong>{ _confTime[this.state.btcFeesTimeBasedStep] }</strong>
                </span>
              }
              { this.state.btcFeesType === 'advanced' &&
                <span>{ translate('SEND.ADVANCED_SELECTION') }</span>
              }
            </div>
            <Slider
              className="send-slider-time-based margin-bottom-70"
              onChange={ this.onSliderChangeTime }
              defaultValue={ this.state.btcFeesTimeBasedStep }
              min={ _timeBased.min }
              max={ _timeBased.max }
              dots={ true }
              marks={{
                0: 'fast',
                1: 'average',
                2: 'slow',
                3: 'advanced',
              }} />
            { this.state.btcFeesType === 'advanced' &&
              <div className="margin-bottom-20">
                <div className="send-target-block">
                  <span className="padding-right-5">{ translate('SEND.BTC_EST_PREDICTION') }</span>
                  <strong>{ this.state.btcFeesAdvancedStep + 1 } { (this.state.btcFeesAdvancedStep + 1) > 1 ? 'blocks' : 'block' }</strong>
                </div>
                <Slider
                  onChange={ this.onSliderChange }
                  defaultValue={ this.state.btcFeesAdvancedStep }
                  min={ _blockBased.min }
                  max={ _blockBased.max } />
              </div>
            }
            { this.state.btcFeesSize > 0 &&
              <div className="margin-top-10">
                { translate('SEND.FEE_PER_BYTE') } { this.state.btcFeesSize }, { translate('SEND.FEE_PER_KB') } { this.state.btcFeesSize * 1024 }
              </div>
            }
          </div>
        </div>
      );
    }
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin &&
        (this.props.ActiveCoin.activeSection === 'send' || this.props.activeSection === 'send')) {
      return SendRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state, props) => {
  let _mappedProps = {
    ActiveCoin: {
      addresses: state.ActiveCoin.addresses,
      coin: state.ActiveCoin.coin,
      mode: state.ActiveCoin.mode,
      opids: state.ActiveCoin.opids,
      balance: state.ActiveCoin.balance,
      activeSection: state.ActiveCoin.activeSection,
      lastSendToResponse: state.ActiveCoin.lastSendToResponse,
      progress: state.ActiveCoin.progress,
    },
    Dashboard: state.Dashboard,
  };

  if (props &&
      props.activeSection &&
      props.renderFormOnly) {
    _mappedProps.ActiveCoin.activeSection = props.activeSection;
    _mappedProps.renderFormOnly = props.renderFormOnly;
  }

  return _mappedProps;
};

export default connect(mapStateToProps)(SendCoin);