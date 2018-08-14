import React from 'react';
import WalletsBalance from '../walletsBalance/walletsBalance';
import WalletsInfo from '../walletsInfo/walletsInfo';
import SendCoin from '../sendCoin/sendCoin';
import WalletsData from '../walletsData/walletsData';
import ReceiveCoin from '../receiveCoin/receiveCoin';
import { getCoinTitle } from '../../../util/coinHelper';
import Config from '../../../config';
import translate from '../../../translate/translate';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';

const WalletsMainRender = function() {
  return (
    <div className="page margin-left-0">
      <div className="padding-top-0">
        <div
          id="easydex-header-div"
          className="background-color-white"
          style={ this.getCoinStyle('transparent') }>
          <ol className={ 'coin-logo breadcrumb' + (this.props.ActiveCoin.coin.toUpperCase() === 'KMD' || this.props.ActiveCoin.coin.toUpperCase() === 'JUMBLR' || this.props.ActiveCoin.coin.toUpperCase() === 'MESH' || this.props.ActiveCoin.coin.toUpperCase() === 'MVP' ? ' coin-logo-wide' : '') + ' native-coin-logo' }>
            <li className="header-easydex-section">
              { this.getCoinStyle('title') &&
                <img
                  className={ 'coin-icon' + (this.props.ActiveCoin.coin.toUpperCase() === 'KMD' ? ' kmd' : '') }
                  src={ this.getCoinStyle('title') } />
              }
              { this.props.ActiveCoin.coin.toUpperCase() === 'KMD' &&
                <img
                  className="kmd-mobile-icon"
                  src="assets/images/cryptologo/kmd.png" />
              }
              <span className={ `margin-left-20 easydex-section-image ${(this.props.ActiveCoin.coin.toUpperCase() === 'KMD' || this.props.ActiveCoin.coin.toUpperCase() === 'JUMBLR' || this.props.ActiveCoin.coin.toUpperCase() === 'MESH' || this.props.ActiveCoin.coin.toUpperCase() === 'MVP' ? 'hide' : '')}` }>
                { translate((isKomodoCoin(this.props.ActiveCoin.coin) && this.props.ActiveCoin.coin !== 'kmd' && this.props.ActiveCoin.coin !== 'chips' ? 'ASSETCHAINS.' : 'CRYPTO.') + this.props.ActiveCoin.coin.toUpperCase()) }
              </span>
            </li>
          </ol>
        </div>
        <div className="page-content page-content-native">
          <div className="row">
            <WalletsBalance />
            <ReceiveCoin />
            <WalletsData />
            <SendCoin />
            <WalletsInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletsMainRender;