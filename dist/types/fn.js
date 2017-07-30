'use strict';

var all = require('utilise/all');

// register custom element prototype (render is automatic)
module.exports = function (ripple) {
  return function (res) {
    return all('' + res.name).map(function (node) {
      delete node.render;
    }).map(ripple.draw);
  };
};