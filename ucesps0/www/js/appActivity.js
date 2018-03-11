// create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions can use the same variable
var client;
// and a variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on
var earthquakelayer;

// load the map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

function trackLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition);
    } else {
        document.getElementById('errorMessage').innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap);
    mymap.setView([position.coords.latitude, position.coords.longitude], 13);
}

// create the code to get the Earthquakes data using an XMLHttpRequest
function getEarthquakes() {
    client = new XMLHttpRequest();
    client.open('GET','https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
    client.onreadystatechange = earthquakeResponse; // note don't use earthquakeResponse() with brackets as that doesn't work
    client.send();
}

// create the code to wait for the response from the data server, and process the response once it is received
function earthquakeResponse() {
    // this function listens out for the server to say that the data is ready - i.e. has state 4
    if (client.readyState == 4) {
        // once the data is ready, process the data
        var earthquakedata = client.responseText;
        loadEarthquakelayer(earthquakedata);
    }
}

// convert the received data - which is text - to JSON format and add it to the map
function loadEarthquakelayer(earthquakedata) {
    // convert the text received from the server to JSON
    var earthquakejson = JSON.parse(earthquakedata );
    // load the geoJSON layer
    var earthquakelayer = L.geoJson(earthquakejson).addTo(mymap);
    bounds = earthquakelayer.getBounds();
    if (bounds.isValid()) {
        mymap.fitBounds(earthquakelayer.getBounds());
    }
}

// load the tiles
L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);
