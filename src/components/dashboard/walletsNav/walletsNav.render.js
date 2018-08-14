import React from 'react';
import translate from '../../../translate/translate';

export const WalletsNavWithWalletRender = function() {
  return (
    <div>
      <div
        className="page-header page-header-bordered header-easydex padding-bottom-40 page-header--spv margin-bottom-30"
        id="header-dashboard">
        { this.props.ActiveCoin &&
          <div>
            <strong>{ translate('INDEX.MY') } { this.props && this.props.ActiveCoin ? this.props.ActiveCoin.coin.toUpperCase() : '-' } { translate('INDEX.ADDRESS') }: </strong>
            <span className="selectable">
              { this.props &&
                this.props.Dashboard &&
                this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin] &&
                this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub ? this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub : '-' }
            </span>
            <button
              className="btn btn-default btn-xs clipboard-edexaddr"
              onClick={ () => this.copyMyAddress(this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub) }>
              <i className="icon fa-copy"></i> { translate('INDEX.COPY') }
            </button>
          </div>
        }
        <div className="page-header-actions">
          <div id="kmd_header_button">
            <button
              type="button"
              className="btn btn-info waves-effect waves-light"
              onClick={ this.toggleWalletInfo }>
              <i className="icon fa-info"></i>
            </button>
            <button
              type="button"
              className="btn btn-dark waves-effect waves-light"
              onClick={ this.toggleWalletTransactions }>
              <i className="icon fa-th-large"></i> <span className="placeholder">{ translate('INDEX.TRANSACTIONS') }</span>
            </button>
            { this.props.ActiveCoin &&
              <button
                type="button"
                className="btn btn-primary waves-effect waves-light"
                onClick={ () => this.toggleSendCoinForm(!this.props.ActiveCoin.send) }
                disabled={ this.checkTotalBalance() <= 0 }>
                <i className="icon fa-send"></i> <span className="placeholder">{ translate('INDEX.SEND') }</span>
              </button>
            }
            <button
              type="button"
              className="btn btn-success waves-effect waves-light"
              onClick={ () => this.toggleReceiveCoinForm(!this.props.ActiveCoin.receive) }>
              <i className="icon fa-inbox"></i> <span className="placeholder">{ translate('INDEX.RECEIVE') }</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};