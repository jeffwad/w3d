/*
	@name: 			require.js

	@description:	module loader and system utils
	
					prototypal inheritance
					iter tools
					promise
					observer
					events
					js module loader
					web worker spawning
					string and function enhancements
					guid generator

	@author:		Simon Jefford
	
*/

(function(json) {

	if(typeof StopIteration === 'undefined') {
		StopIteration = new Error();
	}
	/*

		define vars

	*/ 
	var create,	extend,
		iterator, exhaust, forEach, filter, map, some, every, indexOf, lastIndexOf, toArray, reduce, sum, pluck, chain,
		reSuccessCodes,	processRequest,	formatDataToString, getData, postData, putData, deleteData, socket,	
		deferred, when, 
		bind,partial,
		trim, camelCase, hyphenate, capitalise, interpolate,
		randomNumber, generateGuid,
		observe,
		eventMachine,
		load, spawn,
		sys,
		log = false;
	
	/*

		Prototypal inheritance and object instance extension
		Beefed up version of object by Crockford
		Idea for callSuper is borrowed from qooxdoo's callSuper method
		
	*/
	create = function() {
	
		var Func = function(){};
		
		return function(proto, instance){
		
			var object, callSuper, method; 
			Func.prototype = proto;
			Func.prototype.callSuper = function() {
				var origArgs = Array.prototype.shift.call(arguments);
				return origArgs.callee.callSuper.apply(this, arguments);
			};
			object = new Func();
			if (instance) {
				for(method in instance) {
					callSuper = object[method];
					object[method] = instance[method];
					if(typeof callSuper === "function") {
						object[method].callSuper = callSuper;				
					}
				}
				
			}
			if(((instance && !instance.skipInit) || typeof instance === 'undefined') && typeof object.__init__ === "function") {
				object.__init__.call(object);
			}
            delete object.skipInit;
			return object;
		};		
	
	}();

	extend = function(object, mixin) {
		var method;
		for(method in mixin) {
			object[method] = mixin[method];
		}
	};
	

	/*

		Base iterable methods

	*/
	iterator = function(object, force){
		
		var iterator = false, i, keys, key;
		
		if (typeof object.next ==='function') {
			iterator = object;
		}

		else if (typeof object.__iterator__ === "function") {
			iterator = object.__iterator__();
		}

		else if(object.length) {

			i = 0;
			iterator = {
				next: function() {
					if (typeof object[i] !== 'undefined') {
						return [object[i], i++];
					}
					throw StopIteration; 
				}
			};

		}
		else if(force) {

			keys = [], i = 0, key;
			for(key in object) {
				keys.push(key);
			};
			
			iterator = {
				next: function() {
					var r;
					key = keys[i++];
					r = object[key];
					if(typeof r !== "undefined") {
						return [r, key];
					}
					throw StopIteration; 
				}
			};


		}
		
		return iterator;
	};

	exhaust = function(object, func){

		var i, l, r, iterable;
		try {
			if (typeof object.length === 'number') {
				for(i = 0, l = object.length; i < l; i++) {
					func(object[i], i);
				}
			}
			else {
				iterable = iterator(object);
				if (iterable) {
					i = 0;
					while (true) {
						r = iterable.next();
						func(r[0], r[1]);
					}
				}
				else {
					for(i in object) {
						if(object.hasOwnProperty(i)) {
							func(object[i], i);
						}
					}
				}
			}
		} 
		catch (e) {
			if (e !== StopIteration) {
				throw e;
			}

		}
	};

	forEach = function(o, func, scope) {
		if(typeof o.forEach === 'function') {
			o.forEach(func, scope);
		}
		else {
			exhaust(o, function(value, key){
				func.call(scope, value, key);
			});
		}
	};
	
	filter = function(o, func, scope) {
		if(typeof o.filter === 'function') {
			return o.filter(func, scope);
		}
		var ret = o.length ? [] : {};
		exhaust(o, function(value, key){
			if (func.call(scope, value, key)) {
				if(o.length) {
					ret.push(value);
				}
				else {
					ret[key] = value;
				}
			}
		});
		return ret;
	};
	
	map = function(o, func, scope) {
		if(typeof o.map === 'function') {
			return o.map(func, scope);
		}
		var ret = o.length ? [] : {};
		exhaust(o, function(value, key){
			var r = func.call(scope, value, key);
			if(o.length) {
				ret.push(r);
			}
			else {
				ret[key] = r;
			}
		});
		return ret;
	};

	some = function(o, func, scope) {
		if(typeof o.some === 'function') {
			return o.some(func, scope);
		}
		var ret = false;
		exhaust(o, function(value, key){
			if ((ret = func.call(scope, value, key))) {
				throw StopIteration;
			}
		});
		return ret;
	};
	
	every = function(o, func, scope) {
		if(typeof o.every === 'function') {
			return o.every(func, scope);
		}
		var ret = true;
		exhaust(o, function(value, key){
			if (!(ret = func.call(scope, value, key))) {
				throw StopIteration;
			}
		});
		return ret;
	};
	
	indexOf = function(o, val) {
		if(typeof o.indexOf === 'function') {
			return o.indexOf(val);
		}
		var ret = -1;
		exhaust(o, function(value, key){
			if (value === val) {
				ret = key;
				throw StopIteration;
			}
		});
		return ret;
	};
	
	lastIndexOf = function(o, val){
		if(typeof o.lastIndexOf === 'function') {
			return o.lastIndexOf(val);
		}
		var ret = -1;
		exhaust(o, function(value, key){
			if (value === val) {
				ret = key;
			}
		});
		return ret;
	};

	toArray = function(o){
		var ret = [];
		exhaust(o, function(v, k){
			ret.push(v);
		});
		return ret;
	};

	reduce = function(ret, o, func, scope){
		exhaust(o, function(value, key){
			ret = func.call(scope, ret, value, key);
		});
		return ret;
	};
	
	sum = function(o, ret) {
		return reduce(ret || 0, o, function(ret, a){
			return (ret + a);
		});
	};
	
	pluck = function(o, key){
		return map(o, function(v){
			return v[key];
		});
	};

	chain = function() {

		if(arguments.length === 1) {
			return iterator(arguments[0]);
		}

		var iterables = map(arguments, iterator);
		return {
			next: function() {
				try {
					return iterables[0].next();
				}
				catch(e) {
					if (e !== StopIteration) {
						throw e;
					}
					if(iterables.length === 1) {
						throw StopIteration;
					}
					iterables.shift();
					return iterables[0].next();
				}
			}
		};
	};

	//	debug mode
	if(self.debug) {
		log = true;
	}

	deferred = function() {

		var status, promises = [], results = {}, id = 0, init = false,

		//	promise prototype
		promise = {

			constructor: "promise",

			//	start firing all the promises
			fire: function(res) {

				//	abort if cancelled
				if (status === -1) {
					return;
				}

				//	cache the initial response				
				if(res && (!init)) {
					init = res;
				}

				//	set status to fired
				status = 1;

				//	fire all the promises - each promise starts with the return value of it's parent
				//	if it has no parent (the initial promise) it starts with the incoming result.
				forEach(promises, function(promise) {

					var i = 1, data = promise.parent === -1 ? init : results[[promise.pos, promise.parent].join("")];

					while(promise.stack.length > 0) (function() {
						var func = promise.stack.shift()[data instanceof Error ? 1 : 0];
						if (!func) {
							return;
						}
						results[[i++, promise.id].join("")] = func(data);

					})();

				});

			},
			cancel: function() {
				status = -1;
			},
			
			then: function(callback, errback) {

				var next;			

				//	push callbacks for this promise onto stack			
				this.stack.push([callback, errback]);

				//	create a new promise to return. set it's parent = this.id
				next = create(promise, {
					pos: this.stack.length,
					id: id++,
					parent: this.id,
					stack: []
				});

				//	cache the promise
				promises.push(next);

				//	if the deferred has fired, then fire
				if (status === 1) {
					self.fire();
				}

				//	return the next promise			
				return next;
			},
			inspect: function() {
				console.dir(results);
			}
		},

		//	the deferred object
		self =  create(promise, {
			pos: 1,
			id: id++,
			parent: -1,
			stack: []
		});

		//	cache the initial 	
		promises[self.id] = self;
		return self;
	};

	when = function() {
		var d, i = 0, l = arguments.length, f, args = arguments;
		d = deferred();
		f = function() {
			args[i++].then(function(data) {
				if(i < l) {
					f();
				}
				else {
					d.fire(data);
				}
				return data;
			},
			function(e) {
				return e;
			});
		};
		f();
		return d;
	};


	/*

		Asyncronous data loading/posting and callback api

 	*/
	processRequest = function(type, url, response, timeout, headers, repeat, data) {
		//	create request
		var xhr = new XMLHttpRequest(), d, timer,
		
		//	set headers
		defaultHeaders = {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, application/json, application/javascript'
		};

		xhr.open(type, url, true);

		forEach(headers, function(header, i) {
			defaultHeaders[i] = header;
		});

		forEach(defaultHeaders, function(header, i) {
			xhr.setRequestHeader(i, header);
		});
		
		//	instantiate deferred
		d = deferred();
				
		//	add handler
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4) {
				clearTimeout(timer);
				if (reSuccessCodes.test(xhr.status)) {
					d.fire(function(){
						switch (response) {
							case 'xml': return xhr.responseXML ? xhr.responseXML.documentElement : xhr.documentElement;
							case 'json': return json(xhr.responseText);
							default: return xhr.responseText;
						}
					}());
				}
				else {
					d.fire(new Error(xhr.status));
				}
			}
		};

		//	send request
		xhr.send(data || null);
		
		//	push a repeater function onto the error stack if repeat is greater than 0;
		//	otherwise chuck a timeout error
		timer = setTimeout(function() {
			xhr.abort();
			if(repeat > 0) {
				console.warn(repeat, ": ", url);
				getData(url, response, {
					timeout: timeout,
					headers: headers,
					repeat: repeat - 1,
					data: data
				}).then(function(data) {
					return d.fire(data);
				},
				function() {
					return d.fire(new Error(xhr.status));
				});
			}
			else {
				d.fire(new Error("Timeout exceeded"));
			}
		}, timeout * 1000);
		
		return d;
	};
	

	//	
	reSuccessCodes = /(200|201|204|304)/;

	//	converts an object into a string "key1=value1&key2=value2" for posting
	formatDataToString = function(data, doNotEncode) {

		if(typeof data !== 'string') {

			data = reduce([], data, function(i, value, key) {
				i[i.length] = key + "=" + value;
				return i; 
			}).join("&");

		}

		return doNotEncode ? data : encodeURIComponent(data);

	};


	getData = function(url, response, options) {

		options = options || {};
		if (options.data) {
			url += (url.indexOf("?") !== -1 ? "&" : "?") + formatDataToString(options.data, true);
		}
		var d = processRequest('GET', url, response, options.timeout || 5, options.headers || {}, options.repeat || 0);
		d.then(options.success || false, options.error || false);
		return d;

	};

	//	"x-www-form-urlencoded"
	postData = function(url, response, options) {
		options = options || {};
		options.headers = options.headers || {};
		options.headers["Content-type"] = "application/" + response; 

		var d = processRequest('POST', url, response, options.timeout || 20, options.headers, options.repeat || 0, options.data ? formatDataToString(options.data, true) : "");
		d.then(options.success || false, options.error || false);
		return d;
	};

	putData = function(url, response, options) {
		options = options || {};
		options.headers = options.headers || {};
		options.headers["Content-type"] = "application/" + response; 

		var d = processRequest('PUT', url, response, options.timeout || 20, options.headers, options.repeat || 0, options.data ? formatDataToString(options.data, true) : "");
		d.then(options.success || false, options.error || false);
		return d;
	};

	deleteData = function(url, response, options) {

		options = options || {};
		var d = processRequest('DELETE', url, response, options.timeout || 5, options.headers || {}, options.repeat || 0);
		d.then(options.success || false, options.error || false);
		return d;

	};


	socket = function() {

		var format = function(key, data) {
			key = "~" + key + "~";
			return "~m~" + (key + data).length + "~m~" + key + data;
		};
		
		return function(uri) {

			var id, em, init, socket;

			id = generateGuid();

			em = eventMachine();
			em.on("sendMessage", function(data) {
				socket.send(format("j", JSON.stringify(data)));
				//socket.send("~m~" + ("~j~" + JSON.stringify(data)).length + "~m~~j~" + JSON.stringify(data));
			});

			try {
				socket = new WebSocket(uri);

				socket.onopen = function() {
					em.fire("socketConnected", {
						id: id
					});
				};

				socket.onmessage = function(msg) {

					var data;
					switch (true) {

						case /~j~/.test(msg.data):
							data = JSON.parse(msg.data.split("~j~")[1]);
							em.fire(data.type, data.data);
							break;						

						case /~h~/.test(msg.data):
							socket.send(format("h", msg.data.split("~h~")[1]));
							//socket.send("~m~" + ("~h~" + msg.data.split("~h~")[1]).length + "~m~~h~" + msg.data.split("~h~")[1]);
							break;
					}
				};		

				socket.onclose = function(e) {
					em.fire("socketClosed", {
						id: id
					});
				};

				socket.onerror = function(e) {
					console.log(e);
				};
			}
			catch(e) {
				console.log(e);
			}
		
			return {
			
				on: function(type, func) {
					return em.on(type, func);
				},

				fire: function(type, data) {
					em.fire("sendMessage", {
						type: type,
						id: id,
						data: data
					});
				},

				close: function() {
					socket.close();
				}

			};
		}

	}();

	/*

		Functions that call or bind existing functions
	
	*/
	bind = function(){
		var func = arguments[0], o = arguments[1], args = [], i, l;
		for(i = 1, l = arguments.length; i < l; i++) {
			args[i] = arguments[i];
		}
		return function(){
			return func.apply(o, args);
		};
	};
	
	partial = function(){
		var func = arguments[0], args = Array.prototype.slice.call(arguments, 1);
		return function(){
			var i, l = args.length, j = 0, len = arguments.length;
			for(i = 0; i < l && j < len; i++ ) {
				if (typeof args[i] === 'undefined') {
					args[i] = arguments[j++];
				}
			}
			return func.apply(false, args);
		};
	};


	/*
	
		String processing functions
	
	*/
	trim = function() {
		var reTrim = /^\s*|\s*$/g;
		return function(str){
			return str.replace(reTrim, '');
		};
	}();
	
	camelCase = function() {
		var reCamelCase = /(-([a-z]))/g;
		return function(str){
			return str.replace(reCamelCase, function(str, p1, p2){
				return p2.toUpperCase();
			});
		};
	}();
	
	hyphenate = function() {
		var reHyphenate = /([A-Z])/g;
		return function(str){
			return str.replace(reHyphenate, function(str, p1){
				return "-" + p1.toLowerCase();
			});
		};
	}();
	
	capitalise = function() {
		var reCapitalise = /^([a-zA-Z])([a-zA-Z]+)/;
		return function(str){
			return str.replace(reCapitalise, function(str, p1, p2) {
				return p1.toUpperCase() + p2.toLowerCase();
			});
		};
	}();
	
	interpolate = function () {
		var reInterpolate = /{([^{}]*)}/g;    
		return function(str, data) {
			return str.replace(reInterpolate, function (str, p1) {
				var value = data[p1];
				return typeof value === 'string' || typeof value === 'number' ? value : p1;
	        });
		};
	}();
	
	
	
	/*
	
		number generators
	
	*/	
	randomNumber = function(){
		return Math.floor(Math.random() * 1000000000000);
	};

	generateGuid = function() {

		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 

		return function() {
			var i, r, uuid = [];

			// rfc4122, version 4 form
			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data.  At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random()*16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}

			return uuid.join('');

		};
	}();
	
	/*
	
		observer mechanism
	
	*/
	observe = function() {
		
		var observer, fire; 
		
		observer = {
			start: function() {
				if(!this.isActive) {
					this.obj[this.type].stack[this.id] = this.func;
					this.isActive = true;
				}
			},
			stop: function() {
				if(this.isActive === true) {
					delete this.obj[this.type].stack[this.id];
					this.isActive = false;
				}
			}
		};
		
		fire = function(stack, e) {
			forEach(stack, function(listener) {
				listener(e);
			});
		};
		
		return function(obj, type, func) {
			var id, orig, l;
			id = generateGuid();
			if(obj[type] && (!obj[type].stack)) {
				orig = obj[type];
				obj[type] = function() {
					var e = {type: type, target: this};
					e.returnValue = orig.apply(this, arguments);
					fire(obj[type].stack, e);
					return e.returnValue;
				};
				obj[type].stack = {};
			}

			l = create(observer, {
				obj: obj,
				type: type,
				func: func,
				id: id
			});
			l.start();
			return l;
		};
		
	}();

	eventMachine = function() {

		var self, fire, listeners;

		listeners = {};

		//	fire a message to this dispatchers listeners
		fire = function(type, data) {
			if(log) {
				try {
					console.log(type, data || "");
				}
				catch(e) {}
			}
		
			if(typeof listeners[type] === "function") {
				listeners[type](data);
			}
		};

		self = {

			//	post message to all listeners
			fire: function(type, data) {

				//	broadcast message
				fire(type, data);
				
			},

			//	register listeners
			addListener: function(eventName, listener) {

				if(!listeners[eventName]) {
					listeners[eventName] = function(e) {
						return e;
					};
				}
				return observe(listeners, eventName, function(e) {
					listener(e.returnValue);
				});
			},

			once: function(eventName, listener) {

				if(!listeners[eventName]) {
					listeners[eventName] = function(e) {
						return e;
					};
				}
				return observe(listeners, eventName, function(e) {
					listener(e.returnValue);
				});
			}
		};

		self.on = self.addListener;
		return self;

	};

	sys = function() {

		var self, em, workers;

		workers = [];
		em = eventMachine();		

		self = {

			//	post message to all listeners
			fire: function(type, data) {

				//	broadcast message to listeners in this worker
				em.fire(type, data);

				//	broadcast message to workers
				forEach(workers, function(worker) {
					worker.postMessage({
						type: type,
						data: data
					});
				});
				
			},

			//	receive message from worker
			receive: function(e) {
				
				//	broadcast message to listeners in this thread
				em.fire(e.type, e.data);

			},


			//	register listeners
			addListener: function(eventName, listener) {

				em.addListener(eventName, listener);

			},

			//	register worker
			addWorker: function(worker) {

				//	receive message from data thread
			    worker.onmessage = function(e) {
				
					//	broadcast message to listeners in this thread
					self.receive(e.data);

				};

				//	define the onerror receiver
			  	worker.onerror = function(e) {  

					self.receive({
						type: "workerError",
						data: {
							message: e.message,
							filename: e.filename,
							lineno: e.lineno
						}
					});
			    };

				workers.push(worker);

			}

		};
		
		self.on = self.addListener;
		return self;

	}();

	//	register firebug console logging with message dispatcher
	//	should force logging to propogate up workers
	forEach(["log", "warn", "error"], function(method) {
		
		sys.addListener("console_" + method, function(data) {
			
			console[method].apply(console, data.args);
		
		});
		
	});

	/*
	
		Module & dependency loading mechanism.
		http://wiki.commonjs.org/wiki/Modules/1.1
	
	*/
	(function() {

		var loading = {},
			uninitialised = {},
			modules = {},		
			require,
			load,
			loadText,
			define,
			register,
			head;

		//	require a module
		require = function(moduleName) {
			return modules[moduleName].def;
		};


		if(typeof importScripts === "function") { 
			load = function(moduleName) {
				
				if(modules[moduleName]) {
					return require(moduleName);
				}
				if(!self.debug) {
					moduleName += ".min";
				}
				importScripts(moduleName + ".js");
			}
		}
		else {
			head = document.getElementsByTagName("head")[0]
			//	load a module from the server
			load = function(moduleName) {
				if(modules[moduleName]) {
					return require(moduleName);
				}
				loading[moduleName] = true;
				var script = document.createElement("script");
				script.id = moduleName;
				if(!self.debug) {
					moduleName += ".min";
				}
				script.src = moduleName + ".js";		
				head.appendChild(script);
		
			};
		}

		//	load a template from the server
		loadText = function(fileName) {
	
			loading[fileName] = true;
			getData(fileName, 'txt', {
				headers: { 
					'Cache-Control': 'no-cache, must-revalidate, no-store',
					'Pragma': 'no-cache'
				}
			}).then(function(data) {
					
				register(fileName, data);
				delete loading[fileName];
				forEach(uninitialised, function(module, moduleName) {
					define(moduleName, module.dependencies, module.def);
				});
			});

		};

		//	initialise a module
		define = function(moduleName, dependencies, def) {
			
			var exports, module;

			try {

				delete loading[moduleName];

				if(arguments.length === 2) {
					def = dependencies;
					dependencies = [];
				}

				//	test to see if all the modules dependencies are loaded
				dependencies = filter(dependencies, function(module) {

					if(!modules[module]) {
						if(loading[module]) {
							return true;
						}
						else if(uninitialised[module]) {
							return true;
						}
						else {
							if(/\.\w{2,3}$/.test(module)) {
								loadText(module);
							}
							else {
								load(module);
							}
							return true;
						}
					}
					return false;
				});

				//	if there are no unloaded dependencies, initialise the module, clean up and initialise all uninitialised modules
				if(dependencies.length === 0) {

					exports = {};
					module = {path: moduleName};

					def(require, exports, module);

					register(moduleName, exports, module);

					delete uninitialised[moduleName];
					forEach(uninitialised, function(module, moduleName) {
						define(moduleName, module.dependencies, module.def);
					});

					sys.fire("moduleInitialised", {
						moduleName: moduleName
					});

				}
				//	add the module to the uninitialised stack
				else {

					uninitialised[moduleName] = {
						dependencies: dependencies,
						def: def
					};

				}

			}
			catch(e) {
				console.dir(e);
			}
		};

		//	 register a module
		register = function(moduleName, def, module) {
			module = module || {};
			module.id = module.id || moduleName;
			
			modules[moduleName] = {
				module: module, 
				def: def
			};
		};

		//	attach api
		self.require = load;
		self.define = define;
		//self.require.get = require;
		self.require.inspect = function(module) {		
			console.dir(module ? modules[module] : modules);
		};

	})();

	//	spawn a new worker to load a specific module.
	//	register the worker with the event dispatcher/
	//	returns a deferred object which is fired when the thread is loaded
	spawn = function(module, callback, errorback) {

		var d, initialModuleListener, guid, worker;
		
		if(Worker) {

			//	create a callback holder
			d = deferred();
			d.then(callback || false, errorback || false);

			//	 create a new worker and register it's onmessage function
			worker = new Worker("/worker.js");
			worker.onmessage = function(e) {
				guid = e.data.guid;
				this.postMessage({
					type: "loadInitialModule",
					module: module
				});
				sys.addWorker(worker);
			};
		
			//	listen for the initial module event. fire callbacks waiting for the worker to initialise
			initialModuleListener = sys.addListener("initialModuleLoaded", function(data) {

				if(data.guid === guid) {
					initialModuleListener.stop();
					initialModuleListener = null;
					d.fire(module);
				}

			});
		
			return d;
		}
		else {
			return load(module, callback, errorback);
		}

	};
	
	
	//	initialise a module within the current thread
	//	returns a deferred object which is fired when the module is loaded	
	load = function(module, callback, errorback) {
		
		var d, moduleLoadedListener;
		
		//	create a callback holder
		d = deferred();
		d.then(callback || false, errorback || false);

		moduleLoadedListener = sys.addListener("moduleInitialised", function(data) {
			if(data.moduleName === module) {
				moduleLoadedListener.stop();
				moduleLoadedListener = null;				
				d.fire(module);
			}
		});

		require(module);
		
		return d;
	
	};
	

	//	register system api's and language extensions
	define("sys", function(require, exports) {
		exports.addWorker = sys.addWorker;
		exports.fire = sys.fire;
		exports.addListener = sys.addListener;
		exports.on = sys.on;
		exports.once = sys.once;
		
	});

	define("object", function(require, exports) {
		exports.create = create;
		exports.extend = extend;
	});	
	define("iter", function(require, exports) {
		exports.forEach = forEach; 
		exports.filter = filter;
		exports.map = map;
		exports.some = some;
		exports.every = every;
		exports.indexOf = indexOf;
		exports.lastIndexOf = lastIndexOf;
		exports.toArray = toArray;
		exports.reduce = reduce;
		exports.sum = sum;
		exports.pluck = pluck;
		exports.chain = chain;
		exports.iterator = iterator;
	});
	define("events", function(require, exports) {
		exports.observe = observe;
		exports.eventMachine = eventMachine;
	});
	define("async", function(require, exports) {
		exports.deferred = deferred;
		exports.when = when;
	});
	define("net", function(require, exports) {
		exports.get = getData;
		exports.post = postData;
		exports.put = putData;
		exports.del = deleteData;
		exports.socket = socket;
	});
	define("func", function(require, exports) {
		exports.bind = bind;
		exports.partial = partial;
	});
	define("string", function(require, exports) {
		exports.trim = trim;
		exports.camelCase = camelCase;
		exports.hyphenate = hyphenate;
		exports.capitalise = capitalise;
		exports.interpolate = interpolate;
	});	
	define("gen", function(require, exports) {
		exports.randomNumber = randomNumber;
		exports.generateGuid = generateGuid;
	});
	define("module", function(require, exports) {
		exports.spawn = spawn;
		exports.load = load;
	});

})(function(string) {
		try {	
			return eval("(" + string + ")");
		}
		catch(e) {
			console.error(e.message);
			return false;
		}
	}
);
