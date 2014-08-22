(function() {
	module('Emitter');

	test('should exist and be a function', function() {
		equal(typeof(Emitter), 'function', 'Emitter is a function');
	});

	test('should create an instance of an emitter', function() {
		var emitter = new Emitter();
		ok(emitter instanceof Emitter, 'emitter is an instance of Emitter');
	});
}());

(function() {
	var emitter;
	var listener1, listener2, listener3;

	module('Emitter instance', {
		setup: function() {
			emitter = new Emitter();
			listener1 = sinon.stub();
			listener2 = sinon.stub();
			listener3 = sinon.stub();
		},
		teardown: function() {
		}
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

	test('should trigger listeners in the same order as they were added', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		ok(listener1.calledBefore(listener2), 'Listener1 was called before listener2');
		ok(listener2.calledBefore(listener3), 'Listener2 was called before listener3');
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

	test('should remove correct item when same callback is added as one-time then multiple-time listener', function() {
		emitter.once('event', listener1);
		emitter.on('event', listener1);
		emitter.off('event', listener1);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'listener should have been called once');
		emitter.trigger('event');
		equal(listener1.callCount, 2, 'listener should have been called twice');
	});

	test('should remove correct item when same callback is added as multiple-time then one-time listener', function() {
		emitter.on('event', listener1);
		emitter.once('event', listener1);
		emitter.trigger('event');
		equal(listener1.callCount, 2, 'listener should have been called twice');
		emitter.trigger('event');
		equal(listener1.callCount, 3, 'listener should have been called three times');
	});

	test('*can* add a listener with a custom "maxCalls" value', function() {
		emitter.on('event', {
			callback: listener1,
			maxCalls: 2
		});
		emitter.trigger('event');
		emitter.trigger('event');
		emitter.trigger('event');
		equal(listener1.callCount, 2, 'listener should only have been called twice');
	});
}());

(function() {
	var emitter;
	var listener1, listener2, listener3;

	module('Event listener', {
		setup: function() {
			emitter = new Emitter();
			listener1 = sinon.stub();
			listener2 = sinon.stub();
			listener3 = sinon.stub();
		},
		teardown: function() {
		}
	});

	test('should be able to remove itself', function() {
		listener2 = sinon.spy(function() {
			emitter.off('event', listener2);
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was called once');
		ok(listener2.calledOnce, 'Listener2 was called once');
		ok(listener3.calledOnce, 'Listener3 was called once');
		emitter.trigger('event');
		ok(listener1.calledTwice, 'Listener1 was called again');
		ok(listener2.calledOnce, 'Listener2 was not called again');
		ok(listener3.calledTwice, 'Listener3 was called again');
	});

	test('should be able to remove a later listener to the same event', function() {
		listener1 = sinon.spy(function() {
			emitter.off('event', listener2);
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was called once');
		ok(listener2.notCalled, 'Listener2 was not called');
		ok(listener3.calledOnce, 'Listener3 was called once');
	});

	test('should be able to remove an earlier listener to the same event', function() {
		listener2 = sinon.spy(function() {
			emitter.off('event', listener1);
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was called once');
		ok(listener2.calledOnce, 'Listener2 was called once');
		ok(listener3.calledOnce, 'Listener3 was called once');
	});

	test('should be able to remove all listeners to its own event', function() {
		listener2 = sinon.spy(function() {
			emitter.off('event');
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was called once');
		ok(listener2.calledOnce, 'Listener2 was called once');
		ok(listener3.notCalled, 'Listener3 was not called');
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was not called again');
		ok(listener2.calledOnce, 'Listener2 was not called again');
		ok(listener3.notCalled, 'Listener3 was still not called');
	});

	test('should be able to remove all listeners to all events', function() {
		listener2 = sinon.spy(function() {
			emitter.off();
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was called once');
		ok(listener2.calledOnce, 'Listener2 was called once');
		ok(listener3.notCalled, 'Listener3 was not called');
		emitter.trigger('event');
		ok(listener1.calledOnce, 'Listener1 was not called again');
		ok(listener2.calledOnce, 'Listener2 was not called again');
		ok(listener3.notCalled, 'Listener3 was still not called');
	});
}());
