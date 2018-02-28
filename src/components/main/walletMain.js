import React from 'react';
import { connect } from 'react-redux';
import Toaster from '../toaster/toaster';
import AddCoin from '../addcoin/addcoin';
import Login from '../login/login';
import Dashboard from '../dashboard/main/dashboard';
import Store from '../../store';
import {
  toggleDashboardTxInfoModal,
  toggleAddcoinModal,
  toggleClaimInterestModal,
} from '../../actions/actionCreators';

class WalletMain extends React.Component {
  componentDidMount() {
    // handle esc key globally
    document.onkeydown = (evt) => {
      evt = evt || window.event;

      let isEscape = false;

      if ('key' in evt) {
        isEscape = (evt.key === 'Escape' || evt.key === 'Esc');
      } else {
        isEscape = (evt.keyCode === 27);
      }

      // TODO: qr modal
      if (isEscape) {
        if (this.props.activeModals.showTransactionInfo) {
          Store.dispatch(toggleDashboardTxInfoModal(false));
        } else if (this.props.activeModals.displayClaimInterestModal) {
          Store.dispatch(toggleClaimInterestModal(false));
        } else if (this.props.activeModals.displayAddCoinModal) {
          Store.dispatch(toggleAddcoinModal(false, false));
        }
      }
    };
  }

  render() {
    return (
      <div className="full-height">
        <input
          type="text"
          id="js-copytextarea" />
        <Dashboard />
        <AddCoin />
        <Login />
        <Toaster {...this.props.toaster} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    toaster: state.toaster,
    activeModals: {
      showTransactionInfo: state.ActiveCoin.showTransactionInfo,
      displayClaimInterestModal: state.Dashboard.displayClaimInterestModal,
      displayAddCoinModal: state.AddCoin.display,
    },
  };
};

export default connect(mapStateToProps)(WalletMain);

