import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Store from '../../../store';
import translate from '../../../translate/translate';
import BodyEnd from '../bodyBottom/bodyBottom';
import {
  InvoiceModalRender,
  InvoiceModalButtonRender,
  AddressItemRender,
} from './invoiceModal.render';

class InvoiceModal extends React.Component {
  constructor() {
    super();
    this.state = {
      modalIsOpen: false,
      content: '',
      qrAddress: '-1',
      qrAmount: 0,
      className: 'hide',
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.renderAddressList = this.renderAddressList.bind(this);
    this.updateQRContent = this.updateQRContent.bind(this);
    this.saveAsImage = this.saveAsImage.bind(this);
  }

  openModal() {
    this.setState({
      modalIsOpen: true,
      className: 'show fade',
    });

    setTimeout(() => {
      this.setState(Object.assign({}, this.state, {
        className: 'show in',
      }));
    }, 50);
  }

  saveAsImage(e) {
    if (this.state.qrAddress !== '-1') {
      const qrCanvas = document.getElementById('qrCanvas');
      const canvas = qrCanvas.getElementsByTagName('canvas');
      const dataURL = canvas[0].toDataURL();
      const a = document.getElementById('saveImage');
      const time = new Date().getTime();

      a.href = dataURL;
      a.download = `${this.state.qrAddress}_${time}`;
    } else {
      e.preventDefault();
      return;
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    }, this.updateQRContent);
  }

  updateQRContent() {
    this.setState({
      content: JSON.stringify({
        address: this.state.qrAddress,
        amount: this.state.qrAmount,
        coin: this.props.ActiveCoin.coin,
      }),
    });
  }

   closeModal() {
    this.setState({
      className: 'show out',
    });

    setTimeout(() => {
      this.setState(Object.assign({}, this.state, {
        modalIsOpen: false,
        className: 'hide',
      }));
    }, 300);
  }

  renderAddressList() {
    const _address = this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub;
    let _items = [];

    _items.push(
      <option
        key={ _address }
        value={ _address }>
        { _address }  ({ translate('INDEX.BALANCE') }: { this.props.ActiveCoin.balance.balance })
      </option>
    );

    return _items;
  }

  render() {
    if (this.state.modalIsOpen) {
      return <BodyEnd>{ InvoiceModalRender.call(this) }</BodyEnd>;
    } else {
      return InvoiceModalButtonRender.call(this);
    }
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      mode: state.ActiveCoin.mode,
      send: state.ActiveCoin.send,
      receive: state.ActiveCoin.receive,
      balance: state.ActiveCoin.balance,
      cache: state.ActiveCoin.cache,
      activeAddress: state.ActiveCoin.activeAddress,
      lastSendToResponse: state.ActiveCoin.lastSendToResponse,
      addresses: state.ActiveCoin.addresses,
    },
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(InvoiceModal);