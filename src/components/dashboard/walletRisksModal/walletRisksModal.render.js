import React from 'react';
import translate from '../../../translate/translate';
import Config from '../../../config';

const WalletRisksModalRender = function() {
  return (
    <div>
      <div className={ `modal modal-3d-sign wallet-risks-modal ${this.state.className}` }>
        <div
          onClick={ this.dismiss }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-lg">
          <div
            onClick={ this.dismiss }
            className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.dismiss }>
                <span>×</span>
              </button>
              <h4 className="modal-title white">
                { translate('INDEX.UNDERSTAND_RISKS_LINK') }
              </h4>
            </div>
            <div className="modal-body">
              <div className="vertical-align">
                <div className="page-content vertical-align-middle">
                  <div className="margin-bottom-40">
                    <p>
                      <span className="nbsp">{ translate('RISKS_MODAL.DESC_P1') }</span>
                      <span className="nbsp">{ Config.whitelabel ? Config.wlConfig.coin.ticker : 'KMD' }</span>
                      <span className="nbsp">{ Config.whitelabel ? '' : translate('RISKS_MODAL.DESC_P2') }</span>
                      { translate('RISKS_MODAL.DESC_P3', Config.whitelabel ? Config.wlConfig.coin.name : 'Komodo') }
                    </p>
                    <p>{ translate('RISKS_MODAL.DESC_P4', Config.whitelabel ? Config.wlConfig.coin.name : 'Komodo') }</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    id="loginbtn"
                    onClick={ this.dismiss }>
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </div>
  );
};

export default WalletRisksModalRender;