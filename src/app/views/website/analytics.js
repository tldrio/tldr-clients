define([ 'jquery'
       , 'lib/environment'
       , 'd3'
       , 'underscoreString'
       ], function($, env, d3, _s) {


  /**
   * Constructor for a line chart
   */
  function LineChart (opts, data) {
    var width = opts.width || 250
      , height = opts.height || 80
      , padding = opts.padding || 50
      , thirtyDaysAgo = d3.time.day.offset(new Date(), -30)
      , yMax = d3.max(data, function (d) { return d.timeSaved; })
      , xMin = d3.min([thirtyDaysAgo, d3.time.day(d3.min(data, function (d) { return new Date(d.timestamp); }))])
      , xScale
      , yScale
      , xAxis
      , yAxis
      , line
      , tomorrow = d3.time.day.offset(new Date(), 1)
      , timeOrigin = opts.timeOrigin || xMin
      , container
      , chart
      , tooltip
      ;

    container = d3.select(opts.container);

    // Graph container
    chart = container
      .append('svg')
        .attr('class', 'line-chart')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + padding + ',' + padding + ')')
      ;

    // Define scales
    xScale = d3.time.scale()
         .domain([timeOrigin, tomorrow])
         .range([0, width - padding]);
    yScale = d3.scale.linear()
         .domain([0, yMax])
         .range([height - 2 * padding, 0]);

    // Define input to output functions
    function x (d) {
      return xScale(new Date(d.timestamp));
    }
    function y (d) {
      return yScale(d.timeSaved || 0);
    }

    // Define axes
    xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(d3.time.weeks, 1)
      .tickFormat(d3.time.format('%b %e'))
      .tickPadding(8)
      ;
    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(5)
      .tickPadding(8)
      ;

    // define ticks depending on size of time scale domain
    if ((tomorrow - timeOrigin) > 15469200000) { // 6 months
      xAxis.ticks(d3.time.months, 1).tickFormat(d3.time.format('%b %y'));
    }
    else if ((tomorrow - timeOrigin) > 2592000000) { // 30 days
      xAxis.ticks(d3.time.weeks, 2).tickFormat(d3.time.format('%b %e'));
    }
    else {
      xAxis.ticks(d3.time.weeks, 1).tickFormat(d3.time.format('%b %e'));
    }

    // create the line
    line = d3.svg.line()
             .x(x)
             .y(y)
             .interpolate('basis');

    // append line to chart
    chart.append('svg:path')
      .attr('d', line(data))
      .attr('stroke', '#ff9e5d')
      .attr('fill', 'none')
      .style('stroke-width', '3')
      ;

    //Add axes
    chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - 2 * padding) + ')')
      .call(xAxis)
      ;
    chart
      .append('g')
        .attr('class', 'axis')
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0-padding*3/2)
        .attr("y", -56)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Total hours")
      ;
  }


  /**
   * Get a deep copy of a time series (array of {x, y})
   */
  function getDeepCopy (data) {
    var res = [], i;

    for (i = 0; i < data.length; i += 1) {
      res.push({ timestamp: data[i].timestamp, timeSaved: data[i].timeSaved });
    }

    return res;
  }

  /**
   * Constructor for a bar chart
   */
  function BarChart (opts, data) {
    var width = opts.width || 250
      , height = opts.height || 80
      , padding = opts.padding || 50
      , tomorrow = d3.time.day.offset(new Date(), 1)
      , thirtyDaysAgo = d3.time.day.offset(new Date(), -30)
      , yMax = d3.max(data, function (d) { return d.timeSaved; })
      , xMin = d3.min([thirtyDaysAgo, d3.time.day(d3.min(data, function (d) { return new Date(d.timestamp); }))])
      , xScale
      , yScale
      , xAxis
      , yAxis
      , bars
      , timeOrigin = opts.timeOrigin || xMin
      , container
      , chart
      , tooltip
      ;

    container = d3.select(opts.container);

    chart = container
      .append('svg')
        .attr('class', 'bar-chart')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + padding + ',' + padding + ')')
      ;

    tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Define scales
    xScale = d3.time.scale()
         .domain([timeOrigin, tomorrow])
         .range([0, width - padding]);
    yScale = d3.scale.linear()
         .domain([0, yMax])
         .range([height - 2 * padding, 0]);

    // Define input to output functions
    function x (d) {
      return xScale(new Date(d.timestamp));
    }
    function y (d) {
      return yScale(d.timeSaved || 0);
    }

    // Define axes
    xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(d3.time.weeks, 1)
      .tickFormat(d3.time.format('%b %e'))
      .tickPadding(8)
      ;
    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(5)
      .tickPadding(8)
      ;

    // define ticks depending on size of time scale domain
    if ((tomorrow - timeOrigin) > 15469200000) { // 6 months
      xAxis.ticks(d3.time.months, 1).tickFormat(d3.time.format('%b %y'));
    }
    else if ((tomorrow - timeOrigin) > 2592000000) { // 30 days
      xAxis.ticks(d3.time.weeks, 2).tickFormat(d3.time.format('%b %e'));
    }
    else {
      //xAxis.ticks(d3.time.days, 2).tickFormat(d3.time.format('%b %e'));
      xAxis.ticks(d3.time.weeks, 1).tickFormat(d3.time.format('%b %e'));
    }

    // All bars begin at 0 height
    bars = chart.selectAll('rect').data(data);
    bars.enter().append('rect')
      .attr('x', x)
      .attr('y', y(0))
      .attr('width', (width - padding) / ((tomorrow - timeOrigin) / 86400000)) // band width is equal to container width divided by number of days in domain
      .attr('height', function (d) { return height - 2 * padding - y(0); });

    // Transition to actual height
    bars.transition().duration(1000)
      .attr('x', x)
      .attr('y', y)
      .attr('width', (width - padding) / ((tomorrow - timeOrigin) / 86400000)) // band width is equal to container width divided by number of days in domain
      .attr('height', function (d) { return height - 2 * padding - y(d); })
      ;

    //Add axes
    chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - 2 * padding) + ')')
      .call(xAxis)
      ;
    chart
      .append('g')
        .attr('class', 'axis')
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0-padding)
        .attr("y", -56)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Hours per day")
      ;

    // Attach tooltips
    bars.on('mouseover', function(d) {
            tooltip.style('opacity', 0.9);
            tooltip.html('<p>' + d3.time.format('%A, %B %e, %Y')(new Date(d.timestamp)) + '<br>Time saved: ' + _s.numberFormat(d.timeSaved) + ' hours</p>')
                .style('left', (d3.event.pageX - 28) + 'px')
                .style('top', (d3.event.pageY - 56) + 'px');
            })
        .on('mouseout', function(d) {
            tooltip.style('opacity', 0);
        })
        ;
  }


  /**
   * compute time saved
   */
  function computeTimeSaved (wordCount) {
    // 5 words per second, returns in hours
    // very simple for now
    return wordCount / (3.3 * 3600) || 0;
  }

  /**
   * Create the charts
   */
  function analytics () {
    var dataAllTime = $('#all-the-user-data').data('analytics')
      , dataPast30Days
      , linechartData
      , thirtyDaysAgo = d3.time.day.offset(new Date(), -30)
      , tomorrow = d3.time.day.offset(new Date(), 1)
      , barchartPast30Days
      , barchartAllTime
      , barchartDataAllTime
      , linechartAllTime
      ;

      // Get tomorrow up to a day's resolution
      tomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

      // convert wordcount in timesave
      dataAllTime.map(function (d, i, arr) {
        d.timeSaved = computeTimeSaved(d.articleWordCount);
      });

      dataPast30Days = dataAllTime.filter(function (d, i , arr) {
        if (d3.time.day(new Date(d.timestamp)) > thirtyDaysAgo) {
          return true;
        }
      });

      if (dataPast30Days.length > 0) { barchartPast30Days = new BarChart({ container: '#bar-chart-past30Days', width: 800, height: 400, padding: 70, timeOrigin: thirtyDaysAgo }, dataPast30Days); }
      barchartAllTime = new BarChart({ container: '#bar-chart-allTime', width: 800, height: 400, padding: 70 }, dataAllTime);

      linechartData = getDeepCopy(dataAllTime);
      linechartData.push({ timestamp: tomorrow, timeSaved: 0 });   // Make sure the line chart goes all the way to the right of the graph
      // aggregate data to get cumulative values
      linechartData.map(function (d, i, arr) {
        if (i>0) {
          d.timeSaved = d.timeSaved + arr[i-1].timeSaved;
        }
      });
      // start at 0 for prettiness
      linechartData.unshift({ timestamp: d3.time.day.offset(new Date(linechartData[0].timestamp), -1), timeSaved: 0 });
      linechartAllTime = new LineChart({ container: '#line-chart-allTime', width: 800, height: 400, padding: 70 }, linechartData);
  }

  return analytics;
});

