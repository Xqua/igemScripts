

function monadicView(data) {
  var margin = {top: 75, right: 150, bottom: 25, left: 25},
      width = 960 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  var svg = d3.select("#pannel1")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yScaleSource = d3.scaleLinear()
    .range([0,height/2]);

  var yScaleTarget = d3.scaleLinear()
    .range([height,height/2]);

  var personScale = d3.scalePoint()
    .range([margin.left,width]);

  var personCircleScale = d3.scaleLinear()
    .range([3,40]);

  var pageScale = d3.scalePoint()
    .range([margin.left,width]);

  var pageCircleScale = d3.scaleLinear()
    .range([2,20]);

  var contributionScale = d3.scaleLinear()
    .range([margin.left,width]);

  var contributionRectScale = d3.scaleLinear()
    .range([3,20]);
  svg.selectAll("*").remove();
  filteredData = data.sort(function(a,b) { return a.date - b.date; });

  var nestedPersonData = d3.nest()
      .key(function(d) { return d.userid; })
      .rollup()
      .entries(filteredData);

  var nestedPageData = d3.nest()
      .key(function(d) { return d.page; })
      .rollup()
      .entries(filteredData);

  contributionRectScale.domain(d3.extent(filteredData, function(d) { return +d.bytesize }));

  personCircleScale.domain([0,d3.max(nestedPersonData, function(d) { return d.values.length })]);

  pageCircleScale.domain([0,d3.max(nestedPageData, function(d) { return d.values.length })]);

  personScale.domain(nestedPersonData.map(function(d) { return d.key; }));

  pageScale.domain(nestedPageData.map(function(d) { return d.key; }));

  contributionScale.domain([0,filteredData.length]);

  var transition = svg.transition().duration(0),
    delay = function(d, i) { return i*8; };

  svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .style('fill', '#fff')
      .on('click', backgroundClick)

  var personLine = svg.selectAll(".personLine")
    .data(filteredData);

  personLine
    .enter()
    .append('line')
    .attr('class', function(d) { return 'personLine p'+d.pageid+' u'+d.userid_simple; })
    .attr('x1', function(d,i) { return personScale(d.userid); })
    .attr('y1', 100 )
    .attr('x2', function(d,i) { return contributionScale(i); })
    .attr('y2', height/2 )
    .style('stroke-opacity', 0)
    .style('fill', 'none')
    .style('stroke', 'red')
    .transition()
    .delay(delay)
    .style('stroke-opacity', 0.5)


  var pageLine = svg.selectAll(".pageLine")
    .data(filteredData);

  pageLine
    .enter()
    .append('line')
    .attr('class', function(d) { return 'pageLine p'+d.pageid+' u'+d.userid_simple; })
    .attr('x1', function(d,i) { return pageScale(d.page); })
    .attr('y1', height-100 )
    .attr('x2', function(d,i) { return contributionScale(i); })
    .attr('y2', height/2 )
    .style('stroke-opacity', 0)
    .style('fill', 'none')
    .style('stroke', 'red')
    .transition()
    .delay(delay)
    .style('stroke-opacity', 0.5)

  var personCircle = svg.selectAll(".personCircle")
    .data(nestedPersonData);

  personCircle
    .enter()
    .append('circle')
    .attr('class', function(d) { return 'personCircle u'+d.values[0].userid_simple; })
    .attr('cx', function(d,i) { return personScale(d.key); })
    .attr('cy', 100 )
    .attr('r', function(d) { return personCircleScale(d.values.length); })
    .style('fill', 'rgba(0,0,0,0)')
    .style('stroke', '#000')
    .on('mouseover', personMouseover)
    .on('mouseout', mouseOut)
    .on('click', mouseClick)

  var pageCircle = svg.selectAll(".pageCircle")
    .data(nestedPageData);

  pageCircle
    .enter()
    .append('circle')
    .attr('class', function(d) { return 'pageCircle p'+d.values[0].pageid; })
    .attr('cx', function(d,i) { return pageScale(d.key); })
    .attr('cy', height-100 )
    .attr('r', function(d) { return pageCircleScale(d.values.length); })
    .style('fill', 'rgba(0,0,0,0)')
    .style('stroke', '#000')
    .on('mouseover', pageMouseover)
    .on('mouseout', mouseOut)
    .on('click', mouseClick)

  function personMouseover() {
      svg.append('text')
        .attr('class', 'hoverText')
        .attr('x', width/2)
        .attr('y', 20)
        .text(this.__data__.values[0].userid)
  }
  function pageMouseover() {
      svg.append('text')
        .attr('class', 'hoverText')
        .attr('x', width/2)
        .attr('y', 20)
        .text(this.__data__.values[0].page)
  }
  function mouseOut() {
    d3.selectAll('.hoverText').remove();
  }
  function mouseClick() {
    var selectionID = this.classList[1];
    svg.selectAll('.personCircle').attr('opacity', .1);
    svg.selectAll('.pageCircle').attr('opacity', .1);
    // svg.selectAll('.contributionRect').attr('opacity', .1);
    svg.selectAll('line').attr('opacity', .05);

    svg.selectAll('.'+selectionID).attr('opacity', 1);
  }
  function backgroundClick() {
    svg.selectAll('.personCircle').attr('opacity', 1);
    svg.selectAll('.pageCircle').attr('opacity', 1);
    svg.selectAll('line').attr('opacity', .5);
  }

}
