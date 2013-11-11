// knockout.wrap.js - Watch observables inside of functions for knockout.js
// (c) Tim Hall - https://github.com/timhall/knockout.wrap - License: MIT

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

/**
 * knockout.wrap
 * 
 * Wrap the specified function
 * and notify any subscribers when any observables inside have changed
 * 
 * Basically a ko.computed that doesn't actually calculate on change
 *
 * Useful for expensive functions that only want to know if they should be
 * re-evaluated on change without actually re-evaluating
 *
 * var wrapped = ko.wrap(function() { somethingExpensive(observable()); });
 * wrapped.subscribe(function() {
 *     // The dependencies have updated,
 *     // do something if you want to
 * });
 *
 * When you want to do somethingExpensive call wrapped()
 *
 * @param {Function} fn function to watch
 * @param {Varies} [context]
 */
ko.wrap = function (fn, context) {
  if (typeof fn !== 'function') {
    throw new Error('Pass a function to wrap');
  }

  var subscription;
  var wrapped = function() {
    var args = Array.prototype.slice.call(arguments),
        result;
    context = context || this;

    // Dispose of existing watcher and subscription
    if (subscription) { subscription.dispose(); }

    // Create watcher for function and subscribe to any internal changes
    subscription = watcher(function() {
      result = fn.apply(context, args);
    }).subscribe(function() {
      wrapped.notifySubscribers(undefined, 'change');
    });

    return result;
  };
  ko.subscribable.call(wrapped);

  return wrapped;
};

/**
 * Watch specified callback for changes
 *
 * Grafted liberally from ko.computed
 * https://github.com/SteveSanderson/knockout
 * (c) Steven Sanderson - http://knockoutjs.com/
 *
 * @param {Function} callback
 * @param {Varies} [context]
 * @return {subscribable}
 */
var watcher = function (callback, context) {
    
  var hasBeenEvaluated = false,
      isBeingEvaluated = false,
      subscriptionsToDependencies = [],
      prevValue, latestValue;
  
  context = context || this;
  if (typeof callback !== "function") {
    throw new Error("knockout.wrap: watcher() requires a function to watch");
  }

  function watcher() {}
  watcher.dispose = disposeAll;
  ko.subscribable.call(watcher);

  function init() {
    try {
      // Begin dependency detection and specify callback for found dependencies
      ko.dependencyDetection.begin(function(subscribable) {
        addSubscription(subscribable);
      });

      // Call the callback with the given context and watch for dependencies triggered
      callback.call(context);
    } finally {
      ko.dependencyDetection.end();
    }
  }

  function updated() {
    watcher.notifySubscribers();
  }

  function addSubscription(subscribable) {
    subscriptionsToDependencies.push(subscribable.subscribe(updated));
  }

  var disposeAll = function dispose() {
    ko.utils.arrayForEach(subscriptionsToDependencies, function (subscription) {
      subscription.dispose();
    });
    subscriptionsToDependencies = [];
  };
  
  init();
  return watcher;
};

// Expose knockout's internal dependency detection
// Adapted from knockout.deferred-updates
// https://github.com/mbest/knockout-deferred-updates
// (c) Michael Best, Steven Sanderson
(function exposeDependencyDetection() {
  if (ko.dependencyDetection) return;

  function findPropContainingKey(obj, key) {
    for (var item in obj) {
      if (obj.hasOwnProperty(item) && obj[item] && obj[item][key]) {
        return obj[item];
      }
    }
  }
  function findMethodBySignature(obj, match) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key].toString().indexOf(match) >= 0) {
        return key;
      }
    }
  }
  function getMethodByNameOrSignature(obj, name, match) {
    return obj[name] || obj[findMethodBySignature(obj, match)];
  }

  ko.dependencyDetection = findPropContainingKey(ko, 'end');
  ko.dependencyDetection.begin = 
    getMethodByNameOrSignature(ko.dependencyDetection, 'begin', ']})');
  ko.dependencyDetection.registerDependency = 
    getMethodByNameOrSignature(ko.dependencyDetection, 'registerDependency', '))}');
  ko.dependencyDetection.ignore = 
    getMethodByNameOrSignature(ko.dependencyDetection, 'ignore', '.pop()}}');
}());

  return ko.wrap;
}));
