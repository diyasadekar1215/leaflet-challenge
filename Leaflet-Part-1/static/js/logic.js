// URL for fetching earthquake data (All Earthquakes from the Past Month)
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  console.log(data); // Log to confirm data fetching
  createFeatures(data.features); // Send the features array to the createFeatures function
});

// Function to calculate marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 20000; // Adjust scaling factor for visibility
}

// Function to choose marker color based on depth using a green to red gradient
function chooseColor(depth) {
  return depth > 90 ? "#ea2c2c" :   // red
         depth > 70 ? "#ea822c" :   // orange-red
         depth > 50 ? "#ee9c00" :   // orange
         depth > 30 ? "#eecc00" :   // yellow
         depth > 10 ? "#d4ee00" :   // light green
         "#98ee00";  // green
}

// Function to create features (markers and popups) for each earthquake
function createFeatures(earthquakeData) {
  // Define a function that attaches popups to each feature
  function onEachFeature(feature, layer) {
    layer.bindPopup(`
      <h3>${feature.properties.title}</h3>
      <hr>
      <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
      <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>
      <p><strong>Time:</strong> ${new Date(feature.properties.time)}</p>
    `);
  }

  // Create a GeoJSON layer containing the features array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature, // Attach popups
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng, {
        radius: markerSize(feature.properties.mag), // Marker size based on magnitude
        fillColor: chooseColor(feature.geometry.coordinates[2]), // Fill color based on depth
        fillOpacity: 0.7,
        color: "black",
        weight: 0.5,
      });
    }
  });

  // Pass the earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Function to create the map and add layers (base and earthquake markers)
function createMap(earthquakes) {
  // Add OpenStreetMap as the base layer (free and no API key required)
  var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  // Create baseMaps object to hold the base layer
  var baseMaps = {
    "Grayscale Map": baseLayer
  };

  // Create an overlayMaps object to hold the earthquake layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Initialize the map with the center and zoom level, and set layers
  var myMap = L.map("map", {
    center: [37.09, -95.71], // Latitude and Longitude for center of USA
    zoom: 5, // Initial zoom level
    layers: [baseLayer, earthquakes] // Layers to display on the map initially
  });

  // Add a legend to the map with gradient colors and depth values
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    // Create color scale for depth
    var depth = [-10, 10, 30, 50, 70, 90, 100]; // Depth ranges
    var colors = [
      "#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"
    ];

    div.innerHTML = "<h3>Depth (km)</h3>";

    // Loop through depth ranges and add color swatches with labels
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        depth[i] + " km &ndash; " + (depth[i + 1] ? depth[i + 1] : "+") + " km<br>"; // Color and depth labels
    }

    return div;
  };

  legend.addTo(myMap);

  // Add layer control to toggle overlays
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
}