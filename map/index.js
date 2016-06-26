const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const JSONStream = require('JSONStream')

const geojsonOpen = '{"type":"FeatureCollection","features":['
const geojsonClose = ']}\n'

app.use(bodyParser.text())

const transcriptToGeojson = require('../transcript-to-geojson')

const port = process.env.PORT || 7000

app.use(express.static('public'))

app.post('/transcript', (req, res) => {
  const transcript = req.body

  transcriptToGeojson.fromString(transcript, (err, featuresStream) => {
    if (err) {
      res.status(500).send({error: err.message})
    } else {
      featuresStream
        .pipe(JSONStream.stringify(geojsonOpen, ',\n', geojsonClose))
        .pipe(res)
    }
  })
})

app.listen(port, () => {
  console.log(`Transcript Map listening on port ${port}!`)
})
