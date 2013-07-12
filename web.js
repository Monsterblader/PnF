var express = require("express");
var fs = require("fs");
var http = require("http");
var url = require("url");

var app = express();
app.use(express.logger());

var cssString = fs.readFileSync("assets/style/style.css", "utf8", readFSCallback);
var jsString = fs.readFileSync("assets/scripts/script.js", "utf8", readFSCallback);
var webPage = fs.readFileSync("index.html", "utf8", readFSCallback);
var preJS = webPage.replace("<!--style.css-->", cssString);
app.get('/', function(request, response) {
	response.send(preJS.replace("\/\/script.js", jsString));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
