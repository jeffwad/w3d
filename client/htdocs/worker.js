/*
	@name: 			worker.js
	
	@description: 	Default worker initialiser. Imports require.js
					Loads initial module. Starts listening to incoming events from both parent thread, itself
					and any child threads it subsequently spawns
	
	@author: 		Simon Jefford
	
*/
importScripts("require.js");
var console = {};

(function() {

	try {

		var forEach = require("iter").forEach,
			toArray = require("iter").toArray,
			sys = require("sys"),
			moduleLoadedListener,
			initialModule,
			guid = require("gen").generateGuid();

		//	create console logging methods that pass messages up to the window
		forEach(["log", "warn", "error"], function(method) {

			console[method] = function() {

				var args = toArray(arguments);
				if(!/^worker - /.test(args[0])) {
					args.unshift("worker - " + initialModule + ": ");
				}
				self.postMessage({
					type: "console_" + method,
					data: { 
						args: args
					}
				});
			}
		});

		//	register the initial module has loaded function with the event dispatcher
		moduleLoadedListener = sys.addListener("moduleInitialised", function(data) {

			if(data.moduleName === initialModule) {

				moduleLoadedListener.stop();
				moduleLoadedListener = null;
				//	post a message that the initial module has loadded
				self.postMessage({
					type: "initialModuleLoaded",
					data: {
						guid: guid
					}
				});
			}
		});
	
		//	listen to parent worker. load initial module then register this worker with it's event dispatcher
		//	this will overwrite this onmessage function during registration
		self.onmessage = function(e) {
			initialModule = e.data.module;
			require(e.data.module);
			sys.addWorker(self);
		};

		//	post the initial worker is loaded message
		self.postMessage({
			type: "workerLoaded",
			guid: guid
		});
	}
	catch(e) {
		console.log(e);
	}
})();
