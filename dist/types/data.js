'use strict';

// render all elements that require the specified data
var all = require('utilise/all');

module.exports = function (ripple) {
    return function (res) {
        return all('[data~="' + res.name + '"]').map(ripple.draw);
    };
};