# Ripple | Components
[![Coverage Status](https://coveralls.io/repos/rijs/components/badge.svg?branch=master&service=github)](https://coveralls.io/github/rijs/components?branch=master)
[![Build Status](https://travis-ci.org/rijs/components.svg)](https://travis-ci.org/rijs/components)


Renders Web Components. Given the following markup on your page:

```html
<component-name data="something">
```

With a `component-name` (function) and `something` (data) registered in Ripple, it will invoke `component-name.call(<el>, something)` whenever a change is detected in either of those resources. Internally, this is basically implemented as follows but in a more generic form:

```js
ripple('something').on('change', function(){

  all('[data=something]')
    .map(ripple.draw)
    
})
```

All instances of Custom Elements will be upgraded automatically. You can also manually invoke renders:

```js
ripple.draw(<el> | resource object | resource name)
```

If the first parameter is a DOM element, it will rerender that. If it is a resource (name or object), it will rerender anything on your page that depends on that resource. 
