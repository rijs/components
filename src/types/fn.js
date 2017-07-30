const all = require('utilise/all')

// register custom element prototype (render is automatic)
module.exports = ripple => res => all(`${res.name}`)
  .map(node => { delete node.render })
  .map(ripple.draw)
