import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import {
  getAppConfig,
  getAppInfo,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import { SettingsRender } from './settings.render';
import appData from '../../../actions/actions/appData';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.displaySPVServerListTab = this.displaySPVServerListTab.bind(this);
  }

  displaySPVServerListTab() {
    const _main = this.props.Main;

    if (_main &&
        _main.coins &&
        _main.coins.spv) {
      for (let i = 0; i < _main.coins.spv.length; i++) {
        if (appData.servers[_main.coins.spv[i]].serverList) {
          return true;
        }
      }
    }
  }

  componentDidMount(props) {
    document.getElementById('section-iguana-wallet-settings').setAttribute('style',
      'height: auto;' +
      'min-height: 100%'
    );
  }

  render() {
    return SettingsRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(Settings);