var expect = require('chai').expect
  , values = require('utilise/values')
  , attr = require('utilise/attr')
  , time = require('utilise/time')
  , key = require('utilise/key')
  , components = require('./').default
  , core = require('rijs.core').default
  , data = require('rijs.data').default
  , fn = require('rijs.fn').default
  , container = document.createElement('div')
  , el1, el2, el3
  , ripple = components(fn(data(core())))
  
describe('Custom Elements', function(){

  before(function(){
    document.body.appendChild(container)
  })
  
  beforeEach(function(done){
    container.innerHTML = '<component-1></component-1>'
                        + '<component-2 data="array"></component-2>'
                        + '<component-3 data="array object"></component-3>'

    el1 = container.children[0]
    el2 = container.children[1]
    el3 = container.children[2]    
    time(30, done)
  })

  after(function(){
    document.body.removeChild(container)
  })

  it('should decorate core with draw api', function(){  
    expect(typeof ripple.draw).to.equal('function')
    expect(typeof ripple.render).to.equal('function')
  })

  it('should draw a single node', function(done){  
    var result1, result2

    ripple('array', [])
    ripple('component-1', function(){ result1 = this })
    ripple('component-2', function(){ result2 = this })

    expect(ripple.draw(el1)).to.equal(el1)
    expect(ripple.draw.call(el2)).to.equal(el2)

    time(20, function() {
      expect(result1).to.equal(el1)
      expect(result2).to.equal(el2)
      done()
    })
  })

  it('should draw a d3 node', function(done){  
    var fn1 = function(){ return el1 }
      , fn2 = function(){ return el2 }
      , d31 = { node: fn1 }
      , d32 = { node: fn2 }
      , result1, result2

    ripple('array')
    ripple('component-1', function(){ result1 = this })
    ripple('component-2', function(){ result2 = this })

    expect(ripple.draw(d31)).to.equal(el1)
    expect(ripple.draw.call(d32)).to.equal(el2)

    time(20, function() {
      expect(result1).to.equal(el1)
      expect(result2).to.equal(el2)
      done()
    })
  })

  it('should draw a resource with single datum', function(done){
    var result

    ripple('array', [1, 2, 3])
    ripple('component-2', function(d){ result = d })

    ripple.draw(el2)

    time(20, function(){
      expect(result).to.eql({ array: [1, 2, 3] })
      done()
    })
  })

  it('should draw a resource with multiple data', function(done){
    var result

    ripple('array', [1, 2, 3])
    ripple('object', { foo: 'bar' })
    ripple('component-3', function(d){ result = d })

    ripple.draw(el3)

    time(20, function(){
      expect(result).to.eql({ array: [1, 2, 3], object: { foo: 'bar' }})
      done()
    })
  })

  it('should draw a resource with d3 datum', function(done){
    var result

    ripple('component-1', function(d){ result = d })

    el1.__data__ = { foo: 'bar' }
    ripple.draw(el1)

    time(20, function(){
      expect(result).to.eql({ foo: 'bar' })
      done()
    })
  })

  it('should draw a resource with local state', function(done){
    var result

    ripple('component-1', function(d){ result = d })

    el1.state = { focused: true }
    ripple.draw(el1)

    time(20, function(){
      expect(result).to.eql({ focused: true })
      done()
    })
  })


  it('should draw a resource with combined data', function(done){
    var result

    el2.__data__ = { foo: 'bar' }
    el2.state = { focused: true }
    ripple('array', [1, 2, 3])
    ripple('component-2', function(d){ result = d })

    ripple.draw(el2)

    time(20, function(){
      expect(result).to.eql({ focused: true, foo: 'bar', array: [1, 2, 3] })
      expect(el2.state == result).to.be.ok
      done()
    })
  })

  it('should draw a resource by name (data)', function(done){
    var result2, result3

    ripple('array', [1, 2, 3])
    ripple('object', { foo: 'bar' })
    ripple('component-2', function(d){ result2 = this })
    ripple('component-3', function(d){ result3 = this })

    ripple.draw('array')
    ripple.draw('object')

    time(20, function() {
      expect(result2).to.be.ok
      expect(result3).to.be.ok
      done()
    })
  })

  it('should draw a resource by name (js)', function(done){
    var result
    ripple('component-1', function(d){ result = this })
    ripple.draw('component-1')

    time(20, function() {
      expect(result).to.be.ok
      done()
    })
  })

  it('should redraw element via MutationObserver', function(done){  
    if (typeof MutationObserver == 'undefined') return done()
    time(50 , function(){ el1.innerHTML = 'foo' })
    time(100, function(){ expect(result).to.be.ok })
    time(150, done)

    var muto = new MutationObserver(ripple.draw)
      , conf = { characterData: true, subtree: true, childList: true }
      , result

    ripple('component-1', function(){ result = this })
    muto.observe(el1, conf)
  })

  it('should draw everything', function(done){  
    var result1, result2, result3

    ripple('array')
    ripple('object')
    ripple('component-1', function(){ result1 = this })
    ripple('component-2', function(){ result2 = this })
    ripple('component-3', function(){ result3 = this })

    expect(ripple.draw()).to.eql([el1, el2, el3])

    time(20, function() {
      expect(result1).to.equal(el1)
      expect(result2).to.equal(el2)
      expect(result3).to.equal(el3)
      done()
    })
  })

  it('should not draw headless fragments', function(done){  
    container.innerHTML = ''
    var frag = document.createElement('component-1')
      , result
                
    ripple('component-1', function(){ result = this })
    result = null
    ripple.draw(frag)

    time(20, function() {
      expect(result).to.not.be.ok
      container.appendChild(frag)
      ripple.draw(frag)

      time(20, function() {
        expect(result).to.be.ok
        done()
      })
    })
  })

  it('should not draw inert elements', function(done){  
    var result

    attr(el1, 'inert', '')
    ripple('component-1', function(){ result = this })
    
    ripple.draw(el1)
    time(20, function(){ 
      expect(result).to.not.be.ok 

      attr(el1, 'inert', false)
      ripple.draw(el1)

      time(20, function() {
        expect(result).to.be.ok
        done()
      })
    })

  })

  it('should implicitly draw when all pieces available', function(done){  
    var result1, result2

    ripple('array')
    ripple('component-1', function(){ result1 = this })
    ripple('component-2', function(){ result2 = this })
    
    time(40, function(){
      expect(result1).to.be.ok
      expect(result2).to.be.ok
      done()
    })
  })

  it('should batch draws', function(done){  
    var count = 0

    ripple('component-2', function(){ count++ })
    ripple('array').push(1)
    ripple('array').push(2)
    ripple('array').push(3)
    ripple('array').push(4)
    ripple('array').push(5)
    
    time(40, function(){
      expect(count).to.equal(1)
      expect(ripple('array')).to.eql([1,2,3,1,2,3,4,5])
      done()
    })
  })

  it('should redraw on attribute changes', function(done){
    ripple('component-1', function(){ this.innerHTML = attr(this, 'foo') })

    time(20, function(){
      attr(el1, 'foo', 'bar')
    })

    time(40, function(){
      expect(el1.innerHTML).to.equal('bar')
      done()
    })
  })

  it('should draw newly attached elements', function(done){
    var count = 0

    ripple('component-1', function(){ count++ })
    expect(count).to.equal(0)

    time(40, function(){
      expect(count).to.equal(1)
      container.appendChild(document.createElement('component-1'))
    })

    time(80, function(){
      expect(count).to.equal(2)
      done()
    })
    
  })

  it('should not fail if no elements via force redraw', function(){
    var original = ripple.resources
    ripple.resources = {}
    expect(ripple.draw()).to.be.eql([])
    ripple.resources = original
  })

  it('should emitterify custom elements by default', function(){
    expect(el1.on).to.be.ok
  })

  it('should save draw shortcut once', function(done){  
    var count = 0
      , fn1
      , fn2

    fn1 = el.draw

    ripple('component-1', function(){ count++ })
    el1.draw()
    
    time(40, function() {
      el1.draw()
      time(80, function() {
        fn2 = el.draw
        expect(fn1).to.be.equal(fn2)
        expect(count).to.equal(2)
        done()
      })
    })
  })

  it('should not attempt to register non-custom elements', function(done){  
    var called
      , original = document.registerElement

    document.registerElement = function(){ called = true }

    ripple('function', function(){ })

    time(40, function(){
      expect(called).to.not.be.ok
      document.registerElement = original
      done()
    })

  })

})