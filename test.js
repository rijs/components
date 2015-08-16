var expect = require('chai').expect
  , values = require('utilise/values')
  , attr = require('utilise/attr')
  , key = require('utilise/key')
  , components = require('./')
  , core = require('rijs.core')
  , data = require('rijs.data')
  , fn = require('rijs.fn')
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
    
    setTimeout(done, 30)
  })

  after(function(){
    document.body.removeChild(container)
  })

  it('should decorate core with draw api', function(){  
    expect(typeof ripple.draw).to.equal('function')
  })

  it('should draw a single node', function(){  
    var result1, result2

    ripple('array', [])
    ripple('component-1', function(){ result1 = this })
    ripple('component-2', function(){ result2 = this })

    expect(ripple.draw(el1)).to.equal(el1)
    expect(ripple.draw.call(el2)).to.equal(el2)
    expect(result1).to.equal(el1)
    expect(result2).to.equal(el2)
  })

  it('should draw a d3 node', function(){  
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
    expect(result1).to.equal(el1)
    expect(result2).to.equal(el2)
  })

  it('should draw a resource with single datum', function(){
    var result

    ripple('array', [1, 2, 3])
    ripple('component-2', function(d){ result = d })

    ripple.draw(el2)
    expect(result).to.eql([1, 2, 3])
  })

  it('should draw a resource with multiple data', function(){
    var result

    ripple('array', [1, 2, 3])
    ripple('object', { foo: 'bar' })
    ripple('component-3', function(d){ result = d })

    ripple.draw(el3)
    expect(result).to.eql({ array: [1, 2, 3], object: { foo: 'bar' }})
  })

  it('should draw a resource by name (data)', function(){
    var result2, result3

    ripple('array', [1, 2, 3])
    ripple('object', { foo: 'bar' })
    ripple('component-2', function(d){ result2 = this })
    ripple('component-3', function(d){ result3 = this })

    ripple.draw('array')
    expect(result2).to.be.ok

    ripple.draw('object')
    expect(result3).to.be.ok
  })

  it('should draw a resource by name (js)', function(){
    var result

    ripple('component-1', function(d){ result = this })

    ripple.draw('component-1')
    expect(result).to.be.ok
  })

  it('should redraw element via MutationObserver', function(done){  
    if (typeof MutationObserver == 'undefined') return done()
    setTimeout(function(){ el1.innerHTML = 'foo' }, 50)
    setTimeout(function(){ expect(result).to.be.ok }, 100)
    setTimeout(done, 150)

    var muto = new MutationObserver(ripple.draw)
      , conf = { characterData: true, subtree: true, childList: true }
      , result

    ripple('component-1', function(){ result = this })
    muto.observe(el1, conf)
  })

  it('should draw everything', function(){  
    var result1, result2, result3

    ripple('array')
    ripple('object')
    ripple('component-1', function(){ result1 = this })
    ripple('component-2', function(){ result2 = this })
    ripple('component-3', function(){ result3 = this })

    expect(ripple.draw()).to.eql([el1, el2, el3])
    expect(result1).to.equal(el1)
    expect(result2).to.equal(el2)
    expect(result3).to.equal(el3)
  })

  it('should not draw headless fragments', function(){  
    var frag = document.createElement('component-1')
      , result
                
    ripple('component-1', function(){ result = this })
    result = null
    ripple.draw(frag)
    expect(result).to.not.be.ok

    container.appendChild(frag)
    ripple.draw(frag)
    expect(result).to.be.ok
  })

  it('should not draw inert elements', function(){  
    var result

    ripple('component-1', function(){ result = this })
    result = null

    attr(el1, 'inert', '')
    ripple.draw(el1)
    expect(result).to.not.be.ok

    attr(el1, 'inert', false)
    ripple.draw(el1)
    expect(result).to.be.ok
  })

  it('should implicitly draw when all pieces available', function(done){  
    var result1, result2

    ripple('array')
    ripple('component-1', function(){ result1 = this })
    ripple('component-2', function(){ result2 = this })
    
    setTimeout(function(){
      expect(result1).to.be.ok
      expect(result2).to.be.ok
      done()
    }, 50)
  })

  it('should batch draws', function(done){  
    var count = 0

    ripple('component-2', function(){ count++ })
    ripple('array').push(1)
    ripple('array').push(2)
    ripple('array').push(3)
    ripple('array').push(4)
    ripple('array').push(5)
    
    setTimeout(function(){
      expect(count).to.equal(1)
      expect(ripple('array')).to.eql([1,2,3,1,2,3,4,5])
      done()
    }, 50)
  })

  it('should redraw on attribute changes', function(done){
    ripple('component-1', function(){ this.innerHTML = attr(this, 'foo') })

    setTimeout(function(){
      attr(el1, 'foo', 'bar')
    }, 50)
    setTimeout(function(){
      expect(el1.innerHTML).to.equal('bar')
      done()
    }, 100)
  })

  it('should draw newly attached elements', function(done){
    var count = 0

    ripple('component-1', function(){ count++ })
    expect(count).to.equal(0)

    setTimeout(function(){
      expect(count).to.equal(1)
      container.appendChild(document.createElement('component-1'))
    }, 50)
    setTimeout(function(){
      expect(count).to.equal(2)
      done()
    }, 100)
    
  })

  it('should not fail if no elements via force redraw', function(){
    var original = ripple.resources
    ripple.resources = {}
    expect(ripple.draw()).to.be.eql([])
    ripple.resources = original
  })

})