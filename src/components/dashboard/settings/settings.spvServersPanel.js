import React from 'react';
import translate from '../../../translate/translate';
import { connect } from 'react-redux';
import {
  shepherdElectrumCheckServerConnection,
  shepherdElectrumCoins,
  triggerToaster,
} from '../../../actions/actionCreators';
import Store from '../../../store';

class SPVServersPanel extends React.Component {
  constructor() {
    super();
    this.updateInput = this.updateInput.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.Dashboard &&
        props.Dashboard.activeSection !== 'settings') {
      this.setState(Object.assign({}, this.state, {
        keys: null,
      }));
    }
  }

  setElectrumServer(coin) {
    let _server = [
      window.servers[coin].ip,
      window.servers[coin].port,
      window.servers[coin].proto
    ];

    if (this.state &&
        this.state[coin]) {
      _server = this.state[coin].split(':');
    }

    shepherdElectrumCheckServerConnection(_server[0], _server[1], _server[2])
    .then((res) => {
      if (res.result) {
        const _newServer = `${_server[0]}:${_server[1]}:${_server[2]}`;
        window.servers[coin].ip = _server[0];
        window.servers[coin].port = _server[1];
        window.servers[coin].proto = _server[2];

        Store.dispatch(
          triggerToaster(
            `${coin.toUpperCase()} ${translate('SETTINGS.SPV_SERVER_SET')} ${_newServer}`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );
      } else {
        Store.dispatch(
          triggerToaster(
            `${coin.toUpperCase()} ${translate('SETTINGS.SPV_SERVER')} ${_newServer} ${translate('DASHBOARD.IS_UNREACHABLE')}!`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
      }
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  renderServerListSelectorOptions(coin) {
    let _items = [];
    let _spvServers = window.servers[coin].serverList;

    for (let i = 0; i < _spvServers.length; i++) {
      _items.push(
        <option
          key={ `spv-server-list-${ coin }-${i}` }
          value={ `${_spvServers[i]}` }>{ `${_spvServers[i]}` }</option>
      );
    }

    return _items;
  }

  renderServerList() {
    let _items = [];
    let _spvCoins = this.props.Main.coins.spv;

    for (let i = 0; i < _spvCoins.length; i++) {
      if (window.servers[_spvCoins[i]] &&
          window.servers[_spvCoins[i]].serverList &&
          window.servers[_spvCoins[i]].serverList !== 'none') {
        const _activeServer = `${window.servers[_spvCoins[i]].ip}:${window.servers[_spvCoins[i]].port}:${window.servers[_spvCoins[i]].proto}`;

        _items.push(
          <div
            className={ 'row' + (_spvCoins.length > 1 ? ' padding-bottom-30' : '') }
            key={ `spv-server-list-${ _spvCoins[i] }` }>
            <div className="col-sm-12">
              <strong className="col-sm-1 margin-top-5">{ _spvCoins[i].toUpperCase() }</strong>
              <div className="col-sm-4">
                <select
                  className="form-control form-material"
                  name={ _spvCoins[i] }
                  value={ (this.state && this.state[_spvCoins[i]]) || _activeServer }
                  onChange={ (event) => this.updateInput(event) }
                  autoFocus>
                  { this.renderServerListSelectorOptions(_spvCoins[i]) }
                </select>
              </div>
              <div className="col-sm-1">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={ () => this.setElectrumServer(_spvCoins[i]) }>
                  OK
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    return _items;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 padding-bottom-30">
            <p>{ translate('SETTINGS.SPV_SERVER_LIST_DESC') }</p>
          </div>
        </div>
        { this.renderServerList() }
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
    },
    Dashboard: state.Dashboard,
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(SPVServersPanel);