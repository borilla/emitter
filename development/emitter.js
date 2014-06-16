var Emitter = (function() {

	function Emitter() {
		this.listeners = {};
	}

	Emitter.prototype.on = function(event, listener) {
		var listeners = this.listeners[event] || (this.listeners[event] = []);
		listeners.push(listener);
	}

	var slice = Array.prototype.slice;

	Emitter.prototype.trigger = function(event) {
		var listeners = this.listeners[event];
		if (listeners && listeners.length) {
			var args = slice.call(arguments, 1);
			for (var i = 0, l = listeners.length; i < l; ++i) {
				var listener = listeners[i];
				listener.apply(null, args);
			}
		}
	}

	Emitter.prototype.off = function(event, listener) {
		if (!event) {
			this.listeners = {};
		}
		else if (!listener) {
			delete this.listeners[event];
		}
		else {
			var listeners = this.listeners[event];
			if (listeners) {
				var i = listeners.indexOf(listener);
				if (i != -1) {
					listeners = listeners.splice(i, 1);
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
