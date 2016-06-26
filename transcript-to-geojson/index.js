const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const spawn = require('child_process').spawn
const request = require('request')
const JSONStream = require('JSONStream')
const H = require('highland')

const geojsonOpen = '{"type":"FeatureCollection","features":['
const geojsonClose = ']}\n'

var geocodes
try {
  geocodes = require('./geocodes.json')
} catch (err) {
  geocodes = {}
}

if (!argv._ || argv._.length !== 1) {
  console.error('Please provide transcript file as command line argument')
  process.exit(1)
}

var transcript = argv._[0]

const nerDir = `${__dirname}/../stanford-ner`
const nerCmd = (transcript) => ({
  command: 'java',
  args: [
    `-mx600m`,
     `-cp`,
     `${nerDir}/*:${nerDir}/lib/*`,
     `edu.stanford.nlp.ie.crf.CRFClassifier`,
     `-loadClassifier`,
     `${nerDir}/classifiers/english.all.3class.distsim.crf.ser.gz`,
     `-textFile`,
     `${transcript}`,
     `-outputFormat`,
     `tabbedEntities`
  ]
})

const geocode = (entity, callback) => {
  var token = 'search-nW0Pk78'
  var url = `https://search.mapzen.com/v1/search?text=${encodeURIComponent(entity)}&api_key=${token}&size=1`

  // var googleKey = 'AIzaSyDOmIY2ehySz326NShOZDJvTnvLEpnBaGo'
  // var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${entity}&key=${googleKey}`

  if (geocodes[entity] !== undefined) {
    setImmediate(callback, null, geocodes[entity])
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
            // feature.properties.entity = entity
          } else {
            error = `Not found: "${entity}"`
          }
        } catch (err) {
          error = `Error parsing GeoJSON: ${entity}`
        }
      }

      geocodes[entity] = feature
      fs.writeFileSync('./geocodes.json', JSON.stringify(geocodes, null, 2))
      callback(error, feature)
    })
  }
}

const spawnArgs = nerCmd(transcript)
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
    H(entities)
      .map(H.curry(geocode))
      .nfcall([])
      .series()
      .errors((err) => {
        console.error('Error:', err)
      })
      .compact()
      .map((chips) => {
        // console.log(chips)
        return chips
      })
      .pipe(JSONStream.stringify(geojsonOpen, ',\n', geojsonClose))
      .pipe(argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout)
  })
