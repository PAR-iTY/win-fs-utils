#!/bin/bash

# refresh project
npm i

# generate babel production files
./node_modules/.bin/babel main.js pipe.js utils.js id3-tags.js isMainESM.js -d babel

# generate JSDocs documentation files
./node_modules/.bin/jsdoc --readme README.md main.js pipe.js utils.js id3-tags.js isMainESM.js -d ./docs

# add all tracked files
git add -A

# commit all tracked files
git commit -m "placeholder commit message"

# push to github
git push origin main