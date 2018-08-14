import React from 'react';
import translate from '../../../translate/translate';
import PanelSection from './settings.panelBody';
import Panel from './settings.panel';

import ExportKeysPanel from './settings.exportKeysPanel';
import SPVServersPanel from './settings.spvServersPanel';

export const SettingsRender = function() {
  return (
    <div
      id="section-iguana-wallet-settings"
      className="padding-30">
      <div className="row">
        <div className="col-sm-12">
          <h4 className="font-size-14 text-uppercase">{ translate('INDEX.WALLET_SETTINGS') }</h4>
          <Panel
            uniqId={ 'SettingsAccordion' }
            singleOpen={ true }>
            <PanelSection
              title={ translate('INDEX.EXPORT_KEYS') }
              icon="icon fa-key"
              openByDefault={ true }>
              <ExportKeysPanel />
            </PanelSection>
            { this.props.Main.coins &&
              this.props.Main.coins.spv &&
              Object.keys(this.props.Main.coins.spv).length &&
              this.displaySPVServerListTab() &&
              <PanelSection
                title={ translate('SETTINGS.SPV_SERVERS') }
                icon="icon fa-server">
                <SPVServersPanel />
              </PanelSection>
            }
          </Panel>
        </div>
      </div>
    </div>
  );
};