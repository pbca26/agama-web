import React from 'react';
import { connect } from 'react-redux';
import {
  copyCoinAddress,
  copyString,
  triggerToaster,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import {
  AddressActionsRender,
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
      toggledAddressMenu: null,
    };
    this.handleClickOutside = this.handleClickOutside.bind(this);
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

  renderAddressActions(address) {
    return AddressActionsRender.call(this, address);
  }

  renderAddressList() {
    const _address = this.props.electrumCoins[this.props.coin].pub;
    let _items = [];

    _items.push(
      <tr key={ _address }>
        { this.renderAddressActions(_address) }
        <td className="selectable">{ _address }</td>
        <td>
          <span>{ this.props.balance.balance }</span>
        </td>
      </tr>
    );

    return _items;
  }

  render() {
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