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
        className={
          (this.hasMoreThanOneCoin() ? '' : 'padding-left-15 ' ) +
          (this.hasMoreThanOneCoin() ? 'col-sm-10' : 'col-sm-8')
        }>
        <div
          className={
            (this.hasMoreThanOneCoin() ? '' : 'padding-left-15 ' ) +
            (this.hasMoreThanOneCoin() && (item.mode === '-1' || item.mode === -1) ? 'col-sm-6 form-group' : 'form-group')
          }>
          <Select
            name="selectedCoin"
            value={ coin }
            onChange={ (event) => this.updateSelectedCoin(event, i) }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={ addCoinOptionsCrypto().concat(addCoinOptionsAC()) } />
        </div>
      </div>
      { this.hasMoreThanOneCoin() &&
        <div className="col-sm-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={ () => this.activateCoin(i) }
            disabled={ item.mode === -2 }>
            { translate('INDEX.ACTIVATE_COIN') }
          </button>
        </div>
      }
      { this.hasMoreThanOneCoin() &&
        i !== 0 &&
        <div className="col-sm-1">
          <button
            type="button"
            className="btn btn-primary"
            onClick={ () => this.removeCoin(i) }>
            <i className="fa fa-trash-o"></i>
          </button>
        </div>
      }
    </div>
  )
};

export default CoinSelectorsRender;