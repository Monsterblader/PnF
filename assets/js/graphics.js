// For reference:
// (function() {
//   var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
//                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
//   window.requestAnimationFrame = requestAnimationFrame;
// })();

// var animateChart = function (ctx, X, Y, Y2, Y3){
//   ctx.clearRect(0,0,300,300);
//   drawAxes(ctx);
//   ctx.save();
//   (Y === 145) || (Y += 10);
//   drawX(ctx, X, Y);
//   (Y2 === 135) || (Y2 += 10);
//   drawX(ctx, X, Y2);
//   (Y3 === 125) || (Y3 += 10);
//   drawX(ctx, X, Y3);
//   ((Y !== 145) || (Y2 !== 135) || (Y3 !== 125))
//     && window.webkitRequestAnimationFrame(function (){ animateChart(ctx, X, Y, Y2, Y3) });
//   drawO(ctx, 50, 150);
//   ctx.restore();
// }
var createChart = function (ctx, prices){
  // TODO rewrite findRange to incorporate true breakpoints for point-and-figure charting.
  var findRange = function (prices){
    var extremes = {high: prices[0], low: prices[0]};
    prices.forEach(function (val){
      (val > extremes.high) && (extremes.high = val);
      (val < extremes.low) && (extremes.low = val);
    });
    return extremes;
  };

  var priceRange = findRange(prices);

  var drawLine = function (ctx, startPoint, endPoint, lineColor){
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
  };

  var makePoint = function (X, Y){
    return {x: X, y: Y};
  };

  var drawAxes = function (ctx, top, bottom, scale){
    var labelAxis = function (ctx, priceRange){
      ctx.font = "12px Times New Roman";
      ctx.fillStyle = "Black";
      var high = Math.max(Math.floor(priceRange.high) + 1, 30);
      for (var i = high; i >= priceRange.low; i -= 1) {
        ctx.fillText(i, 1, (high - i + 1) * 10);
      }
    };

    ctx.clearRect(0,0,300,300);
    // This section taken from http://www.w3schools.com/tags/canvas_fillstyle.asp
    var my_gradient=ctx.createLinearGradient(0,0,0,150);
    var my_gradient = ctx.createLinearGradient(0, 0, 0, chartHeight / 2);
		my_gradient.addColorStop(0, "gray");
		my_gradient.addColorStop(1, "white");
		ctx.fillStyle = my_gradient;
		ctx.fillRect(0, 0, 300, chartHeight);
		// End section
		ctx.shadowColor = undefined;
		var axisLeftOffset = Math.max(16, (Math.floor(Math.log(priceRange.high) / Math.LN10) + 2) * 5) + 8;
		drawLine(ctx, makePoint(axisLeftOffset, 0), makePoint(axisLeftOffset, chartHeight), "black");
		labelAxis(ctx, priceRange);
	};


  var detectTrend = function (trend, prices, key){
    var delta = prices[key] - prices[key - 1];
    return trend ? delta >= 0 : delta > 0;
  };

  var drawCol = function (trend, prices, key, ctx, X, Y){
    var shadowStyle = function (ctx, offX, offY, blur, color){
      ctx.shadowOffsetX = offX;
      ctx.shadowOffsetY = offY;
      ctx.shadowBlur = blur;
      ctx.shadowColor = color;//rgba(0, 255, 0, 0.5)";
    };

    var drawX = function (ctx, X, Y){
      shadowStyle(ctx, 2, 2, 2, "black");
      drawLine(ctx, makePoint(X - 5, Y - 5), makePoint(X + 5, Y + 5), "green");
      drawLine(ctx, makePoint(X - 5, Y + 5), makePoint(X + 5, Y - 5), "green");
    };

    var drawO = function (ctx, X, Y){
      shadowStyle(ctx, 2, 2, 2, "black");
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.arc(X, Y, 5, 0, 2*Math.PI, false);
      ctx.stroke();
    };

    if (trend) {
      for (var plotIndex = prices[key - 1]; plotIndex <= prices[key]; plotIndex += 1)
        { drawX(ctx, X, Y -= 10); }
    } else {
      for (var plotIndex = prices[key - 1]; plotIndex >= prices[key]; plotIndex -= 1)
        { drawO(ctx, X, Y += 10); }
    }
    return Y;
  };

  // todo Y always starts in the center.  Need to write scale to left properly.
  var X = Math.max(32, (Math.floor(Math.log(priceRange.high) / Math.LN10) + 4) * 5 + 7),
					Y = (Math.max(Math.floor(priceRange.high), 30) - Math.floor(prices[0]) + 1) * 10 + 5;
	var trendUp = (prices[1] - prices[0]) >= 0;
	drawAxes(ctx);
	ctx.save();
	// Need to scale Y (prices[i]) according to price range.
	Y = drawCol(trendUp, prices, 1, ctx, X, Y);
	for (var i = 2; i < prices.length; i += 1) {
		if (trendUp !== detectTrend(trendUp, prices, i)) {
			X += 10;
			trendUp = !trendUp;
		}
		;
		Y = drawCol(trendUp, prices, i, ctx, X, Y);
	}
	;
  ctx.restore();
};
