'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fn;

var _header = require('utilise/header');

var _header2 = _interopRequireDefault(_header);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// register custom element prototype (render is automatic)
function fn(ripple) {
  return function (res) {
    if (!customs || registered(res)) return (0, _all2.default)(res.name + ':not([inert])\n                 ,[is="' + res.name + '"]:not([inert])').map(ripple.draw);

    var proto = Object.create(HTMLElement.prototype),
        opts = { prototype: proto },
        extend = res.headers['extends'];

    extend && (opts.extends = extend);
    proto.attachedCallback = proto.attributeChangedCallback = ripple.draw;
    document.registerElement(res.name, opts);
  };
}

function registered(res) {
  var extend = (0, _header2.default)('extends')(res);

  return extend ? document.createElement(extend, res.name).attachedCallback : document.createElement(res.name).attachedCallback;
}

var customs = _client2.default && !!document.registerElement;