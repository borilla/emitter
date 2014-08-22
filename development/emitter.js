var Emitter = (function() {

	function Emitter() {
		this._events = {};
	}

	Emitter.prototype.on = function(event, callback) {
		var listener = callback.callback ? callback : {
			callback: callback
		};
		addListener(this._events, event, listener);
	}

	Emitter.prototype.off = function(event, callback) {
		var events = this._events;
		var listeners;
		if (!event) {
			removeAllEvents(events);
		}
		else {
			var listeners = events[event];
			if (listeners) {
				if (callback) {
					removeCallback(listeners, callback);
				}
				else {
					removeEvent(listeners);
				}
			}
		}
	}

	var slice = Array.prototype.slice;

	Emitter.prototype.trigger = function(event) {
		var events = this._events;
		compact(events, event);
		var listeners = events[event];
		if (listeners) {
			var args = slice.call(arguments, 1);
			for (var i = 0, l = listeners.length; i < l; ++i) {
				var listener = listeners[i];
				if (listener) {
					listener.callback.apply(null, args);
					if (++listener.callCount == listener.maxCalls) {
						removeListener(listeners, listener);
					}
				}
			}
		}
	}

	Emitter.prototype.once = function(event, callback) {
		var listener = {
			callback: callback,
			maxCalls: 1
		};
		addListener(this._events, event, listener);
	}

	function addListener(events, event, listener) {
		var listeners = events[event] || (events[event] = []);
		listener.callCount = listener.callCount || 0;
		listeners.push(listener);
	}

	function removeAllEvents(events) {
		for (var event in events) {
			removeEvent(events[event]);
		}
	}

	function removeEvent(listeners) {
		// reset all array members to undefined
		var length = listeners.length;
		listeners.length = 0;
		listeners.length = length;
		listeners._requiresCompact = true;
	}

	function removeCallback(listeners, callback) {
		for (var i = 0, l = listeners.length; i < l; ++i) {
			var listener = listeners[i];
			if (listener && listener.callback == callback) {
				listeners[i] = undefined;
				listeners._requiresCompact = true;
				return;
			}
		}
	}

	function removeListener(listeners, listener) {
		var i = listeners.indexOf(listener);
		if (i != -1) {
			listeners[i] = undefined;
			listeners._requiresCompact = true;
		}
	}

	function compact(events, event) {
		var listeners = events[event];
		if (listeners && listeners._requiresCompact) {
			listeners = listeners.filter(isDefined);
			if (listeners.length) {
				events[event] = listeners;
				listeners._requiresCompact = false;
			}
			else {
				delete events[event];
			}
		}
	}

	function isDefined(listener) {
		return listener;
	}

	return Emitter;
}());
