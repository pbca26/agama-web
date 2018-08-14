import React from 'react';
import translate from '../../../translate/translate';
import Config from '../../../config';

class Support extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="page margin-left-0">
        <div className="page-content">
          <h2>{ translate('SETTINGS.SUPPORT') }</h2>
          <div className="row">
            <div className="col-sm-12 no-padding-left">
              <div className="support-box-wrapper">
                <a
                  target="_blank"
                  className="support-box"
                  href={ Config.whitelabel ? Config.wlConfig.support.ticketsLink.url : 'http://support.komodoplatform.com' }>
                  <img
                    src="assets/images/cryptologo/supernet.png"
                    alt={ translate('SETTINGS.SUPPORT_TICKETS') } />
                  <div className="support-box-title">{ translate('SETTINGS.SUPPORT_TICKETS') }</div>
                  <div className="support-box-link selectable">{ Config.whitelabel ? Config.wlConfig.support.ticketsLink.title : 'support.komodoplatform.com' }</div>
                </a>
              </div>
              <div className="support-box-wrapper">
                <a
                  target="_blank"
                  className="support-box"
                  href={ Config.whitelabel ? Config.wlConfig.support.chatApp.url : 'https://discordapp.com/channels/412898016371015680/453204571393622027' }>
                  <img
                    src={ 'assets/images/support/discord-icon.png'.replace('discord', Config.whitelabel ? Config.wlConfig.support.chatApp.name.toLowerCase() : 'discord') }
                    alt={ Config.whitelabel ? Config.wlConfig.support.chatApp.name : 'Discord' } />
                  <div className="support-box-title">{ Config.whitelabel ? Config.wlConfig.support.chatApp.name : 'Discord' }</div>
                  <div className="support-box-link">{ Config.whitelabel ? Config.wlConfig.support.chatApp.channel : '#agama-wallet' }</div>
                </a>
              </div>
              <div className="support-box-wrapper">
                <a
                  target="_blank"
                  className="support-box"
                  href={ Config.whitelabel ? Config.wlConfig.support.chatApp.inviteUrl : 'https://komodoplatform.com/discord' }>
                  <img
                    src={ 'assets/images/support/discord-invite-icon.png'.replace('discord', Config.whitelabel ? Config.wlConfig.support.chatApp.name.toLowerCase() : 'discord') }
                    alt={ translate('SETTINGS.GET_DISCORD_INVITE').replace('Discord', Config.whitelabel ? Config.wlConfig.support.chatApp.name : 'Discord') } />
                  <div className="support-box-title">{ translate('SETTINGS.GET_DISCORD_INVITE').replace('Discord', Config.whitelabel ? Config.wlConfig.support.chatApp.name : 'Discord') }</div>
                  <div className="support-box-link selectable">{ Config.whitelabel ? Config.wlConfig.support.chatApp.inviteUrl : 'https://komodoplatform.com/discord' }</div>
                </a>
              </div>
              <div className="support-box-wrapper">
                <a
                  target="_blank"
                  className="support-box"
                  href={ Config.whitelabel ? Config.wlConfig.support.gitLink.url : 'https://github.com/pbca26/agama-web' }>
                  <img
                    src="assets/images/support/github-icon.png"
                    alt="Github" />
                  <div className="support-box-title">Github</div>
                  <div className="support-box-link selectable">{ Config.whitelabel ? Config.wlConfig.support.gitLink.title : 'github.com/pbca26/agama-web' }</div>
                </a>
              </div>
            </div>
          </div>
          <div className="row margin-top-30">
            <div className="col-sm-12">
              <p>
                { translate('INDEX.FOR_GUIDES_AND_FAQ') }&nbsp;
                <a
                  className="selectable"
                  target="_blank"
                  href={ Config.whitelabel ? Config.wlConfig.support.ticketsLink.url : 'https://support.komodoplatform.com/support/home' }>{ Config.whitelabel ? Config.wlConfig.support.ticketsLink.url : 'https://support.komodoplatform.com/support/home' }</a>
              </p>
              <p>
                { translate('INDEX.TO_SEND_FEEDBACK') }&nbsp;
                <a
                  className="selectable"
                  target="_blank"
                  href={ Config.whitelabel ? Config.wlConfig.support.ticketsLink.urlNewTicket : 'https://support.komodoplatform.com/support/tickets/new' }>{ Config.whitelabel ? Config.wlConfig.support.ticketsLink.urlNewTicket : 'https://support.komodoplatform.com/support/tickets/new' }</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Support;