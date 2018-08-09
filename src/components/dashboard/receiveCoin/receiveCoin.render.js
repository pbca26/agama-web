import React from 'react';
import translate from '../../../translate/translate';
import QRModal from '../qrModal/qrModal';
import InvoiceModal from '../invoiceModal/invoiceModal';
import ReactTooltip from 'react-tooltip';

export const AddressActionsNonBasiliskModeRender = function(address, type) {
  return (
    <td>
      <button
        onClick={ () => this.toggleAddressMenu(address) }
        data-tip="Toggle address context menu"
        className="btn btn-default btn-xs clipboard-edexaddr margin-left-10 receive-address-context-menu-trigger">
        <i className="fa fa-ellipsis-v receive-address-context-menu-trigger"></i>
      </button>
      <ReactTooltip
        effect="solid"
        className="text-left" />
      { this.state.toggledAddressMenu &&
        this.state.toggledAddressMenu === address &&
        <div className="receive-address-context-menu">
          <ul>
            <li onClick={ () => this._copyCoinAddress(address) }>
              <i className="icon wb-copy margin-right-5"></i> { `${translate('INDEX.COPY')} ${translate('INDEX.PUB_KEY')}` }
            </li>
            <li className="receive-address-context-menu-get-qr">
              <QRModal content={ address } />
            </li>
          </ul>
        </div>
      }
    </td>
  );
};

export const AddressItemRender = function(address, type) {
  return (
    <tr key={ address.address }>
      { this.renderAddressActions(address.address, type) }
      <td>{ address.address }</td>
      <td>
        <span>{ address.amount }</span>
      </td>
    </tr>
  );
};

export const _ReceiveCoinTableRender = function() {
  return (
    <span>
      <table className="table table-hover dataTable table-striped">
        <thead>
          <tr>
            <th></th>
            <th>{ translate('INDEX.ADDRESS') }</th>
            <th>{ translate('INDEX.AMOUNT') }</th>
          </tr>
        </thead>
        <tbody>
          { this.renderAddressList('public') }
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>{ translate('INDEX.ADDRESS') }</th>
            <th>{ translate('INDEX.AMOUNT') }</th>
          </tr>
        </tfoot>
      </table>
    </span>
  );
};

export const ReceiveCoinRender = function() {
  if (this.props.renderTableOnly) {
    return (
      <div>{ this.ReceiveCoinTableRender() }</div>
    );
  } else {
    return (
      <div className="receive-coin-block">
        <div className="col-xs-12 margin-top-20">
          <div className="panel nav-tabs-horizontal">
            <div>
              <div className="col-xlg-12 col-lg-12 col-sm-12 col-xs-12">
                <div className="panel">
                  <header className="panel-heading">
                    <div className="panel-actions">
                      <InvoiceModal />
                    </div>
                    <h4 className="panel-title">{ translate('INDEX.RECEIVING_ADDRESS') }</h4>
                  </header>
                  <div className="panel-body">
                  { this.ReceiveCoinTableRender() }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};