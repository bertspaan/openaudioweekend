# Storynode

### Requirements

Java version 1.8 or greater  
Node version 6.0 or greater  

### Installation

Needs Java 1.8 and Node.js 6.

Download and unzip:

		$ ./download-stanford-ner.sh

Install node dependencies:

		cd openaudioweekend
		$ npm install

Test the Stanford NER by running:

		java -mx600m -cp "./stanford-ner/*:./stanford-ner/lib/*" edu.stanford.nlp.ie.crf.CRFClassifier -loadClassifier stanford-ner/classifiers/english.all.3class.distsim.crf.ser.gz -textFile transcript-to-geojson/transcripts/nypl-live/live-from-the-nypl-elizabeth-alexander--hilton-als.text -outputFormat tabbedEntities

If that works, run the index.js script with:

		node index.js <transcript-file>

### About

Often, cultural heritage collections have a strong connection to place. Place can give meaning or character to a collection. When working with oral histories, this connection can be especially strong.

Being able to visualize spatial locations within a particular collection or within even one recording can help us to better understand and engage with it. It allows us to spot certain connections easily; connections that might have only been possible to discover before by listening to hours of recordings or reading through pages of transcripts. Within a given oral history, we could track an interviewee’s trajectory through the world. Or if a particular physical location interests us, we could zero in on those recordings associated with it.

Place can also draw us in. Perhaps we now live in a neighborhood and we wish to hear stories about it. Maybe our grandparents were from an area and we’re hoping to connect with our roots. We might recognize a particular street name or neighborhood from a song or a television show we love and want to hear more about the “real thing.”

Communities assign meaning to archival collections and what better way to connect with them than where they live?

### Who we are

[Bert Spaan](https://github.com/bertspaan)  
[Evan Misshula](https://github.com/EvanMisshula)  
[Patrick Smyth] (https://github.com/smythp)  
[Rebecca Chandler](https://github.com/rebschandler)  


### The Plan

Using Stanford’s Natural Language Entity Extraction tools identify locations within the transcripts of audio recordings. Geocode these locations and plot them on a map.

### The Tools

[Stanford Natural Entity Recognizer (NER)] (http://nlp.stanford.edu/software/CRF-NER.shtml)   
[Metro Extracts] (https://mapzen.com/data/metro-extracts/)  

### Approach

In order to make this project work, we needed to be able to parse out street names. Stanford’s tool does not currently operate at that granular a level. We used Metro Extracts, a JSON data set, to create a file containing place names and their corresponding coordinates. We then used this file to train NER to recognize our NYC place names.
