# knockout-wrapper

Wrap a function and notify any subscribers when any observables inside have changed.

(Basically a ko.computed that doesn't actually calculate on change)

## Example

```javascript
var a = ko.observable(2),
    b = ko.observable(2);
    
function expensiveOperation() {
  console.log(a() + b());
}

var wrapped = ko.wrapper(expensiveOperation);
wrapped.subscribe(function() {
  console.log('time to update');
});

// Call first time to identify dependencies
wrapped() // -> 4

// Some inside dependency updates, notify subscribers
a(3);     // -> time to update

// Don't call expensive operation unless explicitly called
wrapped() // -> 5
```

## About

- Author: Tim Hall
- License: MIT
- Dependencies: knockout
