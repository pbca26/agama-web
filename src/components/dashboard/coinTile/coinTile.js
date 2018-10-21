import React from 'react';
import { connect } from 'react-redux';
import { getCoinTitle } from '../../../util/coinHelper';
import translate from '../../../translate/translate';
import CoinTileItem from './coinTileItem';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import Config from '../../../config';

import CoinTileRender from './coinTile.render';

class CoinTile extends React.Component {
  constructor() {
    super();
    this.state = {
      toggledSidebar: false,
    };
    this.renderTiles = this.renderTiles.bind(this);
    this.repeatRenderInterval = null;
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.renderSidebarToggle = this.renderSidebarToggle.bind(this);
  }

  toggleSidebar() {
    this.setState({
      toggledSidebar: !this.state.toggledSidebar,
    });
  }

  renderSidebarToggle() {
    if (this.props.allCoins.spv &&
        this.props.allCoins.spv.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  renderTiles() {
    const allCoins = this.props.allCoins;
    let items = [];

    if (allCoins) {
      allCoins.spv.map((coin) => {
        const _coinTitle = getCoinTitle(coin.toUpperCase());
        const coinlogo = coin.toUpperCase();
        const coinname = Config.whitelabel && Config.wlConfig.coin.ticker === coinlogo ? Config.wlConfig.coin.name : translate((isKomodoCoin(coin) && coin !== 'kmd' && coin !== 'chips' ? 'ASSETCHAINS.' : 'CRYPTO.') + coin.toUpperCase());

        items.push({
          coinlogo,
          coinname,
          coin,
          mode: 'spv',
        });
      });
    }

    return (
      items.map((item, i) =>
        <CoinTileItem
          key={ i }
          i={ i }
          item={ item } />)
    );
  }

  // dirty hack to force tile re-render
  componentDidMount() {
    this.repeatRenderInterval = setInterval(() => {
      this.render();
      this.forceUpdate();
    }, 3000);
  }

  componentWillUnmount() {
    if (this.repeatRenderInterval) {
      clearInterval(this.repeatRenderInterval);
    }
  }

  render() {
    return CoinTileRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    allCoins: state.Main.coins,
  };
};

export default connect(mapStateToProps)(CoinTile);