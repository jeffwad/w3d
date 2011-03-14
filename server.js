#!/usr/bin/env node

var util			= require("util"),
	http			= require("http"),
	static		 	= require("node-static"),
	io				= require("socket.io"),
	crypto			= require("crypto"),
	events			= require("events").eventEmitter,
	server,
	listener,
	json;

var file = new(static.Server)('client/htdocs', { cache: 0, headers: {'X-Hello':'World!'} });

server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response, function (err, res) {
            if (err) { // An error as occured
                console.error("> Error serving " + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end();
            }
			else { // The file was served successfully
                console.log("> " + request.url + " - " + res.message);
            }
        });
    });
});

server.listen(8080);

console.log("> node-static is listening on http://127.0.0.1:8080");

json = JSON.stringify;

listener = io.listen(server);

listener.on('connection', function(client) {
	
	if (listener.clients.length > 0) {
		var count = listener.clients.length;
		while (count--) {
		    if (listener.clients[count] != null && this.clients[count] != client) {
				listener.clients[count].broadcast(json({ action: 'fetch' }));
				return;
		    }
		}
    }
    
    client.on('message', function(msg) {
		console.log(util.inspect(msg));
		client.broadcast(msg);
    });

	client.send({
		type: "initialiseClient",
		id: 1,
		data: {
			response: "initial server response"
		}
	});

});

