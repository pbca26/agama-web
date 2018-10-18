import React from 'react';
import { connect } from 'react-redux';
import {
  dashboardChangeSection,
  toggleAddcoinModal,
  stopInterval,
  startInterval,
  shepherdElectrumLock,
  shepherdElectrumLogout,
  getDexCoins,
  activeHandle,
  dashboardRemoveCoin,
  dashboardChangeActiveCoin,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';

import NavbarRender from './navbar.render';

class Navbar extends React.Component {
  constructor() {
    super();
    this.state = {
      openDropMenu: false,
    };
    this.openDropMenu = this.openDropMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.spvLock = this.spvLock.bind(this);
    this.spvLogout = this.spvLogout.bind(this);
  }

  isRenderSpvLockLogout() {
    const _propsMain = this.props.Main;

    if (_propsMain &&
        _propsMain.isLoggedIn &&
        _propsMain.coins &&
        _propsMain.coins.spv &&
        _propsMain.coins.spv.length) {
      return true;
    }
  }

  spvLock() {
    shepherdElectrumLock()
    .then((res) => {
      Store.dispatch(getDexCoins());
      Store.dispatch(activeHandle());
    });
  }

  spvLogout() {
    shepherdElectrumLogout()
    .then((res) => {
      const _spvCoins = this.props.Main.coins.spv;

      for (let i = 0; i < _spvCoins.length; i++) {
        Store.dispatch(dashboardRemoveCoin(_spvCoins[i]));
      }

      Store.dispatch(getDexCoins());
      Store.dispatch(activeHandle());
    });
  }

  componentWillMount() {
    document.addEventListener(
      'click',
      this.handleClickOutside,
      false
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      this.handleClickOutside,
      false
    );
  }

  handleClickOutside(e) {
    const _srcElement = e.srcElement;

    if (e &&
        _srcElement &&
        _srcElement.className !== 'dropdown-menu' &&
        _srcElement.className !== 'icon fa-bars' &&
        _srcElement.title !== 'top menu' &&
        (_srcElement.offsetParent && _srcElement.offsetParent.className !== 'navbar-avatar-inner') &&
        _srcElement.className.indexOf('navbar-avatar') === -1 &&
        (e.path && e.path[4] && e.path[4].className.indexOf('dropdown-menu') === -1)) {
      this.setState({
        openDropMenu: false,
      });
    }
  }

  openDropMenu() {
    this.setState(Object.assign({}, this.state, {
      openDropMenu: !this.state.openDropMenu,
    }));
  }

  toggleAddCoinModal() {
    Store.dispatch(toggleAddcoinModal(true, false));
  }

  dashboardChangeSection(sectionName) {
    Store.dispatch(dashboardChangeSection(sectionName));
  }

  isSectionActive(section) {
    return this.props.Dashboard.activeSection === section;
  }

  render() {
    return NavbarRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
    },
    Dashboard: {
      activeSection: state.Dashboard.activeSection,
    },
    Interval: {
      interval: state.Interval.interval,
    },
    Main: {
      isLoggedIn: state.Main.isLoggedIn,
      coins: state.Main.coins,
    },
  };
};

export default connect(mapStateToProps)(Navbar);