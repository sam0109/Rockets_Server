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
var offsets = [];
var scales = [];
var time_delay = 0;
var column_mask = [];
var line_infos = [];

var line_info_container = d3.select('#line_info');
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

$('#update_values').on('click', function (event) {
  table = parseInt(document.getElementById("input_data").value);
  duration = parseInt(document.getElementById("input_duration").value) * 1000;
  time_delay = parseFloat(document.getElementById("input_time_delay").value) * 1000;
  for(var i = 0; i < cols.length; i++){
    column_mask[i] = !($('#' + cols[i] + "_enabled").hasClass("active"));
    offsets[i]= parseFloat(document.getElementById(cols[i] + "_offset").value);
    scales[i] = parseFloat(document.getElementById(cols[i] + "_scale").value);
  }  
});

function update_graph(){
  time = (new Date).getTime();
  x.domain([time - duration + time_delay, time + time_delay]);
  var flat_data = [];
  for(var i = 0; i < cols.length; i++){
    if(column_mask[i]){
      flat_data = flat_data.concat(data[i].map(function (d) { return (d * scales[i]) + offsets[i] }));
    }
  }

  var dom = [0, 0];
  if(flat_data.length > 0){
    dom = d3.extent(flat_data);
  }
  y.domain(dom);

  xAxis.call(d3.axisBottom(x));
  yAxis.call(d3.axisLeft(y));

  for(var i = 0; i < cols.length; i++){
    if(data[i] && column_mask[i]){
      paths[i].attr('d', lineFunc(data[i].map(function (d) { return (d * scales[i]) + offsets[i] })));
    }
    if(!column_mask[i]){
      paths[i].attr('d', '');
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
      line_infos.push(line_info_container.append('div')
        .attr("class", "row")
        .append('div'));
      line_infos[i].append("div")        //note: active means disabled!
          .attr("class", "col-md-1")
            .append("button")
            .attr("id", cols[i] + "_enabled")
            .attr("type", "button")
            .attr("class", "btn btn-secondary btn-toggle")
            .attr("data-toggle", "button")
            .attr("autocomplete", "off")
            .style("background-color", colors[i])
            .text(cols[i]);
      var input_group_offset = line_infos[i].append("div")
        .attr("class", "col-md-2")
          .append("div")
          .attr("class", "input-group")
      input_group_offset.append("span")
          .attr("class", "input-group-addon")
          .text("Data Offset: ");
      input_group_offset.append("input")
          .attr("type", "text")
          .attr("id", cols[i] + "_offset")
          .attr("class", "form-control")
          .attr("value", 0);
      var input_group_scale = line_infos[i].append("div")
        .attr("class", "col-md-2")
          .append("div")
          .attr("class", "input-group")
      input_group_scale.append("span")
          .attr("class", "input-group-addon")
          .text("Data Scale: ");
      input_group_scale.append("input")
          .attr("type", "text")
          .attr("id", cols[i] + "_scale")
          .attr("class", "form-control")
          .attr("value", 1);
      column_mask.push(true);
      offsets.push(0);
      scales.push(1);     
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
        var time_cutoff = (new Date).getTime() - duration + time_delay;
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
