import React from 'react';
import { translate } from '../../../translate/translate';

const WalletRisksModalRender = function() {
  return (
    <div>
      <div
        className={ 'modal modal-3d-sign wallet-risks-modal ' + (this.state.display ? 'show in' : 'fade hide') }
        id="AddCoinDilogModel-login">
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
                Understand the risks in using Agama web wallet
              </h4>
            </div>
            <div className="modal-body">
              <div className="vertical-align">
                <div className="page-content vertical-align-middle">
                  <div className="margin-bottom-40">
                    <p>This wallet is a web-based interface that allows you to use KMD and other Komodo chains without running a full Komodo node. However, because this convenience comes at a cost: it is extremely difficult for Agama to securely deliver its code to your browser. This means that there is considerable risk in using Agama web wallet for large amounts!</p>
                    <p>It is recommended that you treat Agama web as you would treat your actual wallet, and not store very large amounts in it. For long-term storage of Komodo and any other cryptocurrency you should create a cold wallet.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    id="loginbtn"
                    onClick={ this.dismiss }>OK</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={ 'modal-backdrop ' + (this.state.display ? 'show in' : 'fade hide') }></div>
    </div>
  );
};

export default WalletRisksModalRender;