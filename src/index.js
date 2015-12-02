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
  if (!client) return ripple
  log('creating')
  
  if (!customs) ready(polyfill(ripple))
  values(ripple.types).map(type => type.parse = proxy(type.parse || identity, clean(ripple)))
  key('types.application/javascript.render', wrap(fn(ripple)))(ripple)
  key('types.application/data.render', wrap(data(ripple)))(ripple)
  ripple.draw = draw(ripple)
  ripple.render = render(ripple)
  ripple.on('change', ripple.draw)
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
function batch(ripple){
  return el => !el.pending 
     && (el.pending = requestAnimationFrame(d => (delete el.pending, ripple.render(el))))
}

// main function to render a particular custom element with any data it needs
function invoke(ripple){ 
  return function(el) {
    if (el.nodeName == '#document-fragment') return invoke(ripple)(el.host)
    if (el.nodeName == '#text') return invoke(ripple)(el.parentNode)
    if (!el.matches(isAttached)) return
    if (attr(el, 'inert') != null) return
    if (!el.on) emitterify(el)
    if (!el.draw) el.draw = d => ripple.draw(el)
    return batch(ripple)(el), el
  }
}

function render(ripple){
  return function(el){
    var name = lo(el.tagName)
      , deps = attr(el, 'data')
      , fn   = body(ripple)(name)
      , data = bodies(ripple)(deps)

    if (!fn) return el
    if (deps && !data) return el
      
    try {
      fn.call(el.shadowRoot || el, defaults(el, data))
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
  return res => {
    delete res.headers.pending
    return res
  }
}

// helpers
function defaults(el, data) {
  el.state = el.state || {}
  overwrite(el.state)(data)
  overwrite(el.state)(el.__data__)
  return el.state
}

function overwrite(to) {
  return from => keys(from).map(copy(from, to))
}

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

function bodies(ripple){
  return deps => {
    var o = {}
      , names = deps ? deps.split(' ') : []

    names.map(d => o[d] = body(ripple)(d))

    return !names.length            ? undefined
         : values(o).some(is.falsy) ? undefined 
         : o
  }
}

import emitterify from 'utilise/emitterify'
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
import copy from 'utilise/copy'
import key from 'utilise/key'
import all from 'utilise/all'
import is from 'utilise/is'
import by from 'utilise/by'
import lo from 'utilise/lo'
import to from 'utilise/to'
import data from './types/data'
import fn from './types/fn'
var log = require('utilise/log')('[ri/components]')
  , err = require('utilise/err')('[ri/components]')
  , mutation = client && window.MutationRecord || noop
  , customs = client && !!document.registerElement
  , isAttached = customs
                  ? 'html *, :host-context(html) *'
                  : 'html *'
client && (Element.prototype.matches = Element.prototype.matches || Element.prototype.msMatchesSelector)