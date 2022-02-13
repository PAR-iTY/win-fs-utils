> work in progress personal project

# win-fs-utils

CLI tool for batch filesystem and metadata tasks like post-processing other CLI tools like ffmpeg and youtube-dl and standardising and normalising metadata in my existing media libraries

Currently mostly consists of composed pipes to handle handle CLI arguments and feed valid filesystem inputs to glob search. Features some handling of different shell string inputs and filepath error handling. CLI user experience minded features like informative logging, prompting the user, and protection from accidentally searching or editing dangerous windows 10 system paths

## how to use

to use call main.js script from project root with `node main`

optionally can add the following parameters:

`node main --path <path>`

- enter the file system path to search in

  `node main --recurse`

- set search to be recursive

  `node main --ext <extension>`
  only search for files of a specific extension

if searching for mp3 file(s):

`node main --tagType <tag-type>`

- the ID3 tag type or name i.e. 'artist' or 'album'

  `node main --tagFind <tag-value-to-replace>`

- for editing a specific substring of the selected tag's current value

  `node main --tagReplace <new-tag-value>`

- the new value to be inserted either for the specified substring or the whole tag value

i.e. `node main --path ~/music/beyonce --recurse --ext mp3 --tagType artist --tagFind Bey --tagReplace Hey` would convert all 'Beyonce' songs into 'Heyonce' songs

## includes

glob search, path normalisation, mp3 metadata editing, shell and node.js argument handling, posix and win32 and \*nix paths, forbids windows system paths and more

- isMainESM.js solution to determining if module was run directly or not
- pipe.js contains functions that run checks and alter input and return output
- utils.js contains functions that run checks and return booleans
- main.js drives argument handling and glob search functionality
- build-win-fs-utils.sh configures and builds project with babel and JDdoc, then generates production-ready ECMAScript and JSDoc documentation

## inspiration

Written in a Node.js environment to learn ES6+ function composition and pipes and with the idea that the concepts involved will be helpful in future web projects involving filesystems, paths and metadata, media files and formats.

This project is also first attempt at a functional design pattern library and implements function composition pipes with async/await handling. it is a work in progress of learning experiments and the main.js driving script especially is not currently written in a functional style.

## experiments

- to learn about differences in windows and \*nix filesystems, shells, paths, posix
- to handle these differences and implement a glob search to access files in Node.js
- to develop a custom function composition design pattern that consumes pipe.js functions
-

## todo:

- use pipes more generally across scripts especially main.js
- refactor main.js more to functionalise and for readability
- add a kind of keyword search
- publish isMainESM.js as seperate npm module and consume as a dependency
- refactor function params to use defaults where useful
- look at libraries like mutagen and file-renaming strategies
- shift win10 system path protection from search into editing so you can search but not edit them?
