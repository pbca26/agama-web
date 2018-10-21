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
      className: 'hide',
    };
    this.dismiss = this.dismiss.bind(this);
  }

  dismiss() {
    Store.dispatch(toggleWalletRisksModal(false));
  }

  componentWillReceiveProps(nextProps) {
    const _display = nextProps.displayWalletRisksModal;

    if (nextProps &&
        this.props.displayWalletRisksModal !== _display) {
      this.setState(Object.assign({}, this.state, {
        className: _display ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          display: _display,
          className: _display ? 'show in' : 'hide',
        }));
      }, _display ? 50 : 300);
    }
  }

  render() {
    return WalletRisksModalRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    displayWalletRisksModal: state.Dashboard.displayWalletRisksModal,
  };
};

export default connect(mapStateToProps)(WalletRisksModal);