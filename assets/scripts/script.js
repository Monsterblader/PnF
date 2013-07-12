var findRange = function (prices){
	var extremes = {high: prices[0], low: prices[0]};
	prices.forEach(function(val) {
		(val > extremes.high) ? (extremes.high = val) :
						(val < extremes.low) && (extremes.low = val);
	});
	return extremes;
};

var BREAKPOINTS = [{top: Infinity, bottom: 200, increment: 4},
	{top: 200, bottom: 100, increment: 2},
	{top: 100, bottom: 20, increment: 1},
	{top: 20, bottom: 5, increment: 0.50},
	{top: 5, bottom: 0, increment: 0.25}];

// TODO Keep an eye on this.  Removed '+ 1' from 'var highValue...'  Works for 'V' (range - 178-216), 'GOOG' (range - 700+), and 'T' (range - 34).  Haven't tested for others.
var PnFDiff = function(minuend, subtrahend) {
	var returnArray = [];
	for (var i = 0; i < 5; i += 1) {
		if (((minuend < BREAKPOINTS[i].top) && (minuend >= BREAKPOINTS[i].bottom)) || ((subtrahend < BREAKPOINTS[i].top) && (subtrahend >= BREAKPOINTS[i].bottom))) {
			// This determines if the stock's high price exceeds the top boundary.
			var highValue = Math.min(BREAKPOINTS[i].top / BREAKPOINTS[i].increment, Math.floor(minuend / BREAKPOINTS[i].increment) + 1);
			// This determines if the stock's low price exceeds the bottom boundary.
			var lowValue = Math.max(BREAKPOINTS[i].bottom / BREAKPOINTS[i].increment, Math.floor(subtrahend / BREAKPOINTS[i].increment));
			returnArray.push(highValue - lowValue);
		} else {
			returnArray.push(0);
		}
	}
	return returnArray;
};

var diffRangeSum = function(rangeArray) {
	return rangeArray[0] + rangeArray[1] + rangeArray[2] + rangeArray[3] + rangeArray[4];
};

var createChart = function (ctx, prices, priceRange, chartHeight){
	var drawLine = function(ctx, startPoint, endPoint, lineColor) {
		ctx.strokeStyle = lineColor;
		ctx.beginPath();
		ctx.moveTo(startPoint.x, startPoint.y);
		ctx.lineTo(endPoint.x, endPoint.y);
		ctx.stroke();
	};

	var makePoint = function(X, Y) {
		return {x: X, y: Y};
	};

	var drawAxes = function(ctx, top, bottom, scale) {
		var labelAxis = function(ctx, priceRange) {
			// There are five price increments that are established as part of the definition of point and figure charting.  I have separated the processing of each range into (five) functions.
			ctx.font = "12px Times New Roman";
			ctx.fillStyle = "Black";
			var totalTicks = PnFDiff(priceRange.high, priceRange.low);
			var n = diffRangeSum(totalTicks);
			var paddedHigh;
			if (n < 30) {
				n = Math.floor((30 - n) / 2);
				var splitN;
				var padHigh = function(index) {
					var top = BREAKPOINTS[index].top;
					var increment = BREAKPOINTS[index].increment;
					if ((top - Math.floor(priceRange.high)) / increment > n) {
						totalTicks[index] += n;
						paddedHigh = (Math.floor(priceRange.high / increment) + 1 + n) * increment;
					} else {
						totalTicks[index] += (top / increment) - Math.floor(priceRange.high / increment);
						splitN = n - ((top / increment) - Math.floor(priceRange.high / increment));
						totalTicks[index - 1] += splitN;
						paddedHigh = BREAKPOINTS[index - 1].bottom + splitN * BREAKPOINTS[index - 1].increment;
					}
				};
				var padLow = function(index) {
					var bottom = BREAKPOINTS[index].bottom;
					var increment = BREAKPOINTS[index].increment;
					var pricetoBottom = Math.floor(priceRange.low / increment) - (bottom / increment);
					if (pricetoBottom > n) {
						totalTicks[index] += n;
					} else {
						totalTicks[index] += pricetoBottom;
						totalTicks[index + 1] += n - pricetoBottom;
					}
				};
				if (totalTicks[0]) {
					totalTicks[0] += n;
					paddedHigh = (Math.floor(priceRange.high / 4) + 1 + n) * 4;
					padLow(0);
				} else if (totalTicks[1]) {
					padHigh(1);
					padLow(1);
				} else if (totalTicks[2]) {
					padHigh(2);
					padLow(2);
				} else if (totalTicks[3]) {
					padHigh(3);
					padLow(3);
				} else {
					totalTicks[3] = 10;
					paddedHigh = 10;
					totalTicks[4] = 20;
				}
			} else {
				paddedHigh = Math.floor(priceRange.high);
			}
			var chartMax = paddedHigh;
			var axisIndex = 1;
			for (var i = 0; i < 5; i += 1) {
				if (totalTicks[i]) {
					for (var j = totalTicks[i]; j-- > 0; paddedHigh -= BREAKPOINTS[i].increment) {
						ctx.fillText(paddedHigh, 1, axisIndex++ * 10);
					}
				}
			}
			var axisLeftOffset = (totalTicks[3] > 1) || (totalTicks[4] > 1) ? 22.5 : Math.max(16, (Math.floor(Math.log(priceRange.high) / Math.LN10) + 2) * 5) + 1;
			drawLine(ctx, makePoint(axisLeftOffset, 0), makePoint(axisLeftOffset, chartHeight), "black");
			return [chartMax, axisLeftOffset];
		};

		ctx.clearRect(0, 0, 300, 300);
		// This section taken from http://www.w3schools.com/tags/canvas_fillstyle.asp
		var my_gradient = ctx.createLinearGradient(0, 0, 0, chartHeight / 2);
		my_gradient.addColorStop(0, "gray");
		my_gradient.addColorStop(1, "white");
		ctx.fillStyle = my_gradient;
		ctx.fillRect(0, 0, 300, chartHeight);
		// End section
		ctx.shadowColor = undefined;
		return labelAxis(ctx, priceRange);
	};

	var plotData = function(ctx, high, prices, axisLeftOffset) {
		var shadowStyle = function(ctx, offX, offY, blur, color) {
			ctx.shadowOffsetX = offX;
			ctx.shadowOffsetY = offY;
			ctx.shadowBlur = blur;
			ctx.shadowColor = color;//rgba(0, 255, 0, 0.5)";
		};

		var drawX = function(ctx, X, Y) {
			shadowStyle(ctx, 2, 2, 2, "black");
			drawLine(ctx, makePoint(X - 5, Y - 5), makePoint(X + 5, Y + 5), "green");
			drawLine(ctx, makePoint(X - 5, Y + 5), makePoint(X + 5, Y - 5), "green");
		};

		var drawO = function(ctx, X, Y) {
			shadowStyle(ctx, 2, 2, 2, "black");
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.arc(X, Y, 5, 0, 2 * Math.PI, false);
			ctx.stroke();
		};

		var getIncrement = function(price) {
			var i = 0;
			while (price < BREAKPOINTS[i].bottom) {
				i += 1;
			}
			return BREAKPOINTS[i].increment;
		};

		var PnFCeil = function(price) {
			var increment = getIncrement(price);
			return Math.ceil(price / increment) * increment;
		};

		var PnFFloor = function(price) {
			var increment = getIncrement(price);
			return Math.floor(price / increment) * increment;
		};

		var trendDown = prices[1] - prices[0] < 0;
		var drawFunction = trendDown ? drawO : drawX;
		var bottomPrice = PnFCeil(prices[2]);
		var topPrice = PnFFloor(prices[3]);
		// This sets up the initial column of the chart.
		axisLeftOffset += 7.5;
		for (var i = diffRangeSum(PnFDiff(high, prices[3])), j = diffRangeSum(PnFDiff(high, bottomPrice)); i <= j; i += 1) {
			drawFunction(ctx, axisLeftOffset, i * 10 - 5);
		}
		for (var i = 4, l = prices.length; i < l; i += 2) {
			if (trendDown) {
				var newBottom = PnFCeil(prices[i]);
				if (newBottom < bottomPrice) {
					for (var j = diffRangeSum(PnFDiff(high, bottomPrice)) + 1, k = diffRangeSum(PnFDiff(high, newBottom)); j <= k; j += 1) {
						drawO(ctx, axisLeftOffset, j * 10 - 5);
					}
					bottomPrice = newBottom;
				} else if (diffRangeSum(PnFDiff(prices[i + 1], bottomPrice)) > 3) {
					axisLeftOffset += 10;
					for (var j = diffRangeSum(PnFDiff(high, PnFFloor(prices[i + 1]))), k = diffRangeSum(PnFDiff(high, bottomPrice)); j < k; j += 1) {
						drawX(ctx, axisLeftOffset, j * 10 - 5);
					}
					topPrice = PnFFloor(prices[i + 1]);
					bottomPrice = PnFCeil(prices[i]);
					trendDown = false;
				}
			} else {
				var newTop = PnFFloor(prices[i + 1]);
				if (newTop > topPrice) {
					for (var j = diffRangeSum(PnFDiff(high, newTop)), k = diffRangeSum(PnFDiff(high, topPrice)); j < k; j += 1) {
						drawX(ctx, axisLeftOffset, j * 10 - 5);
					}
					topPrice = newTop;
				} else if (diffRangeSum(PnFDiff(topPrice, PnFCeil(prices[i]))) > 3) {
					axisLeftOffset += 10;
					for (var j = diffRangeSum(PnFDiff(high, topPrice)) + 1, k = diffRangeSum(PnFDiff(high, PnFCeil(prices[i]))); j <= k; j += 1) {
						drawO(ctx, axisLeftOffset, j * 10 - 5);
					}
					topPrice = PnFFloor(prices[i + 1]);
					bottomPrice = PnFCeil(prices[i]);
					trendDown = true;
				}
			}
		}
	};
	var chartData = drawAxes(ctx);
	ctx.save();
	plotData(ctx, chartData[0], prices, chartData[1]);
	ctx.restore();
};

var getStockChart = function(){
	var tickerSymb = $("#testBox").val();
	$.ajax({
		url: "stock?" + tickerSymb,
		type: "POST",
		data: tickerSymb,
		success: function(data) {
			alert(data);
//			var priceRange = findRange(JSON.parse(data));
//			var chartHeight = Math.max(300, Math.min(30, diffRangeSum(PnFDiff(priceRange.high, priceRange.low))) * 10);
//			$("#chartContainer").remove();
//			$("#container").append("<div id='chartContainer'><br><div class='chartTitle'>" + tickerSymb.toUpperCase() + "</div>" +
//							"<canvas class='pnfChart' id='" + tickerSymb + "Chart' width='300' height='" + chartHeight + "'></canvas></div>");
//			$("#testBox").val("");
//			var canvas = $("#" + tickerSymb + "Chart")[0];
//			canvas.getContext && webkitRequestAnimationFrame(function() {
//				createChart(canvas.getContext("2d"), JSON.parse(data), priceRange, chartHeight);
//			});
		}
	});
};

$("#testBox").keyup(function(event) {
	event.keyCode === 13 && getStockChart();
});
