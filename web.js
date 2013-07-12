var express = require("express");
var fs = require("fs");
var http = require("http");
var url = require("url");

var app = express();
app.use(express.logger());

var readFSCallback = function(err, data) {
	return err ? console.log(err) : data;
};

app.get('/', function(request, response) {
	var cssString = fs.readFileSync("assets/style/style.css", "utf8", readFSCallback);
	var jsString = fs.readFileSync("assets/scripts/script.js", "utf8", readFSCallback);
	var webPage = fs.readFileSync("index.html", "utf8", readFSCallback);
	var preJS = webPage.replace("<!--style.css-->", cssString);
	response.send(preJS.replace("\/\/script.js", jsString));
});

app.post("/stock?goog", express.bodyParser(), function(request, response) {
	console.log("working so far");
	response.send("Moo to you, too.");
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
