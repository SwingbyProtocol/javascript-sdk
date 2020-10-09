"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _big = _interopRequireDefault(require("big.js"));

var crypto = _interopRequireWildcard(require("../../crypto"));

var _ = require("..");

var _validateHelper = require("../../utils/validateHelper");

var _types = require("../../types");

/**
 * @module Token
 */
// import { TxTypes } from "../tx/"
var MAXTOTALSUPPLY = 9000000000000000000;

var validateNonZeroAmount = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(amountParam, symbol, fromAddress, httpClient) {
    var type,
        amount,
        _yield$httpClient$req,
        result,
        balance,
        _args = arguments;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            type = _args.length > 4 && _args[4] !== undefined ? _args[4] : "free";
            amount = new _big["default"](amountParam);

            if (!(amount.lte(0) || amount.gt(MAXTOTALSUPPLY))) {
              _context.next = 4;
              break;
            }

            throw new Error("invalid amount");

          case 4:
            _context.prev = 4;
            _context.next = 7;
            return httpClient.request("get", "".concat(_.api.getAccount, "/").concat(fromAddress));

          case 7:
            _yield$httpClient$req = _context.sent;
            result = _yield$httpClient$req.result;
            balance = result.balances.find(function (b) {
              return b.symbol.toUpperCase() === symbol.toUpperCase();
            });

            if (balance) {
              _context.next = 12;
              break;
            }

            throw new Error("the account doesn't have ".concat(symbol));

          case 12:
            if (!amount.gte(balance[type])) {
              _context.next = 14;
              break;
            }

            throw new Error("the account doesn't have enougth balance");

          case 14:
            _context.next = 19;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](4);
            //if get account failed. still broadcast
            console.log(_context.t0);

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[4, 16]]);
  }));

  return function validateNonZeroAmount(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var TokenManagement = /*#__PURE__*/function () {
  /**
   * @param {Object} bncClient
   */
  function TokenManagement(bncClient) {
    (0, _classCallCheck2["default"])(this, TokenManagement);
    (0, _defineProperty2["default"])(this, "_bncClient", void 0);

    if (!TokenManagement.instance) {
      this._bncClient = bncClient;
      TokenManagement.instance = this;
    }

    return TokenManagement.instance;
  }
  /**
   * create a new asset on Binance Chain
   * @param {String} - senderAddress
   * @param {String} - tokenName
   * @param {String} - symbol
   * @param {Number} - totalSupply
   * @param {Boolean} - mintable
   * @returns {Promise} resolves with response (success or fail)
   */


  (0, _createClass2["default"])(TokenManagement, [{
    key: "issue",
    value: function () {
      var _issue = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(senderAddress, tokenName, symbol) {
        var totalSupply,
            mintable,
            issueMsg,
            signIssueMsg,
            signedTx,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                totalSupply = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : 0;
                mintable = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : false;

                if (senderAddress) {
                  _context2.next = 4;
                  break;
                }

                throw new Error("sender address cannot be empty");

              case 4:
                if (!(tokenName.length > 32)) {
                  _context2.next = 6;
                  break;
                }

                throw new Error("token name is limited to 32 characters");

              case 6:
                if (/^[a-zA-z\d]{3,8}$/.test(symbol)) {
                  _context2.next = 8;
                  break;
                }

                throw new Error("symbol should be alphanumeric and length is limited to 3~8");

              case 8:
                if (!(totalSupply <= 0 || totalSupply > MAXTOTALSUPPLY)) {
                  _context2.next = 10;
                  break;
                }

                throw new Error("invalid supply amount");

              case 10:
                totalSupply = Number(new _big["default"](totalSupply).mul(Math.pow(10, 8)).toString());
                issueMsg = {
                  from: crypto.decodeAddress(senderAddress),
                  name: tokenName,
                  symbol: symbol,
                  total_supply: totalSupply,
                  mintable: mintable,
                  aminoPrefix: _types.AminoPrefix.IssueMsg
                };
                signIssueMsg = {
                  from: senderAddress,
                  name: tokenName,
                  symbol: symbol,
                  total_supply: totalSupply,
                  mintable: mintable
                };
                _context2.next = 15;
                return this._bncClient._prepareTransaction(issueMsg, signIssueMsg, senderAddress);

              case 15:
                signedTx = _context2.sent;
                return _context2.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function issue(_x5, _x6, _x7) {
        return _issue.apply(this, arguments);
      }

      return issue;
    }()
    /**
     * freeze some amount of token
     * @param {String} fromAddress
     * @param {String} symbol
     * @param {String} amount
     * @returns {Promise}  resolves with response (success or fail)
     */

  }, {
    key: "freeze",
    value: function () {
      var _freeze = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(fromAddress, symbol, amount) {
        var freezeMsg, freezeSignMsg, signedTx;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                (0, _validateHelper.validateSymbol)(symbol);
                validateNonZeroAmount(amount, symbol, fromAddress, this._bncClient._httpClient, "free");
                amount = +Number(new _big["default"](amount).mul(Math.pow(10, 8)).toString());
                freezeMsg = {
                  from: crypto.decodeAddress(fromAddress),
                  symbol: symbol,
                  amount: amount,
                  aminoPrefix: _types.AminoPrefix.FreezeMsg
                };
                freezeSignMsg = {
                  amount: amount,
                  from: fromAddress,
                  symbol: symbol
                };
                _context3.next = 7;
                return this._bncClient._prepareTransaction(freezeMsg, freezeSignMsg, fromAddress);

              case 7:
                signedTx = _context3.sent;
                return _context3.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function freeze(_x8, _x9, _x10) {
        return _freeze.apply(this, arguments);
      }

      return freeze;
    }()
    /**
     * unfreeze some amount of token
     * @param {String} fromAddress
     * @param {String} symbol
     * @param {String} amount
     * @returns {Promise}  resolves with response (success or fail)
     */

  }, {
    key: "unfreeze",
    value: function () {
      var _unfreeze = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(fromAddress, symbol, amount) {
        var unfreezeMsg, unfreezeSignMsg, signedTx;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                (0, _validateHelper.validateSymbol)(symbol);
                validateNonZeroAmount(amount, symbol, fromAddress, this._bncClient._httpClient, "frozen");
                amount = +Number(new _big["default"](amount).mul(Math.pow(10, 8)).toString());
                unfreezeMsg = {
                  from: crypto.decodeAddress(fromAddress),
                  symbol: symbol,
                  amount: amount,
                  aminoPrefix: _types.AminoPrefix.UnfreezeMsg
                };
                unfreezeSignMsg = {
                  amount: amount,
                  from: fromAddress,
                  symbol: symbol
                };
                _context4.next = 7;
                return this._bncClient._prepareTransaction(unfreezeMsg, unfreezeSignMsg, fromAddress);

              case 7:
                signedTx = _context4.sent;
                return _context4.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function unfreeze(_x11, _x12, _x13) {
        return _unfreeze.apply(this, arguments);
      }

      return unfreeze;
    }()
    /**
     * burn some amount of token
     * @param {String} fromAddress
     * @param {String} symbol
     * @param {Number} amount
     * @returns {Promise}  resolves with response (success or fail)
     */

  }, {
    key: "burn",
    value: function () {
      var _burn = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(fromAddress, symbol, amount) {
        var burnMsg, burnSignMsg, signedTx;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                (0, _validateHelper.validateSymbol)(symbol);
                validateNonZeroAmount(amount, symbol, fromAddress, this._bncClient._httpClient);
                amount = +Number(new _big["default"](amount).mul(Math.pow(10, 8)).toString());
                burnMsg = {
                  from: crypto.decodeAddress(fromAddress),
                  symbol: symbol,
                  amount: amount,
                  aminoPrefix: _types.AminoPrefix.BurnMsg
                };
                burnSignMsg = {
                  amount: amount,
                  from: fromAddress,
                  symbol: symbol
                };
                _context5.next = 7;
                return this._bncClient._prepareTransaction(burnMsg, burnSignMsg, fromAddress);

              case 7:
                signedTx = _context5.sent;
                return _context5.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function burn(_x14, _x15, _x16) {
        return _burn.apply(this, arguments);
      }

      return burn;
    }()
    /**
     * mint tokens for an existing token
     * @param {String} fromAddress
     * @param {String} symbol
     * @param {Number} amount
     * @returns {Promise}  resolves with response (success or fail)
     */

  }, {
    key: "mint",
    value: function () {
      var _mint = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(fromAddress, symbol, amount) {
        var mintMsg, mintSignMsg, signedTx;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                (0, _validateHelper.validateSymbol)(symbol);

                if (!(amount <= 0 || amount > MAXTOTALSUPPLY)) {
                  _context6.next = 3;
                  break;
                }

                throw new Error("invalid amount");

              case 3:
                amount = Number(new _big["default"](amount).mul(Math.pow(10, 8)).toString());
                mintMsg = {
                  from: crypto.decodeAddress(fromAddress),
                  symbol: symbol,
                  amount: amount,
                  aminoPrefix: _types.AminoPrefix.MintMsg
                };
                mintSignMsg = {
                  amount: amount,
                  from: fromAddress,
                  symbol: symbol
                };
                _context6.next = 8;
                return this._bncClient._prepareTransaction(mintMsg, mintSignMsg, fromAddress);

              case 8:
                signedTx = _context6.sent;
                return _context6.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function mint(_x17, _x18, _x19) {
        return _mint.apply(this, arguments);
      }

      return mint;
    }()
    /**
     * lock token for a while
     * @param {String} fromAddress
     * @param {String} description
     * @param {Array} amount
     * @param {Number} lockTime
     * @returns {Promise}  resolves with response (success or fail)
     */

  }, {
    key: "timeLock",
    value: function () {
      var _timeLock = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(fromAddress, description, amount, lockTime) {
        var timeLockMsg, signTimeLockMsg, signedTx;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                (0, _validateHelper.checkCoins)(amount);

                if (!(description.length > 128)) {
                  _context7.next = 3;
                  break;
                }

                throw new Error("description is too long");

              case 3:
                if (!(lockTime < 60 || lockTime > 253402300800)) {
                  _context7.next = 5;
                  break;
                }

                throw new Error("timeTime must be in [60, 253402300800]");

              case 5:
                timeLockMsg = {
                  from: crypto.decodeAddress(fromAddress),
                  description: description,
                  amount: amount,
                  lock_time: lockTime,
                  aminoPrefix: _types.AminoPrefix.TimeLockMsg
                };
                signTimeLockMsg = {
                  from: fromAddress,
                  description: description,
                  amount: amount,
                  lock_time: lockTime
                };
                _context7.next = 9;
                return this._bncClient._prepareTransaction(timeLockMsg, signTimeLockMsg, fromAddress);

              case 9:
                signedTx = _context7.sent;
                return _context7.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function timeLock(_x20, _x21, _x22, _x23) {
        return _timeLock.apply(this, arguments);
      }

      return timeLock;
    }()
    /**
     * lock more token or increase locked period
     * @param {String} fromAddress
     * @param {Number} id
     * @param {String} description
     * @param {Array} amount
     * @param {Number} lockTime
     * @returns {Promise}  resolves with response (success or fail)
     */

  }, {
    key: "timeRelock",
    value: function () {
      var _timeRelock = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(fromAddress, id, description, amount, lockTime) {
        var timeRelockMsg, signTimeRelockMsg, signedTx;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!(description.length > 128)) {
                  _context8.next = 2;
                  break;
                }

                throw new Error("description is too long");

              case 2:
                if (!(lockTime < 60 || lockTime > 253402300800)) {
                  _context8.next = 4;
                  break;
                }

                throw new Error("timeTime must be in [60, 253402300800]");

              case 4:
                timeRelockMsg = {
                  from: crypto.decodeAddress(fromAddress),
                  time_lock_id: id,
                  description: description,
                  amount: amount,
                  lock_time: lockTime,
                  aminoPrefix: _types.AminoPrefix.TimeRelockMsg
                };
                signTimeRelockMsg = {
                  from: fromAddress,
                  time_lock_id: id,
                  description: description,
                  amount: amount && amount.length ? amount : null,
                  lock_time: lockTime
                };
                _context8.next = 8;
                return this._bncClient._prepareTransaction(timeRelockMsg, signTimeRelockMsg, fromAddress);

              case 8:
                signedTx = _context8.sent;
                return _context8.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function timeRelock(_x24, _x25, _x26, _x27, _x28) {
        return _timeRelock.apply(this, arguments);
      }

      return timeRelock;
    }()
    /**
     * unlock locked tokens
     * @param {String} fromAddress
     * @param {Number} id
     * @returns {Promise}  resolves with response (success or fail)
     */

  }, {
    key: "timeUnlock",
    value: function () {
      var _timeUnlock = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(fromAddress, id) {
        var timeUnlockMsg, signTimeUnlockMsg, signedTx;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                timeUnlockMsg = {
                  from: crypto.decodeAddress(fromAddress),
                  time_lock_id: id,
                  aminoPrefix: _types.AminoPrefix.TimeUnlockMsg
                };
                signTimeUnlockMsg = {
                  from: fromAddress,
                  time_lock_id: id
                };
                _context9.next = 4;
                return this._bncClient._prepareTransaction(timeUnlockMsg, signTimeUnlockMsg, fromAddress);

              case 4:
                signedTx = _context9.sent;
                return _context9.abrupt("return", this._bncClient._broadcastDelegate(signedTx));

              case 6:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function timeUnlock(_x29, _x30) {
        return _timeUnlock.apply(this, arguments);
      }

      return timeUnlock;
    }()
  }]);
  return TokenManagement;
}();

(0, _defineProperty2["default"])(TokenManagement, "instance", void 0);
var _default = TokenManagement;
exports["default"] = _default;