//	er, pinched runCmds from geddy. nicely done sir.
//	build a project, client, server and tests
var child_process			 = require('child_process'),
	fs						 = require('fs'),
	ujs						 = require("uglify-js"),
	util					 = require("util"),
	runCmds,
	runClient,
	copyFile,
	createTransportFile,
	createMinifiedFile;


desc("Build the full application");
task("default", ["build:client", "build:server", "build:tests"], function() {

});

namespace("build", function() {
	desc("Build client");
	task("client", [], function() {

		runClient(__dirname + "/client/src");

	});


	desc("Build server");
	task("server", [], function() {


	});

	desc("Build tests");
	task("tests", [], function() {


	});
});


copyFile = function(filename, callback) {

	fs.readFile(filename, "utf8", function(err, data) {

		//	write the file
		filename = filename.replace("/src/", "/htdocs/");

		fs.writeFile(filename, data, "utf8", function(err) {
			if(err) {
				console.error(err);
				return;
			}
			if(callback) {
				callback(filename);
			}
		});
	});
};

createTransportFile = function(filename, callback) {

	fs.readFile(filename, "utf8", function(err, data) {

		var requires, transport, raw, start;
	
		requires = [];
		transport = [
			"define(\"" + filename.split(__dirname + "/client/src")[1].split(".js")[0] + "\",\n\n",
			"\tfunction(require, exports, module) {\n\n",
			//"\t\treturn [exports, module];\n",
			"\t}\n\n",
			");"
		];

		//	does the module have any dependencies
		requires = data.match(/require\(["'](\w*|\/*|:*|-*|\.\w{2,3})+["']\)/g);
		requires = requires ? requires.map(function(dependency) {
			return "\"" + dependency.replace(/require\("/, "").replace(/"\)/, "") + "\"";
		}) : false;

		//	split at the first end comment block
		raw = data.split("*/\n");

		//	find the line at which the module start		
		start = raw[0].split("\n").length;

		//	stich the module back together
		raw.shift();
		data = raw.join("*/\n").replace(/\n/g, "\n\t\t");

		//	insert raw module into transport
		transport.splice(2, 0, "\t\t" + data + "\n");

		//	insert the requires list and calculate the actual start position
		if(requires) {
			start = start - 6;
			transport.splice(1, 0, "\t[" + requires.join(",") + "],\n\n");
		}
		else {
			start = start - 4;
		}

		//	push the start position down. ensures line numbers match	
		for(var i = 0; i < start; i++) {
			transport.unshift("\n");		
		}

		//	write the file
		filename = filename.replace("/src/", "/htdocs/");

		fs.writeFile(filename, transport.join(""), "utf8", function(err) {
			if(err) {
				console.error(err);
				return true;
			}
			if(callback) {
				callback(filename);
			}
		});

	});
};

createMinifiedFile = function(filename) {

	var ast;
	
	fs.readFile(filename, "utf8", function(err, data) {

		ast = ujs.parser.parse(data); 				// parse code and get the initial AST
		ast = ujs.uglify.ast_mangle(ast); 			// get a new AST with mangled names
		ast = ujs.uglify.ast_squeeze(ast); 			// get an AST with compression optimizations
		data = ujs.uglify.gen_code(ast); 			// compressed code here

		//	write the file
		filename = filename.replace(".js", ".min.js");

		fs.writeFile(filename, data, "utf8", function(err) {
			if(err) {
				console.error(err);
			}
		});
	});

};


runClient = function(filename){

	fs.stat(filename, function(err, stats) {
		if(err) throw err;
		if(stats.isFile() && /\.js$/.test(filename)) {
			if(!/(require|worker)\.js$/.test(filename)) {
				createTransportFile(filename, function(filename) {
					createMinifiedFile(filename);
				});
			}
			else {
				copyFile(filename, function(filename) {
					createMinifiedFile(filename);
				});
			}
		} 
		else if(stats.isFile()) {
			copyFile(filename);
		} 
		else if(stats.isDirectory()) {

			fs.readdir(filename, function(err, files) {
				files.forEach(function(file){
					runClient(filename + '/' + file);
				});
			});

		}
	});
};

// Runs an array of shell commands asynchronously, calling the
// next command off the queue inside the callback from child_process.exec.
// When the queue is done, call the final callback function.
runCmds = function (arr, callback, printStdout) {
	var run = function (cmd) {
		child_process.exec(cmd, function (err, stdout, stderr) {
			if (err) {
				console.error('Error: ' + JSON.stringify(err));
			}
			else if (stderr) {
				console.error('Error: ' + stderr);
			}
			else {
				if (printStdout) {
					console.log(stdout);
				}
				if (arr.length) {
					var next = arr.shift();
					run(next);
				}
				else {
					if (callback) {
						callback();
					}
				}
			}
		});
	};
	run(arr.shift());
};
