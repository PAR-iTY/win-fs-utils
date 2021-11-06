Personal CLI utilities for windows filesystem and ID3 tag batch editing using glob searching and function composition pipes. Includes path normalisation, mp3 metadata editing, shell and node.js argument handling, posix and win32 and \*nix paths, forbids windows system paths and more

This project is a first attempt at a functional design pattern library
Can glob search across letter drives and within safe system drive locations
includes isMainESM.js which could be its own npm library
Implements function composition pipes (is sync/async capable via async/await)
pipe.js contains functions that run checks and alter input and return output
utils.js contains functions that run checks and return booleans

Project includes automated minification and documentation using Babel and JSDocs
todo:

- refactor init function to functionalise and for readability
- add keyword search
- add more ID3 editing functionality
- publish isMainESM.js as npm library
