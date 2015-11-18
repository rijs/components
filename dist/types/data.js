'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = data;

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// render all elements that require the specified data
function data(ripple) {
  return function (res) {
    return (0, _all2.default)('[data~="' + res.name + '"]:not([inert])').map(ripple.draw);
  };
}