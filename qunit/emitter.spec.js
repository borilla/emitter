(function() {
	module('Emitter');

	QUnit.testStart(function() {
	});

	QUnit.testDone(function() {
	});

	test('should exist and be a function', function() {
		equal(typeof(Emitter), 'function', 'Emitter is a function');
	});

	test('should create an instance of en emitter', function() {
		var emitter = new Emitter();
		ok(emitter instanceof Emitter, 'Object is an instance of Emitter');
	});
}());

(function() {
	module('Emitter instance');

	var emitter;
	var listener1, listener2;

	QUnit.testStart(function() {
		emitter = new Emitter();
		listener1 = sinon.stub();
		listener2 = sinon.stub();
		listener3 = sinon.stub();
	});

	QUnit.testDone(function() {
	});

	test('should be able to add a listener to an event', function() {
		emitter.on('event', listener1);
		expect(0);
	});

	test('should be able to trigger listener to an event', function() {
		emitter.on('event', listener1);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener was called once');
		emitter.trigger('event');
		ok(listener1.calledTwice, 'Listener was called again');
	});

	test('should not fail if we trigger an event with no listeners', function() {
		emitter.trigger('xxx');
		expect(0);
	});

	test('should be able to trigger multiple listeners', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was called once');
		ok(listener2.calledOnce, 'Listener1 was called once');
	});

	test('should call listeners with arguments sent to trigger', function() {
		var arg1 = 'john';
		var arg2 = {};
		var arg3 = [];
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.trigger('event', arg1, arg2, arg3);
		ok(listener1.calledWith(arg1, arg2, arg3), 'Listener1 was called with expected arguments');
		ok(listener2.calledWith(arg1, arg2, arg3), 'Listener2 was called with expected arguments');
	});

	test('should be able to remove a single listener', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.off('event', listener2);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was called once');
		ok(listener2.notCalled, 'Listener2 was not called');
		ok(listener3.calledOnce, 'Listener3 was called once');
	});

	test('should be able to remove all listeners to an event', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.off('event');
		emitter.trigger('event');
		ok(listener1.notCalled, 'Listener1 was not called');
		ok(listener2.notCalled, 'Listener2 was not called');
	});

	test('should be able to remove all listeners to all events', function() {
		emitter.on('event1', listener1);
		emitter.on('event2', listener2);
		emitter.off();
		emitter.trigger('event1');
		emitter.trigger('event2');
		ok(listener1.notCalled, 'Listener1 was not called');
		ok(listener2.notCalled, 'Listener2 was not called');
	});

	test('should be able to add a listener to fire only once', function() {
		emitter.on('event', listener1);
		emitter.once('event', listener2);
		emitter.trigger('event');
		emitter.trigger('event');
		ok(listener1.calledTwice, 'Listener1 was called twice');
		ok(listener2.calledOnce, 'Listener2 was called only once');
	});

	test('should be able to remove a one-time listener', function() {
		emitter.once('event', listener1);
		emitter.off('event', listener1);
		emitter.trigger('event');
		ok(listener1.notCalled, 'Listener1 was not called');
	});
}());
