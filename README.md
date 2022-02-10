> work in progress personal project

# win-fs-utils

CLI tool for batch filesystem and metadata tasks like post-processing other CLI tools like ffmpeg and youtube-dl and standardising and normalising metadata in my existing media libraries

Currently mostly consists of composed pipes to handle handle CLI arguments and feed valid filesystem inputs to glob search. Features some handling of different shell string inputs and filepath error handling. CLI user experience minded features like informative logging, prompting the user, and protection from accidentally searching or editing dangerous windows 10 system paths

## includes

glob search, path normalisation, mp3 metadata editing, shell and node.js argument handling, posix and win32 and \*nix paths, forbids windows system paths and more

- isMainESM.js is my own solution to determining if module was run directly or not
- pipe.js contains functions that run checks and alter input and return output
- utils.js contains functions that run checks and return booleans
- main.js drives argument handling and glob search functionality
- run-win-fs-utils.sh generates production-ready javascript and JSDoc documentation

## inspiration

Written in a Node.js environment to learn ES6+ function composition and pipes and with the idea that it may be helpful in future web projects involving filesystems, paths and metadata, especially media files and formats

This project is also first attempt at a functional design pattern library and implements function composition pipes with async/await handling. it is a work in progress of learning experiments and the main.js driving script especially is not currently written in a functional style

## experiments

- to learn about differences in windows and \*nix filesystems, shells, paths, posix
- to handle these differences and implement a glob search to access files in Node.js
- to develop a custom function composition design pattern that consumes pipe.js functions

## todo:

- keep de-branching main.js and refactor into more functions
- use pipes more generally across scripts especially main.js
- refactor init function to functionalise and for readability
- add keyword search
- add more ID3 editing functionality
- publish isMainESM.js as seperate npm module and consume as a dependency
- refactor function params to use defaults where useful
- shift win10 system path protection from search into editing so you can search but not edit them
- look at libraries like mutagen and file-renaming strategies (subprocess or Node.js?)
- rename ID3-tags.js to avoid camel case confusion and keep to js standards
