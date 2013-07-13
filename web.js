var express = require("express");
var fs = require("fs");
var request = require("request");

var app = express();
app.use(express.logger());

// Function getDateRange returns a string with a defined (60-day) date range in
// the proper format for the ichart.yahoo.com API.
var getDateRange = function() {
	var todayms = new Date();
	var today = new Date(todayms - (1000 * 60 * 60 * 24));
	var startDate = new Date(todayms - (1000 * 60 * 60 * 24 * 61));
	var a = "&a=" + startDate.getMonth();
	var b = "&b=" + startDate.getDate();
	var c = "&c=" + startDate.getFullYear();
	var d = "&d=" + today.getMonth();
	var e = "&e=" + today.getDate();
	var f = "&f=" + today.getFullYear();
	return a + b + c + d + e + f;
};

var readFSCallback = function(err, data) {
	return err ? console.log(err) : data;
};

// Function initPage handles the code necessary to set up the page on its
// initial load.
var initPage = function(req, res) {
	var cssString = fs.readFileSync("assets/style/style.css", "utf8", readFSCallback);
	var jsString = fs.readFileSync("assets/js/script.js", "utf8", readFSCallback);
	var webPage = fs.readFileSync("index.html", "utf8", readFSCallback);
	var preJS = webPage.replace("<!--style.css-->", cssString);
	res.send(preJS.replace("\/\/script.js", jsString));
	return true;
};

app.get('/', initPage);

app.post("/stock?", express.bodyParser(), function(req, res) {
	// TODO if time of request after market close, use today's date, else use yesterday's date.
	var chartReq = "http://ichart.yahoo.com/table.csv?s=" + req.body.stock + getDateRange() + "&g=d&ignore=.csv";
	request(chartReq, function(err, response, body) {
		var stockPrices = body.split(",");
		// The following section takes the historic stock-price data from
		// Yahoo! and converts it to an array with the contents:
		// [opening price for first day of range, closing price for same,
		//  high and low prices for all days to last day of range]
		var stockArray = stockPrices.slice(8).filter(function(val, key) {
			return (((key % 6) === 0) || ((key % 6) === 1));
		}).map(function(val, key) {
			return parseFloat(val);
		}).reverse();
		stockArray.unshift(stockPrices[stockPrices.length - 3]);
		stockArray.unshift(stockPrices[stockPrices.length - 6]);
		// End of section.
		res.send(JSON.stringify(stockArray));
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
