import React from 'react';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import ReactTable from 'react-table';
import TablePaginationRenderer from './pagination';
import { formatValue } from 'agama-wallet-lib/src/utils';
import Config from '../../../config';
import Spinner from '../spinner/spinner';
import tableSorting from '../../../util/tableSorting'
import appData from '../../../actions/actions/appData';

export const TxConfsRender = function(confs) {
  if (Number(confs) > -1) {
    return (
      <span>{ confs }</span>
    );
  } else {
    return (
      <span>
        <i
          className="icon fa-warning color-warning margin-right-5"
          data-tip={ translate('DASHBOARD.FAILED_TX_INFO') }></i>
        <ReactTooltip
          effect="solid"
          className="text-left" />
      </span>
    );
  }
}

export const AddressTypeRender = function() {
  return (
    <span>
      <span className="label label-default">
        <i className="icon fa-eye nbsp"></i>
        { translate('IAPI.PUBLIC_SM') }
      </span>
    </span>
  );
};

export const TransactionDetailRender = function(transactionIndex) {
  return (
    <button
      type="button"
      className="btn btn-xs white btn-info waves-effect waves-light btn-kmdtxid"
      onClick={ () => this.toggleTxInfoModal(!this.props.ActiveCoin.showTransactionInfo, transactionIndex) }>
      <i className="icon fa-search"></i>
    </button>
  );
};

export const AddressRender = function(tx) {
  if (!tx.address) {
    return (
      <span>
        <i className="icon fa-bullseye"></i>&nbsp;
        <span className="label label-dark">
          { translate('DASHBOARD.ZADDR_NOT_LISTED') }
        </span>
      </span>
    );
  }

  return tx.address;
};

export const AddressItemRender = function(address, type, amount, coin) {
  return (
    <li
      key={ address }
      className={ address === this.state.currentAddress ? 'selected' : '' }>
      <a onClick={ () => this.updateAddressSelection(address) }>
        <i className="padding-right-5 icon fa-eye-slash"></i>
        <span className="text">
          [ { amount } { coin } ]
          <span className="padding-left-10">{ address }</span>
        </span>
        <span className="icon fa-check check-mark"></span>
      </a>
    </li>
  );
};

export const TxTypeRender = function(category) {
  if (category === 'send' ||
      category === 'sent') {
    return (
      <span className="label label-danger">
        <i className="icon fa-arrow-circle-left"></i> { translate('DASHBOARD.OUT') }
      </span>
    );
  } else if (
    category === 'receive' ||
    category === 'received'
  ) {
    return (
      <span className="label label-success">
        <i className="icon fa-arrow-circle-right"></i> { translate('DASHBOARD.IN') }
      </span>
    );
  } else if (category === 'generate') {
    return (
      <span>
        <i className="icon fa-cogs"></i> <span>{ translate('DASHBOARD.MINED') }</span>
      </span>
    );
  } else if (category === 'immature') {
    return (
      <span>
        <i className="icon fa-clock-o"></i> <span>{ translate('DASHBOARD.IMMATURE') }</span>
      </span>
    );
  } else if (category === 'unknown') {
    return (
      <span>
        <i className="icon fa-meh-o"></i> <span>{ translate('DASHBOARD.UNKNOWN') }</span>
      </span>
    );
  } else if (category === 'self') {
    return (
      <span className="label label-info self-send">
        <span>self</span>
      </span>
    );
  }
};

export const TxAmountRender = function(tx) {
  if (Config.roundValues) {
    return (
      <span>
        <span data-tip={ tx.amount }>
          { Math.abs(tx.interest) !== Math.abs(tx.amount) &&
            <span>{ formatValue(tx.amount) || translate('DASHBOARD.UNKNOWN') }</span>
          }
          { tx.interest &&
            <span
              className="tx-interest"
              data-tip={ `${translate('DASHBOARD.SPV_CLAIMED_INTEREST')} ${formatValue(Math.abs(tx.interest))}` }>
              +{ formatValue(Math.abs(tx.interest)) }
            </span>
          }
          { tx.interest &&
            <ReactTooltip
              effect="solid"
              className="text-left" />
          }
        </span>
        <ReactTooltip
          effect="solid"
          className="text-left" />
      </span>
    );
  }

  return (
    <span>
      { Math.abs(tx.interest) !== Math.abs(tx.amount) &&
        <span>{ Number(tx.amount) || translate('DASHBOARD.UNKNOWN') }</span>
      }
      { tx.interest &&
        <span
          className="tx-interest"
          data-tip={ `${translate('DASHBOARD.SPV_CLAIMED_INTEREST')} ${Math.abs(tx.interest)}` }>
          +{ Math.abs(tx.interest) }
        </span>
      }
      { tx.interest &&
        <ReactTooltip
          effect="solid"
          className="text-left" />
      }
    </span>
  );
};

export const TxHistoryListRender = function() {
  let _data;

  if (this.props.ActiveCoin.coins[appData.activeCoin] &&
      this.props.ActiveCoin.coins[appData.activeCoin].txhistory &&
      !this.state.searchTerm) {
    _data = this.props.ActiveCoin.coins[appData.activeCoin].txhistory;
  }

  _data = _data || this.state.filteredItemsList;

  return (
    <ReactTable
      data={ _data }
      columns={ this.state.itemsListColumns }
      minRows="0"
      sortable={ true }
      className="-striped -highlight"
      PaginationComponent={ TablePaginationRenderer }
      nextText={ translate('INDEX.NEXT_PAGE') }
      previousText={ translate('INDEX.PREVIOUS_PAGE') }
      showPaginationBottom={ this.state.showPagination }
      pageSize={ this.state.pageSize }
      defaultSortMethod={ tableSorting }
      defaultSorted={[{ // default sort
        id: 'timestamp',
        desc: true,
      }]}
      onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
  );
};

export const WalletsDataRender = function() {
  return (
    <div>
      <div id="edexcoin_dashboardinfo">
        { (this.displayClaimInterestUI() === 777 || this.displayClaimInterestUI() === -777) &&
          <div className="col-xs-12 margin-top-20 backround-gray">
            <div className="panel no-margin">
              <div>
                <div className="col-xlg-12 col-lg-12 col-sm-12 col-xs-12">
                  <div className="panel no-margin padding-top-10 padding-bottom-10 center">
                    { this.displayClaimInterestUI() === 777 &&
                      <div>
                        { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_P1') }
                        <strong className="padding-left-5">{ this.props.ActiveCoin.balance.interest }</strong> KMD
                        <span className="padding-left-5">{ translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_P2') }</span>.
                        <button
                          type="button"
                          className="btn btn-success waves-effect waves-light dashboard-claim-interest-btn"
                          onClick={ this.openClaimInterestModal }>
                          <i className="icon fa-dollar"></i> { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_P3') }
                        </button>
                      </div>
                    }
                    { this.displayClaimInterestUI() === -777 &&
                      <div>
                        { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_ALT_P1') }.
                        <button
                          type="button"
                          className="btn btn-success waves-effect waves-light dashboard-claim-interest-btn"
                          onClick={ this.openClaimInterestModal }>
                          <i className="icon fa-search"></i> { translate('DASHBOARD.CLAIM_INTEREST_HELPER_BAR_ALT_P2') }
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        <div className="col-xs-12 margin-top-20 backround-gray">
          <div className="panel nav-tabs-horizontal">
            <div>
              <div className="col-xlg-12 col-lg-12 col-sm-12 col-xs-12">
                <div className="panel">
                  <header className="panel-heading z-index-10">
                    { this.state.loading &&
                      <span className="spinner--small">
                        <Spinner />
                      </span>
                    }
                    { !this.state.loading &&
                      <i
                        className="icon fa-refresh manual-txhistory-refresh pointer"
                        onClick={ this.refreshTxHistory }></i>
                    }
                    <h4 className="panel-title">{ translate('INDEX.TRANSACTION_HISTORY') }</h4>
                  </header>
                  <div className="panel-body">
                    <div className="row padding-bottom-30 padding-top-10">
                      { this.props.ActiveCoin.txhistory !== 'loading' &&
                        this.props.ActiveCoin.txhistory !== 'no data' &&
                        this.props.ActiveCoin.txhistory !== 'connection error' &&
                        this.props.ActiveCoin.txhistory !== 'connection error or incomplete data' &&
                        this.props.ActiveCoin.txhistory !== 'cant get current height' &&
                        <div className="col-sm-4 search-box">
                          <input
                            className="form-control"
                            onChange={ e => this.onSearchTermChange(e.target.value) }
                            placeholder={ translate('DASHBOARD.SEARCH') } />
                        </div>
                      }
                    </div>
                    <div className="row txhistory-table">
                      { this.renderTxHistoryList() }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};