import React from 'react';
import translate from '../../translate/translate';
import addCoinOptionsCrypto from '../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../addcoin/addcoinOptionsAC';
import Select from 'react-select';

const CoinSelectorsRender = function(item, coin, i) {
  console.warn(this.state);
  return (
    <div
      className="single"
      key={ `add-coin-${i}` }>
      <div className="col-sm-7">
        <div
          className="col-sm-12 form-group no-padding-left">
          <Select
            name="selectedCoin"
            value={ coin }
            onChange={ (event) => this.updateSelectedCoin(event, i) }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={ addCoinOptionsCrypto().concat(addCoinOptionsAC()) } />
        </div>
      </div>
      <div className="col-sm-2">
        <button
          type="button"
          className="btn btn-primary"
          disabled={ !this.state.coins[0].selectedCoin }
          onClick={ () => this.activateCoin(i) }>
          { translate('INDEX.ACTIVATE_COIN') }
        </button>
      </div>
    </div>
  )
};

export default CoinSelectorsRender;