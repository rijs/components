// render all elements that require the specified data
export default function data(ripple) {
  return res => {
    return all('[data~="'+res.name+'"]:not([inert])')
      .map(ripple.draw)
  }
}

import all from 'utilise/all'