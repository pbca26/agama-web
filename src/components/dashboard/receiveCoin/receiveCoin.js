import React from 'react';
import { connect } from 'react-redux';
import {
  copyCoinAddress,
  copyString,
  triggerToaster,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import {
  AddressActionsNonBasiliskModeRender,
  AddressItemRender,
  ReceiveCoinRender,
  _ReceiveCoinTableRender,
} from './receiveCoin.render';
import translate from '../../../translate/translate';

// TODO: implement balance/interest sorting

class ReceiveCoin extends React.Component {
  constructor() {
    super();
    this.state = {
      openDropMenu: false,
      hideZeroAdresses: false,
      toggledAddressMenu: null,
      toggleIsMine: false,
    };
    this.openDropMenu = this.openDropMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.checkTotalBalance = this.checkTotalBalance.bind(this);
    this.ReceiveCoinTableRender = _ReceiveCoinTableRender.bind(this);
    this.toggleAddressMenu = this.toggleAddressMenu.bind(this);
  }

  toggleAddressMenu(address) {
    this.setState({
      toggledAddressMenu: this.state.toggledAddressMenu === address ? null : address,
    });
  }

  ReceiveCoinTableRender() {
    return this._ReceiveCoinTableRender();
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
    if (e &&
        e.srcElement &&
        e.srcElement.offsetParent &&
        e.srcElement.offsetParent.className.indexOf('dropdown') === -1 &&
      (e.srcElement.offsetParent && e.srcElement.offsetParent.className.indexOf('dropdown') === -1)) {
      this.setState({
        openDropMenu: false,
        toggledAddressMenu:
          e.srcElement.className.indexOf('receive-address-context-menu-trigger') === -1 &&
          e.srcElement.className.indexOf('fa-qrcode') === -1 &&
          e.srcElement.className.indexOf('receive-address-context-menu-get-qr') === -1 &&
          e.srcElement.className.indexOf('qrcode-modal') === -1 ? null : this.state.toggledAddressMenu,
      });
    }
  }

  openDropMenu() {
    this.setState(Object.assign({}, this.state, {
      openDropMenu: !this.state.openDropMenu,
    }));
  }

  _copyCoinAddress(address) {
    this.toggleAddressMenu(address);
    Store.dispatch(copyCoinAddress(address));
  }

  renderAddressActions(address, type) {
    return AddressActionsNonBasiliskModeRender.call(this, address, type);
  }

  hasNoAmount(address) {
    return address.amount === 'N/A' || address.amount === 0;
  }

  hasNoInterest(address) {
    return address.interest === 'N/A' || address.interest === 0 || !address.interest;
  }

  checkTotalBalance() {
    let _balance = '0';

    if (this.props.balance &&
        this.props.balance.total) {
      _balance = this.props.balance.total;
    }

    return _balance;
  }

  renderAddressList(type) {
    const _addresses = this.props.addresses;

    if (_addresses &&
        _addresses[type] &&
        _addresses[type].length) {
      let items = [];

      for (let i = 0; i < _addresses[type].length; i++) {
        let address = _addresses[type][i];

        if (this.state.hideZeroAddresses) {
          if (!this.hasNoAmount(address)) {
            items.push(
              AddressItemRender.call(this, address, type)
            );
          }
        } else {
          items.push(
            AddressItemRender.call(this, address, type)
          );
        }
      }

      return items;
    } else {
      if (this.props.electrumCoins &&
          type === 'public') {
        let items = [];

        items.push(
          AddressItemRender.call(
            this,
            {
              address: this.props.electrumCoins[this.props.coin].pub,
              amount: this.props.balance.balance
            },
            'public'
          )
        );

        return items;
      } else {
        return null;
      }
    }
  }

  render() {
    // TODO activeSection === 'receive' should be removed when native mode is fully merged
    // into the rest of the components
    if (this.props &&
       (this.props.receive || this.props.activeSection === 'receive')) {
      return ReceiveCoinRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state, props) => {
  let _mappedProps = {
    coin: state.ActiveCoin.coin,
    mode: state.ActiveCoin.mode,
    receive: state.ActiveCoin.receive,
    balance: state.ActiveCoin.balance,
    cache: state.ActiveCoin.cache,
    activeSection: state.ActiveCoin.activeSection,
    activeAddress: state.ActiveCoin.activeAddress,
    addresses: state.ActiveCoin.addresses,
    electrumCoins: state.Dashboard.electrumCoins,
  };

  if (props &&
      props.activeSection &&
      props.renderTableOnly) {
    _mappedProps.activeSection = props.activeSection;
    _mappedProps.renderTableOnly = props.renderTableOnly;
  }

  return _mappedProps;
};

export default connect(mapStateToProps)(ReceiveCoin);