import React from 'react';
import translate from '../../translate/translate';
import addCoinOptionsCrypto from '../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../addcoin/addcoinOptionsAC';
import Select from 'react-select';

const CoinSelectorsRender = function(item, coin, i) {
  return (
    <div
      className={ this.hasMoreThanOneCoin() ? 'multi' : 'single' }
      key={ `add-coin-${i}` }>
      <div
        className={ this.hasMoreThanOneCoin() ? 'col-sm-10' : 'col-sm-8' }
        style={{ paddingLeft: !this.hasMoreThanOneCoin() ? '0' : '15px' }}>
        <div
          className={ this.hasMoreThanOneCoin() && (item.mode === '-1' || item.mode === -1) ? 'col-sm-6 form-group' : 'form-group' }
          style={{ paddingLeft: this.hasMoreThanOneCoin() ? '0' : '15px' }}>
          <Select
            name="selectedCoin"
            value={ coin }
            onChange={ (event) => this.updateSelectedCoin(event, i) }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={ addCoinOptionsCrypto().concat(addCoinOptionsAC()) } />
        </div>
      </div>
      <div className={ this.hasMoreThanOneCoin() ? 'hide' : 'col-sm-4' }>
        <button
          type="button"
          className="btn btn-primary"
          onClick={ () => this.activateCoin(i) }
          disabled={ item.mode === -2 }>
          { translate('INDEX.ACTIVATE_COIN') }
        </button>
      </div>
      <div className="col-sm-11 text-center add-coin-modes">
        <div className="form-group col-lg-4 col-md-4 col-sm-6 col-xs-6 style-addcoin-lbl-mdl-login">
          <input
            type="radio"
            className="to-labelauty labelauty"
            name={ `mode-${i}` }
            id={ `addcoin_mdl_basilisk_mode_login-${i}` }
            disabled={ item.spvMode.disabled }
            checked={ item.spvMode.checked } />
          <label
            htmlFor={ `addcoin_mdl_basilisk_mode_login-${i}` }
            onClick={ () => this.updateSelectedMode('0', i) }
            style={{ pointerEvents: item.spvMode.disabled ? 'none' : 'all' }}>
            <span
              className="labelauty-unchecked-image"
              style={{ display: item.spvMode.checked ? 'none' : 'inline-block' }}></span>
            <span
              className="labelauty-unchecked"
              style={{ display: item.spvMode.checked ? 'none' : 'inline-block' }}>
                { translate('INDEX.SPV_MODE') }
            </span>
            <span
              className="labelauty-checked-image"
              style={{ display: item.spvMode.checked ? 'inline-block' : 'none' }}></span>
            <span
              className="labelauty-checked"
              style={{ display: item.spvMode.checked ? 'inline-block' : 'none' }}>
                { translate('INDEX.SPV_MODE') }
            </span>
          </label>
        </div>
      </div>
      <div className={ this.hasMoreThanOneCoin() && i !== 0 ? 'col-sm-1' : 'hide' }>
        <button
          type="button"
          className="btn btn-primary"
          onClick={ () => this.removeCoin(i) }>
            <i className="fa fa-trash-o"></i>
        </button>
      </div>
    </div>
  )
};

export default CoinSelectorsRender;