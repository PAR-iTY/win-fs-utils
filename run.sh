#!/bin/bash

# refresh project
npm i

# generate babel production files
npx babel main.js pipe.js utils.js ID3-tags.js isMainESM.js -d babel

# generate JSDocs documentation files
./node_modules/.bin/jsdoc --readme README.md main.js pipe.js utils.js ID3-tags.js isMainESM.js -d ./docs

# add all tracked files
git add .

# commit all tracked files
git commit -m "run.sh placeholder"