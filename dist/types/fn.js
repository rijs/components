'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fn;

var _includes = require('utilise/includes');

var _includes2 = _interopRequireDefault(_includes);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// register custom element prototype (render is automatic)
function fn(ripple) {
  return function (res) {
    if (!customs || !customEl(res) || registered(res)) return (0, _all2.default)(res.name + ':not([inert])\n                 ,[is="' + res.name + '"]:not([inert])').map(ripple.draw);

    var proto = Object.create(HTMLElement.prototype),
        opts = { prototype: proto };

    proto.attachedCallback = ripple.draw;
    document.registerElement(res.name, opts);
  };
}

var registered = function registered(res) {
  return document.createElement(res.name).attachedCallback;
};

var customs = _client2.default && !!document.registerElement,
    customEl = function customEl(d) {
  return (0, _includes2.default)('-')(d.name);
};