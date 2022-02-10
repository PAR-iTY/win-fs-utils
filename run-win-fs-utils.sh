#!/bin/bash

# refresh project
npm i

# generate babel production files
npx babel main.js pipe.js utils.js id3-tags.js isMainESM.js -d babel

# generate JSDocs documentation files
npx jsdoc --readme README.md main.js pipe.js utils.js id3-tags.js isMainESM.js -d ./docs

# add all tracked files
git add -A

# commit all tracked files
git commit -m "updated babel and jsdocs"

# push to github
git push origin main