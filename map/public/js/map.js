var map = L.map('map').setView([40.695,-73.954], 10);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  subdomains: 'abcd',
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
})
.addTo(map)

function onEachFeature(feature, layer) {
  layer.bindPopup(feature.properties.entity)
}

var geojsonLayer = L.geoJson(null, {
  onEachFeature: onEachFeature,
  pointToLayer: function(feature, latlon) {
    return L.circleMarker(latlon, {
      radius: 8,
      fillColor: '#6ae2a1',
      color: '#6ae2a1',
      weight: 1,
      opacity: 1,
      fillOpacity: 1
    })
  }
}).addTo(map)

function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON (response) {
  return response.json()
}

function transcriptToGeojson (transcript, callback) {
  fetch('/transcript', {
    method: 'POST',
    body: transcript
  })
  .then(checkStatus)
  .then(parseJSON)
  .then(function(geojson) {
    callback(null, geojson)
  }).catch(function(error) {
    callback(error)
  })
}

document.getElementById('submit')
  .addEventListener('click', () => {
    geojsonLayer.clearLayers()
    const transcript = document.getElementById('editor').value
    transcriptToGeojson(transcript, function(err, geojson) {
      if (err) {
        console.error(err.message)
      } else {
        geojsonLayer.addData(geojson)
        map.fitBounds(geojsonLayer.getBounds())
      }
    })
  })
