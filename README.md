# Open Audio Weekend

Needs Java 1.8 and Node.js 6.

Download and unzip:

  ./download-stanford-ner.sh

Try to run Stanford NER:

    java -mx600m -cp "./stanford-ner/*:./stanford-ner/lib/*" edu.stanford.nlp.ie.crf.CRFClassifier -loadClassifier stanford-ner/classifiers/english.all.3class.distsim.crf.ser.gz -textFile transcript-to-geojson/transcripts/nypl-live/live-from-the-nypl-elizabeth-alexander--hilton-als.text -outputFormat tabbedEntities
