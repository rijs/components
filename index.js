module.exports = function components(ripple){
  if (!client) return ripple
  log('creating')

  // if no render is defined on a component, load up definition
  Node.prototype.render = function(){
    const name = this.nodeName.toLowerCase()
    if (name.includes('-')) 
      this.fn$ = this.fn$ || ripple
        .subscribe(name)
        .map(component => define(name, component))
        // .until(new Promise(resolve => this.addEventListener('disconnected', () => {
        //   if (!this.isConnected) resolve()
        // })))
  }
  
  // this is for backwards compatibility
  Node.prototype.draw = function(){ 
    this.render() 
  }

  ready(() => Array.from(document.querySelectorAll('*'))
    .filter(d => d.nodeName.includes('-'))
    .map(node => node.render())
  )

  return ripple
}

const log = require('utilise/log')('[ri/components]')
    , client = require('utilise/client')
    , ready = require('utilise/ready')
    , define = require('@compone/define')