var express = require("express");
var fs = require("fs");
var request = require("request");

var app = express();
app.use(express.logger());

// Function getDateRange returns a string with a defined (60-day) date range in
// the proper format for the ichart.yahoo.com API.
var getDateRange = function() {
	var DAYSBACK = 61;
	var ONEDAYINMS = 1000 * 60 * 60 * 24;
	var todayms = new Date();
	var today = new Date(todayms - ONEDAYINMS);
	var startDate = new Date(todayms - (ONEDAYINMS * DAYSBACK));
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
	var webPage = fs.readFileSync("index.html", "utf8", readFSCallback);
	res.set("Content-type", "text/html");
	res.send(webPage);
	return true;
};

var getCompanyInformation = function(chunk) {
	var companyInformation = {};
	var REGEX = /^[^<]+/;
	var companyKeys = ["name", "marketCap", "PtoE", "EPS", "DivandYield"];
	var searchValues = ['class=\"title\"><h2>', "Market Cap:</th>", "P/E ", "EPS ", "Yield:"];
	var startOffsets = [18, 68, 70, 70, 39];
	var endOffsets = [100, 88, 80, 80, 59];
	var nameIndex;
	var result;
	for (var i = 0; i < 5; i += 1) {
		nameIndex = chunk.search(searchValues[i]);
		result = chunk.slice(nameIndex + startOffsets[i], nameIndex + endOffsets[i]);
		companyInformation[companyKeys[i]] = REGEX.exec(result)[0];
	}
	return companyInformation;
};

app.get('/', initPage);

app.get('/script.js', function(req, res) {
	var scr = fs.readFileSync("assets/js/script.js", "utf8", readFSCallback);
	res.set("Content-type", "text/javascript");
	res.send(scr);
});

app.get('/style.css', function(req, res) {
	var sty = fs.readFileSync("assets/style/style.css", "utf8", readFSCallback);
	res.set("Content-type", "text/css");
	res.send(sty);
});

app.get('/bootstrap.min.css', function(req, res) {
	var sty = fs.readFileSync("assets/bootstrap/css/bootstrap.min.css", "utf8", readFSCallback);
	res.set("Content-type", "text/css");
	res.send(sty);
});

app.get('/bootstrap-responsive.min.css', function(req, res) {
	var sty = fs.readFileSync("assets/bootstrap/css/bootstrap-responsive.min.css", "utf8", readFSCallback);
	res.set("Content-type", "text/css");
	res.send(sty);
});

app.post("/ichart?", express.bodyParser(), function(req, res) {
	// TODO if time of request after market close, use today's date, else use yesterday's date.
	var chartReq = "http://ichart.yahoo.com/table.csv?s=" + req.body.ichart + getDateRange() + "&g=d&ignore=.csv";
	request(chartReq, function(err, response, body) {
		var stockPrices = body.split(",");
		// The following section takes the historic stock-price data from
		// Yahoo! and converts it to an array with the contents:
		// [opening price for first day of range, closing price for same,
		//  high and low prices for all days to last day of range]
		var stockArray = stockPrices.slice(8).filter(function(val, key) {
			return ((key % 6) === 0) || ((key % 6) === 1);
		}).map(function(val, key) {
			return parseFloat(val);
		}).reverse();
		stockArray.unshift(stockPrices[stockPrices.length - 3]);
		stockArray.unshift(stockPrices[stockPrices.length - 6]);
		// End of section.
		res.send(JSON.stringify(stockArray));
	});
});

app.post("/finance?", express.bodyParser(), function(req, res) {
	var companyInformationReq = "http://finance.yahoo.com/q?s=" + req.body.finance + "&ql=1";
	request(companyInformationReq, function(err, response, body) {
		res.send(JSON.stringify(getCompanyInformation(body)));
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
