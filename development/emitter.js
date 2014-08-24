var Emitter = (function() {

	var slice = Array.prototype.slice;

	/**
	 * construct a new event emitter
	 */
	function Emitter() {
		this._events = {};
	}

	/**
	 * add a listener to be fired when event occurs
	 * @param  {string}   event    name of the event (can contain optional namespaces separated by '.' character)
	 * @param  {function} callback function to be called when event occurs
	 */
	Emitter.prototype.on = function(event, callback) {
		var listener = callback.callback ? callback : {
			callback: callback
		};
		addListener(this._events, event, listener);
	}

	/**
	 * stop listeners from being fired when events occur
	 * @param  {string}   event    (optional) name of the event (with possible namespaces) to remove events for
	 * @param  {function} callback (optional) specific callback to remove
	 */
	Emitter.prototype.off = function(event, callback) {
		forEachListener(removeListener, this._events, event, callback);
	}

	/**
	 * trigger an event
	 * @param  {string} event name of the event to trigger (with )
	 */
	Emitter.prototype.trigger = function(event) {
		var events = this._events;
		var args = slice.call(arguments, 1);
		compact(events, event);
		forEachListener(triggerListener, events, event);

		function triggerListener(listener, listeners, i) {
			listener.callback.apply(null, args);
			if (++listener.callCount == listener.maxCalls) {
				removeListener(listener, listeners, i);
			}
		}
	}

	/**
	 * add a listener to fire only once; the first time event occurs
	 * @param  {string}   event    name of the event (with optional namespaces separated by '.' character)
	 * @param  {function} callback function to be called when event occurs
	 */
	Emitter.prototype.once = function(event, callback) {
		var listener = {
			callback: callback,
			maxCalls: 1
		};
		addListener(this._events, event, listener);
	}

	/**
	 * add a listener to an event
	 */
	function addListener(events, event, listener) {
		var namespaces = event.split('.');
		event = namespaces.shift();
		if (namespaces.length) {
			listener.namespaces = namespaces;
		}
		listener.callCount = listener.callCount || 0;
		var listeners = events[event] || (events[event] = newEvent());
		listeners.push(listener);
	}

	/**
	 * return a new "listeners" object to represent a new event
	 */
	function newEvent() {
		var listeners = [];
		listeners._requiresCompact = false;
		return listeners;
	}

	/**
	 * remove a listener (used as callback for forEachListener)
	 */
	function removeListener(listener, listeners, i) {
		delete listeners[i];
		listeners._requiresCompact = true;
	}

	/**
	 * call fn for all listeners that match specified params
	 */
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
					if (listenerMatches(listener, callback, namespaces)) {
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

	/**
	 * return if listener is a match for (optional) specified callback and namespaces
	 */
	function listenerMatches(listener, callback, namespaces) {
		return (listener
			&& (!callback || callback == listener.callback)
			&& (!namespaces || isSubset(namespaces, listener.namespaces)));
	}

	/**
	 * return if all items in subset array are contained in superset
	 */
	function isSubset(subset, superset) {
		var length = subset.length;
		if (!superset || superset.length < length) {
			return false;
		}
		if (length == 1) {
			return superset.indexOf(subset[0]) != -1;
		}
		for (var i = 0; i < length; ++i) {
			var item = subset[i];
			if (superset.indexOf(item) == -1) {
				return false;
			}
		}
		return true;
	}

	/**
	 * compact listeners for an event - ie strip out deleted items
	 */
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

	/**
	 * return a copy of array with all falsy values removed
	 */
	function compactArray(array) {
		var result = [];
		for (var i = 0, l = array.length; i < l; ++i) {
			var value = array[i];
			value && result.push(value);
		}
		return result;
	}

	return Emitter;
}());
