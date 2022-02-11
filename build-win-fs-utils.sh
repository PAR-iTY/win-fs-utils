#!/bin/bash

# abort on errors
set -e

# ------------------------------------------------------------------
#
# initialise project
#
# ------------------------------------------------------------------

# create new project
npm init

# (optional) open editor
code .

# install dev dependencies:
npm i -D jsdoc @babel/cli @babel/core @babel/preset-env babel-preset-minify @babel/plugin-transform-runtime

# install dependencies:
npm i @babel/runtime

# ------------------------------------------------------------------
#
# configure babel to build for production
#
# ------------------------------------------------------------------

echo `{
  "comments": false,
  "ignore": ["**/.*", "**/_*", "**/node_modules/*"],
  "plugins": ["@babel/plugin-transform-runtime"],
  "presets": [
    ["@babel/preset-env"
      ,
      {
        "useBuiltIns": "usage",
        "corejs": "3.8"
      }
    ],
    ["minify", {"mangle": true,"deadcode": true,"evaluate": true, "simplify": true, "builtIns": true}]
  ]
}` > .babelrc

# ------------------------------------------------------------------
#
# generate dev dependency files
#
# ------------------------------------------------------------------

# generate babel production files
npx babel main.js pipe.js utils.js id3-tags.js isMainESM.js -d babel

# generate JSDocs documentation files
npx jsdoc --readme README.md main.js pipe.js utils.js id3-tags.js isMainESM.js -d ./docs

# ------------------------------------------------------------------
#
# initialise git
#
# ------------------------------------------------------------------

# refresh project
npm i

# initialise local git repo
git init

# add all tracked files
git add -A

# commit all tracked files
git commit -m "updated babel and jsdocs"

# ------------------------------------------------------------------
#
# upload to github
#
# ------------------------------------------------------------------

# push to github
git push origin main