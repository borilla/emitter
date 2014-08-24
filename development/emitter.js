var Emitter = (function() {

	var slice = Array.prototype.slice;

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
		forEachListener(removeListener, this._events, event, callback);

		function removeListener(listener, listeners, i) {
			delete listeners[i];
		}
	}

	Emitter.prototype.trigger = function(event) {
		var events = this._events;
		var args = slice.call(arguments, 1);
		compact(events, event);
		forEachListener(triggerListener, events, event);

		function triggerListener(listener, listeners, i) {
			listener.callback.apply(null, args);
			if (++listener.callCount == listener.maxCalls) {
				delete listeners[i];
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
		var namespaces = event.split('.');
		event = namespaces.shift();
		if (namespaces.length) {
			listener.namespaces = namespaces;
		}
		listener.callCount = listener.callCount || 0;
		var listeners = events[event] || (events[event] = []);
		listeners.push(listener);
	}

	function compact(events, event) {
		event = event.split('.')[0];
		var listeners = events[event];
		if (listeners && listeners._requiresCompact) {
			listeners = compactArray(listeners);
			if (listeners.length) {
				events[event] = listeners;
				listeners._requiresCompact = false;
			}
			else {
				delete events[event];
			}
		}
	}

	function compactArray(array) {
		var result = [];
		for (var i = 0, l = array.length; i < l; ++i) {
			var value = array[i];
			value && result.push(value);
		}
		return result;
	}

	function forEachListener(fn, events, event, callback) {
		// if event not specified then apply to all events
		if (!event) {
			for (event in events) {
				forEachListener(fn, events, event, callback);
			}
		}
		else {
			var namespaces = event.split('.');
			event = namespaces.shift();
			namespaces = namespaces.length ? namespaces : null;
			var listeners = events[event];
			if (listeners) {
				for (var i = 0, l = listeners.length; i < l; ++i) {
					var listener = listeners[i];
					if (listener && (!callback || callback == listener.callback)) {
						if (!namespaces || namespacesMatch(namespaces, listener.namespaces)) {
							fn.call(null, listener, listeners, i);
							// if callback was specified then apply to only a single listener
							if (callback) {
								break;
							}
						}
					}
				}
			}
		}
	}

	function namespacesMatch(eventNamespaces, listenerNamespaces) {
		var length = eventNamespaces.length;
		if (!listenerNamespaces || listenerNamespaces.length < length) {
			return false;
		}
		if (length == 1) {
			return listenerNamespaces.indexOf(eventNamespaces[0]) != -1;
		}
		for (var i = 0; i < length; ++i) {
			var namespace = eventNamespaces[i];
			if (listenerNamespaces.indexOf(namespace) == -1) {
				return false;
			}
		}
		return true;
	}

	return Emitter;
}());
