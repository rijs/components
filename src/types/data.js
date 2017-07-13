// render all elements that require the specified data
import all from 'utilise/all'

export default ripple => res => all('[data~="'+res.name+'"]')
    .map(ripple.draw)