var Stock = Backbone.Model.extend({
  defaults: {
    symbol: "DIA",
    period: 365
  }
});


var PointandFigureCharts = Backbone.Collection.extend({
  model: Stock
});


var Portfolio = Backbone.View.extend({
  events: {
    // None for now.
  },

  initialize: function(){
    _.bindAll(this, 'render'); // fixes loss of context for 'this' within methods
    this.collection = new PointandFigureCharts();
    // $(this.el).append("<ul id='moo'> <li>hello world</li> </ul>");
    // $("html").append($(this.el));
    $("#container").append("<div class='chartTitle'>YHOO</div>");
    $("#container").append("<canvas id='canvas' width='300' height='300'></canvas>");
    $("#container").append("<canvas id='canvas2' width='200' height='200'></canvas>");
    $("#container").append("<canvas id='canvas3' width='200' height='200'></canvas>");
    this.render("canvas");
    // $("body").append("<canvas id='DOW30' height='300' width='300'></canvas>");
    // draw("DOW30");
    // $(function () {
    //   that.render(); // not all views are self-rendering. This one is.
    // });
  },

// render(): Function in charge of rendering the entire view in this.el. Needs to be manually called by the user.

  render: function(chartDesired){
    var rawStockData = null;


    var stockPricestoArray = function (rawStockData){
      var splitStockData = rawStockData.replace("\n", ",");
      return splitStockData.split(",").filter(function (val,key){
        return (key % 6) === 4;
      }).map(function (val, key){
        return parseFloat(val);
      });
    }

    var prices = stockPricestoArray(rawStockData).slice(1);
    var canvas = document.getElementById(chartDesired);
    // canvas.getContext && window.webkitRequestAnimationFrame(function (){ animateChart(canvas.getContext('2d'), 20, 5, -25, -55) });
    canvas.getContext && webkitRequestAnimationFrame(function (){ createChart(canvas.getContext("2d"), prices); });
  }

});
