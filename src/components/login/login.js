import React from 'react';
import { connect } from 'react-redux';
import {
  toggleAddcoinModal,
  shepherdElectrumAuth,
  shepherdElectrumCoins,
  getDexCoins,
  triggerToaster,
  toggleLoginSettingsModal,
  stopInterval,
  dashboardChangeActiveCoin,
  toggleWalletRisksModal,
  shepherdElectrumLogout,
  dashboardRemoveCoin,
  activeHandle,
  addCoin,
  copyString,
} from '../../actions/actionCreators';
import Config from '../../config';
import Store from '../../store';
import SwallModalRender from './swall-modal.render';
import LoginRender from './login.render';
import translate from '../../translate/translate';
import passphraseGenerator from 'agama-wallet-lib/src/crypto/passphrasegenerator';
import md5 from 'agama-wallet-lib/src/crypto/md5';
import assetsPath from '../../util/assetsPath';
import appData from '../../actions/actions/appData';

const SEED_TRIM_TIMEOUT = 5000;

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      display: false,
      activeLoginSection: 'activateCoin',
      loginPassphrase: Config.preload ? Config.preload.seed : '',
      seedInputVisibility: false,
      loginPassPhraseSeedType: null,
      bitsOption: 256,
      randomSeed: passphraseGenerator.generatePassPhrase(256),
      randomSeedConfirm: '',
      isSeedConfirmError: false,
      isSeedBlank: false,
      displaySeedBackupModal: false,
      customWalletSeed: false,
      isCustomSeedWeak: false,
      trimPassphraseTimer: null,
      shouldEncryptSeed: false,
      encryptKey: '',
      pubKey: '',
      decryptKey: '',
      selectedPin: '',
      enableEncryptSeed: false,
      selectedShortcutSPV: '',
      risksWarningRead: false,
      seedExtraSpaces: false,
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.toggleActivateCoinForm = this.toggleActivateCoinForm.bind(this);
    this.updateRegisterConfirmPassPhraseInput = this.updateRegisterConfirmPassPhraseInput.bind(this);
    this.updateLoginPassPhraseInput = this.updateLoginPassPhraseInput.bind(this);
    this.loginSeed = this.loginSeed.bind(this);
    this.toggleSeedInputVisibility = this.toggleSeedInputVisibility.bind(this);
    this.handleRegisterWallet = this.handleRegisterWallet.bind(this);
    this.toggleSeedBackupModal = this.toggleSeedBackupModal.bind(this);
    this.copyPassPhraseToClipboard = this.copyPassPhraseToClipboard.bind(this);
    this.execWalletCreate = this.execWalletCreate.bind(this);
    this.resizeLoginTextarea = this.resizeLoginTextarea.bind(this);
    this.updateEncryptKey = this.updateEncryptKey.bind(this);
    this.updatePubKey = this.updatePubKey.bind(this);
    this.updateDecryptKey = this.updateDecryptKey.bind(this);
    this.loadPinList = this.loadPinList.bind(this);
    this.updateSelectedShortcut = this.updateSelectedShortcut.bind(this);
    this.setRecieverFromScan = this.setRecieverFromScan.bind(this);
    this.setLoginState = this.setLoginState.bind(this);
    this.toggleRisksWarningModal = this.toggleRisksWarningModal.bind(this);
    this.resetSPVCoins = this.resetSPVCoins.bind(this);
  }

  // the setInterval handler for 'activeCoins'
  _iguanaActiveCoins = null;

  toggleRisksWarningModal() {
    Store.dispatch(toggleWalletRisksModal(!this.props.Dashboard.displayWalletRisksModal));
  }

  setRecieverFromScan(receiver) {
    if (receiver) {
      this.setState({
        loginPassphrase: receiver,
      });
    } else {
      Store.dispatch(
        triggerToaster(
          translate('LOGIN.QR_SCAN_ERR_DESC'),
          translate('LOGIN.QR_SCAN_ERR'),
          'error'
        )
      );
    }
  }

  isCustomWalletSeed() {
    return this.state.customWalletSeed;
  }

  toggleCustomWalletSeed() {
    this.setState({
      customWalletSeed: !this.state.customWalletSeed,
    }, () => {
      // if customWalletSeed is set to false, regenerate the seed
      if (!this.state.customWalletSeed) {
        this.setState({
          randomSeed: passphraseGenerator.generatePassPhrase(this.state.bitsOption),
          isSeedConfirmError: false,
          isSeedBlank: false,
          isCustomSeedWeak: false,
        });
      } else {
        // if customWalletSeed is set to true, reset to seed to an empty string
        this.setState({
          randomSeed: '',
          randomSeedConfirm: '',
        });
      }
    });
  }

  shouldEncryptSeed() {
    return this.state.shouldEncryptSeed;
  }

  toggleShouldEncryptSeed() {
    this.setState({
      shouldEncryptSeed: !this.state.shouldEncryptSeed,
    });
  }

  updateEncryptKey(e) {
    this.setState({
      encryptKey: e.target.value,
    });
  }

  updatePubKey(e) {
    this.setState({
      pubKey: e.target.value,
    });
  }

  updateDecryptKey(e) {
    this.setState({
      decryptKey: e.target.value,
    });
  }

  componentDidMount() {
    this.setLoginState(this.props);

    if (Config.preload) {
      for (let i = 0; i < Config.preload.coins.length; i++) {
        Store.dispatch(addCoin(Config.preload.coins[i]));
      }
    }
  }

  toggleSeedInputVisibility() {
    this.setState({
      seedInputVisibility: !this.state.seedInputVisibility,
    });

    this.resizeLoginTextarea();
  }

  generateNewSeed(bits) {
    this.setState(Object.assign({}, this.state, {
      randomSeed: passphraseGenerator.generatePassPhrase(bits),
      bitsOption: bits,
      isSeedBlank: false,
    }));
  }

  setLoginState(props) {
    if (props.Login.pinList === 'no pins') {
      props.Login.pinList = [];
    }

    if (props &&
        props.Main &&
        props.Main.isLoggedIn) {
      if (props.Main.total === 0) {
        this.setState({
          activeLoginSection: 'activateCoin',
          loginPassphrase: '',
          display: true,
        });
      } else {
        this.setState({
          loginPassphrase: '',
          display: false,
        });
      }
    }

    if (props &&
        props.Main &&
        !props.Main.isLoggedIn) {
      document.body.className = 'page-login layout-full page-dark';

      if (props.Interval &&
          props.Interval.interval &&
          props.Interval.interval.sync) {
        Store.dispatch(dashboardChangeActiveCoin());
        Store.dispatch(
          stopInterval(
            'sync',
            props.Interval.interval
          )
        );
      }

      this.setState({
        display: true,
        activeLoginSection: this.state.activeLoginSection !== 'signup' ? (props.Main.total > 0 ? 'login' : 'activateCoin') : (props.Main.total > 0 ? 'signup' : 'activateCoin'),
      });
    }

    if (props.Main &&
        props.Main.total === 0) {
      document.body.className = 'page-login layout-full page-dark';

      if (props.Interval &&
          props.Interval.interval &&
          props.Interval.interval.sync) {
        Store.dispatch(dashboardChangeActiveCoin());
        Store.dispatch(
          stopInterval(
            'sync',
            props.Interval.interval
          )
        );
      }
    }

    if (this.state.activeLoginSection !== 'signup' &&
        props &&
        props.Main &&
        props.Main.isLoggedIn) {
      this.setState({
        loginPassphrase: '',
        activeLoginSection: 'activateCoin',
      });
    }
  }

  componentWillReceiveProps(props) {
    this.setLoginState(props);

    if (this.props.Dashboard.displayWalletRisksModal) {
      setTimeout(() => {
        this.setState({
          risksWarningRead: true,
        });
      }, 100);
    }
  }

  componentWillMount() {
    if (Config.whitelabel) {
      Store.dispatch(addCoin(Config.wlConfig.coin.ticker));
    }
  }

  toggleActivateCoinForm() {
    Store.dispatch(toggleAddcoinModal(true, false));
  }

  resizeLoginTextarea() {
    // auto-size textarea
    setTimeout(() => {
      if (this.state.seedInputVisibility) {
        const _login = document.querySelector('#loginPassphrase');
        _login.style.height = '1px';
        _login.style.height = `${(15 + _login.scrollHeight)}px`;
      }
    }, 100);
  }

  updateLoginPassPhraseInput(e) {
    const newValue = e.target.value;

    clearTimeout(this.state.trimPassphraseTimer);

    const _trimPassphraseTimer = setTimeout(() => {
      if (newValue[0] === ' ' ||
          newValue[newValue.length - 1] === ' ') {
        this.setState({
          seedExtraSpaces: true,
        });
      } else {
        this.setState({
          seedExtraSpaces: false,
        });
      }
    }, SEED_TRIM_TIMEOUT);

    this.resizeLoginTextarea();

    this.setState({
      seedExtraSpaces: false,
      trimPassphraseTimer: _trimPassphraseTimer,
      [e.target.name === 'loginPassphraseTextarea' ? 'loginPassphrase' : e.target.name]: newValue,
      loginPassPhraseSeedType: this.getLoginPassPhraseSeedType(newValue),
    });
  }

  updateRegisterConfirmPassPhraseInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
      isSeedConfirmError: false,
      isSeedBlank: this.isBlank(e.target.value),
    });
  }

  updateWalletSeed(e) {
    this.setState({
      randomSeed: e.target.value,
      isSeedConfirmError: false,
      isSeedBlank: this.isBlank(e.target.value),
    });
  }

  loginSeed() {
    appData.createSeed.secondaryLoginPH = md5(this.state.loginPassphrase);

    // reset the login pass phrase values so that when the user logs out, the values are clear
    this.setState({
      loginPassphrase: '',
      loginPassPhraseSeedType: null,
    });

    // reset login input vals
    this.refs.loginPassphrase.value = '';
    this.refs.loginPassphraseTextarea.value = '';

    if (this.state.shouldEncryptSeed) {
      Store.dispatch(encryptPassphrase(
        this.state.loginPassphrase,
        this.state.encryptKey,
        this.state.pubKey
      ));
    }

    if (this.state.selectedPin) {
      Store.dispatch(loginWithPin(this.state.decryptKey, this.state.selectedPin));
    } else {
      Store.dispatch(shepherdElectrumAuth(this.state.loginPassphrase));
      Store.dispatch(shepherdElectrumCoins());
    }

    this.setState(this.defaultState);
  }

  loadPinList() {
    Store.dispatch(loadPinList());
  }

  updateSelectedPin(e) {
    this.setState({
      selectedPin: e.target.value,
    });
  }

  getLoginPassPhraseSeedType(passPhrase) {
    if (!passPhrase) {
      return null;
    }

    const passPhraseWords = passPhrase.split(' ');

    if (!passphraseGenerator.arePassPhraseWordsValid(passPhraseWords)) {
      return null;
    }

    if (passphraseGenerator.isPassPhraseValid(passPhraseWords, 256)) {
      return translate('LOGIN.IGUANA_SEED');
    }

    if (passphraseGenerator.isPassPhraseValid(passPhraseWords, 160)) {
      return translate('LOGIN.WAVES_SEED');
    }

    if (passphraseGenerator.isPassPhraseValid(passPhraseWords, 128)) {
      return translate('LOGIN.NXT_SEED');
    }

    return null;
  }

  updateActiveLoginSection(name) {
    // reset login/create form
    this.setState({
      activeLoginSection: name,
      loginPassphrase: null,
      loginPassPhraseSeedType: null,
      seedInputVisibility: false,
      bitsOption: 256,
      randomSeed: passphraseGenerator.generatePassPhrase(256),
      randomSeedConfirm: '',
      isSeedConfirmError: false,
      isSeedBlank: false,
      displaySeedBackupModal: false,
      customWalletSeed: false,
      isCustomSeedWeak: false,
      risksWarningRead: this.state.risksWarningRead,
    });

    if (!this.state.risksWarningRead &&
        name === 'signup') {
      setTimeout(() => {
        this.toggleRisksWarningModal();
      }, 50);
    }
  }

  execWalletCreate() {
    appData.createSeed.triggered = true;
    appData.createSeed.firstLoginPH = md5(this.state.randomSeed);

    Store.dispatch(
      shepherdElectrumAuth(this.state.randomSeedConfirm)
    );
    Store.dispatch(
      shepherdElectrumCoins()
    );

    this.setState({
      activeLoginSection: 'activateCoin',
      displaySeedBackupModal: false,
      isSeedConfirmError: false,
    });
  }

  // TODO: disable register btn if seed or seed conf is incorrect
  handleRegisterWallet() {
    const enteredSeedsMatch = this.state.randomSeed === this.state.randomSeedConfirm;
    const isSeedBlank = this.isBlank(this.state.randomSeed);

    // if custom seed check for string strength
    // at least 1 letter in upper case
    // at least 1 digit
    // at least one special char
    // min length 10 chars

    const _regexPattern = '^(?=.*[A-Z])(?=.*[^<>{}\"/|;:.,~!?@#$%^=&*\\]\\\\()\\[_+]*$)(?=.*[0-9])(?=.*[a-z]).{10,99}$';
    const _customSeed = this.state.customWalletSeed ? this.state.randomSeed.match(_regexPattern) : false;

    this.setState({
      isCustomSeedWeak: _customSeed === null ? true : false,
      isSeedConfirmError: !enteredSeedsMatch ? true : false,
      isSeedBlank: isSeedBlank ? true : false,
    });

    if (enteredSeedsMatch &&
        !isSeedBlank &&
        _customSeed !== null) {
      this.toggleSeedBackupModal();
    }
  }

  isBlank(str) {
    return (!str || /^\s*$/.test(str));
  }

  handleKeydown(e) {
    this.updateLoginPassPhraseInput(e);

    if (e.key === 'Enter' &&
        this.state.loginPassphrase) {
      this.loginSeed();
    }
  }

  toggleSeedBackupModal() {
    this.setState(Object.assign({}, this.state, {
      displaySeedBackupModal: !this.state.displaySeedBackupModal,
    }));
  }

  copyPassPhraseToClipboard() {
    Store.dispatch(copyString(this.state.randomSeed, translate('LOGIN.SEED_SUCCESSFULLY_COPIED')));
  }

  updateSelectedShortcut(e, type) {
    this.setState({
      'selectedShortcutSPV' : e.value,
    });

    if (e.value === 'kmd+revs+jumblr') {
      Store.dispatch(addCoin(
        'kmd',
        '0',
      ));
      Store.dispatch(addCoin(
        'revs',
        '0',
      ));
      Store.dispatch(addCoin(
        'jumblr',
        '0',
      ));
    } else {
      Store.dispatch(addCoin(
        e.value,
        '0',
      ));
    }

    Store.dispatch(activeHandle());
    Store.dispatch(getDexCoins());
  }

  renderResetSPVCoinsOption() {
    const _main = this.props.Main;

    if (_main &&
        _main.coins &&
        _main.coins.spv &&
        _main.coins.spv.length) {
      if (!Config.whitelabel ||
          (Config.whitelabel && _main.coins.spv.length === 1 && _main.coins.spv[0] !== Config.wlConfig.coin.ticker.toLowerCase()) ||
          (Config.whitelabel && _main.coins.spv.length > 1)) {
        return true;
      }
    }
  }

  resetSPVCoins() {
    shepherdElectrumLogout()
    .then((res) => {
      const _spvCoins = this.props.Main.coins.spv;

      for (let i = 0; i < _spvCoins.length; i++) {
        if (!Config.whitelabel ||
          (Config.whitelabel && _spvCoins[i].toLowerCase() !== Config.wlConfig.coin.ticker.toLowerCase())) {
          Store.dispatch(dashboardRemoveCoin(_spvCoins[i]));
        }
      }

      this.setState({
        selectedShortcutSPV: null,
      });

      Store.dispatch(getDexCoins());
      Store.dispatch(activeHandle());
    });
  }

  renderSwallModal() {
    if (this.state.displaySeedBackupModal) {
      return SwallModalRender.call(this);
    }

    return null;
  }

  renderShortcutOption(option) {
    if (option.value.indexOf('+') > -1) {
      const _comps = option.value.split('+');
      let _items = [];

      for (let i = 0; i < _comps.length; i++) {
        _items.push(
          <span key={ `addcoin-shortcut-icons-${i}` }>
            <img
              src={ `${assetsPath.coinLogo}/${_comps[i].toLowerCase()}.png` }
              alt={ _comps[i].toUpperCase() }
              width="30px"
              height="30px" />
            { i !== _comps.length - 1 &&
              <span className="margin-left-10 margin-right-10">+</span>
            }
          </span>
        );
      }

      return _items;
    } else {
      return (
        <div>
          <img
            src={ `${assetsPath.coinLogo}/${option.value.toLowerCase()}.png` }
            alt={ option.value.toUpperCase() }
            width="30px"
            height="30px" />
          <span className="margin-left-10">{ option.value.toUpperCase() }</span>
        </div>
      );
    }
  }

  render() {
    if ((this.state && this.state.display) ||
        !this.props.Main) {
      return LoginRender.call(this);
    }

    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
    Dashboard: state.Dashboard,
    Interval: {
      interval: state.Interval.interval,
    },
    Login: state.Login,
  };
};

export default connect(mapStateToProps)(Login);