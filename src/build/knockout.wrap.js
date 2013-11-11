(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('knockout'));
  } else if (typeof define === 'function' && define.amd) {
    define(['knockout'], factory);
  } else {
    factory(root.ko);
  }
}(this, function (ko) {
  'use strict';
  if (!ko) return;

// @include ../knockout.wrap.js
  return ko.wrap;
}));
