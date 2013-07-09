// Refer to this website: https://github.com/mikeal/request to make these lines work!!!
// How to create chart url: http://code.google.com/p/yahoo-finance-managed/wiki/csvHistQuotesDownload
var http = require('http');
var fs = require('fs');
var url = require("url");
var querystring = require("querystring");
var request = require("request");

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

// Function readFSCallback is the generic function that is passed to the
// synchronous file read.
var readFSCallback = function(err, data) {
  return err ? console.log(err) : data;
};

// Function initPage handles the code necessary to set up the page on its
// initial load.
var initPage = function() {
  var cssString = fs.readFileSync("style/style.css", "utf8", readFSCallback);
  var jsString = fs.readFileSync("scripts/script.js", "utf8", readFSCallback);
  var webPage = fs.readFileSync("index.html", "utf8", readFSCallback);
  var preJS = webPage.replace("cssstylecss", cssString);
  res.writeHead(200);
  res.end(preJS.replace("jsscriptjs", jsString));
  return true;
};

var requestListener = function (req, res) {
  if (req.method === "POST") {
    var parsedURL = url.parse(req.url, true);
    req.on("data", function (chunk){
      var data = querystring.parse(chunk.toString());
      // TODO if time of request after market close, use today's date, else use yesterday's date.
			var chartReq = "http://ichart.yahoo.com/table.csv?s=" + Object.keys(data)[0] + getDateRange() + "&g=d&ignore=.csv";
      var chartData = "Not undefined";
      request(chartReq, function(err, response, body) {
				var stockPrices = body.split(",");
				// The following section takes the historic stock-price data from
				// Yahoo! and converts it to an array with the contents:
				// [opening price for first day of range, closing price for same,
				//  high and low prices for all days to last day of range]
        var stockArray = stockPrices.slice(8).filter(function(val, key) {
          return (((key % 6) === 0) || ((key % 6) === 1));
        }).map(function (val, key){
          return parseFloat(val);
        }).reverse();
				stockArray.unshift(stockPrices[stockPrices.length - 3]);
				stockArray.unshift(stockPrices[stockPrices.length - 6]);
				// End of section.
        res.writeHead(200);
        res.end(JSON.stringify(stockArray));
      });
    });
  } else {
    var cssString = fs.readFileSync("assets/style/style.css", "utf8", function(err, data) {
      return err ? console.log(err) : data;
    });
    var jsString = fs.readFileSync("assets/scripts/script.js", "utf8", function(err, data) {
      return err ? console.log(err) : data;
    });
    var webPage = fs.readFileSync("index.html", "utf8", function (err, data){
      return err ? console.log(err) : data;
    });
		var preJS = webPage.replace("<!--style.css-->", cssString);
    res.writeHead(200, {'content-type': 'text/html'});
		res.end(preJS.replace("\/\/script.js", jsString));
  }
};

var server = http.createServer(requestListener);

// We're using the special Cloud9 IDE port and hostname here;
// you'll probably just want something like (8080, "127.0.0.1")
server.listen(process.env.PORT || 8080, process.env.IP || "127.0.0.1");