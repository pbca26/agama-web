import React from 'react';
import translate from '../../../translate/translate';
import Config from '../../../config';

class About extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="page margin-left-0">
        <div className="page-content">
          <h2>{ translate('ABOUT.ABOUT_AGAMA_ALT') }</h2>
          <p>{ translate('ABOUT.AGAMA_MODES') }</p>
          <br />
          <p className="font-weight-600">{ translate('ABOUT.AGAMA_NOTE') }</p>
          <br />
          <div className="font-weight-600">{ translate('ABOUT.TESTERS') }</div>
          { translate('ABOUT.TESTERS_P1') } <a href={ Config.whitelabel ? Config.wlConfig.support.onlineLink.url : 'https://www.atomicexplorer.com/wallet' }>{ Config.whitelabel ? Config.wlConfig.support.onlineLink.title : 'https://www.atomicexplorer.com/wallet' }</a> { translate('ABOUT.TESTERS_OR') } <a className="link" target="_blank" href={ Config.whitelabel ? Config.wlConfig.support.standaloneLink : 'https://www.atomicexplorer.com/wallet.zip' }>{ translate('ABOUT.TESTERS_P2') }</a>.&nbsp;
          { translate('ABOUT.TESTERS_P3') } <a className="link" target="_blank" href={ Config.whitelabel ? Config.wlConfig.support.chatApp.url : 'https://discordapp.com/channels/412898016371015680/453204571393622027' }>{ Config.whitelabel ? Config.wlConfig.support.chatApp.channel : '#agama-wallet' }</a> { Config.whitelabel ? Config.wlConfig.support.chatApp.name : 'Discord' } { translate('ABOUT.CHANNEL') }. <a className="link" target="_blank" href="http://slackinvite.supernet.org">{ translate('ABOUT.GET_AN_INVITE') }</a> { translate('ABOUT.GET_AN_INVITE_P2') }.&nbsp;
          { translate('ABOUT.TESTERS_P4') }
        </div>
      </div>
    );
  }
}

export default About;