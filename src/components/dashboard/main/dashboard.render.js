import React from 'react';

import Navbar from '../navbar/navbar';
import CoinTile from '../coinTile/coinTile';
import WalletsBalance from '../walletsBalance/walletsBalance';
import WalletsNav from '../walletsNav/walletsNav';
import SendCoin from '../sendCoin/sendCoin';
import WalletsData from '../walletsData/walletsData';
import Settings from '../settings/settings';
import ReceiveCoin from '../receiveCoin/receiveCoin';
import About from '../about/about';
import Support from '../support/support';
// import Tools from '../tools/tools';
import WalletsMain from '../walletsMain/walletsMain';
import WalletsTxInfo from '../walletsTxInfo/walletsTxInfo';
import ClaimInterestModal from '../claimInterestModal/claimInterestModal';

const DashboardRender = function() {
  return (
    <div className="full-height">
      <div
        className={ this.isSectionActive('wallets') ? 'page-main' : '' }
        id="section-dashboard">
        <Navbar />
        <div className={ this.isSectionActive('wallets') ? 'show' : 'hide' }>
          <CoinTile />
          <WalletsNav />
          <WalletsTxInfo />
          <WalletsMain />
          <ClaimInterestModal />
        </div>
        { this.isSectionActive('settings') &&
          <Settings disableWalletSpecificUI={false} />
        }
        { this.isSectionActive('about') &&
          <About />
        }
        { this.isSectionActive('support') &&
          <Support />
        }
        { /*this.isSectionActive('tools') &&
          <Tools />*/
        }
      </div>
    </div>
  );
};

export default DashboardRender;