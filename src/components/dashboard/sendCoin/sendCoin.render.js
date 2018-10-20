import React from 'react';
import translate from '../../../translate/translate';
import QRModal from '../qrModal/qrModal';
import { formatValue } from 'agama-wallet-lib/src/utils';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';
import ReactTooltip from 'react-tooltip';
import Config from '../../../config';
import {
  toSats,
  fromSats,
} from 'agama-wallet-lib/src/utils';

export const AddressListRender = function() {
  const _balance = this.props.ActiveCoin.balance.balance + this.props.ActiveCoin.balance.unconfirmed;
  const _coin = this.props.ActiveCoin.coin;

  return (
    <div className={ `btn-group bootstrap-select form-control form-material showkmdwalletaddrs show-tick ${(this.state.addressSelectorOpen ? 'open' : '')}` }>
      <button
        type="button"
        className="btn dropdown-toggle btn-info disabled"
        onClick={ this.openDropMenu }>
        <span className="filter-option pull-left">{ this.renderSelectorCurrentLabel() }</span>
        <span className="bs-caret">
          <span className="caret"></span>
        </span>
      </button>
      <div className="dropdown-menu open">
        <ul className="dropdown-menu inner">
          <li className="selected">
            <a>
              <span className="text">
                [ { _balance } { Config.sendCoinAllowFiatEntry && Config.fiatRates && this.state.valuesInFiat && this.props.Dashboard.prices ? 'USD' : _coin.toUpperCase() } ] { this.props.Dashboard.electrumCoins[_coin].pub }
              </span>
              <span
                className="icon fa-check check-mark pull-right"
                style={{ display: this.state.sendFrom === null ? 'inline-block' : 'none' }}></span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export const _SendFormRender = function() {
  return (
    <div className="extcoin-send-form">
      <div className="row">
        <div className="col-xlg-12 form-group form-material">
          <label className="control-label padding-bottom-10">
            { translate('INDEX.SEND_FROM') }
          </label>
          { this.renderAddressList() }
        </div>
      </div>
      <div className="row">
        <div className="col-xlg-12 form-group form-material">
          <button
            type="button"
            className="btn btn-default btn-send-self"
            onClick={ this.setSendToSelf }>
            { translate('SEND.SELF') }
          </button>
          <label
            className="control-label"
            htmlFor="kmdWalletSendTo">{ translate('INDEX.SEND_TO') }</label>
          <input
            type="text"
            className="form-control"
            name="sendTo"
            onChange={ this.updateInput }
            value={ this.state.sendTo }
            id="kmdWalletSendTo"
            placeholder={ translate('SEND.ENTER_ADDRESS') }
            autoComplete="off"
            required />
        </div>
        <div className="col-xlg-12 form-group form-material">
          <button
            type="button"
            className="btn btn-default btn-send-self"
            onClick={ this.setSendAmountAll }>
            { translate('SEND.ALL') }
          </button>
          <label
            className="control-label"
            htmlFor="kmdWalletAmount">
            { translate('INDEX.AMOUNT') }
          </label>
          <input
            type="text"
            className="form-control"
            name="amount"
            value={ this.state.amount !== 0 ? this.state.amount : '' }
            onChange={ this.updateInput }
            id="kmdWalletAmount"
            placeholder="0.000"
            autoComplete="off" />
        </div>
        { this.renderBTCFees() }
        <div className="col-xlg-12">
          <button
            type="button"
            className="btn btn-primary waves-effect waves-light pull-right"
            onClick={ this.props.renderFormOnly ? this.handleSubmit : () => this.changeSendCoinStep(1) }
            disabled={ !this.state.sendTo || !this.state.amount }>
            { Config.sendCoinAllowFiatEntry &&
              Config.fiatRates &&
              this.state.valuesInFiat &&
              this.props.Dashboard.prices &&
              <span>{ translate('INDEX.SEND') } { Number(this.state.amount) } USD / { Number((this.state.amount / this.getFiatPrice()).toFixed(8)) } { this.props.ActiveCoin.coin.toUpperCase() }</span>
            }
            { (!Config.sendCoinAllowFiatEntry ||
              !Config.fiatRates ||
              !this.state.valuesInFiat ||
              !this.props.Dashboard.prices) &&
              <span>{ translate('INDEX.SEND') } { Number(this.state.amount) } { this.props.ActiveCoin.coin.toUpperCase() }</span>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export const SendRender = function() {
  const _coin = this.props.ActiveCoin.coin;

  if (this.props.renderFormOnly) {
    return (
      <div>{ this.SendFormRender() }</div>
    );
  } else {
    return (
      <div className="col-sm-12 padding-top-10 coin-send-form">
        <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
          <div className="steps row margin-top-10">
            <div className={ 'step col-md-4' + (this.state.currentStep === 0 ? ' current' : '') }>
              <span className="step-number">1</span>
              <div className="step-desc">
                <span className="step-title">{ translate('INDEX.FILL_SEND_FORM') }</span>
                <p>{ translate('INDEX.FILL_SEND_DETAILS') }</p>
              </div>
            </div>
            <div className={ 'step col-md-4' + (this.state.currentStep === 1 ? ' current' : '') }>
              <span className="step-number">2</span>
              <div className="step-desc">
                <span className="step-title">{ translate('INDEX.CONFIRMING') }</span>
                <p>{ translate('INDEX.CONFIRM_DETAILS') }</p>
              </div>
            </div>
            <div className={ 'step col-md-4' + (this.state.currentStep === 2 ? ' current' : '') }>
              <span className="step-number">3</span>
              <div className="step-desc">
                <span className="step-title">{ translate('INDEX.PROCESSING_TX') }</span>
                <p>{ translate('INDEX.PROCESSING_DETAILS') }</p>
              </div>
            </div>
          </div>
        </div>

        { this.state.currentStep === 0 &&
          <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="panel">
              <div className="panel-heading">
                <h3 className="panel-title">
                  { translate('INDEX.SEND') } { _coin.toUpperCase() }
                </h3>
              </div>
              <div className="qr-modal-send-block">
                <QRModal
                  mode="scan"
                  setRecieverFromScan={ this.setRecieverFromScan } />
              </div>
              <div className="panel-body container-fluid">
                { Config.sendCoinAllowFiatEntry &&
                  Config.fiatRates &&
                  this.props.Dashboard.prices &&
                  <div className="send-fiat-entry-toggle padding-left-10 margin-bottom-15">
                    <span className="pointer">
                      <label className="switch">
                        <input
                          type="checkbox"
                          readOnly
                          checked={ this.state.valuesInFiat } />
                        <div
                          className="slider"
                          onClick={ this.toggleValuesInFiat }></div>
                      </label>
                      <div
                        className="toggle-label"
                        onClick={ this.toggleValuesInFiat }>
                        { translate('SEND.USE_FIAT_VALUES') }
                      </div>
                    </span>
                    <span>
                      <i
                        className="icon fa-question-circle settings-help"
                        data-tip={ translate('SEND.FIAT_VALUES_ENTRY_WARNING', this.props.ActiveCoin.coin.toUpperCase()) }
                        data-html={ true }
                        data-for="sendCoin2"></i>
                      <ReactTooltip
                        id="sendCoin2"
                        effect="solid"
                        className="text-top" />
                    </span>
                  </div>
                }
                { this.SendFormRender() }
              </div>
            </div>
          </div>
        }

        { this.state.currentStep === 1 &&
          <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="panel">
              <div className="panel-body">
                <div className="row">
                  <div className="col-xs-12">
                    <strong>{ translate('INDEX.TO') }</strong>
                  </div>
                  <div className="col-lg-6 col-sm-6 col-xs-12 overflow-hidden selectable">
                  { this.state.sendTo }
                  </div>
                  <div className="col-lg-6 col-sm-6 col-xs-6">
                    { Config.sendCoinAllowFiatEntry &&
                        Config.fiatRates &&
                        this.state.valuesInFiat &&
                        this.props.Dashboard.prices &&
                        <span>{ Number(this.state.amount) } USD / { Number((this.state.amount / this.getFiatPrice()).toFixed(8)) } { _coin.toUpperCase() }</span>
                      }
                      { (!Config.sendCoinAllowFiatEntry ||
                        !Config.fiatRates ||
                        !this.state.valuesInFiat ||
                        !this.props.Dashboard.prices) &&
                        <span>{ Number(this.state.amount) } { _coin.toUpperCase() }</span>
                      }
                  </div>
                </div>
                { this.state.sendFrom &&
                  <div className="row padding-top-20">
                    <div className="col-xs-12">
                      <strong>{ translate('INDEX.FROM') }</strong>
                    </div>
                    <div className="col-lg-6 col-sm-6 col-xs-12 overflow-hidden">{ this.state.sendFrom }</div>
                    <div className="col-lg-6 col-sm-6 col-xs-6 confirm-currency-send-container">
                      { Config.sendCoinAllowFiatEntry &&
                        Config.fiatRates &&
                        this.state.valuesInFiat &&
                        this.props.Dashboard.prices &&
                        <span>{ Number(this.state.amount) } USD / { Number((this.state.amount / this.getFiatPrice()).toFixed(8)) } { _coin.toUpperCase() }</span>
                      }
                      { (!Config.sendCoinAllowFiatEntry ||
                        !Config.fiatRates ||
                        !this.state.valuesInFiat ||
                        !this.props.Dashboard.prices) &&
                        <span>{ Number(this.state.amount) } { _coin.toUpperCase() }</span>
                      }
                    </div>
                  </div>
                }
                { this.state.spvPreflightRes &&
                  <div className="row padding-top-20">
                    <div className="col-xs-12">
                      <strong>{ translate('SEND.FEE') }</strong>
                    </div>
                    <div className="col-lg-12 col-sm-12 col-xs-12">
                      { Config.sendCoinAllowFiatEntry &&
                        Config.fiatRates &&
                        this.state.valuesInFiat &&
                        this.props.Dashboard.prices &&
                        <span>{ Number((fromSats(this.state.spvPreflightRes.fee) * this.getFiatPrice()).toFixed(8)) } USD / { formatValue(fromSats(this.state.spvPreflightRes.fee)) } { _coin.toUpperCase() } ({ this.state.spvPreflightRes.fee } { translate('SEND.SATS_SM') })</span>
                      }
                      { (!Config.sendCoinAllowFiatEntry ||
                        !Config.fiatRates ||
                        !this.state.valuesInFiat ||
                        !this.props.Dashboard.prices) &&
                        <span>{ formatValue(fromSats(this.state.spvPreflightRes.fee)) } ({ this.state.spvPreflightRes.fee } { translate('SEND.SATS_SM') })</span>
                      }
                    </div>
                  </div>
                }
                { this.state.spvPreflightRes &&
                  <div className="row padding-top-20">
                    { this.state.spvPreflightRes.change === 0 &&
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        <strong>{ translate('SEND.ADJUSTED_AMOUNT') }</strong>
                        <span className="nbsp">
                          <i
                            className="icon fa-question-circle settings-help send-btc"
                            data-tip={ translate('SEND.TOTAL_DESC') }
                            data-for="sendCoin3"></i>
                          <ReactTooltip
                            data-for="sendCoin3"
                            effect="solid"
                            className="text-left" />
                        </span>
                        { Config.sendCoinAllowFiatEntry &&
                          Config.fiatRates &&
                          this.state.valuesInFiat &&
                          this.props.Dashboard.prices &&
                          <span>
                          { Number((formatValue(fromSats(this.state.spvPreflightRes.value) + fromSats(this.state.spvPreflightRes.fee)) * this.getFiatPrice()).toFixed(8)) } USD / { formatValue(fromSats(this.state.spvPreflightRes.value) + fromSats(this.state.spvPreflightRes.fee)) } { _coin.toUpperCase() }
                          </span>
                        }
                        { (!Config.sendCoinAllowFiatEntry ||
                          !Config.fiatRates ||
                          !this.state.valuesInFiat ||
                          !this.props.Dashboard.prices) &&
                          <span>
                          { formatValue(fromSats(this.state.spvPreflightRes.value) + fromSats(this.state.spvPreflightRes.fee)) }
                          </span>
                        }
                      </div>
                    }
                    { this.state.spvPreflightRes.estimatedFee < 0 &&
                      <div className="col-lg-12 col-sm-12 col-xs-12 padding-bottom-20">
                        <strong className="nbsp">KMD { translate('SEND.REWARDS_SM') }</strong>
                        { Config.sendCoinAllowFiatEntry &&
                          Config.fiatRates &&
                          this.state.valuesInFiat &&
                          this.props.Dashboard.prices &&
                          <span>
                          { Number((Math.abs(formatValue(fromSats(this.state.spvPreflightRes.estimatedFee))) * this.getFiatPrice()).toFixed(8)) } USD / { Math.abs(formatValue(fromSats(this.state.spvPreflightRes.estimatedFee))) } { _coin.toUpperCase() }
                          </span>
                        }
                        { (!Config.sendCoinAllowFiatEntry ||
                          !Config.fiatRates ||
                          !this.state.valuesInFiat ||
                          !this.props.Dashboard.prices) &&
                          <span className="nbsp">{ Math.abs(formatValue(fromSats(this.state.spvPreflightRes.estimatedFee))) }</span>
                        }
                        { translate('SEND.TO_S,') } { this.props.Dashboard.electrumCoins[_coin].pub }
                      </div>
                    }
                    { this.state.spvPreflightRes.change > 0 &&
                      <div className="col-lg-12 col-sm-12 col-xs-12">
                        <strong className="nbsp display--block">{ translate('SEND.TOTAL') }</strong>
                        { Config.sendCoinAllowFiatEntry &&
                          Config.fiatRates &&
                          this.state.valuesInFiat &&
                          this.props.Dashboard.prices &&
                          <span>
                          { Number((formatValue(fromSats(this.state.spvPreflightRes.value) + fromSats(this.state.spvPreflightRes.fee)) * this.getFiatPrice()).toFixed(8)) } USD / { formatValue(fromSats(this.state.spvPreflightRes.value) + fromSats(this.state.spvPreflightRes.fee)) } { _coin.toUpperCase() }
                          </span>
                        }
                        { (!Config.sendCoinAllowFiatEntry ||
                          !Config.fiatRates ||
                          !this.state.valuesInFiat ||
                          !this.props.Dashboard.prices) &&
                          <span>
                          { formatValue(fromSats(this.state.spvPreflightRes.value) + fromSats(this.state.spvPreflightRes.fee)) }
                          </span>
                        }
                      </div>
                    }
                  </div>
                }
                { this.state.spvPreflightSendInProgress &&
                  <div className="padding-top-20 fs-15 col-lg-12 col-sm-12 col-xs-12 padding-bottom-40 padding-left-0">
                  { translate('SEND.SPV_VERIFYING') }...
                  </div>
                }
                { this.state.spvVerificationWarning &&
                  <div className="padding-top-20 fs-15 col-lg-12 col-sm-12 col-xs-12 padding-bottom-40 padding-left-0">
                    <strong className="color-warning nbsp">{ translate('SEND.WARNING') }:</strong>
                    <span>{ translate('SEND.WARNING_SPV_P1') }</span>
                    { translate('SEND.WARNING_SPV_P2') }
                  </div>
                }
                <div className="widget-body-footer">
                  <a
                    className="btn btn-default waves-effect waves-light"
                    onClick={ () => this.changeSendCoinStep(0, true) }>{ translate('INDEX.BACK') }</a>
                  <div className="widget-actions pull-right">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={ () => this.changeSendCoinStep(2) }>
                      { translate('INDEX.CONFIRM') }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        { this.state.currentStep === 2 &&
          <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
            <div className="panel">
              <div className="panel-heading">
                <h4 className="panel-title">
                  { translate('INDEX.TRANSACTION_RESULT') }
                </h4>
                <div>
                  { this.props.ActiveCoin.lastSendToResponse &&
                    this.props.ActiveCoin.lastSendToResponse.msg &&
                    this.props.ActiveCoin.lastSendToResponse.msg === 'success' &&
                    <table className="table table-hover table-striped">
                      <thead>
                        <tr>
                          <th className="padding-left-30">{ translate('INDEX.KEY') }</th>
                          <th className="padding-left-30">{ translate('INDEX.INFO') }</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="padding-left-30">
                          { translate('SEND.RESULT') }
                          </td>
                          <td className="padding-left-30">
                            <span className="label label-success">{ translate('SEND.SUCCESS_SM') }</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="padding-left-30">
                          { translate('INDEX.SEND_FROM') }
                          </td>
                          <td className="padding-left-30 selectable">
                            { this.props.Dashboard.electrumCoins[_coin].pub }
                          </td>
                        </tr>
                        <tr>
                          <td className="padding-left-30">
                          { translate('INDEX.SEND_TO') }
                          </td>
                          <td className="padding-left-30 selectable">
                            { this.state.sendTo }
                          </td>
                        </tr>
                        <tr>
                          <td className="padding-left-30">
                          { translate('INDEX.AMOUNT') }
                          </td>
                          <td className="padding-left-30">
                          { Config.sendCoinAllowFiatEntry &&
                            Config.fiatRates &&
                            this.state.valuesInFiat &&
                            this.props.Dashboard.prices &&
                            <span>
                            { Number(this.state.amount) } USD / { Number((this.state.amount / this.getFiatPrice()).toFixed(8)) } { _coin.toUpperCase() }
                            </span>
                          }
                          { (!Config.sendCoinAllowFiatEntry ||
                            !Config.fiatRates ||
                            !this.state.valuesInFiat ||
                            !this.props.Dashboard.prices) &&
                            <span>{ Number(this.state.amount) } { _coin.toUpperCase() }</span>
                          }
                          </td>
                        </tr>
                        <tr>
                          <td className="padding-left-30">{ translate('SEND.TRANSACTION_ID') }</td>
                          <td className="padding-left-30">
                            { this.props.ActiveCoin.lastSendToResponse &&
                              this.props.ActiveCoin.lastSendToResponse.txid &&
                              <span className="selectable">
                                { this.props.ActiveCoin.lastSendToResponse.txid }
                              </span>
                            }
                            { this.props.ActiveCoin.lastSendToResponse &&
                              this.props.ActiveCoin.lastSendToResponse.txid &&
                              <button
                                className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                                title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                                onClick={ () => this.copyTXID(this.props.ActiveCoin.lastSendToResponse.txid) }>
                                <i className="icon fa-copy"></i> { translate('INDEX.COPY') }
                              </button>
                            }
                            { this.props.ActiveCoin.lastSendToResponse &&
                              this.props.ActiveCoin.lastSendToResponse.txid &&
                              (explorerList[_coin.toUpperCase()] || Config.whitelabel) &&
                              <div className="margin-top-10">
                                <a
                                  href={ this.openExplorerWindow() }
                                  target="_blank">
                                  <button
                                    type="button"
                                    className="btn btn-sm white btn-dark waves-effect waves-light pull-left">
                                    <i className="icon fa-external-link"></i> { translate('INDEX.OPEN_TRANSACTION_IN_EPLORER', _coin.toUpperCase()) }
                                  </button>
                                </a>
                              </div>
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  }
                  { !this.props.ActiveCoin.lastSendToResponse &&
                    <div className="padding-left-30 padding-top-10">{ translate('SEND.PROCESSING_TX') }...</div>
                  }
                  { this.props.ActiveCoin.lastSendToResponse &&
                    this.props.ActiveCoin.lastSendToResponse.msg &&
                    this.props.ActiveCoin.lastSendToResponse.msg === 'error' &&
                    <div className="padding-left-30 padding-top-10 selectable">
                      <div>
                        <strong className="text-capitalize">{ translate('API.ERROR_SM') }</strong>
                      </div>
                      { (this.props.ActiveCoin.lastSendToResponse.result.toLowerCase().indexOf('decode error') > -1) &&
                        <div>
                          <span className="display--block">{ translate('SEND.SEND_ERR_ZTX_P1') }</span>
                          { translate('SEND.SEND_ERR_ZTX_P2') }
                        </div>
                      }
                      { this.props.ActiveCoin.lastSendToResponse.result.toLowerCase().indexOf('decode error') === -1 &&
                        <div>{ this.props.ActiveCoin.lastSendToResponse.result }</div>
                      }
                      { this.props.ActiveCoin.lastSendToResponse.raw &&
                        this.props.ActiveCoin.lastSendToResponse.raw.txid &&
                        <div>{ this.props.ActiveCoin.lastSendToResponse.raw.txid.replace(/\[.*\]/, '') }</div>
                      }
                      { this.props.ActiveCoin.lastSendToResponse.raw &&
                        this.props.ActiveCoin.lastSendToResponse.raw.txid &&
                        this.props.ActiveCoin.lastSendToResponse.raw.txid.indexOf('bad-txns-inputs-spent') > -1 &&
                        <div className="margin-top-10">
                          { translate('SEND.BAD_TXN_SPENT_ERR1') }
                          <ul>
                            <li>{ translate('SEND.BAD_TXN_SPENT_ERR2') }</li>
                            <li>{ translate('SEND.BAD_TXN_SPENT_ERR3') }</li>
                            <li>{ translate('SEND.BAD_TXN_SPENT_ERR4') }</li>
                          </ul>
                        </div>
                      }
                    </div>
                  }
                </div>
                <div className="widget-body-footer">
                  <div className="widget-actions margin-bottom-15 margin-right-15">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={ () => this.changeSendCoinStep(0) }>
                      { translate('INDEX.MAKE_ANOTHER_TX') }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
};