import all from 'utilise/all'

// register custom element prototype (render is automatic)
export default ripple => res => all(`${res.name}`)
  .map(node => { delete node.render })
  .map(ripple.draw)
