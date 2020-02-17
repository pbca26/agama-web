import React from 'react';
import { connect } from 'react-redux';
import DashboardRender from './dashboard.render';
import { triggerToaster } from '../../../actions/actionCreators';
import Store from '../../../store';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.renderDashboard = this.renderDashboard.bind(this);
  }

  isSectionActive(section) {
    return this.props.Dashboard.activeSection === section;
  }

  renderDashboard() {
    document.body.className = '';

    return DashboardRender.call(this);
  }

  displayDashboard() {
    const _props = this.props;

    return _props &&
      _props.Main &&
      _props.Main.coins &&
      _props.Main.coins.spv &&
      _props.Main.coins.spv.length &&
      _props.Main.isLoggedIn;
  }

  render() {
    if (this.displayDashboard()) {
      return this.renderDashboard();
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
    },
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(Dashboard);