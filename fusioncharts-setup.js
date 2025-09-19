FusionCharts.ready(function() {
  // Original Pie Chart
  var pieChart = new FusionCharts({
    type: 'pie2d',
    renderAt: 'fusion-pie',
    width: '100%',
    height: '300',
    dataFormat: 'json',
    dataSource: {
      "chart": {
        "caption": "Restaurant Types",
        "theme": "fusion",
        "showPercentValues": "1",
        "decimals": "1",
        "useDataPlotColorForLabels": "1"
      },
      "data": [
        { "label": "Cafe", "value": "35" },
        { "label": "Casual Dining", "value": "40" },
        { "label": "Quick Bites", "value": "20" },
        { "label": "Fine Dining", "value": "5" }
      ]
    }
  });
  pieChart.render();
  
  // Stacked Bar Chart for Online Order vs Table Booking
  var stackedBarChart = new FusionCharts({
    type: 'stackedbar2d',
    renderAt: 'fusion-stack-bar',
    width: '100%',
    height: '300',
    dataFormat: 'json',
    dataSource: {
      "chart": {
        "caption": "Online Order vs. Table Booking Ratio",
        "subcaption": "By City",
        "xAxisName": "City",
        "yAxisName": "Count",
        "theme": "fusion",
        "legendPosition": "bottom",
        "showValues": "1",
        "showPercentValues": "0"
      },
      "categories": [{
        "category": [
          { "label": "Mumbai" },
          { "label": "Delhi" },
          { "label": "Bangalore" },
          { "label": "Hyderabad" },
          { "label": "Pune" }
        ]
      }],
      "dataset": [
        {
          "seriesname": "Online Order",
          "color": "#5D62B5",
          "data": [
            { "value": "2100" },
            { "value": "1800" },
            { "value": "2200" },
            { "value": "1400" },
            { "value": "900" }
          ]
        },
        {
          "seriesname": "Table Booking",
          "color": "#29C3BE",
          "data": [
            { "value": "1200" },
            { "value": "1400" },
            { "value": "1100" },
            { "value": "800" },
            { "value": "600" }
          ]
        }
      ]
    }
  });
  stackedBarChart.render();
  
  // 100% Stacked Bar Chart (showing percentage ratio)
  var stackedPercentBar = new FusionCharts({
    type: 'stackedbar100',
    renderAt: 'fusion-donut',
    width: '100%',
    height: '300',
    dataFormat: 'json',
    dataSource: {
      "chart": {
        "caption": "Online Order vs. Table Booking Ratio (%)",
        "subcaption": "By City",
        "xAxisName": "City",
        "showValues": "1",
        "showPercentValues": "1",
        "decimals": "1",
        "theme": "fusion",
        "legendPosition": "bottom"
      },
      "categories": [{
        "category": [
          { "label": "Mumbai" },
          { "label": "Delhi" },
          { "label": "Bangalore" },
          { "label": "Hyderabad" },
          { "label": "Pune" }
        ]
      }],
      "dataset": [
        {
          "seriesname": "Online Order",
          "color": "#5D62B5",
          "data": [
            { "value": "2100" },
            { "value": "1800" },
            { "value": "2200" },
            { "value": "1400" },
            { "value": "900" }
          ]
        },
        {
          "seriesname": "Table Booking",
          "color": "#29C3BE",
          "data": [
            { "value": "1200" },
            { "value": "1400" },
            { "value": "1100" },
            { "value": "800" },
            { "value": "600" }
          ]
        }
      ]
    }
  });
  stackedPercentBar.render();
});
