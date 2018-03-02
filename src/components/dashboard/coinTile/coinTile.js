import React from 'react';
import { connect } from 'react-redux';
import {
  getCoinTitle,
  getModeInfo
} from '../../../util/coinHelper';
import CoinTileItem from './coinTileItem';

import CoinTileRender from './coinTile.render';

class CoinTile extends React.Component {
  constructor() {
    super();
    this.renderTiles = this.renderTiles.bind(this);
    this.repeatRenderInterval = null;
  }

  renderTiles() {
    const modes = [
      'spv',
    ];
    const allCoins = this.props.allCoins;
    let items = [];

    if (allCoins) {
      modes.map(function(mode) {
        allCoins[mode].map(function(coin) {
          const _coinMode = getModeInfo(mode);
          const modecode = _coinMode.code;
          const modetip = _coinMode.tip;
          const modecolor = _coinMode.color;

          const _coinTitle = getCoinTitle(coin.toUpperCase());
          const coinlogo = _coinTitle.logo;
          const coinname = _coinTitle.name;

          items.push({
            coinlogo,
            coinname,
            coin,
            mode,
            modecolor,
            modetip,
            modecode,
          });
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

