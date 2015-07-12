(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

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

module.exports = components;

function components(ripple) {
  if (!client) {
    return ripple;
  }log("creating");

  if (!customEls) document.body ? polyfill(ripple)() : document.addEventListener("DOMContentLoaded", polyfill(ripple));
  key("types.application/javascript.render", wrap(fn(ripple)))(ripple);
  key("types.application/data.render", wrap(data(ripple)))(ripple);
  ripple.draw = draw(ripple);
  ripple.render = render(ripple);
  ripple.on("change", raf(ripple));
  return ripple;
}

// public draw api
function draw(ripple) {
  return function (thing) {
    return this && this.nodeName ? invoke(ripple)(this) : this && this.node ? invoke(ripple)(this.node()) : !thing ? everything(ripple) : thing instanceof mutation ? invoke(ripple)(thing.target) : thing[0] instanceof mutation ? invoke(ripple)(thing[0].target) : thing.nodeName ? invoke(ripple)(thing) : thing.node ? invoke(ripple)(thing.node()) : thing.name ? resource(ripple)(thing.name) : is.str(thing) ? resource(ripple)(thing) : err("could not update", thing);
  };
}

// render all components
function everything(ripple) {
  var selector = values(ripple.resources).filter(header("content-type", "application/javascript")).map(key("name")).join(",");

  return all(selector).map(invoke(ripple));
}

// render all elements that depend on the resource
function resource(ripple) {
  return function (name) {
    var res = ripple.resources[name],
        type = header("content-type")(res);

    return (ripple.types[type].render || noop)(res);
  };
}

// batch renders on render frames
function raf(ripple) {
  return function (res) {
    return !header("pending")(res) && (res.headers.pending = requestAnimationFrame(function () {
      return (delete ripple.resources[res.name].headers.pending, ripple.draw(res));
    }));
  };
}

// main function to render a particular custom element with any data it needs
function invoke(ripple) {
  return function (el) {
    if (el.nodeName == "#document-fragment") return invoke(ripple)(el.host);
    if (el.nodeName == "#text") return invoke(ripple)(el.parentNode);
    if (!el.matches(isAttached)) return;
    if (attr(el, "inert") != null) return;
    return ripple.render.apply(this, arguments);
  };
}

function render(ripple) {
  return function (el) {
    var name = attr(el, "is") || el.tagName.toLowerCase(),
        deps = attr(el, "data"),
        fn = body(ripple)(name),
        data = resourcify(ripple)(deps);

    try {
      fn && (!deps || data) && fn.call(el.shadowRoot || el, data);
    } catch (e) {
      err(e, e.stack);
    }

    return el;
  };
}

// for non-Chrome..
function polyfill(ripple) {
  return function () {
    if (typeof MutationObserver == "undefined") return;
    if (document.body.muto) document.body.muto.disconnect();
    var muto = document.body.muto = new MutationObserver(drawCustomEls(ripple)),
        conf = { childList: true, subtree: true, attributes: true, attributeOldValue: true };

    muto.observe(document.body, conf);
  };
}

// polyfills
function drawCustomEls(ripple) {
  return function (mutations) {
    mutations.filter(key("attributeName")).filter(by("target", isCustomElement)).filter(onlyIfDifferent).map(ripple.draw);

    mutations.map(key("addedNodes")).map(to.arr).reduce(flatten).filter(isCustomElement).map(ripple.draw);
  };
}

function onlyIfDifferent(m) {
  return attr(m.target, m.attributeName) != m.oldValue;
}

function isCustomElement(d) {
  return ~d.nodeName.indexOf("-");
}

var resourcify = _interopRequire(require("utilise/resourcify"));

var includes = _interopRequire(require("utilise/includes"));

var flatten = _interopRequire(require("utilise/flatten"));

var prepend = _interopRequire(require("utilise/prepend"));

var header = _interopRequire(require("utilise/header"));

var client = _interopRequire(require("utilise/client"));

var values = _interopRequire(require("utilise/values"));

var attr = _interopRequire(require("utilise/attr"));

var body = _interopRequire(require("utilise/body"));

var noop = _interopRequire(require("utilise/noop"));

var wrap = _interopRequire(require("utilise/wrap"));

var key = _interopRequire(require("utilise/key"));

var err = _interopRequire(require("utilise/err"));

var all = _interopRequire(require("utilise/all"));

var log = _interopRequire(require("utilise/log"));

var is = _interopRequire(require("utilise/is"));

var by = _interopRequire(require("utilise/by"));

var lo = _interopRequire(require("utilise/lo"));

var to = _interopRequire(require("utilise/to"));

var data = _interopRequire(require("./types/data"));

var fn = _interopRequire(require("./types/fn"));

log = log("[ri/components]");
err = err("[ri/components]");
var mutation = client && window.MutationRecord || noop,
    customEls = client && !!document.registerElement,
    isAttached = customEls ? "html *, :host-context(html) *" : "html *";
client && (Element.prototype.matches = Element.prototype.matches || Element.prototype.msMatchesSelector);
},{"./types/data":2,"./types/fn":3,"utilise/all":4,"utilise/attr":5,"utilise/body":6,"utilise/by":7,"utilise/client":8,"utilise/err":9,"utilise/flatten":10,"utilise/header":11,"utilise/includes":12,"utilise/is":13,"utilise/key":14,"utilise/lo":15,"utilise/log":16,"utilise/noop":61,"utilise/prepend":62,"utilise/resourcify":63,"utilise/to":64,"utilise/values":65,"utilise/wrap":66}],2:[function(require,module,exports){
"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// render all elements that require the specified data
module.exports = data;

function data(ripple) {
  return function (res) {
    return all("[data~=\"" + res.name + "\"]:not([inert])").map(ripple.draw);
  };
}

var all = _interopRequire(require("utilise/all"));
},{"utilise/all":4}],3:[function(require,module,exports){
"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// register custom element prototype (render is automatic)
module.exports = fn;

function fn(ripple) {
  return function (res) {
    if (!customEls || registered(res)) return all("" + res.name + ":not([inert])\n                 ,[is=\"" + res.name + "\"]:not([inert])").map(ripple.draw);

    var proto = Object.create(HTMLElement.prototype),
        opts = { prototype: proto },
        extend = res.headers["extends"];

    extend && (opts["extends"] = extend);
    proto.attachedCallback = proto.attributeChangedCallback = ripple.draw;
    document.registerElement(res.name, opts);
  };
}

function registered(res) {
  var extend = header("extends")(res);

  return extend ? document.createElement(extend, res.name).attachedCallback : document.createElement(res.name).attachedCallback;
}

function node(ripple) {
  return function () {
    ripple.invoke(this);
  };
}

var header = _interopRequire(require("utilise/header"));

var client = _interopRequire(require("utilise/client"));

var all = _interopRequire(require("utilise/all"));

var customEls = client && !!document.registerElement;
},{"utilise/all":4,"utilise/client":8,"utilise/header":11}],4:[function(require,module,exports){
module.exports = require('all')
},{"all":17}],5:[function(require,module,exports){
module.exports = require('attr')
},{"attr":19}],6:[function(require,module,exports){
module.exports = require('body')
},{"body":21}],7:[function(require,module,exports){
module.exports = require('by')
},{"by":24}],8:[function(require,module,exports){
module.exports = require('client')
},{"client":28}],9:[function(require,module,exports){
module.exports = require('err')
},{"err":29}],10:[function(require,module,exports){
module.exports = require('flatten')
},{"flatten":32}],11:[function(require,module,exports){
module.exports = require('header')
},{"header":33}],12:[function(require,module,exports){
module.exports = require('includes')
},{"includes":35}],13:[function(require,module,exports){
module.exports = require('is')
},{"is":36}],14:[function(require,module,exports){
module.exports = require('key')
},{"key":37}],15:[function(require,module,exports){
module.exports = require('lo')
},{"lo":39}],16:[function(require,module,exports){
module.exports = require('log')
},{"log":40}],17:[function(require,module,exports){
var to = require('to')

module.exports = function all(selector, doc){
  var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
  return to.arr((doc || document).querySelectorAll(prefix+selector))
}
},{"to":18}],18:[function(require,module,exports){
module.exports = { 
  arr : toArray
}

function toArray(d){
  return Array.prototype.slice.call(d, 0)
}
},{}],19:[function(require,module,exports){
var is = require('is')

module.exports = function attr(d, name, value) {
  d = d.node ? d.node() : d
  if (is.str(d)) return function(el){ return attr(this.nodeName || this.node ? this : el, d) }

  return arguments.length > 2 && value === false ? d.removeAttribute(name)
       : arguments.length > 2                    ? d.setAttribute(name, value)
       : d.attributes.getNamedItem(name) 
      && d.attributes.getNamedItem(name).value
}

},{"is":20}],20:[function(require,module,exports){
module.exports = is
is.fn     = isFunction
is.str    = isString
is.num    = isNumber
is.obj    = isObject
is.lit    = isLiteral
is.bol    = isBoolean
is.truthy = isTruthy
is.falsy  = isFalsy
is.arr    = isArray
is.null   = isNull
is.def    = isDef
is.in     = isIn

function is(v){
  return function(d){
    return d == v
  }
}

function isFunction(d) {
  return typeof d == 'function'
}

function isBoolean(d) {
  return typeof d == 'boolean'
}

function isString(d) {
  return typeof d == 'string'
}

function isNumber(d) {
  return typeof d == 'number'
}

function isObject(d) {
  return typeof d == 'object'
}

function isLiteral(d) {
  return typeof d == 'object' 
      && !(d instanceof Array)
}

function isTruthy(d) {
  return !!d == true
}

function isFalsy(d) {
  return !!d == false
}

function isArray(d) {
  return d instanceof Array
}

function isNull(d) {
  return d === null
}

function isDef(d) {
  return typeof d !== 'undefined'
}

function isIn(set) {
  return function(d){
    return  set.indexOf 
         ? ~set.indexOf(d)
         :  d in set
  }
}
},{}],21:[function(require,module,exports){
var key = require('key')

module.exports = function body(ripple){
  return function(name){
    return key([name, 'body'])(ripple.resources)
  }
}
},{"key":22}],22:[function(require,module,exports){
var is = require('is')

module.exports = function key(k, v){ 
  var set  = arguments.length > 1
  is.arr(k) ? (k = k.join('.'))
            : (k = String(k ? k : ''))

  return function deep(o){
    var keys = k.split('.')
      , root = keys.shift()

    return !o ? undefined 
         : !k ? o
         : keys.length ? (set ? key(keys.join('.'), v)(o[root] ? o[root] : (o[root] = {}))
                              : key(keys.join('.'))(o[root]))
                       : (set ? ((o[k] = is.fn(v) ? v(o[k]) : v), o)
                              :  o[k])
  }
}
},{"is":23}],23:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],24:[function(require,module,exports){
var key = require('key')
  , is  = require('is')

module.exports = function by(k, v){
  return function(o){
    var d = key(k)(o)
    
    return d && v && d.toLowerCase && v.toLowerCase ? d.toLowerCase() === v.toLowerCase()
         : is.fn(v) ? v(d)
         : d == v
  }
}
},{"is":25,"key":26}],25:[function(require,module,exports){
module.exports = is
is.fn     = isFunction
is.str    = isString
is.num    = isNumber
is.obj    = isObject
is.poj    = isPlainOject
is.bol    = isBoolean
is.truthy = isTruthy
is.falsy  = isFalsy
is.arr    = isArray
is.null   = isNull
is.def    = isDef
is.in     = isIn

function is(v){
  return function(d){
    return d == v
  }
}

function isFunction(d) {
  return typeof d == 'function'
}

function isBoolean(d) {
  return typeof d == 'boolean'
}

function isString(d) {
  return typeof d == 'string'
}

function isNumber(d) {
  return typeof d == 'number'
}

function isObject(d) {
  return typeof d == 'object'
}

function isPlainOject(d) {
  return typeof d == 'object' 
      && !(d instanceof Array)
}

function isTruthy(d) {
  return !!d == true
}

function isFalsy(d) {
  return !!d == false
}

function isArray(d) {
  return d instanceof Array
}

function isNull(d) {
  return d === null
}

function isDef(d) {
  return typeof d !== 'undefined'
}

function isIn(set) {
  return function(d){
    return  set.indexOf 
         ? ~set.indexOf(d)
         :  d in set
  }
}
},{}],26:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"dup":22,"is":27}],27:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],28:[function(require,module,exports){
module.exports = typeof window != 'undefined'
},{}],29:[function(require,module,exports){
var owner = require('owner')
  , to = require('to')

module.exports = function err(prefix){
  return function(d){
    if (!owner.console || !console.error.apply) return d;
    var args = to.arr(arguments)
    args.unshift(prefix.red ? prefix.red : prefix)
    return console.error.apply(console, args), d
  }
}
},{"owner":30,"to":56}],30:[function(require,module,exports){
(function (global){
module.exports = require('client') ? /* istanbul ignore next */ window : global
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"client":31}],31:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28}],32:[function(require,module,exports){
module.exports = function flatten(p,v){ 
  return (p = p || []), p.concat(v) 
}

},{}],33:[function(require,module,exports){
var has = require('has')

module.exports = function header(header, value) {
  var getter = arguments.length == 1
  return function(d){ 
    return !d                      ? null
         : !has(d, 'headers')      ? null
         : !has(d.headers, header) ? null
         : getter                  ? d['headers'][header]
                                   : d['headers'][header] == value
  }
}
},{"has":34}],34:[function(require,module,exports){
module.exports = function has(o, k) {
  return k in o
}
},{}],35:[function(require,module,exports){
module.exports = function includes(pattern){
  return function(d){
    return ~d.indexOf(pattern)
  }
}
},{}],36:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],37:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"dup":22,"is":38}],38:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],39:[function(require,module,exports){
module.exports = function lo(d){
  return d.toLowerCase()
}

},{}],40:[function(require,module,exports){
var is = require('is')
  , to = require('to')
  , owner = require('owner')

module.exports = function log(prefix){
  return function(d){
    if (!owner.console || !console.log.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
    args.unshift(prefix.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}
},{"is":41,"owner":42,"to":44}],41:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],42:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"client":43,"dup":30}],43:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28}],44:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"dup":18}],45:[function(require,module,exports){
module.exports = function noop(){}
},{}],46:[function(require,module,exports){
module.exports = function prepend(v) {
  return function(d){
    return v+d
  }
}
},{}],47:[function(require,module,exports){
var is = require('is')
  , body = require('body')
  , first = require('first')
  , values = require('values')

module.exports = function resourcify(ripple){
  return function(d) {
    var o = {}
      , names = d ? d.split(' ') : []

    return   names.length == 0 ? undefined
         :   names.length == 1 ? body(ripple)(first(names))
         : ( names.map(function(d) { return o[d] = body(ripple)(d) })
           , values(o).some(is.falsy) ? undefined : o 
           )
  }
}
},{"body":48,"first":51,"is":52,"values":53}],48:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"dup":21,"key":49}],49:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"dup":22,"is":50}],50:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],51:[function(require,module,exports){
module.exports = function first(d){
  return d[0]
}
},{}],52:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],53:[function(require,module,exports){
var keys = require('keys')
  , base = require('base')

module.exports = function values(o) {
  return !o ? [] : keys(o).map(base(o))
}
},{"base":54,"keys":55}],54:[function(require,module,exports){
module.exports = function base(o) {
  return function (k) {
    return o[k]
  }
}
},{}],55:[function(require,module,exports){
module.exports = function keys(o) {
  return Object.keys(o || {})
}
},{}],56:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"dup":18}],57:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"base":58,"dup":53,"keys":59}],58:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"dup":54}],59:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],60:[function(require,module,exports){
module.exports = function wrap(d){
  return function(){
    return d
  }
}
},{}],61:[function(require,module,exports){
module.exports = require('noop')
},{"noop":45}],62:[function(require,module,exports){
module.exports = require('prepend')
},{"prepend":46}],63:[function(require,module,exports){
module.exports = require('resourcify')
},{"resourcify":47}],64:[function(require,module,exports){
module.exports = require('to')
},{"to":56}],65:[function(require,module,exports){
module.exports = require('values')
},{"values":57}],66:[function(require,module,exports){
module.exports = require('wrap')
},{"wrap":60}]},{},[1]);
