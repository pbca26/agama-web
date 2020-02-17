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
          <p className="padding-bottom-15 padding-top-10">{ translate('ABOUT.AGAMA_MODES') }</p>
          <p className="font-weight-600 padding-bottom-15">{ translate('ABOUT.AGAMA_NOTE') }</p>
          <div className="font-weight-600">{ translate('ABOUT.TESTERS') }</div>
          { translate('ABOUT.TESTERS_P1') }
          <a
            className="pointer nbsp nbsp-l"
            target="_blank"
            href={
              Config.whitelabel ? Config.wlConfig.support.onlineLink.url : 'https://www.atomicexplorer.com/wallet'
            }>{ Config.whitelabel ? Config.wlConfig.support.onlineLink.title : 'https://www.atomicexplorer.com/wallet' }</a>
          <span className="nbsp">{ translate('ABOUT.TESTERS_OR') }</span>
          <a
            className="pointer nbsp"
            target="_blank"
            href={
              Config.whitelabel ? Config.wlConfig.support.standaloneLink : 'https://www.atomicexplorer.com/wallet.zip'
            }>{ translate('ABOUT.TESTERS_P2') }</a>.
          <span className="nbsp-l nbsp">{ translate('ABOUT.TESTERS_P3') }</span>
          <a
            className="pointer nbsp"
            target="_blank"
            href={
              Config.whitelabel ? Config.wlConfig.support.chatApp.url : 'https://discordapp.com/channels/412898016371015680/453204571393622027'
            }>{
              Config.whitelabel ? Config.wlConfig.support.chatApp.channel : '#agama-wallet'
            }</a>
          <span className="nbsp">{ Config.whitelabel ? Config.wlConfig.support.chatApp.name : 'Discord' } { translate('ABOUT.CHANNEL') }</span>.
          <a
            className="pointer nbsp nbsp-l"
            target="_blank"
            href={
              Config.whitelabel ? Config.wlConfig.support.chatApp.inviteUrl : 'https://komodoplatform.com/discord'
            }>{ translate('ABOUT.GET_AN_INVITE') }</a>
          { translate('ABOUT.GET_AN_INVITE_P2').replace('Discord', Config.whitelabel ? Config.wlConfig.support.chatApp.name : 'Discord') }.
          <span className="nbsp-l">{ translate('ABOUT.TESTERS_P4') }</span>
        </div>
      </div>
    );
  }
}

export default About;