const sha256 = require('sha256');
const CoinKey = require('coinkey');
const bitcoin = require('bitcoinjs-lib');
const coinSelect = require('coinselect');
const crypto = require('crypto');

let networks = {};
networks.komodo = {
    messagePrefix: '\x19Komodo Signed Message:\n',
    bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
    },
    pubKeyHash: 0x3c,
    scriptHash: 0x55,
    wif: 0xbc,
    dustThreshold: 1000,
};

const seedToWif = (seed, network, iguana) => {
  const bytes = sha256(seed, { asBytes: true });

  if (iguana) {
    bytes[0] &= 248;
    bytes[31] &= 127;
    bytes[31] |= 64;
  }

  const toHexString = (byteArray) => {
    return Array.from(byteArray, (byte) => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  const hex = toHexString(bytes);

  const key = new CoinKey(new Buffer(hex, 'hex'), {
    private: network.wif,
    public: network.pubKeyHash,
  });

  key.compressed = true;

  // shepherd.log(`seedtowif priv key ${key.privateWif}`, true);
  // shepherd.log(`seedtowif pub key ${key.publicAddress}`, true);

  return {
    priv: key.privateWif,
    pub: key.publicAddress,
  };
}

var decodeFormat = function(tx) {
  var result = {
    txid: tx.getId(),
    version: tx.version,
    locktime: tx.locktime,
  };

  return result;
}

var decodeInput = function(tx) {
  var result = [];

  tx.ins.forEach(function(input, n) {
    var vin = {
      txid: input.hash.reverse().toString('hex'),
      n: input.index,
      script: bitcoin.script.toASM(input.script),
      sequence: input.sequence,
    };

    result.push(vin);
  });

  return result;
}

var decodeOutput = function(tx, network) {
  var format = function(out, n, network) {
    var vout = {
      satoshi: out.value,
      value: (1e-8 * out.value).toFixed(8),
      n: n,
      scriptPubKey: {
        asm: bitcoin.script.toASM(out.script),
        hex: out.script.toString('hex'),
        type: bitcoin.script.classifyOutput(out.script),
        addresses: [],
      },
    };

    switch(vout.scriptPubKey.type) {
      case 'pubkeyhash':
        vout.scriptPubKey.addresses.push(bitcoin.address.fromOutputScript(out.script, network));
        break;
      case 'pubkey':
        const pubKeyBuffer = new Buffer(vout.scriptPubKey.asm.split(' ')[0], 'hex');
        vout.scriptPubKey.addresses.push(bitcoin.ECPair.fromPublicKeyBuffer(pubKeyBuffer, network).getAddress());
        break;
      case 'scripthash':
        vout.scriptPubKey.addresses.push(bitcoin.address.fromOutputScript(out.script, network));
        break;
    }

    return vout;
  }

  var result = [];

  tx.outs.forEach(function(out, n) {
    result.push(format(out, n, network));
  });

  return result;
}

var TxDecoder = module.exports = function(rawtx, network) {
  try {
    const _tx = bitcoin.Transaction.fromHex(rawtx);

    return {
      tx: _tx,
      network: network,
      format: decodeFormat(_tx),
      inputs: decodeInput(_tx),
      outputs: decodeOutput(_tx, network),
    };
  } catch (e) {
    return false;
  }
}

TxDecoder.prototype.decode = function() {
  var result = {};
  var self = this;

  Object.keys(self.format).forEach(function(key) {
    result[key] = self.format[key];
  });

  result.outputs = self.outputs;

  return result;
}

module.exports = {
  seedToWif,
  networks,
  TxDecoder
}