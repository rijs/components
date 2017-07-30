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

module.exports = function components(ripple){
  if (!client) return ripple
  log('creating')
  
  values(ripple.types).map(type => type.parse = proxy(type.parse, clean(ripple)))
  key('types.application/javascript.render', d => fn(ripple))(ripple)
  key('types.application/data.render', d => data(ripple))(ripple)
  ripple.draw = Node.prototype.draw = draw(ripple)
  ripple.render = render(ripple)
  ripple.on('change.draw', ripple.draw)
  time(0, ripple.draw)
  return ripple
}

// public draw api
function draw(ripple){
  return function(thing) { 
    return this && this.nodeName        ? invoke(ripple)(this)
         : this && this.node            ? invoke(ripple)(this.node())
         : !thing                       ? everything(ripple)
         : thing    instanceof mutation ? invoke(ripple)(thing.target)
         : thing[0] instanceof mutation ? invoke(ripple)(thing[0].target)
         : thing.nodeName               ? invoke(ripple)(thing)
         : thing.node                   ? invoke(ripple)(thing.node())
         : thing.name                   ? resource(ripple)(thing.name)
         : is.str(thing)                ? resource(ripple)(thing)
         : err('could not update', thing)
  }
}

// render all components
const everything = ripple => {
  const selector = values(ripple.resources)
    .filter(header('content-type', 'application/javascript'))
    .map(key('name'))
    .join(',')

  return !selector ? [] 
       : all(selector)
           .map(invoke(ripple))
}

// render all elements that depend on the resource
const resource = ripple => name => { 
  const res = ripple.resources[name]
      , type = header('content-type')(res)

  return (ripple.types[type].render || noop)(res)  
}

// batch renders on render frames
const batch = ripple => el => {
  if (!el.pending) {
    el.pending = []
    requestAnimationFrame(d => {
      el.changes = el.pending
      delete el.pending
      ripple.render(el)
    })    
  }

  if (ripple.change) 
    el.pending.push(ripple.change[1])
}

// main function to render a particular custom element with any data it needs
const invoke = ripple => el => { 
  if (!includes('-')(el.nodeName)) return
  if (el.nodeName == '#document-fragment') return invoke(ripple)(el.host)
  if (el.nodeName == '#text') return invoke(ripple)(el.parentNode)
  if (!el.matches(isAttached)) return
  if (attr(el, 'inert') != null) return
  return batch(ripple)(el), el
}

const render = ripple => el => {
  let root = el.shadowRoot || el
    , deps = attr(el, 'data')
    , data = bodies(ripple)(deps)
    , fn   = body(ripple)(lo(el.tagName))
    , isClass = fn && fn.prototype && fn.prototype.render

  if (!fn) return el
  if (deps && !data) return el
  if (isClass && !root.render) {
    Object.getOwnPropertyNames(fn.prototype)
      .map(method => root[method] = fn.prototype[method].bind(root))

    Promise
      .resolve((root.init || noop).call(root, root))
      .then(d => ripple.draw(root.initialised = root))
    return el
  }
  if (isClass && !root.initialised) return

  try {
    (root.render || fn).call(root, root, defaults(el, data))
  } catch (e) {
    err(e, e.stack)
  }

  return el
}

// clean local headers for transport
const clean = ripple =>  res => (delete res.headers.pending, res)

// helpers
const defaults = (el, data) => {
  el.state = el.state || {}
  overwrite(el.state)(data)
  overwrite(el.state)(el.__data__)
  el.__data__ = el.state
  return el.state
}

const bodies = ripple => deps => {
  var o = {}
    , names = deps ? deps.split(' ') : []

  names.map(d => o[d] = body(ripple)(d))

  return !names.length            ? undefined
       : values(o).some(is.falsy) ? undefined 
       : o
}

const body = ripple => name => ripple.resources[name] && ripple.resources[name].body

const index = el => Array.prototype.indexOf.call(key('parentNode.children')(el) || [], el)

const overwrite = require('utilise/overwrite')
    , includes = require('utilise/includes')
    , header = require('utilise/header')
    , client = require('utilise/client')
    , values = require('utilise/values')
    , proxy = require('utilise/proxy')
    , attr = require('utilise/attr')
    , noop = require('utilise/noop')
    , time = require('utilise/time')
    , key = require('utilise/key')
    , all = require('utilise/all')
    , is = require('utilise/is')
    , lo = require('utilise/lo')
    , data = require('./types/data')
    , fn = require('./types/fn')
    , log = require('utilise/log')('[ri/components]')
    , err = require('utilise/err')('[ri/components]')
    , mutation = client && window.MutationRecord || noop
    , customs = client && !!document.registerElement
    , isAttached = customs
                  ? 'html *, :host-context(html) *'
                  : 'html *'
client && (Element.prototype.matches = Element.prototype.matches || Element.prototype.msMatchesSelector)