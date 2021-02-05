// Earthquakes endpoint (last month)
let endpoint = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
let plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

let mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'

// Map layers
let dark = L.tileLayer(mapboxUrl, {
    id: 'mapbox/dark-v10', 
    tileSize: 512, 
    zoomOffset: -1,
    accessToken: API_KEY,
    title: "USGS Earthquakes" 
});
let satellite   = L.tileLayer(mapboxUrl, {
    id: 'mapbox/satellite-v9', 
    tileSize: 512, 
    zoomOffset: -1,
    accessToken: API_KEY,
    title: "USGS Earthquakes" 
});

// Map starting
let light =  L.tileLayer(mapboxUrl, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY,
    title: "USGS Earthquakes"
});

let myMap = L.map('map',{
    center: [17.999936471282737, -10.783409692796146],
    zoom: 3,
    layers: [light, dark, satellite]
});

// Base layers
let baseMaps = {
    "Satellite": satellite,
    "Dark": dark,
    "Light": light
};

L.control.layers(baseMaps,{},{
    collapsed: false
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
    // transform the property into a number
    let mag = +feature.properties.mag;
    // select the color depending on the magnitude
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
        fillOpacity: 0.65,
        radius: 8
    };
    
    // Adding points and changing properties according to features
    let geojson = L.geoJson(data,{
        pointToLayer: function(data, latlng){
            myCircleStyle.radius = data.properties.mag*5;
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


// Tectonic plates //

d3.json(plates).then(geojsonFeature=>{

    console.log(geojsonFeature)

    let myStyle = {
        "color": "#ff7800",
        "weight": 1,
        "opacity": 1
    };

    L.geoJSON(geojsonFeature,{
        style: myStyle
    }).addTo(myMap)

})
.catch(e=>{
    console.log(e)
})