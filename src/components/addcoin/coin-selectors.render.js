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