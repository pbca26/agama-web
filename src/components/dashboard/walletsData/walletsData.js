import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import {
  formatValue,
  sortByDate,
  getRandomElectrumServer,
} from 'agama-wallet-lib/src/utils';
import Config from '../../../config';
import {
  toggleDashboardTxInfoModal,
  changeActiveAddress,
  shepherdElectrumTransactions,
  toggleClaimInterestModal,
  shepherdElectrumCheckServerConnection,
  shepherdElectrumSetServer,
  electrumServerChanged,
  triggerToaster,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import {
  AddressTypeRender,
  TransactionDetailRender,
  AddressRender,
  AddressItemRender,
  TxTypeRender,
  TxAmountRender,
  TxHistoryListRender,
  TxConfsRender,
  WalletsDataRender,
} from  './walletsData.render';
import { secondsToString } from 'agama-wallet-lib/src/time';
import DoubleScrollbar from 'react-double-scrollbar';
import appData from '../../../actions/actions/appData';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class WalletsData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 20,
      pageSize: 20,
      showPagination: true,
      searchTerm: null,
      coin: null,
      txhistory: null,
      loading: false,
      reconnectInProgress: false,
    };
    this.refreshTxHistory = this.refreshTxHistory.bind(this);
    this.openClaimInterestModal = this.openClaimInterestModal.bind(this);
    this.displayClaimInterestUI = this.displayClaimInterestUI.bind(this);
    this.spvAutoReconnect = this.spvAutoReconnect.bind(this);
  }

  displayClaimInterestUI() {
    if (this.props.ActiveCoin &&
        this.props.ActiveCoin.coin.toUpperCase() === 'KMD' &&
        this.props.ActiveCoin.balance) {
      if (this.props.ActiveCoin.balance.interest &&
          this.props.ActiveCoin.balance.interest > 0) {
        return 777;
      } else if (
        this.props.ActiveCoin.balance.balance &&
        this.props.ActiveCoin.balance.balance >= 10
      ) {
        return -777;
      }
    }
  }

  openClaimInterestModal() {
    Store.dispatch(toggleClaimInterestModal(true));
  }

  isOutValue(tx) {
    if ((tx.category === 'send' || tx.category === 'sent') ||
        (tx.type === 'send' || tx.type === 'sent') &&
        tx.amount > 0) {
      tx.amount = tx.amount * -1;
      return tx;
    } else {
      return tx;
    }
  }

  generateItemsListColumns(itemsCount) {
    let columns = [];
    let _col;

    _col = [{
      id: 'direction',
      Header: translate('INDEX.DIRECTION'),
      Footer: translate('INDEX.DIRECTION'),
      className: 'colum--direction',
      headerClassName: 'colum--direction',
      footerClassName: 'colum--direction',
      Cell: row => TxTypeRender.call(this, row.value),
      accessor: (tx) => tx.category || tx.type,
      maxWidth: '110',
    },
    {
      id: 'confirmations',
      Header: translate('INDEX.CONFIRMATIONS'),
      Footer: translate('INDEX.CONFIRMATIONS'),
      headerClassName: 'hidden-xs hidden-sm',
      footerClassName: 'hidden-xs hidden-sm',
      className: 'hidden-xs hidden-sm',
      Cell: row => TxConfsRender.call(this, row.value),
      accessor: (tx) => tx.confirmations,
      maxWidth: '180',
    },
    {
      id: 'amount',
      Header: translate('INDEX.AMOUNT'),
      Footer: translate('INDEX.AMOUNT'),
      Cell: row => TxAmountRender.call(this, this.isOutValue(row.value)),
      accessor: (tx) => tx,
      sortMethod: (a, b) => {
        if (a.amount > b.amount) {
          return 1;
        }
        if (a.amount < b.amount) {
          return -1;
        }
        return 0;
      },
    },
    {
      id: 'timestamp',
      Header: translate('INDEX.TIME'),
      Footer: translate('INDEX.TIME'),
      accessor: (tx) => secondsToString(tx.timestamp || tx.time || tx.blocktime),
    }];

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col[0].Footer;
      delete _col[1].Footer;
      delete _col[2].Footer;
      delete _col[3].Footer;
    }

    columns.push(..._col);

    _col = {
      id: 'destination-address',
      Header: translate('INDEX.DEST_ADDRESS'),
      Footer: translate('INDEX.DEST_ADDRESS'),
      className: 'selectable',
      accessor: (tx) => AddressRender.call(this, tx),
      maxWidth: '350',
    };

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col.Footer;
    }

    columns.push(_col);

    _col = {
      id: 'tx-detail',
      Header: translate('INDEX.TX_DETAIL'),
      Footer: translate('INDEX.TX_DETAIL'),
      className: 'colum--txinfo',
      headerClassName: 'colum--txinfo',
      footerClassName: 'colum--txinfo',
      accessor: (tx) => TransactionDetailRender.call(this, tx),
      sortable: false,
      filterable: false,
      maxWidth: '100',
    };

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col.Footer;
    }

    columns.push(_col);

    return columns;
  }

  refreshTxHistory() {
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 1000);

    Store.dispatch(
      shepherdElectrumTransactions(
        this.props.ActiveCoin.coin,
        this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub
      )
    );
  }

  toggleTxInfoModal(display, txIndex) {
    Store.dispatch(toggleDashboardTxInfoModal(display, txIndex));
  }

  componentWillReceiveProps(props) {
    const _txhistory = this.props.ActiveCoin.txhistory;
    let _stateChange = {};

    // TODO: figure out why changing ActiveCoin props doesn't trigger comp update
    if (_txhistory &&
        _txhistory !== 'loading' &&
        _txhistory !== 'no data' &&
        _txhistory !== 'connection error or incomplete data' &&
        _txhistory !== 'cant get current height' &&
        _txhistory.length) {
      _stateChange = Object.assign({}, _stateChange, {
        itemsList: _txhistory,
        filteredItemsList: this.filterTransactions(_txhistory, this.state.searchTerm),
        txhistory: _txhistory,
        showPagination: _txhistory && _txhistory.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_txhistory.length),
        reconnectInProgress: false,
      });
    }

    if (_txhistory &&
        _txhistory === 'no data') {
      _stateChange = Object.assign({}, _stateChange, {
        itemsList: 'no data',
        reconnectInProgress: false,
      });
    } else if (
      _txhistory &&
      _txhistory === 'loading'
    ) {
      _stateChange = Object.assign({}, _stateChange, {
        itemsList: 'loading',
        reconnectInProgress: false,
      });
    } else if (
      (_txhistory && _txhistory === 'connection error or incomplete data') ||
      (_txhistory && _txhistory === 'cant get current height')
    ) {
      _stateChange = Object.assign({}, _stateChange, {
        itemsList: 'connection error',
        reconnectInProgress: this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].serverList !== 'none' ? true : false,
      });

      if (!this.state.reconnectInProgress) {
        this.spvAutoReconnect();
      }
    }

    this.setState(Object.assign({}, _stateChange));
  }

  spvAutoReconnect() {
    const _coin = this.props.ActiveCoin.coin;
    const _coinServers = appData.servers[_coin];
    const _spvServers = _coinServers.serverList;
    const _server = [
      _coinServers.ip,
      _coinServers.port,
      _coinServers.proto,
    ];
    const _randomServer = getRandomElectrumServer(_spvServers, _server.join(':'));

    shepherdElectrumCheckServerConnection(
      _randomServer.ip,
      _randomServer.port,
      _randomServer.proto
    )
    .then((res) => {
      if (res.result) {
        const _newServer = `${_randomServer.ip}:${_randomServer.port}:${_randomServer.proto}`;
        _coinServers.ip = _server[0];
        _coinServers.port = _server[1];
        _coinServers.proto = _server[2];

        Store.dispatch(
          triggerToaster(
            `${_coin.toUpperCase()} SPV ${translate('DASHBOARD.SERVER_SET_TO')} ${_newServer}`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );
      } else {
        Store.dispatch(
          triggerToaster(
            `${_coin.toUpperCase()} SPV ${translate('DASHBOARD.SERVER_SM')} ${_newServer} ${translate('DASHBOARD.IS_UNREACHABLE')}!`,
            translate('TOASTR.WALLET_NOTIFICATION'),
            'error'
          )
        );
      }
    });
  }

  renderTxHistoryList() {
    if (this.state.itemsList === 'loading') {
      return (
        <div className="padding-left-15">{ translate('INDEX.SYNC_IN_PROGRESS') }...</div>
      );
    } else if (this.state.itemsList === 'no data') {
      return (
        <div className="padding-left-15">{ translate('INDEX.NO_DATA') }</div>
      );
    } else if (this.state.itemsList === 'connection error') {
      return (
        <div className="padding-left-15">
          <div className="color-warning">
            { translate('DASHBOARD.SPV_CONN_ERROR') }
          </div>
          { this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].serverList !== 'none' &&
            <div>
              <div className="color-warning padding-bottom-10">{ translate('DASHBOARD.SPV_AUTO_SWITCH') }...</div>
              <strong>{ translate('DASHBOARD.HOW_TO_SWITCH_MANUALLY') }:</strong>
              <div className="padding-top-10">{ translate('DASHBOARD.SPV_CONN_ERROR_P1') }</div>
            </div>
          }
        </div>
      );
    } else if (
      this.state.itemsList &&
      this.state.itemsList.length
    ) {
      return (
        <DoubleScrollbar>
        { TxHistoryListRender.call(this) }
        </DoubleScrollbar>
      );
    }

    return null;
  }

  onPageSizeChange(pageSize, pageIndex) {
    this.setState(Object.assign({}, this.state, {
      pageSize: pageSize,
      showPagination: this.state.itemsList && this.state.itemsList.length >= this.state.defaultPageSize,
    }));
  }

  onSearchTermChange(newSearchTerm) {
    this.setState(Object.assign({}, this.state, {
      searchTerm: newSearchTerm,
      filteredItemsList: this.filterTransactions(this.state.itemsList, newSearchTerm),
    }));
  }

  filterTransactions(txList, searchTerm) {
    return txList.filter(tx => this.filterTransaction(tx, searchTerm));
  }

  filterTransaction(tx, term) {
    if (!term) {
      return true;
    }

    return this.contains(tx.address, term) ||
      this.contains(tx.confirmations, term) ||
      this.contains(tx.amount, term) ||
      this.contains(tx.type, term) ||
      this.contains(secondsToString(tx.blocktime || tx.timestamp || tx.time), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  isActiveCoinMode(coinMode) {
    return this.props.ActiveCoin.mode === coinMode;
  }

  render() {
    if (this.props &&
        this.props.ActiveCoin &&
        this.props.ActiveCoin.coin &&
        this.props.ActiveCoin.activeSection === 'default') {
      return WalletsDataRender.call(this);
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
      coins: state.ActiveCoin.coins,
      mode: state.ActiveCoin.mode,
      send: state.ActiveCoin.send,
      receive: state.ActiveCoin.receive,
      balance: state.ActiveCoin.balance,
      cache: state.ActiveCoin.cache,
      activeSection: state.ActiveCoin.activeSection,
      activeAddress: state.ActiveCoin.activeAddress,
      lastSendToResponse: state.ActiveCoin.lastSendToResponse,
      addresses: state.ActiveCoin.addresses,
      txhistory: state.ActiveCoin.txhistory,
      showTransactionInfo: state.ActiveCoin.showTransactionInfo,
      progress: state.ActiveCoin.progress,
    },
    Main: state.Main,
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(WalletsData);