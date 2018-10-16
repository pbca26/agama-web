import React from 'react';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import Spinner from '../spinner/spinner';
import Config from '../../../config';

const WalletsBalanceRender = function() {
  return (
    <div
      id="wallet-widgets"
      className="wallet-widgets">
      { this.renderBalance('transparent') !== -777 &&
        <div className="col-xs-12 flex">
          <div className={
            this.props.ActiveCoin.coin.toUpperCase() !== 'KMD' ||
            this.renderBalance('total') === this.renderBalance('transparent') ||
            this.renderBalance('total') === 0 ? 'col-lg-12 col-xs-12 balance-placeholder--bold' : 'col-lg-4 col-xs-12'
          }>
            <div className="widget widget-shadow">
              <div className="widget-content">
                { this.state.loading &&
                  <span className="spinner--small">
                    <Spinner />
                  </span>
                }
                { !this.state.loading &&
                  <i
                    className="icon fa-refresh manual-balance-refresh pointer"
                    onClick={ this.refreshBalance }></i>
                }
                <div className="padding-20 padding-top-10">
                  <div className="clearfix cursor-default">
                    <div className="pull-left padding-vertical-10">
                      { Number(this.renderBalance('interest')) > 0 &&
                        <span className="padding-right-30 nbsp">&nbsp;</span>
                      }
                      <span className="font-size-18">{ translate('INDEX.BALANCE') }</span>
                      { Number(this.props.ActiveCoin.balance.unconfirmed) < 0 &&
                        <span>
                          <i
                            className="icon fa-info-circle margin-left-5 icon-unconf-balance"
                            data-for="balance2"
                            data-tip={ `${translate('INDEX.UNCONFIRMED_BALANCE')} ${Math.abs(this.props.ActiveCoin.balance.unconfirmed)}` }></i>
                          <ReactTooltip
                            id="balance2"
                            effect="solid"
                            className="text-left" />
                        </span>
                      }
                    </div>
                    <span
                      className="pull-right padding-top-10 font-size-22">
                      { this.renderBalance('transparent', true) }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          { (this.props.ActiveCoin.coin.toUpperCase() === 'KMD' &&
              Number(this.renderBalance('interest')) > 0) &&
            <div className="col-lg-4 col-xs-12">
              <div className="widget widget-shadow">
                <div className="widget-content">
                  <div className="padding-20 padding-top-10">
                    <div className="clearfix cursor-default">
                      <div className="pull-left padding-vertical-10">
                        <i className="icon fa-money font-size-24 vertical-align-bottom margin-right-5"></i>
                        <span className="font-size-18">{ translate('INDEX.INTEREST_EARNED') }</span>
                      </div>
                      <span
                        className="pull-right padding-top-10 font-size-22"
                        data-tip={ Config.roundValues ? this.renderBalance('interest') : '' }
                        data-for="balance3">
                        { this.renderBalance('interest', true) }
                      </span>
                      <ReactTooltip
                        id="balance3"
                        effect="solid"
                        className="text-left" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          { !(this.props.ActiveCoin.coin.toUpperCase() !== 'KMD' ||
              Number(this.renderBalance('total')) === 0 ||
              this.renderBalance('total') === this.renderBalance('transparent')) &&
            <div className="col-lg-4 col-xs-12">
              <div className="widget widget-shadow">
                <div className="widget-content">
                  <div className="padding-20 padding-top-10">
                    <div className="clearfix cursor-default">
                      <div className="pull-left padding-vertical-10">
                        <i className="icon fa-bullseye font-size-24 vertical-align-bottom margin-right-5"></i>
                        <span className="font-size-18">{ translate('INDEX.TOTAL_BALANCE') }</span>
                      </div>
                      <span
                        className="pull-right padding-top-10 font-size-22"
                        data-tip={ Config.roundValues ? this.renderBalance('total') : '' }
                        data-for="balance4">
                        { this.renderBalance('total', true) }
                      </span>
                      <ReactTooltip
                        id="balance4"
                        effect="solid"
                        className="text-left" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  );
};

export default WalletsBalanceRender;