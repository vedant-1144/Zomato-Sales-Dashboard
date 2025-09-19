const data = [
  { city: 'Mumbai', sales: 20000 },
  { city: 'Delhi', sales: 15000 },
  { city: 'Bangalore', sales: 12000 },
  { city: 'Chennai', sales: 10000 }
];

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // First display fallback data to ensure something appears
    useSampleData();
    
    // Then try to load the actual data
    loadZomatoData();
    
    // Set up navigation active state
    setupNavigation();
});

// Load and process Zomato CSV data
function loadZomatoData() {
    console.log("Attempting to load Zomato data...");
    
    // Try to load the CSV file
    d3.csv("data/zomato.csv")
        .then(function(data) {
            console.log("CSV data loaded successfully:", data.length, "records");
            
            if (!data || data.length === 0) {
                console.warn("CSV loaded but no data found");
                return; // Keep using the sample data
            }
            
            // Check data structure
            console.log("First record:", data[0]);
            
            // Process and render all charts with real data
            const salesByCity = processSalesByCity(data);
            renderD3BarChart(salesByCity);
            
            const orderingData = processOrderingData(data);
            initializeFusionCharts(orderingData);
            
            const locationData = processLocationData(data);
            renderLocationMap(locationData);
            
            const restaurantTypeData = processRestaurantTypes(data);
            renderRestaurantTypePie(restaurantTypeData);
            
            const cuisineData = processCuisineTypes(data);
            renderCuisineChart(cuisineData);
            
            // Update summary metrics
            updateSummaryMetrics(data);
        })
        .catch(function(error) {
            console.error("Error loading CSV file:", error);
            // We're already using sample data from initial load
        });
}

// Process data for sales by city visualization
function processSalesByCity(data) {
    console.log("Processing sales by city...");
    
    try {
        // Group data by location
        const cityGroups = d3.group(data, d => d.location || "Unknown");
        
        let salesByCity = Array.from(cityGroups, ([city, restaurants]) => {
            // Parse cost field with error handling
            const totalSales = d3.sum(restaurants, d => {
                const costField = d['approx_cost(for two people)'];
                const cost = parseFloat(costField);
                return isNaN(cost) ? 0 : cost;
            });
            
            return { city, sales: totalSales };
        });
        
        // Sort by sales and take top 5
        salesByCity.sort((a, b) => b.sales - a.sales);
        console.log("Processed sales by city:", salesByCity.slice(0, 5));
        return salesByCity.slice(0, 5);
    } catch (error) {
        console.error("Error processing sales by city:", error);
        return [
            { city: 'Mumbai', sales: 20000 },
            { city: 'Delhi', sales: 15000 },
            { city: 'Bangalore', sales: 12000 },
            { city: 'Chennai', sales: 10000 },
            { city: 'Hyderabad', sales: 8000 }
        ];
    }
}

// Process data for location map visualization
function processLocationData(data) {
    try {
        // India state codes for FusionCharts
        const stateMapping = {
            'Delhi': '001',
            'Maharashtra': '027', // Mumbai, Pune
            'Karnataka': '017', // Bangalore
            'Tamil Nadu': '031', // Chennai
            'Telangana': '007', // Hyderabad
            // Add more state mappings as needed
        };
        
        // City to state mapping
        const cityToState = {
            'New Delhi': 'Delhi',
            'Delhi': 'Delhi',
            'Mumbai': 'Maharashtra',
            'Pune': 'Maharashtra',
            'Bangalore': 'Karnataka',
            'Chennai': 'Tamil Nadu',
            'Hyderabad': 'Telangana',
            // Add more cities as needed
        };
        
        // Count restaurants by state
        const stateCounts = {};
        
        data.forEach(restaurant => {
            // Try to match city to state
            let location = restaurant.location || "";
            let city = location.trim();
            let state = cityToState[city] || "Unknown";
            
            // If we have a state mapping, add to count
            if (state !== "Unknown") {
                stateCounts[state] = (stateCounts[state] || 0) + 1;
            }
        });
        
        // Format for FusionCharts map
        let mapData = [];
        for (const [state, count] of Object.entries(stateCounts)) {
            const id = stateMapping[state];
            if (id) {
                mapData.push({
                    "id": id,
                    "value": count,
                    "showLabel": "1",
                    "displayValue": `${state}: ${count}`
                });
            }
        }
        
        return mapData;
        
    } catch (error) {
        console.error("Error processing location data:", error);
        // Return sample data
        return [
            { "id": "001", "value": "350", "showLabel": "1" }, // Delhi
            { "id": "027", "value": "450", "showLabel": "1" }, // Maharashtra
            { "id": "017", "value": "250", "showLabel": "1" }, // Karnataka
            { "id": "031", "value": "180", "showLabel": "1" }, // Tamil Nadu
            { "id": "007", "value": "200", "showLabel": "1" }  // Telangana
        ];
    }
}

// Process data for restaurant types visualization
function processRestaurantTypes(data) {
    try {
        // Count restaurant types
        const typeCounts = {};
        
        data.forEach(restaurant => {
            let types = (restaurant.rest_type || "").split(",");
            
            types.forEach(type => {
                const cleanType = type.trim();
                if (cleanType) {
                    typeCounts[cleanType] = (typeCounts[cleanType] || 0) + 1;
                }
            });
        });
        
        // Convert to array and sort by count
        let typeData = Object.entries(typeCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 types
            
        return typeData;
        
    } catch (error) {
        console.error("Error processing restaurant types:", error);
        return [
            { type: "Casual Dining", count: 450 },
            { type: "Café", count: 350 },
            { type: "Quick Bites", count: 300 },
            { type: "Fine Dining", count: 150 },
            { type: "Food Court", count: 120 }
        ];
    }
}

// Process data for cuisine types chart
function processCuisineTypes(data) {
    try {
        // Count cuisine types
        const cuisineCounts = {};
        
        data.forEach(restaurant => {
            let cuisines = (restaurant.cuisines || "").split(",");
            
            cuisines.forEach(cuisine => {
                const cleanCuisine = cuisine.trim();
                if (cleanCuisine) {
                    cuisineCounts[cleanCuisine] = (cuisineCounts[cleanCuisine] || 0) + 1;
                }
            });
        });
        
        // Convert to array and sort by count
        let cuisineData = Object.entries(cuisineCounts)
            .map(([cuisine, count]) => ({ cuisine, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 cuisines
            
        return cuisineData;
        
    } catch (error) {
        console.error("Error processing cuisine types:", error);
        return [
            { cuisine: "North Indian", count: 380 },
            { cuisine: "Chinese", count: 320 },
            { cuisine: "South Indian", count: 280 },
            { cuisine: "Italian", count: 220 },
            { cuisine: "Continental", count: 180 }
        ];
    }
}

// Process data for online ordering vs table booking visualizations
function processOrderingData(data) {
    // Get counts by city for online ordering and table booking
    const cityGroups = d3.group(data, d => d.location || "Unknown");
    
    let orderingData = {
        cities: [],
        onlineOrdering: [],
        tableBooking: []
    };
    
    // Process data for each city
    cityGroups.forEach((restaurants, city) => {
        const onlineCount = restaurants.filter(d => d.online_order === "Yes").length;
        const tableCount = restaurants.filter(d => d.book_table === "Yes").length;
        
        // Only include cities with some data
        if (onlineCount > 0 || tableCount > 0) {
            orderingData.cities.push(city);
            orderingData.onlineOrdering.push(onlineCount);
            orderingData.tableBooking.push(tableCount);
        }
    });
    
    // Calculate totals for summary
    orderingData.totalOnline = d3.sum(orderingData.onlineOrdering);
    orderingData.totalTable = d3.sum(orderingData.tableBooking);
    
    // Get top 5 cities by total orders
    if (orderingData.cities.length > 5) {
        const cityTotals = orderingData.cities.map((city, i) => ({
            city: city,
            total: orderingData.onlineOrdering[i] + orderingData.tableBooking[i]
        }));
        
        cityTotals.sort((a, b) => b.total - a.total);
        const top5Cities = cityTotals.slice(0, 5).map(item => item.city);
        
        // Filter data to include only top 5 cities
        const newData = {
            cities: [],
            onlineOrdering: [],
            tableBooking: [],
            totalOnline: orderingData.totalOnline,
            totalTable: orderingData.totalTable
        };
        
        for (let i = 0; i < orderingData.cities.length; i++) {
            if (top5Cities.includes(orderingData.cities[i])) {
                newData.cities.push(orderingData.cities[i]);
                newData.onlineOrdering.push(orderingData.onlineOrdering[i]);
                newData.tableBooking.push(orderingData.tableBooking[i]);
            }
        }
        
        orderingData = newData;
    }
    
    return orderingData;
}

// Update summary metrics at the top of the dashboard
function updateSummaryMetrics(data) {
    // Calculate total sales
    const totalSales = d3.sum(data, d => {
        const costField = d['approx_cost(for two people)'];
        return parseFloat(costField) || 0;
    });
    
    document.querySelector(".summary-card:nth-child(1) .number").textContent = 
        "₹" + totalSales.toLocaleString();
    
    // Count online orders
    const onlineOrders = data.filter(d => d.online_order === "Yes").length;
    document.querySelector(".summary-card:nth-child(2) .number").textContent = 
        onlineOrders.toLocaleString();
    
    // Count table bookings
    const tableBookings = data.filter(d => d.book_table === "Yes").length;
    document.querySelector(".summary-card:nth-child(3) .number").textContent = 
        tableBookings.toLocaleString();
    
    // Count unique cities
    const uniqueCities = new Set(data.map(d => d.location)).size;
    document.querySelector(".summary-card:nth-child(4) .number").textContent = 
        uniqueCities.toLocaleString();
}

// D3.js Bar Chart for City Sales
function renderD3BarChart(data) {
    // Check if the chart container exists
    const container = document.getElementById('d3-bar-chart');
    if (!container) return;
    
    console.log("Rendering D3 bar chart with data:", data);
    
    // Clear any existing chart
    d3.select("#d3-bar-chart").html("");
    
    // Chart dimensions
    const width = 600, height = 350, margin = 40;
    
    // Create SVG container
    const svg = d3.select("#d3-bar-chart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Create scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.city))
        .range([margin, width - margin])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.sales)])
        .range([height-margin, margin]);

    // Create axes
    svg.append("g")
        .attr("transform", `translate(0,${height-margin})`)
        .call(d3.axisBottom(x))
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-25)"); // Rotate labels for better fit

    svg.append("g")
        .attr("transform", `translate(${margin},0)`)
        .call(d3.axisLeft(y));

    // Create and style bars
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.city))
        .attr("y", d => y(d.sales))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin - y(d.sales))
        .attr("fill", "#CB202D")
        .attr("rx", 3)
        .attr("ry", 3)
        .on("mouseover", function() {
            d3.select(this)
                .attr("fill", "#E23744");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("fill", "#CB202D");
        });
    
    // Add city sales labels
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .text(d => `₹${d.sales.toLocaleString()}`)
        .attr("x", d => x(d.city) + x.bandwidth()/2)
        .attr("y", d => y(d.sales) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#333");
}

// Render location map using FusionCharts
function renderLocationMap(data) {
    if (typeof FusionCharts === 'undefined') return;
    
    const container = document.getElementById('location-map-container');
    if (!container) return;
    
    console.log("Rendering location map with data:", data);
    
    FusionCharts.ready(function() {
        var mapChart = new FusionCharts({
            type: 'india',
            renderAt: 'location-map-container',
            width: '100%',
            height: '400',
            dataFormat: 'json',
            dataSource: {
                "chart": {
                    "caption": "Restaurant Distribution Across India",
                    "subcaption": "Based on location data",
                    "includevalueinlabels": "1",
                    "labelsepchar": ": ",
                    "entityFillHoverColor": "#FFF9C4",
                    "theme": "fusion"
                },
                "colorrange": {
                    "minvalue": "0",
                    "startlabel": "Low",
                    "endlabel": "High",
                    "code": "#e6ebf8",
                    "gradient": "1",
                    "color": [
                        {
                            "maxvalue": "150",
                            "displayvalue": "Low",
                            "code": "#c7d6f5"
                        },
                        {
                            "maxvalue": "300",
                            "displayvalue": "Medium",
                            "code": "#96b2e8"
                        },
                        {
                            "maxvalue": "500",
                            "displayvalue": "High",
                            "code": "#5d87d0"
                        }
                    ]
                },
                "data": data
            }
        });
        
        mapChart.render();
    });
}

// D3.js Pie Chart for Restaurant Types
function renderRestaurantTypePie(data) {
    const container = document.getElementById('restaurant-type-pie');
    if (!container) return;
    
    console.log("Rendering restaurant type pie with data:", data);
    
    // Clear any existing chart
    d3.select("#restaurant-type-pie").html("");
    
    // Chart dimensions
    const width = 500, height = 320, margin = 40;
    
    // Radius calculation
    const radius = Math.min(width, height) / 2 - margin;
    
    // Create SVG container
    const svg = d3.select("#restaurant-type-pie")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    // Color scale - Zomato themed colors
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.type))
        .range(["#CB202D", "#E23744", "#F54D5D", "#FF6B7A", "#FF8A94", "#FFB3BA", "#D4426E", "#B8425C", "#A03C4F", "#8B3547"]);

    // Pie generator
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    // Arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.4) // For donut chart effect
        .outerRadius(radius);
    
    // Add arcs / slices
    const slices = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    slices.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.type))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", function() {
            d3.select(this)
                .style("opacity", 1)
                .attr("stroke", "#333");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.8)
                .attr("stroke", "white");
        });

    // Add labels
    const arcLabel = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.7);
        
    slices.append("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => {
            // Only show label if segment is big enough
            const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
            if (percent < 5) return ""; // Skip small segments
            return d.data.type;
        })
        .style("font-size", "10px")
        .style("fill", "#333");
    
    // Add center text
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0em")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Restaurant");
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.2em")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Types");
    
    // Add legend
    const legendContainer = d3.select("#restaurant-type-pie")
        .append("div")
        .attr("class", "legend-container")
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center")
        .style("margin-top", "20px");
    
    data.forEach((d, i) => {
        const legendItem = legendContainer.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-right", "15px")
            .style("margin-bottom", "8px");
            
        legendItem.append("div")
            .style("width", "12px")
            .style("height", "12px")
            .style("background-color", color(d.type))
            .style("margin-right", "5px");
            
        legendItem.append("div")
            .text(`${d.type} (${d.count})`)
            .style("font-size", "12px");
    });
}

// FusionCharts for Cuisine Types
function renderCuisineChart(data) {
    if (typeof FusionCharts === 'undefined') return;
    
    const container = document.getElementById('cuisine-type-chart');
    if (!container) return;
    
    console.log("Rendering cuisine chart with data:", data);
    
    FusionCharts.ready(function() {
        var cuisineChart = new FusionCharts({
            type: 'bar2d',
            renderAt: 'cuisine-type-chart',
            width: '100%',
            height: '320',
            dataFormat: 'json',
            dataSource: {
                "chart": {
                    "caption": "Top Cuisine Types",
                    "yAxisName": "Number of Restaurants",
                    "theme": "fusion",
                    "paletteColors": "#5D87D0,#7CB5EC,#90ED7D,#F7A35C,#8085E9",
                    "showValues": "1",
                    "showLabels": "1",
                    "rotateLabels": "1",
                    "slantLabels": "1",
                    "labelDisplay": "rotate",
                    "baseFont": "Helvetica Neue,Arial",
                    "showToolTip": "1"
                },
                "data": data.map(item => ({
                    "label": item.cuisine,
                    "value": item.count
                }))
            }
        });
        
        cuisineChart.render();
    });
}

// FusionCharts for Online vs Table Booking visualizations
function initializeFusionCharts(orderingData) {
    if (typeof FusionCharts === 'undefined') return;
    
    FusionCharts.ready(function() {
        // Stacked Bar Chart
        var stackedBarChart = new FusionCharts({
            type: 'stackedbar2d',
            renderAt: 'stacked-bar-container',
            width: '100%',
            height: '350',
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
                    "showPercentValues": "0",
                    "decimals": "1",
                    "toolTipBorderColor": "#666666",
                    "toolTipBgColor": "#efefef",
                    "showToolTipShadow": "1"
                },
                "categories": [{
                    "category": orderingData.cities.map(city => ({"label": city}))
                }],
                "dataset": [
                    {
                        "seriesname": "Online Order",
                        "color": "#CB202D",
                        "data": orderingData.onlineOrdering.map(value => ({"value": value.toString()}))
                    },
                    {
                        "seriesname": "Table Booking",
                        "color": "#E23744",
                        "data": orderingData.tableBooking.map(value => ({"value": value.toString()}))
                    }
                ]
            }
        });
        
        // 100% Stacked Bar Chart (showing percentage ratio)
        var stackedPercentBar = new FusionCharts({
            type: 'stackedbar100',
            renderAt: 'stacked-percent-container',
            width: '100%',
            height: '350',
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
                    "legendPosition": "bottom",
                    "toolTipBorderColor": "#666666",
                    "toolTipBgColor": "#efefef",
                    "showToolTipShadow": "1"
                },
                "categories": [{
                    "category": orderingData.cities.map(city => ({"label": city}))
                }],
                "dataset": [
                    {
                        "seriesname": "Online Order",
                        "color": "#CB202D",
                        "data": orderingData.onlineOrdering.map(value => ({"value": value.toString()}))
                    },
                    {
                        "seriesname": "Table Booking",
                        "color": "#E23744",
                        "data": orderingData.tableBooking.map(value => ({"value": value.toString()}))
                    }
                ]
            }
        });
        
        // Donut Chart for Overall Ratio
        var donutChart = new FusionCharts({
            type: 'doughnut2d',
            renderAt: 'donut-container',
            width: '100%',
            height: '350',
            dataFormat: 'json',
            dataSource: {
                "chart": {
                    "caption": "Overall Online Order vs. Table Booking Ratio",
                    "subcaption": "Across All Cities",
                    "showPercentValues": "1",
                    "showPercentInTooltip": "0",
                    "decimals": "1",
                    "useDataPlotColorForLabels": "1",
                    "theme": "fusion",
                    "doughnutRadius": "70%",
                    "centerLabel": "$label: $value",
                    "showLegend": "1",
                    "legendPosition": "bottom",
                    "toolTipBorderColor": "#666666",
                    "toolTipBgColor": "#efefef",
                    "showToolTipShadow": "1"
                },
                "data": [
                    {
                        "label": "Online Order",
                        "value": orderingData.totalOnline.toString(),
                        "color": "#5D62B5" 
                    },
                    {
                        "label": "Table Booking",
                        "value": orderingData.totalTable.toString(),
                        "color": "#29C3BE"
                    }
                ]
            }
        });
        
        // Render the charts if the containers exist
        if (document.getElementById("stacked-bar-container")) {
            stackedBarChart.render();
        }
        
        if (document.getElementById("stacked-percent-container")) {
            stackedPercentBar.render();
        }
        
        if (document.getElementById("donut-container")) {
            donutChart.render();
        }
    });
}

// Fall back to sample data if CSV load fails
function useSampleData() {
    console.log("Using sample data for visualizations");
    
    // Sample data for sales by city
    const salesByCity = [
        { city: 'Mumbai', sales: 20000 },
        { city: 'Delhi', sales: 15000 },
        { city: 'Bangalore', sales: 12000 },
        { city: 'Chennai', sales: 10000 },
        { city: 'Hyderabad', sales: 8000 }
    ];

    // Render D3 chart with sample data
    renderD3BarChart(salesByCity);
    
    // Sample data for ordering patterns
    const orderingData = {
        cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'],
        onlineOrdering: [2100, 1800, 2200, 1400, 900],
        tableBooking: [1200, 1400, 1100, 800, 600],
        totalOnline: 8400,
        totalTable: 5100
    };
    
    // Initialize FusionCharts with sample data
    initializeFusionCharts(orderingData);
    
    // Sample data for location map
    const locationData = [
        { "id": "001", "value": "350", "showLabel": "1" }, // Delhi
        { "id": "027", "value": "450", "showLabel": "1" }, // Maharashtra
        { "id": "017", "value": "250", "showLabel": "1" }, // Karnataka
        { "id": "031", "value": "180", "showLabel": "1" }, // Tamil Nadu
        { "id": "007", "value": "200", "showLabel": "1" }  // Telangana
    ];
    
    // Render location map
    renderLocationMap(locationData);
    
    // Sample data for restaurant types
    const restaurantTypeData = [
        { type: "Casual Dining", count: 450 },
        { type: "Café", count: 350 },
        { type: "Quick Bites", count: 300 },
        { type: "Fine Dining", count: 150 },
        { type: "Food Court", count: 120 }
    ];
    
    // Render restaurant type pie chart
    renderRestaurantTypePie(restaurantTypeData);
    
    // Sample data for cuisine types
    const cuisineData = [
        { cuisine: "North Indian", count: 380 },
        { cuisine: "Chinese", count: 320 },
        { cuisine: "South Indian", count: 280 },
        { cuisine: "Italian", count: 220 },
        { cuisine: "Continental", count: 180 }
    ];
    
    // Render cuisine chart
    renderCuisineChart(cuisineData);
    
    // Make sure summary metrics show at least the sample values
    document.querySelector(".summary-card:nth-child(1) .number").textContent = "₹57,000";
    document.querySelector(".summary-card:nth-child(2) .number").textContent = "8,400";
    document.querySelector(".summary-card:nth-child(3) .number").textContent = "5,100";
    document.querySelector(".summary-card:nth-child(4) .number").textContent = "5";
}

// Set up navigation active state and smooth scrolling
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Add click event listeners for smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 70,
                behavior: 'smooth'
            });
            
            // Update active state
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Update active state on scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('.section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}
