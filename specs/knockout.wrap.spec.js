describe('knockout.wrap', function () {
  var spec = this;

  beforeEach(function () {
    spec.obs = ko.observable(10);

    spec.called = 0;
    spec.fn = function () {
      spec.called++;
      return 10 + spec.obs();
    };
  });

  it('should return result of inner function', function () {
    var wrapped = ko.wrap(function () {
      return 2 + 2;
    });

    expect(wrapped()).toEqual(4);
  });

  it('should pass arguments into inner function', function () {
    var wrapped = ko.wrap(function (a, b) {
      return a + b;
    });

    expect(wrapped(2, 3)).toEqual(5);
  });

  it('should use given context for inner function', function () {
    var test = {
      value: 10,
      result: function() {
        return this.value;
      }
    };
    var wrapped = ko.wrap(test.result, test);

    expect(wrapped()).toEqual(test.value);
  });

  it('should watch function with observables inside for changes', function () {
    var wrapped = ko.wrap(spec.fn);
    var spy = jasmine.createSpy('watch.obs');
    wrapped.subscribe(spy);

    expect(spy).not.toHaveBeenCalled();
    wrapped();

    spec.obs(11);
    expect(spy).toHaveBeenCalled();
  });

  it('should not update if observable inside function doesn\'t change', function () {
    var wrapped = ko.wrap(spec.fn);
    var spy = jasmine.createSpy('watch.obs');
    wrapped.subscribe(spy);

    expect(spy).not.toHaveBeenCalled();
    wrapped();

    spec.obs(10);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not update until wrapped function is initially called', function () {
    var wrapped = ko.wrap(spec.fn);
    var spy = jasmine.createSpy('watch.obs');
    wrapped.subscribe(spy);

    expect(spy).not.toHaveBeenCalled();
    spec.obs(11);
    expect(spy).not.toHaveBeenCalled();

    wrapped();
    spec.obs(10);
    expect(spy).toHaveBeenCalled();
  });

  it('should only call wrapped function explicitly', function () {
    var wrapped = ko.wrap(spec.fn);

    wrapped();
    expect(spec.called).toEqual(1);
    spec.obs(11);
    expect(spec.called).toEqual(1);

    spec.obs(10);
    spec.obs(11);
    spec.obs(10);
    spec.obs(11);
    expect(spec.called).toEqual(1);

    wrapped();
    expect(spec.called).toEqual(2);

    wrapped();
    spec.obs(10);
    wrapped();
    spec.obs(11);
    wrapped();
    spec.obs(10);
    wrapped();
    spec.obs(11);
    wrapped();
    expect(spec.called).toEqual(7);
  });
});
