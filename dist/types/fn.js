'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// register custom element prototype (render is automatic)
exports.default = function (ripple) {
  return function (res) {
    return (0, _all2.default)('' + res.name).map(function (node) {
      delete node.render;
    }).map(ripple.draw);
  };
};