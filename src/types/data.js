// render all elements that require the specified data
const all = require('utilise/all')

module.exports = ripple => res => all('[data~="'+res.name+'"]')
    .map(ripple.draw)