var colors = ["red", "green", "blue", "orange", "teal", "brown"];
var data = [];
var timestamps = [];
var paths = [];
var cols = [];
var readyForData = false;
var table = $("#graph").attr("table");

var duration = 10000;
var margins = {top: 20, right: 20, bottom: 30, left: 50}
var bb = document.querySelector('#graph').getBoundingClientRect();
var width = bb.right - bb.left;
var height = 500;

var svg = d3.select('#graph')
  .append('svg')
  .attr('class', 'chart')
  .attr('width', width)
  .attr('height', height)
  .attr('style', "display: block; margin: auto;");

/* make an interpolating function for x data */
var x = d3.scaleTime()
  .range([margins.left, width - margins.right]);

/* make an interpolating function for y data */
var y = d3.scaleLinear()
  .range([height - margins.top, margins.bottom]);

/* add a graphic element, the x-axis */
var xAxis = svg.append('g')
  .attr('class', 'x_axis')
  .attr('transform', 'translate(0,' + (height - margins.bottom + 10) + ')')
  .call(d3.axisBottom(x));

/* add a graphic element, the y-axis */
var yAxis = svg.append('g')
  .attr('class', 'y_axis')
  .attr('transform', 'translate(' + (margins.left) + ',0)')
  .call(d3.axisLeft(y));

var lineFunc = d3.line()
  .x(function(d, i) {
    return x(timestamps[i]);
  })
  .y(function(d) {
    return y(d);
  });

var ordinal = null;

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(" + (20 + margins.left) + ",20)");

var legend = null;

var last_retrieved = null;


function update_duration() {
    var input = document.getElementById("userInputDuration").value;
    var new_duration = parseInt(input);
    if(new_duration){
      duration = new_duration * 1000
    }
    else{
      alert("Not a valid duration");
    }
}

function update_graph(){
  time = (new Date).getTime();
  x.domain([time - duration, time]);  //TODO: ease instead of constantly redrawing to improve performance
  var flat_data = [].concat.apply([], data);
  y.domain(d3.extent(flat_data, function(d) { return Math.max(d); }));

  xAxis.call(d3.axisBottom(x));
  yAxis.call(d3.axisLeft(y));

  for(var i = 0; i < cols.length; i++){
    if(data[i]){
      paths[i].attr('d', lineFunc(data[i]));
    }
  }
}

//fetch the database info before attempting to fetch data
var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", "/data.php?table=" + table + "&mode=info", true);
xmlHttp.onreadystatechange = function() { 
  if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    last_retrieved = parseInt(xmlHttp.responseText.split("\n")[0]);
    cols = xmlHttp.responseText.split("\n").slice(4);
    for(var i = 0; i < cols.length; i++){
      paths.push(svg.append('path')
                      .attr('class', 'line')
                      .attr('stroke', colors[i])
                      .attr('stroke-width', 1)
                      .attr('fill', 'none'));
      data.push([]);
    }

    //create the legend
    ordinal = d3.scaleOrdinal()
      .domain(cols)
      .range(colors.slice(0, cols.length));
    legend = d3.legendColor()
      .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
      .shapePadding(10)
      //use cellFilter to hide the "e" cell
      .cellFilter(function(d){ return d.label !== "e" })
      .scale(ordinal);
    svg.select(".legendOrdinal")
       .call(legend);
    //start updating the graph
    setInterval(update_graph, 25);
    readyForData = true;
  }}
xmlHttp.send();

setInterval(function() {
  if(readyForData){
    readyForData = false
    var xmlHttp = new XMLHttpRequest();
    /* address root of the server '/', pass arguments */
    xmlHttp.open("GET", "/data.php?table=" + table + "&mode=since&id=" + last_retrieved, true);
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        /* update the graph with the data */
        var txt = xmlHttp.responseText;
        console.log(txt);
        var lines = txt.split("\n");

        lines.forEach(function(line) {
          if(line != ""){
            var values = line.split(",");
            timestamps.push(values[1] * 1000);
            last_retrieved = Math.max(last_retrieved, parseInt(values[0]));
            for (var i = 0; i < cols.length; i++){
              data[i].push(parseFloat(values[i + 3]));
            }
          }
        });

        //remove old timestamps
        var time_cutoff = (new Date).getTime() - duration;
        var index = timestamps.findIndex(function (d) { return d > time_cutoff});
        if(index == -1){
          timestamps = [];
          data = []
          for(var i = 0; i < cols.length; i++){
            data.push([]);
          }
        }
        else if(index > 0){
          timestamps = timestamps.slice(index - 1);
          data = data.map(function (d) {return d.slice(index - 1);});
        }

        readyForData = true;
      }
    }
    xmlHttp.send();
  }
}, 100); // update every 100 ms
