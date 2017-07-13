'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (ripple) {
    return function (res) {
        return (0, _all2.default)('[data~="' + res.name + '"]').map(ripple.draw);
    };
}; // render all elements that require the specified data