var express = require("express");
var fs = require("fs");
var http = require("http");
var url = require("url");

var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

var requestListener = function(req, res) {
	if (req.method === "POST") {
		res.writeHead(200, {'content-type': 'text/html'});
		res.end("Moo, I say.");
	} else {
		res.writeHead(200, {'content-type': 'text/html'});
		res.end("You say, 'moo.'");
	}
};

var server = http.createServer(requestListener);
server.listen(process.env.PORT || 8080, process.env.IP || "127.0.0.1");
