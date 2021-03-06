/* TODO list: If replacing chart, replace ticker symbol.
 Set up charts side by side.
 Dynamic chart width? - determine after writing correct algorithms  New canvas only draw on show then hide debugger window.
 Rearrange for Backbone?
 */

var express = require("express");
var fs = require("fs");
var request = require("request");
var mime = require("mime");

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

var readFSCallback = function(err, data) {
	return err ? console.log(err) : data;
};

// Function initPage handles the code necessary to set up the page on its
// initial load.
var initPage = function(req, res) {
	var webPage = fs.readFileSync("assets/html/index.html", "utf8", readFSCallback);
	res.set("Content-type", "text/html");
	res.send(webPage);
	return true;
};

app.get('/', initPage);

app.get('/assets?', function(req, res) {
	var path = "assets/" + req.query.route;
	var asset = fs.readFileSync(path, "utf8", readFSCallback);
	res.set("Content-type", mime.lookup(path));
	res.send(asset);
});

app.post("/ichart?", express.bodyParser(), function(req, res) {
	// TODO if time of request after market close, use today's date, else use yesterday's date.
	var requestedStock = req.body.ichart.toUpperCase();
	if (stock.indexOf(requestedStock) >= 0) {
		var chartReq = "http://ichart.yahoo.com/table.csv?s=" + requestedStock + getDateRange() + "&g=d&ignore=.csv";
		request(chartReq, function(err, response, body) {
			var stockPrices = body.split(",");
			// The following section takes the historic stock-price data from
			// Yahoo! and converts it to an array with the contents:
			// [opening price for first day of range, closing price for same,
			//  high and low prices for all days to last day of range]
			var stockArray = stockPrices.slice(8).filter(function(val, key) {
				return (key % 6 === 0) || (key % 6 === 1);
			}).map(function(val, key) {
				return parseFloat(val);
			}).reverse();
			stockArray.unshift(stockPrices[stockPrices.length - 3]);
			stockArray.unshift(stockPrices[stockPrices.length - 6]);
			// End of section.
			res.send(JSON.stringify(stockArray));
		});
	} else {
		res.send("--Failed--");
	}
});

var stock = fs.readFileSync("assets/tickerlist.txt", "utf8", readFSCallback).split(",");

app.post("/finance?", express.bodyParser(), function(req, res) {
	var requestedStock = req.body.finance.toUpperCase();
	console.log(stock.indexOf(requestedStock));
	if (stock.indexOf(requestedStock) >= 0) {
		var companyInformationReq = "http://finance.yahoo.com/q?s=" + requestedStock + "&ql=1";
		request(companyInformationReq, function(err, response, body) {
			res.send(JSON.stringify(getCompanyInformation(body)));
		});
	}
});

app.post("/random", express.bodyParser(), function(req, res) {
	res.send(stock[Math.floor(Math.random() * stock.length)]);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
