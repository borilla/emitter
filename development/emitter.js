var Emitter = (function() {

	function Emitter() {
		this._events = {};
	}

	Emitter.prototype.on = function(event, listener) {
		var listeners = this._events[event] || (this._events[event] = []);
		listeners.push(listener);
	}

	var slice = Array.prototype.slice;


	Emitter.prototype.off = function(event, listener) {
		var events = this._events;
		var listeners;
		if (!event) {
			removeAllEvents(events);
		}
		else {
			var listeners = events[event];
			if (listeners) {
				if (listener) {
					removeListener(listeners, listener);
				}
				else {
					removeEvent(listeners);
				}
			}
		}
	}

	Emitter.prototype.trigger = function(event) {
		var events = this._events;
		compact(events, event);
		var listeners = events[event];
		if (listeners) {
			var args = slice.call(arguments, 1);
			for (var i = 0, l = listeners.length; i < l; ++i) {
				var listener = listeners[i];
				listener && listener.apply(null, args);
			}
		}
	}

	Emitter.prototype.once = function(event, listener) {
		var self = this;
		this.on(event, listener);
		this.on(event, function() {
			self.off(event, listener);
		});
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
