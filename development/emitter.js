var Emitter = (function() {

	var slice = Array.prototype.slice;

	/**
	 * construct a new event emitter
	 */
	function Emitter() {
		this._events = {};
		this._flags = {};
	}

	var EmitterPrototype = Emitter.prototype;

	/**
	 * add a listener to be fired when event occurs
	 * @param  {string}   event    name of the event (can contain optional namespaces separated by '.' character)
	 * @param  {function} callback function to be called when event occurs
	 */
	EmitterPrototype.on = function(event, callback) {
		var listener = callback.callback ? callback : {
			callback: callback
		};
		addListener(this, event, listener);
	}

	/**
	 * stop listeners from being fired when events occur
	 * @param  {string}   event    (optional) name of the event (with possible namespaces) to remove events for
	 * @param  {function} callback (optional) specific callback to remove
	 */
	EmitterPrototype.off = function(event, callback) {
		forEachListener(removeListener, this._events, event, callback);
	}

	/**
	 * trigger an event
	 * @param  {string} event name of the event to trigger (with )
	 */
	EmitterPrototype.trigger = function(event/*, args... */) {
		var events = this._events;
		var args = slice.call(arguments, 1);
		forEachListener(trigger, events, event);

		function trigger(listener, listeners, i) {
			triggerListener(listener, args, listeners, i);
		}
	}

	/**
	 * add a listener to fire only once; the first time event occurs
	 * @param  {string}   event    name of the event (with optional namespaces separated by '.' character)
	 * @param  {function} callback function to be called when event occurs
	 */
	EmitterPrototype.once = function(event, callback) {
		var listener = {
			callback: callback,
			maxCalls: 1
		};
		addListener(this, event, listener);
	}

	/**
	 * flag that an event has occured
	 * @param  {string} event name of the event (with optional namespaces separated by '.' character)
	 */
	EmitterPrototype.flag = function(event/*, args... */) {
		var args = slice.call(arguments);
		args.unshift(this._flags)
		addFlag.apply(null, args);
		EmitterPrototype.trigger.apply(this, arguments);
	}

	/**
	 * remove flagged event
	 * @param  {string} event name of the event (with optional namespaces separated by '.' character)
	 */
	EmitterPrototype.unflag = function(event) {
		forEachMatchingFlag(remove, this, event);

		function remove(flag, flags, i) {
			flags[i] = null;
			flags._removed++;
		}
	}

	function addFlag(flags, event/*, args...*/) {
		var namespaces = event.split('.');
		event = namespaces.shift();
		var flag = {
			args: slice.call(arguments, 2)
		};
		if (namespaces.length) {
			flag.namespaces = namespaces;
		}
		var flaggedEvents = flags[event] || (flags[event] = newFlags());
		flaggedEvents.push(flag);
	}

	function newFlags() {
		var flags = [];
		flags._depth = 0;
		flags._removed = 0;
		return flags;
	}

	/**
	 * add a listener to an event
	 */
	function addListener(emitter, event, listener) {
		var events = emitter._events;
		var namespaces = event.split('.');
		event = namespaces.shift();
		if (namespaces.length) {
			listener.namespaces = namespaces;
		}
		listener.calls = 0;
		var listeners = events[event] || (events[event] = newEvent());
		var index = listeners.push(listener) - 1;

		forEachMatchingFlag(_triggerListener, emitter, event, namespaces);
		function _triggerListener(flag, flags, i) {
			triggerListener(listener, flag.args, listeners, index);
		}
	}

	/**
	 * return a new "listeners" object to represent a new event
	 */
	function newEvent() {
		var listeners = [];
		listeners._removed = 0;
		listeners._depth = 0;
		return listeners;
	}

	/**
	 * trigger a listener with the specified args
	 * [Other params are used to remove listener if it reaches maxCalls]
	 */
	function triggerListener(listener, args, listeners, i) {
		listener.callback.apply(null, args);
		if (++listener.calls == listener.maxCalls) {
			removeListener(listener, listeners, i);
		}
	}

	/**
	 * remove a listener (used as callback for forEachListener)
	 */
	function removeListener(listener, listeners, i) {
		listeners[i] = null;
		listeners._removed++;
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
				listeners._depth++;
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
				if (--listeners._depth == 0) {
					stripRemoved(listeners);
				}
			}
		}

		function listenerMatches(listener, callback, namespaces) {
			return listener
				&& (!callback || callback == listener.callback)
				&& (!namespaces || isSubset(namespaces, listener.namespaces));
		}
	}

	function forEachMatchingFlag(fn, emitter, event, namespaces) {
		// if event not specified then apply to all events
		if (!event) {
			for (event in events) {
				forEachMatchingFlag(fn, emitter, event);
			}
		}
		else {
			if (!namespaces) {
				namespaces = event.split('.');
				event = namespaces.shift();
			}
			var flags = emitter._flags[event];
			if (flags) {
				flags._depth++;
				for (var i = 0, l = flags.length; i < l; ++i) {
					var flag = flags[i];
					if (flag && isSubset(flag.namespaces, namespaces)) {
						fn.call(null, flag, flags, i);
					}
				}
				if (--flags._depth == 0) {
					stripRemoved(flags);
				}
			}
		}
	}

	/**
	 * return if all items in subset array are contained in superset array
	 *
	 * used for comparing sets of namespaces
	 * if item is null or undefined then is considered an empty array
	 */
	function isSubset(subset, superset) {
		var length;
		if (!subset || (length = subset.length) == 0) {
			return true;
		}
		if (!superset || superset.length < length || superset.indexOf(subset[0]) == -1) {
			return false;
		}
		for (var i = 1; i < length; ++i) {
			if (superset.indexOf(subset[i]) == -1) {
				return false;
			}
		}
		return true;
	}

	/**
	 * strip any removed items from listeners or flags array (if required)
	 */
	function stripRemoved(array) {
		if (array._removed) {
			compactArray(array);
			array._removed = 0;
		}
	}

	/**
	 * remove all falsy items from an array, modifying the original array
	 */
	function compactArray(array) {
		for (var i = 0, j = 0, l = array.length; i < l; ++i) {
			var value = array[i];
			value && (array[j++] = value);
		}
		array.length = j;
	}

	return Emitter;
}());
