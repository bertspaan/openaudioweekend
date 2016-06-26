const argv = require('minimist')(process.argv.slice(2))
const JSONStream = require('JSONStream')
const transcriptToGeojson = require('./')

const geojsonOpen = '{"type":"FeatureCollection","features":['
const geojsonClose = ']}\n'

if (!argv._ || argv._.length !== 1) {
  console.error('Please provide transcript file as command line argument')
  process.exit(1)
}

const filename = argv._[0]
const options = {
  classifier: argv.classifier
}

transcriptToGeojson.fromFile(filename, options, (err, stream) => {
  if (err) {
    console.error(err.message)
  } else {
    stream
      .pipe(JSONStream.stringify(geojsonOpen, ',\n', geojsonClose))
      .pipe(argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout)
  }
})
