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

export default function components(ripple){
  if (!client) return ripple;
  log('creating')
  
  if (!customs) ready(polyfill(ripple))
  values(ripple.types).map(type => type.parse = proxy(type.parse || identity, clean(ripple)))
  key('types.application/javascript.render', wrap(fn(ripple)))(ripple)
  key('types.application/data.render', wrap(data(ripple)))(ripple)
  ripple.draw = draw(ripple)
  ripple.render = render(ripple)
  ripple.on('change', raf(ripple))
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
function everything(ripple){
  var selector = values(ripple.resources)
        .filter(header('content-type', 'application/javascript'))
        .map(key('name'))
        .join(',')

  return !selector ? [] 
       : all(selector)
           .map(invoke(ripple))
}

// render all elements that depend on the resource
function resource(ripple){
  return name => {
    var res = ripple.resources[name]
      , type = header('content-type')(res)

    return (ripple.types[type].render || noop)(res)
  }
}

// batch renders on render frames
function raf(ripple){
  return res => !header('pending')(res) 
      && (res.headers.pending = requestAnimationFrame(() => 
          (delete ripple.resources[res.name].headers.pending, ripple.draw(res))))
}

// main function to render a particular custom element with any data it needs
function invoke(ripple){ 
  return function(el) {
    if (el.nodeName == '#document-fragment') return invoke(ripple)(el.host)
    if (el.nodeName == '#text') return invoke(ripple)(el.parentNode)
    if (!el.matches(isAttached)) return;
    if (attr(el, 'inert') != null) return;
    if (!el.on) emitterify(el)
    if (!el.draw) el.draw = d => ripple.draw(el)
    return ripple.render(el)
  }
}

function render(ripple){
  return function(el){
    var name = attr(el, 'is') || el.tagName.toLowerCase()
      , deps = attr(el, 'data')
      , fn   = body(ripple)(name)
      , data = resourcify(ripple)(deps)
      
    try {
          fn
      && (!deps || data)
      && fn.call(el.shadowRoot || el, data)
    } catch (e) {
      err(e, e.stack)
    }

    return el
  }
}

// polyfill
function polyfill(ripple) {
  return function(){
    if (typeof MutationObserver == 'undefined') return
    if (document.body.muto) document.body.muto.disconnect()
    var muto = document.body.muto = new MutationObserver(drawCustomEls(ripple))
      , conf = { childList: true, subtree: true, attributes: true, attributeOldValue: true }

    muto.observe(document.body, conf)
  }
}

function drawCustomEls(ripple) {
  return function(mutations){
    drawNodes(ripple)(mutations)
    drawAttrs(ripple)(mutations)
  }
}

// clean local headers for transport
function clean(ripple){
  return function(res){
    delete res.headers.pending
    return res
  }
}

// helpers
function onlyIfDifferent(m) {
  return attr(m.target, m.attributeName) != m.oldValue
}

function ready(fn){
  return document.body ? fn() : document.addEventListener('DOMContentLoaded', fn)
}

function drawAttrs(ripple) {
  return mutations => mutations
    .filter(key('attributeName'))
    .filter(by('target.nodeName', includes('-')))
    .filter(onlyIfDifferent)
    .map(ripple.draw)
}

function drawNodes(ripple) {
  return mutations => mutations
    .map(key('addedNodes'))
    .map(to.arr)
    .reduce(flatten)
    .filter(by('nodeName', includes('-')))
    .map(ripple.draw)
}

import emitterify from 'utilise/emitterify'
import resourcify from 'utilise/resourcify'
import includes from 'utilise/includes'
import identity from 'utilise/identity'
import flatten from 'utilise/flatten'
import prepend from 'utilise/prepend'
import header from 'utilise/header'
import client from 'utilise/client'
import values from 'utilise/values'
import proxy from 'utilise/proxy'
import attr from 'utilise/attr'
import body from 'utilise/body'
import noop from 'utilise/noop'
import wrap from 'utilise/wrap'
import key from 'utilise/key'
import err from 'utilise/err'
import all from 'utilise/all'
import log from 'utilise/log'
import is from 'utilise/is'
import by from 'utilise/by'
import lo from 'utilise/lo'
import to from 'utilise/to'
import data from './types/data'
import fn from './types/fn'
log = log('[ri/components]')
err = err('[ri/components]')
var mutation = client && window.MutationRecord || noop
  , customs = client && !!document.registerElement
  , isAttached = customs
                  ? 'html *, :host-context(html) *'
                  : 'html *'
client && (Element.prototype.matches = Element.prototype.matches || Element.prototype.msMatchesSelector)