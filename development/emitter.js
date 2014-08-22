var Emitter = (function() {

	function Emitter() {
		this.events = {};
	}

	Emitter.prototype.on = function(event, listener) {
		var listeners = this.events[event] || (this.events[event] = []);
		listeners.push(listener);
	}

	var slice = Array.prototype.slice;

	Emitter.prototype.trigger = function(event) {
		var listeners = this.events[event];
		if (listeners && listeners.length) {
			var args = slice.call(arguments, 1);
			for (var i = 0; i < listeners.length; ++i) {
				var listener = listeners[i];
				listener && listener.apply(null, args);
			}
		}
	}

	Emitter.prototype.off = function(event, listener) {
		if (!event) {
			this.events = {};
		}
		else if (!listener) {
			delete this.events[event];
		}
		else {
			var listeners = this.events[event];
			if (listeners) {
				var i = listeners.indexOf(listener);
				if (i != -1) {
					listeners[i] = null;
				}
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

	return Emitter;
}());
