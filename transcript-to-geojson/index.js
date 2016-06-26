const fs = require('fs')
var tmp = require('tmp')
const spawn = require('child_process').spawn
const request = require('request')
const H = require('highland')

var geocodesCache
try {
  geocodesCache = require('./.geocodes-cache.json')
} catch (err) {
  geocodesCache = {}
}

const nerDir = `${__dirname}/../stanford-ner`
const nerCmd = (filename, classifier) => ({
  command: 'java',
  args: [
    `-mx600m`,
     `-cp`,
     `${nerDir}/*:${nerDir}/lib/*`,
     `edu.stanford.nlp.ie.crf.CRFClassifier`,
     `-loadClassifier`,
     classifier ? classifier : `${nerDir}/classifiers/english.all.3class.distsim.crf.ser.gz`,
     `-textFile`,
     `${filename}`,
     `-outputFormat`,
     `tabbedEntities`
  ]
})

const geocode = (entity, callback) => {
  var token = 'search-nW0Pk78'
  var url = `https://search.mapzen.com/v1/search?text=${encodeURIComponent(entity)}&api_key=${token}&size=1`

  // var googleKey = 'AIzaSyDOmIY2ehySz326NShOZDJvTnvLEpnBaGo'
  // var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${entity}&key=${googleKey}`

  if (geocodesCache[entity] !== undefined) {
    setImmediate(callback, null, geocodesCache[entity])
  } else {
    request(url, (err, response, body) => {
      var error = err
      var feature

      //// Google!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // if (!err && response && response.statusCode === 200) {
      //   try {
      //     var json = JSON.parse(body)
      //     if (json.results && json.results.length) {
      //       var result = json.results[0]
      //
      //       // console.log(result.geometry.location)
      //       feature = {
      //         type: 'Feature',
      //         properties: {
      //           entity,
      //           address: result.formatted_address
      //         },
      //         geometry: {
      //           type: 'Point',
      //           coordinates: [
      //             result.geometry.location.lat,
      //             result.geometry.location.lng
      //           ]
      //         }
      //       }
      //     } else {
      //       error = `Not found: "${entity}"`
      //     }
      //   } catch (err) {
      //     error = `Error parsing GeoJSON: ${entity}`
      //   }
      // }

      if (!err && response && response.statusCode === 200) {
        try {
          var geojson = JSON.parse(body)
          if (geojson.features && geojson.features.length) {
            feature = geojson.features[0]

            feature.properties = Object.assign({entity}, feature.properties)
          } else {
            error = `Not found: "${entity}"`
          }
        } catch (err) {
          error = `Error parsing GeoJSON: ${entity}`
        }
      }

      geocodesCache[entity] = feature
      fs.writeFileSync(`${__dirname}/.geocodes-cache.json`, JSON.stringify(geocodesCache, null, 2))
      callback(error, feature)
    })
  }
}


function fromFile (filename, options, callback) {
  // See if only two arguments are provided,
  // in that case, options arg is callback
  if (!callback) {
    callback = options
  }

  var classifier
  if (options && options.classifier) {
    classifier = options.classifier
  }

  const spawnArgs = nerCmd(filename, classifier)
  var ner = spawn(spawnArgs.command, spawnArgs.args)

  var line = -1
  var lastLocation
  var lastLocationLine = -1

  H(ner.stdout)
    .split()
    .compact()
    .map((row) => {
      var entity, type, text
      [entity, type, text] = row.split('\t')

      if (type === 'LOCATION') {
        return entity
      } else {
        return null
      }
    })
    .compact()
    .uniq()
    .toArray((entities) => {
      var featuresStream = H(entities)
        .map(H.curry(geocode))
        .nfcall([])
        .series()
        .errors(callback)
        .compact()

      callback(null, featuresStream)
    })
}

function fromString (string, options, callback) {
  // See if only two arguments are provided,
  // in that case, options arg is callback
  if (!callback) {
    callback = options
  }

  tmp.file((err, filename, fd, cleanupCallback) => {
    if (err) {
      callback(err)
      return
    }

    fs.writeFileSync(filename, string)
    fromFile(filename, options, (err, featuresStream) => {
      cleanupCallback()
      callback(err, featuresStream)
    })
  })
}

module.exports.fromFile = fromFile
module.exports.fromString = fromString
