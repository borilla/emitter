function isCompact(emitter) {
	var events = emitter._events;
	for (var event in events) {
		var listeners = events[event];
		if (listeners._requiresCompact) {
			return false;
		}
	}
	return true;
}

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
			ok(isCompact(emitter), 'emitter should be left properly compacted');
		}
	});

	test('should be able to add a listener to an event', function() {
		emitter.on('event', listener1);
		expect(1);
	});

	test('should be able to remove a listener to an event', function() {
		emitter.on('event', listener1);
		emitter.off('event', listener1);
		expect(1);
	});

	test('should be able to trigger listener to an event', function() {
		emitter.on('event', listener1);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener should have been called once');
		emitter.trigger('event');
		equal(listener1.callCount, 2, 'Listener should have been called again');
	});

	test('should not fail if we trigger an event with no listeners', function() {
		emitter.trigger('xxx');
		expect(1);
	});

	test('should be able to trigger multiple listeners', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should have been called once');
		equal(listener2.callCount, 1, 'Listener1 should have been called once');
	});

	test('should trigger listeners in the same order as they were added', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		ok(listener1.calledBefore(listener2), 'Listener1 should have been called before listener2');
		ok(listener2.calledBefore(listener3), 'Listener2 should have been called before listener3');
	});

	test('should call listeners with arguments sent to trigger', function() {
		var arg1 = 'john';
		var arg2 = {};
		var arg3 = [];
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.trigger('event', arg1, arg2, arg3);
		ok(listener1.calledWith(arg1, arg2, arg3), 'Listener1 should have been called with expected arguments');
		ok(listener2.calledWith(arg1, arg2, arg3), 'Listener2 should have been called with expected arguments');
	});

	test('should be able to remove a single listener', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.off('event', listener2);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should have been called once');
		equal(listener2.callCount, 0, 'Listener2 should not have been called');
		equal(listener3.callCount, 1, 'Listener3 should have been called once');
	});

	test('should be able to remove all listeners to an event', function() {
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.off('event');
		emitter.trigger('event');
		equal(listener1.callCount, 0, 'Listener1 should not have been called');
		equal(listener2.callCount, 0, 'Listener2 should not have been called');
	});

	test('should be able to remove all listeners to all events', function() {
		emitter.on('event1', listener1);
		emitter.on('event2', listener2);
		emitter.off();
		emitter.trigger('event1');
		emitter.trigger('event2');
		equal(listener1.callCount, 0, 'Listener1 should not have been called');
		equal(listener2.callCount, 0, 'Listener2 should not have been called');
	});

	test('should be able to add a listener to fire only once', function() {
		emitter.on('event', listener1);
		emitter.once('event', listener2);
		emitter.trigger('event');
		emitter.trigger('event');
		equal(listener1.callCount, 2, 'Listener1 should have been called twice');
		equal(listener2.callCount, 1, 'Listener2 should have been called only once');
	});

	test('should be able to remove a one-time listener', function() {
		emitter.once('event', listener1);
		emitter.off('event', listener1);
		emitter.trigger('event');
		equal(listener1.callCount, 0, 'Listener1 should not have been called');
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
			ok(isCompact(emitter), 'emitter should be left properly compacted');
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
		equal(listener1.callCount, 1, 'Listener1 should have been called once');
		equal(listener2.callCount, 1, 'Listener2 should have been called once');
		equal(listener3.callCount, 1, 'Listener3 should have been called once');
		emitter.trigger('event');
		equal(listener1.callCount, 2, 'Listener1 should have been called again');
		equal(listener2.callCount, 1, 'Listener2 should not have been called again');
		equal(listener3.callCount, 2, 'Listener3 should have been called again');
	});

	test('should be able to remove a later listener to the same event', function() {
		listener1 = sinon.spy(function() {
			emitter.off('event', listener2);
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should have been called once');
		equal(listener2.callCount, 0, 'Listener2 should not have been called');
		equal(listener3.callCount, 1, 'Listener3 should have been called once');
	});

	test('should be able to remove an earlier listener to the same event', function() {
		listener2 = sinon.spy(function() {
			emitter.off('event', listener1);
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should have been called once');
		equal(listener2.callCount, 1, 'Listener2 should have been called once');
		equal(listener3.callCount, 1, 'Listener3 should have been called once');
	});

	test('should be able to remove all listeners to its own event', function() {
		listener2 = sinon.spy(function() {
			emitter.off('event');
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should have been called once');
		equal(listener2.callCount, 1, 'Listener2 should have been called once');
		equal(listener3.callCount, 0, 'Listener3 should not have been called');
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should not have been called again');
		equal(listener2.callCount, 1, 'Listener2 should not have been called again');
		equal(listener3.callCount, 0, 'Listener3 should still not have been called');
	});

	test('should be able to remove all listeners to all events', function() {
		listener2 = sinon.spy(function() {
			emitter.off();
		});
		emitter.on('event', listener1);
		emitter.on('event', listener2);
		emitter.on('event', listener3);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should have been called once');
		equal(listener2.callCount, 1, 'Listener2 should have been called once');
		equal(listener3.callCount, 0, 'Listener3 should not have been called');
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'Listener1 should not have been called again');
		equal(listener2.callCount, 1, 'Listener2 should not have been called again');
		equal(listener3.callCount, 0, 'Listener3 should still not have been called');
	});

	test('should be able to recursively trigger its own event', function() {
		var remainingCalls = 10;
		listener2 = sinon.spy(function() {
			emitter.off('event', listener3);
		});
		listener1 = sinon.spy(function() {
			if (--remainingCalls) {
				emitter.on('event', listener3);
				emitter.once('event', listener2);
				emitter.trigger('event');
			}
		});
		emitter.on('event', listener1);
		emitter.trigger('event');
		equal(listener1.callCount, 10, 'listener1 should have been called ten times');
		equal(listener2.callCount, 9, 'listener2 should have been called nine times');
		equal(listener3.callCount, 9, 'listener3 should have been called nine times');
	});
}());

(function() {
	var emitter;
	var listener1, listener2, listener3;

	module('Namespaces', {
		setup: function() {
			emitter = new Emitter();
			listener1 = sinon.stub();
			listener2 = sinon.stub();
			listener3 = sinon.stub();
		},
		teardown: function() {
			ok(isCompact(emitter), 'emitter should be left properly compacted');
		}
	});

	test('should be able to add an event listener with namespace/s', function() {
		emitter.on('event.namespace1', listener1);
		emitter.on('event.namespace1.namespace2', listener2);
		expect(1);
	});

	test('should trigger all listeners if namespace is not specified', function() {
		emitter.on('event.namespace1', listener1);
		emitter.on('event.namespace2', listener2);
		emitter.trigger('event');
		equal(listener1.callCount, 1, 'listener1 should have been called once');
		equal(listener2.callCount, 1, 'listener2 should have been called once');
	});

	test('should only trigger events with matching namespaces', function() {
		emitter.on('event.namespace1.namespace3', listener1);
		emitter.on('event.namespace2.namespace3', listener2);
		emitter.trigger('event.namespace3.namespace1');
		equal(listener1.callCount, 1, 'listener1 should have been called once');
		equal(listener2.callCount, 0, 'listener2 should not have been called');
	});

	test('should only remove events with matching namespaces', function() {
		emitter.on('event.namespace1', listener1);
		emitter.on('event.namespace2', listener2);
		emitter.off('event.namespace1');
		emitter.trigger('event');
		equal(listener1.callCount, 0, 'listener1 should have been removed');
		equal(listener2.callCount, 1, 'listener2 should not have been removed');
	});

}());
