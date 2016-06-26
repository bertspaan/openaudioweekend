# Transcript to json 

### Requrements

Java version 1.8 or greater
Node version 6.0 or greater

### Installation

Download and unzip:

	```
	$ ./download-stanford-ner.sh
	```

Install node dependencies:
	
	```
	cd openaudioweekend
	$ npm install
	```
	
Test the Stanford NER by running:

	```
	java -mx600m -cp "./stanford-ner/*:./stanford-ner/lib/*" edu.stanford.nlp.ie.crf.CRFClassifier -loadClassifier stanford-ner/classifiers/english.all.3class.distsim.crf.ser.gz -textFile transcript-to-geojson/transcripts/nypl-live/live-from-the-nypl-elizabeth-alexander--hilton-als.text -outputFormat tabbedEntities
	```

If that works, run the index.js script with:

	```
	node index.js <transcript-file>
	```
