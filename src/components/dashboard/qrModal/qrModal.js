import React from 'react';
import ReactDOM from 'react-dom';
import Store from '../../../store';
import translate from '../../../translate/translate';
import {
  QRModalRender,
  QRModalReaderRender,
} from './qrModal.render';

class QRModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      error: null,
      errorShown: false,
      className: 'hide',
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
    this.saveAsImage = this.saveAsImage.bind(this);
  }

  handleScan(data) {
    if (data !== null) {
      if (this.props.mode === 'scan') {
        this.props.setRecieverFromScan(data);
      }

      this.closeModal();
    }
  }

  handleError(err) {
    this.setState({
      error: translate('DASHBOARD.' + (err.name === 'NoVideoInputDevicesError' ? 'QR_ERR_NO_VIDEO_DEVICE' : 'QR_ERR_UNKNOWN')),
    });
  }

  openModal() {
    this.setState({
      className: 'show fade',
    });

    setTimeout(() => {
      this.setState(Object.assign({}, this.state, {
        modalIsOpen: true,
        className: 'show in',
      }));
    }, 50);
  }

  closeModal() {
    this.setState({
      className: 'show out',
    });

    if (this.state) {
      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          errorShown: this.state.error ? true : false,
          modalIsOpen: false,
          className: 'hide',
        }));
      }, 300);
    }
  }

  componentWillUnmount() {
    this.setState(Object.assign({}, this.state, {
      modalIsOpen: false,
      className: 'hide',
    }));
  }

  saveAsImage(e) {
    const qrCanvas = document.getElementById('qrModalCanvas' + this.props.content);
    const canvas = qrCanvas.getElementsByTagName('canvas');
    const dataURL = canvas[0].toDataURL();
    const a = document.getElementById('saveModalImage' + this.props.content);

    a.href = dataURL;
    a.download = this.props.fileName || this.props.content;
  }

  render() {
    return this.props.mode === 'scan' ? QRModalReaderRender.call(this) : QRModalRender.call(this);
  }
}

export default QRModal;