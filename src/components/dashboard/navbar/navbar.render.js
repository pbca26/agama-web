import React from 'react';
import translate from '../../../translate/translate';
import ReactTooltip from 'react-tooltip';
import Config from '../../../config';
import assetsPath from '../../../util/assetsPath';
import appData from '../../../actions/actions/appData';

const NavbarRender = function() {
  let _imagePath;

  if (Config.whitelabel) {
    if (Config.wlConfig.coin.logo.indexOf('http') > -1) {
      _imagePath = Config.wlConfig.coin.logo;
    } else {
      _imagePath = `${assetsPath.root}/${Config.wlConfig.coin.logo}`;
    }
  } else {
    _imagePath = assetsPath.root + '/';
  }

  return (
    <nav className="site-navbar navbar navbar-default navbar-fixed-top navbar-mega">
      <div className="navbar-header">
        <div className="navbar-brand navbar-brand-center site-gridmenu-toggle">
          <img
            className={ 'navbar-brand-logo hidden-xs' + (Config.whitelabel ? ' whitelabel' : '') }
            src={ _imagePath + 'agama-logo-side.svg' }
            height="100"
            width="100"
            title={ Config.whitelabel ? Config.wlConfig.title : translate('ABOUT.AGAMA_WALLET') } />
          { Config.whitelabel &&
            <span className="whitelabel-icon-title">{ Config.wlConfig.coin.ticker }</span>
          }
          <img
            className={ 'navbar-brand-logo hidden-lg' + (Config.whitelabel ? ' whitelabel' : '') }
            src={ _imagePath + 'agama-icon.svg' }
            title={ Config.whitelabel ? Config.wlConfig.title : translate('ABOUT.AGAMA_WALLET') } />
          <span className="navbar-brand-text hidden-xs"></span>
        </div>
      </div>
      <div className="navbar-container container-fluid">
        <div className="collapse navbar-collapse navbar-collapse-toolbar">
          <ul className="nav navbar-toolbar">
            <li className="hidden-float hide">
              <a>
                <i className="icon hamburger hamburger-arrow-left">
                  <span className="sr-only">{ translate('INDEX.TOGGLE_MENUBAR') }</span>
                  <span className="hamburger-bar"></span>
                </i>
              </a>
            </li>
            <li className={ this.isSectionActive('wallets') ? 'active nav-top-menu' : 'nav-top-menu' }>
              <a onClick={ () => this.dashboardChangeSection('wallets') }>
                <i className="site-menu-icon"></i> { translate('INDEX.WALLETS') }
              </a>
            </li>
            { /*Config.experimentalFeatures &&
              <li className={ this.isSectionActive('tools') ? 'active nav-top-menu' : 'nav-top-menu' }>
                <a onClick={ () => this.dashboardChangeSection('tools') }>
                  <i className="site-menu-icon"></i> Tools
                </a>
              </li>*/
            }
            { !navigator.onLine &&
              <li
                className="nav-top-menu offline"
                data-tip={ translate('INDEX.WALLET_OFFLINE') }
                data-for="navbar">
                <span className="offline-icon"></span> { translate('INDEX.OFFLINE') }
                <ReactTooltip
                  id="navbar"
                  effect="solid"
                  className="text-left" />
              </li>
            }
          </ul>
          <ul className="nav navbar-toolbar navbar-right navbar-toolbar-right">
            { (!Config.whitelabel || (Config.whitelabel && Config.wlConfig.enableAllCoins)) &&
              !appData.isWatchOnly &&
              <li>
                <a
                  className="pointer padding-bottom-10 padding-top-16"
                  onClick={ this.toggleAddCoinModal }>
                  <span>
                    <img
                      src={ `${assetsPath.icons}/activatecoin.png` }
                      alt={ translate('INDEX.ADD_COIN') } />
                  </span>
                </a>
              </li>
            }
            <li
              className={ 'pointer dropdown' + (this.state.openDropMenu ? ' open' : '') }
              onClick={ this.openDropMenu }>
              <a className="navbar-avatar dropdown-toggle">
                <span className="navbar-avatar-inner">
                  <i
                    title={ translate('INDEX.TOP_MENU') }
                    className="icon fa-bars"></i>
                </span>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a
                    href={ Config.whitelabel ? Config.wlConfig.support.standaloneLink : 'https://www.atomicexplorer.com/wallet.zip' }
                    target="_blank">
                    <i className="icon fa-download"></i> { translate('INDEX.STANDALONE') }
                  </a>
                </li>
                { !this.isSectionActive('settings') &&
                  <li>
                    <a onClick={ () => this.dashboardChangeSection('settings') }>
                      <i className="icon fa-cog"></i> { translate('INDEX.SETTINGS') }
                    </a>
                  </li>
                }
                { !this.isSectionActive('about') &&
                  <li>
                    <a onClick={ () => this.dashboardChangeSection('about') }>
                      <i className="icon fa-users"></i> { translate('ABOUT.ABOUT') }
                    </a>
                  </li>
                }
                { !this.isSectionActive('support') &&
                  <li>
                    <a onClick={ () => this.dashboardChangeSection('support') }>
                      <i className="icon fa-life-ring"></i> { translate('SETTINGS.SUPPORT') }
                    </a>
                  </li>
                }
                { this.isRenderSpvLockLogout() &&
                  <li>
                    <a onClick={ this.spvLock }>
                      <i className="icon fa-lock"></i> { translate('DASHBOARD.SOFT_LOGOUT') }
                    </a>
                  </li>
                }
                { this.isRenderSpvLockLogout() &&
                  <li>
                    <a onClick={ this.spvLogout }>
                      <i className="icon fa-power-off"></i> { translate('DASHBOARD.COMPLETE_LOGOUT') }
                    </a>
                  </li>
                }
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarRender;