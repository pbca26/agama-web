import React from 'react';
import { connect } from 'react-redux';
import { toggleWalletRisksModal } from '../../../actions/actionCreators';
import Store from '../../../store';
import translate from '../../../translate/translate';

import WalletRisksModalRender from './walletRisksModal.render';

class WalletRisksModal extends React.Component {
  constructor() {
    super();
    this.state = {
      display: false,
    };
    this.dismiss = this.dismiss.bind(this);
  }

  dismiss() {
    Store.dispatch(toggleWalletRisksModal(false));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.displayWalletRisksModal !== nextProps.displayWalletRisksModal) {
      this.setState(Object.assign({}, this.state, {
        display: nextProps.displayWalletRisksModal,
      }));
    }
  }

  render() {
    if (this.state.display) {
      return WalletRisksModalRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    displayWalletRisksModal: state.Dashboard.displayWalletRisksModal,
  };
};

export default connect(mapStateToProps)(WalletRisksModal);