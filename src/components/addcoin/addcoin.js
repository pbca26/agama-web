import React from 'react';
import { connect } from 'react-redux';
import translate from '../../translate/translate';
import Config from '../../config';
import {
  addCoin,
  toggleAddcoinModal,
  triggerToaster,
} from '../../actions/actionCreators';
import Store from '../../store';

import CoinSelectorsRender from './coin-selectors.render';
import AddCoinRender from './addcoin.render';

class AddCoin extends React.Component {
  constructor() {
    super();
    this.state = {
      coins: [{
        selectedCoin: null,
        spvMode: {
          disabled: true,
          checked: false,
        },
        mode: 0,
      }],
      display: false,
      modalClassName: 'hide',
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.existingCoins = null;
    this.activateCoin = this.activateCoin.bind(this);
    this.dismiss = this.dismiss.bind(this);
  }

  componentWillMount() {
    this.setState(this.defaultState);
  }

  componentWillReceiveProps(props) {
    const addCoinProps = props ? props.AddCoin : null;

    this.existingCoins = props && props.Main ? props.Main.coins : null;

    if (addCoinProps &&
        addCoinProps.display !== this.state.display) {
      this.setState(Object.assign({}, this.state, {
        modalClassName: addCoinProps.display ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          display: addCoinProps.display,
          modalClassName: addCoinProps.display ? 'show in' : 'hide',
        }));
      }, addCoinProps.display ? 50 : 300);
    }
  }

  renderCoinOption(option) {
    return (
      <div>
        <img
          src={ `assets/images/cryptologo/${option.icon.toLowerCase()}.png` }
          alt={ option.label }
          width="30px"
          height="30px" />
        <span className="margin-left-10">{ option.label }</span>
      </div>
    );
  }

  updateSelectedCoin(e, index) {
    if (e &&
        e.value &&
        e.value.indexOf('|')) {
      const coin = e.value.split('|');
      const defaultMode = coin[1];
      const modeToValue = {
        spv: 0,
      };
      const _value = e.value;
      let _coins = this.state.coins;

      _coins[index] = {
        selectedCoin: _value,
        spvMode: {
          disabled: _value.indexOf('spv') > -1 ? false : true,
          checked: defaultMode === 'spv' ? true : false,
        },
        mode: modeToValue[defaultMode] !== undefined ? modeToValue[defaultMode] : -2,
      };

      this.setState(Object.assign({}, this.state, {
        coins: _coins,
      }));
    }
  }

  updateSelectedMode(_value, index) {
    let _coins = this.state.coins;
    const _selectedCoin = _coins[index].selectedCoin;

    _coins[index] = {
      selectedCoin: _selectedCoin,
      spvMode: {
        disabled: _selectedCoin.indexOf('spv') > -1 ? false : true,
        checked: _value === '0' ? true : false,
      },
      mode: _value,
    };

    this.setState(Object.assign({}, this.state, {
      coins: _coins,
    }));
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.dismiss();
    }
  }

  activateCoin() {
    const coin = this.state.coins[0].selectedCoin.split('|')[0];
    const _coin = this.state.coins[0];

    Store.dispatch(addCoin(
      coin,
      _coin.mode,
    ));

    this.setState(this.defaultState);
    Store.dispatch(toggleAddcoinModal(false, false));
  }

  dismiss() {
    Store.dispatch(toggleAddcoinModal(false, false));
  }

  renderCoinSelectors() {
    const _coins = this.state.coins;
    let items = [];

    for (let i = 0; i < _coins.length; i++) {
      const _item = _coins[i];
      const _coin = _item.selectedCoin || '';

      items.push(
        CoinSelectorsRender.call(
          this,
          _item,
          _coin,
          i
        )
      );
    }

    return items;
  }

  render() {
    return (
      AddCoinRender.call(this)
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
    },
    AddCoin: state.AddCoin,
  };
};

export default connect(mapStateToProps)(AddCoin);