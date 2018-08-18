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
  const _coin = this.props.ActiveCoin.coin;
  const isNativeLogoWide = _coin === 'kmd' || _coin === 'jumblr' || _coin === 'mesh' || _coin === 'mvp' ? true : false;

  return (
    <div className="page margin-left-0">
      <div className="padding-top-0">
        <div
          id="easydex-header-div"
          className="background-color-white"
          style={ this.getCoinStyle('transparent') }>
          <ol className={ 'coin-logo breadcrumb' + (isNativeLogoWide ? ' coin-logo-wide' : '') + ' native-coin-logo' }>
            <li className="header-easydex-section">
              { this.getCoinStyle('title') &&
                <img
                  className={ 'coin-icon' + (_coin === 'kmd' ? ' kmd' : '') }
                  src={ this.getCoinStyle('title') } />
              }
              { _coin === 'kmd' &&
                <img
                  className="kmd-mobile-icon"
                  src="assets/images/cryptologo/kmd.png" />
              }
              <span className={ `margin-left-20 easydex-section-image ${(isNativeLogoWide ? 'hide' : '')}` }>
                { translate((isKomodoCoin(_coin) && _coin !== 'kmd' && _coin !== 'chips' ? 'ASSETCHAINS.' : 'CRYPTO.') + _coin.toUpperCase()) }
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