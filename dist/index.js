'use strict';

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

module.exports = function components(ripple) {
  if (!client) return ripple;
  log('creating');

  values(ripple.types).map(function (type) {
    return type.parse = proxy(type.parse, clean(ripple));
  });
  key('types.application/javascript.render', function (d) {
    return fn(ripple);
  })(ripple);
  key('types.application/data.render', function (d) {
    return data(ripple);
  })(ripple);
  ripple.draw = Node.prototype.draw = draw(ripple);
  ripple.render = render(ripple);
  ripple.on('change.draw', ripple.draw);
  time(0, ripple.draw);
  return ripple;
};

// public draw api
function draw(ripple) {
  return function (thing) {
    return this && this.nodeName ? invoke(ripple)(this) : this && this.node ? invoke(ripple)(this.node()) : !thing ? everything(ripple) : thing instanceof mutation ? invoke(ripple)(thing.target) : thing[0] instanceof mutation ? invoke(ripple)(thing[0].target) : thing.nodeName ? invoke(ripple)(thing) : thing.node ? invoke(ripple)(thing.node()) : thing.name ? resource(ripple)(thing.name) : is.str(thing) ? resource(ripple)(thing) : err('could not update', thing);
  };
}

// render all components
var everything = function everything(ripple) {
  var selector = values(ripple.resources).filter(header('content-type', 'application/javascript')).map(key('name')).join(',');

  return !selector ? [] : all(selector).map(invoke(ripple));
};

// render all elements that depend on the resource
var resource = function resource(ripple) {
  return function (name) {
    var res = ripple.resources[name],
        type = header('content-type')(res);

    return (ripple.types[type].render || noop)(res);
  };
};

// batch renders on render frames
var batch = function batch(ripple) {
  return function (el) {
    if (!el.pending) {
      el.pending = [];
      requestAnimationFrame(function (d) {
        el.changes = el.pending;
        delete el.pending;
        ripple.render(el);
      });
    }

    if (ripple.change) el.pending.push(ripple.change[1]);
  };
};

// main function to render a particular custom element with any data it needs
var invoke = function invoke(ripple) {
  return function (el) {
    if (!includes('-')(el.nodeName)) return;
    if (el.nodeName == '#document-fragment') return invoke(ripple)(el.host);
    if (el.nodeName == '#text') return invoke(ripple)(el.parentNode);
    if (!el.matches(isAttached)) return;
    if (attr(el, 'inert') != null) return;
    return batch(ripple)(el), el;
  };
};

var render = function render(ripple) {
  return function (el) {
    var root = el.shadowRoot || el,
        deps = attr(el, 'data'),
        data = bodies(ripple)(deps),
        fn = body(ripple)(lo(el.tagName)),
        isClass = fn && fn.prototype && fn.prototype.render;

    if (!fn) return el;
    if (deps && !data) return el;
    if (isClass && !root.render) {
      Object.getOwnPropertyNames(fn.prototype).map(function (method) {
        return root[method] = fn.prototype[method].bind(root);
      });

      Promise.resolve((root.init || noop).call(root, root)).then(function (d) {
        return ripple.draw(root.initialised = root);
      });
      return el;
    }
    if (isClass && !root.initialised) return;

    try {
      (root.render || fn).call(root, root, defaults(el, data));
    } catch (e) {
      err(e, e.stack);
    }

    return el;
  };
};

// clean local headers for transport
var clean = function clean(ripple) {
  return function (res) {
    return delete res.headers.pending, res;
  };
};

// helpers
var defaults = function defaults(el, data) {
  el.state = el.state || {};
  overwrite(el.state)(data);
  overwrite(el.state)(el.__data__);
  el.__data__ = el.state;
  return el.state;
};

var bodies = function bodies(ripple) {
  return function (deps) {
    var o = {},
        names = deps ? deps.split(' ') : [];

    names.map(function (d) {
      return o[d] = body(ripple)(d);
    });

    return !names.length ? undefined : values(o).some(is.falsy) ? undefined : o;
  };
};

var body = function body(ripple) {
  return function (name) {
    return ripple.resources[name] && ripple.resources[name].body;
  };
};

var index = function index(el) {
  return Array.prototype.indexOf.call(key('parentNode.children')(el) || [], el);
};

var overwrite = require('utilise/overwrite'),
    includes = require('utilise/includes'),
    header = require('utilise/header'),
    client = require('utilise/client'),
    values = require('utilise/values'),
    proxy = require('utilise/proxy'),
    attr = require('utilise/attr'),
    noop = require('utilise/noop'),
    time = require('utilise/time'),
    key = require('utilise/key'),
    all = require('utilise/all'),
    is = require('utilise/is'),
    lo = require('utilise/lo'),
    data = require('./types/data'),
    fn = require('./types/fn'),
    log = require('utilise/log')('[ri/components]'),
    err = require('utilise/err')('[ri/components]'),
    mutation = client && window.MutationRecord || noop,
    customs = client && !!document.registerElement,
    isAttached = customs ? 'html *, :host-context(html) *' : 'html *';
client && (Element.prototype.matches = Element.prototype.matches || Element.prototype.msMatchesSelector);