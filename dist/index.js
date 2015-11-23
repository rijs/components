'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = components;

var _emitterify = require('utilise/emitterify');

var _emitterify2 = _interopRequireDefault(_emitterify);

var _resourcify = require('utilise/resourcify');

var _resourcify2 = _interopRequireDefault(_resourcify);

var _includes = require('utilise/includes');

var _includes2 = _interopRequireDefault(_includes);

var _identity = require('utilise/identity');

var _identity2 = _interopRequireDefault(_identity);

var _flatten = require('utilise/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _prepend = require('utilise/prepend');

var _prepend2 = _interopRequireDefault(_prepend);

var _header = require('utilise/header');

var _header2 = _interopRequireDefault(_header);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _values = require('utilise/values');

var _values2 = _interopRequireDefault(_values);

var _proxy = require('utilise/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _attr = require('utilise/attr');

var _attr2 = _interopRequireDefault(_attr);

var _body = require('utilise/body');

var _body2 = _interopRequireDefault(_body);

var _noop = require('utilise/noop');

var _noop2 = _interopRequireDefault(_noop);

var _wrap = require('utilise/wrap');

var _wrap2 = _interopRequireDefault(_wrap);

var _key = require('utilise/key');

var _key2 = _interopRequireDefault(_key);

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

var _is = require('utilise/is');

var _is2 = _interopRequireDefault(_is);

var _by = require('utilise/by');

var _by2 = _interopRequireDefault(_by);

var _lo = require('utilise/lo');

var _lo2 = _interopRequireDefault(_lo);

var _to = require('utilise/to');

var _to2 = _interopRequireDefault(_to);

var _data = require('./types/data');

var _data2 = _interopRequireDefault(_data);

var _fn = require('./types/fn');

var _fn2 = _interopRequireDefault(_fn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// API: Renders specific nodes, resources or everything
// -------------------------------------------
// ripple.draw()                 - redraw all components on page
// ripple.draw(element)          - redraw specific element
// ripple.draw.call(element)     - redraw specific element
// ripple.draw.call(selection)   - redraw D3 selection
// ripple.draw('name')           - redraw elements that depend on resource
// ripple.draw({ ... })          - redraw elements that depend on resource
// MutationObserver(ripple.draw) - redraws element being observed

function components(ripple) {
  if (!_client2.default) return ripple;
  log('creating');

  if (!customs) ready(polyfill(ripple));
  (0, _values2.default)(ripple.types).map(function (type) {
    return type.parse = (0, _proxy2.default)(type.parse || _identity2.default, clean(ripple));
  });
  (0, _key2.default)('types.application/javascript.render', (0, _wrap2.default)((0, _fn2.default)(ripple)))(ripple);
  (0, _key2.default)('types.application/data.render', (0, _wrap2.default)((0, _data2.default)(ripple)))(ripple);
  ripple.draw = draw(ripple);
  ripple.render = render(ripple);
  ripple.on('change', raf(ripple));
  return ripple;
}

// public draw api
function draw(ripple) {
  return function (thing) {
    return this && this.nodeName ? invoke(ripple)(this) : this && this.node ? invoke(ripple)(this.node()) : !thing ? everything(ripple) : thing instanceof mutation ? invoke(ripple)(thing.target) : thing[0] instanceof mutation ? invoke(ripple)(thing[0].target) : thing.nodeName ? invoke(ripple)(thing) : thing.node ? invoke(ripple)(thing.node()) : thing.name ? resource(ripple)(thing.name) : _is2.default.str(thing) ? resource(ripple)(thing) : err('could not update', thing);
  };
}

// render all components
function everything(ripple) {
  var selector = (0, _values2.default)(ripple.resources).filter((0, _header2.default)('content-type', 'application/javascript')).map((0, _key2.default)('name')).join(',');

  return !selector ? [] : (0, _all2.default)(selector).map(invoke(ripple));
}

// render all elements that depend on the resource
function resource(ripple) {
  return function (name) {
    var res = ripple.resources[name],
        type = (0, _header2.default)('content-type')(res);

    return (ripple.types[type].render || _noop2.default)(res); // TODO identity
  };
}

// batch renders on render frames
function raf(ripple) {
  return function (res) {
    return !(0, _header2.default)('pending')(res) && (res.headers.pending = requestAnimationFrame(function (d) {
      return delete ripple.resources[res.name].headers.pending, ripple.draw(res);
    }));
  };
}

// batch renders on render frames
function batch(ripple) {
  return function (el) {
    return !el.pending && (el.pending = requestAnimationFrame(function (d) {
      return delete el.pending, ripple.render(el);
    }));
  };
}

// main function to render a particular custom element with any data it needs
function invoke(ripple) {
  return function (el) {
    if (el.nodeName == '#document-fragment') return invoke(ripple)(el.host);
    if (el.nodeName == '#text') return invoke(ripple)(el.parentNode);
    if (!el.matches(isAttached)) return;
    if ((0, _attr2.default)(el, 'inert') != null) return;
    if (!el.on) (0, _emitterify2.default)(el);
    if (!el.draw) el.draw = function (d) {
      return ripple.draw(el);
    };
    return batch(ripple)(el), el;
  };
}

function render(ripple) {
  return function (el) {
    var name = (0, _attr2.default)(el, 'is') || el.tagName.toLowerCase(),
        deps = (0, _attr2.default)(el, 'data'),
        fn = (0, _body2.default)(ripple)(name),
        data = (0, _resourcify2.default)(ripple)(deps);

    try {
      fn && (!deps || data) && fn.call(el.shadowRoot || el, data);
    } catch (e) {
      err(e, e.stack);
    }

    return el;
  };
}

// polyfill
function polyfill(ripple) {
  return function () {
    if (typeof MutationObserver == 'undefined') return;
    if (document.body.muto) document.body.muto.disconnect();
    var muto = document.body.muto = new MutationObserver(drawCustomEls(ripple)),
        conf = { childList: true, subtree: true, attributes: true, attributeOldValue: true };

    muto.observe(document.body, conf);
  };
}

function drawCustomEls(ripple) {
  return function (mutations) {
    drawNodes(ripple)(mutations);
    drawAttrs(ripple)(mutations);
  };
}

// clean local headers for transport
function clean(ripple) {
  return function (res) {
    delete res.headers.pending;
    return res;
  };
}

// helpers
function onlyIfDifferent(m) {
  return (0, _attr2.default)(m.target, m.attributeName) != m.oldValue;
}

function ready(fn) {
  return document.body ? fn() : document.addEventListener('DOMContentLoaded', fn);
}

function drawAttrs(ripple) {
  return function (mutations) {
    return mutations.filter((0, _key2.default)('attributeName')).filter((0, _by2.default)('target.nodeName', (0, _includes2.default)('-'))).filter(onlyIfDifferent).map(ripple.draw);
  };
}

function drawNodes(ripple) {
  return function (mutations) {
    return mutations.map((0, _key2.default)('addedNodes')).map(_to2.default.arr).reduce(_flatten2.default).filter((0, _by2.default)('nodeName', (0, _includes2.default)('-'))).map(ripple.draw);
  };
}

var log = require('utilise/log')('[ri/components]'),
    err = require('utilise/err')('[ri/components]'),
    mutation = _client2.default && window.MutationRecord || _noop2.default,
    customs = _client2.default && !!document.registerElement,
    isAttached = customs ? 'html *, :host-context(html) *' : 'html *';
_client2.default && (Element.prototype.matches = Element.prototype.matches || Element.prototype.msMatchesSelector);