// Earthquakes endpoint (last month)
let endpoint = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// Map starting
let myMap = L.map('map').setView([35.93373001708858, -112.41594924041489], 6);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY,
    title: "USGS Earthquakes"
}).addTo(myMap);

// Circles' colors and limits
let colors = ["#7FFF00","#ADFF2F","#FFFF00","#FFD700","#FFA500","#FF4500"]
let limits = ["0-1","1-2","2-3","3-4","4-5","5+"]

/**
 * Function for matching GeoJSON magnitude with color
 * @param {Object} feature from GeoJSON 
 * @param {Object} layer from Leaflet
 * @returns {String} containing the fillColor for the point
 */
function fillColor(feature,layer){
    // Magnitude property to number scales
    let mag = +feature.properties.mag;
    // Match color with magnitude number scale
    if(mag > 0 && mag < 1){
        return colors[0]
    }else if(mag < 2){
        return colors[1]
    }else if(mag < 3){
        return colors[2]
    }else if(mag < 4){
        return colors[3]
    }else if(mag < 5){
        return colors[4]
    }else {
        return colors[5]
    }
}

/**
 * Function for identifying Place property in GeoJSON and adding it as a description
 * @param {Object} feature from GeoJSON
 * @param {Object} layer from Leaflet
 */
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.place) {
        layer.bindPopup(`Magnitude: ${feature.properties.mag} <br> Place: ${feature.properties.place}`);
    }
}

// Getting data from USGS
d3.json(endpoint).then(data => {
    console.log(data)

    let myCircleStyle = {
        color: "black",
        weight: 1,
        opacity: 0.5,
        fillColor: "#088",
        fillOpacity: 0.75,
        radius: 8
    };
    
    // Adding points and changing properties according to features
    let geojson = L.geoJson(data,{
        pointToLayer: function(data, latlng){
            myCircleStyle.radius = data.properties.mag*10;
            myCircleStyle.fillColor = fillColor(data,latlng)
            return L.circleMarker(latlng, myCircleStyle)
        },
        onEachFeature: onEachFeature //this calls the function to bind Popups on each feature
    }).addTo(myMap)

    // Adding legends
    let legend = L.control({ 
        position: "bottomright"
     });

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let labels = [];

        // Adding limits
        let legendInfo = "<h1>Magnitudes</h1>" +
        "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

        div.innerHTML = legendInfo;

        // Adding color scale depending on values
        limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\">"+limit+"</li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding map legend
    legend.addTo(myMap);

})
// Checking on errors and running the console
.catch(e =>{
    console.log(e)
})