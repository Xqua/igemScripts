

function heatmapChart(rawdata) {
    // console.log(rawdata)
    document.getElementById("chart").innerHTML = "";
    var data = [];
    var tmp = {};
    for (var i=0; i<rawdata.length; i++) {
      var day = rawdata[i].day;
      var hour = rawdata[i].hour;
      if (!tmp[day]) {
        tmp[day] = {}
      }
      if (!tmp[day][hour]) {
        tmp[day][hour] = 0
      }
      tmp[day][hour] += 1
    }
    // console.log("tmp", tmp)

    for (var day=0; day<7; day++) {
      for (var hour=0; hour<24; hour++) {
        var val = 0;
        if (tmp[day]) {
          if (tmp[day][hour]) {
            val = tmp[day][hour];
          }
        }
        data.push({
          day: day+1,
          hour: hour+1,
          value: val
        })
      }
    }

    // console.log("data",data);

    var margin = { top: 50, right: 0, bottom: 100, left: 30 },
        width = 550 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom,
        gridSize = Math.floor(width / 24),
        legendElementWidth = gridSize*2,
        buckets = 9,
        colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
        days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
        datasets = ["data.tsv", "data2.tsv"];

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // svg.selectAll("*").remove();

    var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
          .text(function (d) { return d; })
          .attr("x", 0)
          .attr("y", function (d, i) { return i * gridSize; })
          .style("text-anchor", "end")
          .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
          .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
          .text(function(d) { return d; })
          .attr("x", function(d, i) { return i * gridSize; })
          .attr("y", 0)
          .style("text-anchor", "middle")
          .attr("transform", "translate(" + gridSize / 2 + ", -6)")
          .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    // console.log(d3.max(data, function (d) { return d.value; }))
    // d3.tsv(tsvFile,
    // function(d) {
    //   return {
    //     day: +d.day,
    //     hour: +d.hour,
    //     value: +d.value
    //   };
    // },
    // function(error, data) {
    var datamax = d3.max(data, function (d) { return d.value; })
    var domains = [0];
    for (var i=buckets; i>0; i--) {
      domains.push(datamax/i);
    }
    // console.log("domains", domains)
      var colorScale = d3.scaleQuantile()
          .domain(domains)
          // .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
          .range(colors);
    // console.log(colorScale(55))
      var cards = svg.selectAll(".hour")
          .data(data, function(d) {return d.day+':'+d.hour;});

      cards.append("title");

      cards.enter().append("rect")
          .attr("x", function(d) { return (d.hour - 1) * gridSize; })
          .attr("y", function(d) { return (d.day - 1) * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", function(d) { return colorScale(d.value); });
          // .style("fill", colors[0]);

      cards.transition().duration(1000)
          .style("fill", function(d) { return colorScale(d.value); });

      cards.select("title").text(function(d) { return d.value; });

      cards.exit().remove();

      var legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) { return d; });

      legend.enter().append("g")
          .attr("class", "legend");

      legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i]; });

      legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height + gridSize);

      legend.exit().remove();

  }
