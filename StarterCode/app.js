var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 30,
  right: 40,
  bottom: 200,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

function xScale(healthData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(healthData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}


function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}


function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderTexts(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}


function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty :";
  }
  else if (chosenXAxis === "age") {
    var label = "Age :";
  }
  else {
    var label = "Income :";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity :";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes :";
  }
  else {
    var ylabel = "Health Care :";
  }

  
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


d3.csv("./assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);



  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);


  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);


  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");


    var textsGroup = chartGroup.selectAll(".stateText")
        .data(healthData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dx", -8)
        .attr("dy", 3)
        .attr("font-size", "10px")
        .attr("fill", "pink")
        .text(function(d) { return d.abbr });

  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("age (median)");

    var incomesLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Income (median)");
  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

      var obesityLabel = yLabelsGroup.append("text")
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 80)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obesity (%)");

      var smokesLabel = yLabelsGroup.append("text")
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (median)");

      var healthcareLabel = yLabelsGroup.append("text")
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("healthcare (median)");

  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    d3.selectAll("text").on("click", function()
    {
      var value = d3.select(this).attr("value");

        if (value === "poverty") {
        chosenXAxis = value;

      xLinearScale = xScale(healthData, chosenXAxis);


      xAxis = renderXAxes(xLinearScale, xAxis);

          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (value === "age"){
        chosenXAxis = value;
      xLinearScale = xScale(healthData, chosenXAxis);

      xAxis = renderXAxes(xLinearScale, xAxis);

          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (value === "income"){
        chosenXAxis = value;

      xLinearScale = xScale(healthData, chosenXAxis);

      xAxis = renderXAxes(xLinearScale, xAxis);

          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomesLabel
            .classed("active", true)
            .classed("inactive", false);
        } 
        else if (value === "obesity") {
        chosenYAxis = value;

      yLinearScale = yScale(healthData, chosenYAxis);

      yAxis = renderYAxes(yLinearScale, yAxis);

          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (value === "smokes"){

        chosenYAxis = value;


      yLinearScale = yScale(healthData, chosenYAxis);

      yAxis = renderYAxes(yLinearScale, yAxis);

          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (value === "healthcare"){
 
        chosenYAxis = value;

      yLinearScale = yScale(healthData, chosenYAxis);

      yAxis = renderYAxes(yLinearScale, yAxis);

          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    });
}).catch(function(error) {
  console.log(error);
});