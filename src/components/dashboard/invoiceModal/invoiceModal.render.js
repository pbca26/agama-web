import React from 'react';
import translate from '../../../translate/translate';
import QRCode from 'qrcode.react';

export const InvoiceModalRender = function() {
  return (
    <span>
      <div className={ `modal modal-3d-sign ${this.state.className}` }>
        <div
          onClick={ this.closeModal }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-lg">
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
              <h4 className="modal-title white text-left">{ translate('INDEX.CREATE_INVOICE_QR') }</h4>
            </div>
            <div className="modal-body">
              <div>
                <div className="page-content">
                  <div className="row">
                    <div className="col-lg-8 form-group form-material vertical-align-middle">
                      <form>
                        <label
                          className="control-label"
                          htmlFor="qrAddress">
                          { translate('INDEX.RECEIVING_ADDRESS') }
                        </label>
                        <select
                          className="form-control"
                          name="qrAddress"
                          id="qrAddress"
                          value={ this.state.qrAddress }
                          onChange={ this.updateInput }>
                          <option value="-1">
                            { translate('INDEX.CHOOSE_RECEIVING_ADDRESS') }
                          </option>
                          { this.renderAddressList() }
                        </select>
                        <label
                          className="text-left control-label margin-top-20"
                          htmlFor="qrCoinAmount">
                          { translate('INDEX.AMOUNT_IN') } { this.props.ActiveCoin.coin.toUpperCase() }
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          id="qrCoinAmount"
                          name="qrAmount"
                          placeholder="0"
                          autoComplete="off"
                          value={ this.state.qrAmount }
                          onChange={ this.updateInput } />
                      </form>
                    </div>
                    <div
                      id="qrCanvas"
                      className="col-lg-4 text-center">
                      <QRCode
                        value={ this.state.content }
                        size={ 198 } />
                        <p className="margin-top-10">
                          <a
                            href=""
                            id="saveImage"
                            className="btn btn-success waves-effect waves-light save-image-btn margin-right-10"
                            disabled={ this.state.qrAddress === '-1' }
                            onClick={ this.saveAsImage }>
                            <i className="icon fa-picture-o nbsp"></i>
                            { translate('INDEX.SAVE_AS_IMAGE') }
                          </a>
                        </p>
                    </div>
                  </div>
                  <div className="row hide">
                    <div className="col-lg-12">
                      <p className="help-block">
                        <span className="display--block">{ translate('INDEX.QR_CONTENT') }:</span>
                        { this.state.content }
                      </p>
                    </div>
                  </div>
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

export const InvoiceModalButtonRender = function() {
  return (
    <span>
      <button
        type="button"
        className="btn btn-success waves-effect waves-light margin-right-10"
        onClick={ this.openModal }>
          <i className="icon fa-file-text-o nbsp"></i>
          { translate('INDEX.CREATE_INVOICE') }
      </button>
    </span>
  );
};