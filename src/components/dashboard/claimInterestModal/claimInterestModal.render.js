import React from 'react';
import translate from '../../../translate/translate';
import Spinner from '../spinner/spinner';
import ReactTooltip from 'react-tooltip';
import ReactTable from 'react-table';
import TablePaginationRenderer from '../walletsData/pagination';
import tableSorting from '../../../util/tableSorting'

export const TxLocktimeRender = function(locktime) {
  return (
    <span className="locktime">
      { locktime &&
        <i
          data-tip={ `${translate('CLAIM_INTEREST.LOCKTIME_IS_SET_TO')} ${locktime}` }
          className="fa-check-circle green"></i>
      }
      { !locktime &&
        <i
          data-tip={ translate('CLAIM_INTEREST.LOCKTIME_IS_UNSET') }
          data-for="interestModal"
          className="fa-exclamation-circle red"></i>
      }
      <ReactTooltip
        id="interestModal"
        effect="solid"
        className="text-left" />
    </span>
  );
};

export const TxAmountRender = function(tx) {
  return (
    <span className={ tx.locktime ? 'green bold' : '' }>{ tx.amount }</span>
  );
};

export const TxIdRender = function(txid) {
  return (
    <button
      className="btn btn-default btn-xs copy-string-btn"
      title={ translate('INDEX.COPY_TO_CLIPBOARD') }
      onClick={ () => this.copyTxId(txid) }>
      <i className="icon fa-copy"></i> { translate('INDEX.COPY') + ' TXID' }
    </button>
  );
};

export const _ClaimInterestTableRender = function() {
  return (
    <span>
      <div>
        <p>
          <strong>{ translate('CLAIM_INTEREST.REQ_P1') }:</strong> { translate('CLAIM_INTEREST.REQ_P2') } <strong>10 KMD</strong>
        </p>
        <p>
          <strong>{ translate('CLAIM_INTEREST.TIP') }:</strong> { translate('CLAIM_INTEREST.TIP_DESC') }
        </p>
        <p>
          <strong>{ translate('CLAIM_INTEREST.CLAIM_INTEREST_FEE') }:</strong> 0.0002 KMD (20000 sats).
        </p>
      </div>
      { this.state.totalInterest > 0 &&
        <div className={ 'text-left padding-bottom-20' + (this.state.displayShowZeroInterestToggle ? ' padding-top-40' : '') }>
          { this.state.displayShowZeroInterestToggle &&
            <span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={ this.state.showZeroInterest } />
                <div
                  className="slider"
                  onClick={ this.toggleZeroInterest }></div>
              </label>
              <div
                className="toggle-label margin-right-15 pointer"
                onClick={ this.toggleZeroInterest }>
                { translate('CLAIM_INTEREST.SHOW_ZERO_INTEREST') }
              </div>
            </span>
          }
          { !this.state.spvVerificationWarning &&
            <button
              type="button"
              className="btn btn-success waves-effect waves-light claim-btn"
              onClick={ () => this.claimInterest() }
              disabled={ this.state.spvPreflightSendInProgress }>
              { !this.state.spvPreflightSendInProgress &&
                <i className="icon fa-dollar margin-right-5"></i>
              }
              { !this.state.spvPreflightSendInProgress &&
                <span>{ translate('CLAIM_INTEREST.CLAIM_INTEREST', `${this.state.totalInterest} KMD `) }</span>
              }
              { this.state.spvPreflightSendInProgress &&
                <span>{ translate('SEND.SPV_VERIFYING') }...</span>
              }
            </button>
          }
          { this.state.spvVerificationWarning &&
            <div className="padding-top-10 padding-bottom-10 fs-15">
              <strong className="color-warning">{ translate('SEND.WARNING') }:</strong> { translate('SEND.WARNING_SPV_P1') } { translate('SEND.WARNING_SPV_P2') }
              <div className="margin-top-15">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={ this.confirmClaimInterest }>
                  { translate('INDEX.CONFIRM') }
                </button>
                <button
                  type="button"
                  className="btn btn-primary margin-left-15"
                  onClick={ this.cancelClaimInterest }>
                  { translate('INDEX.CANCEL') }
                </button>
              </div>
            </div>
          }
        </div>
      }
      <ReactTable
        data={ this.state.transactionsList }
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
          id: 'interest',
          desc: true,
        }]}
        onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
    </span>
  );
};

export const ClaimInterestModalRender = function() {
  return (
    <span onClick={ this.closeDropMenu }>
      <div className={ `modal modal-claim-interest modal-3d-sign ${this.state.className}` }>
        <div
          onClick={ this.closeModal }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-sm">
          <div
            onClick={ this.closeModal }
            className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.closeModal }>
                <span>×</span>
              </button>
              <h4 className="modal-title white text-left">{ translate('CLAIM_INTEREST.CLAIM_INTEREST', ' ') }</h4>
            </div>
            <div className="modal-body">
              { this.state.loading &&
                <span className="spinner--medium">
                  <Spinner />
                </span>
              }
              { !this.state.loading &&
                <i
                  className="icon fa-refresh pointer refresh-icon"
                  onClick={ this.loadListUnspent }></i>
              }
              <div className="vertical-align">
                <div className="page-content vertical-align-middle full-width">
                  { this.state.isLoading &&
                    <span>{ translate('INDEX.LOADING') }...</span>
                  }
                  { !this.state.isLoading &&
                    this.checkTransactionsListLength() &&
                    <div>{ this.claimInterestTableRender() }</div>
                  }
                  { !this.state.isLoading &&
                    !this.checkTransactionsListLength() &&
                    <div>{ translate('INDEX.NO_DATA') }</div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </span>
  );
};