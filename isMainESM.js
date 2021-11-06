// --------------------------------------------------------------------------- //

// for this to work as a module, it can't be done so simply, calling main returns:

// process.argv[1]:  C:\DEV\win-fs-utils\main
// import.meta.url:  file:///C:/DEV/win-fs-utils/isMainESM.js

// this code must use the callers import.meta.url value to work
// could be a Class and instantiated inside main.js?
// or some similar kind of function composition?

// the other way is pass in import.meta from main.js

// --------------------------------------------------------------------------- //

import { fileURLToPath } from 'url';
import { extname } from 'path';

// --------------------------------------------------------------------------- //

/**
 * ES Modules version of require.main === module.
 *
 * Checks if script was called directly.
 * ES6 import.meta.url always returns the file url with path extension.
 * process.argv[1] comes from the command-line and may be extensionless.
 *
 * @module isMainESM
 *
 * @param metaURL - The import.meta.url of type string or URL instance.
 * @return {boolean} True if script was called directly, false if not.
 * */
export default metaURL => {
  // returns a boolean expression comparing the filename with an extension
  // with a potentially extensionless CLI argument
  // includes a evaluation shortcut check on the required metaURL arg existing
  return (
    metaURL &&
    (extname(process.argv[1])
      ? `${process.argv[1]}`
      : `${process.argv[1]}.js`) === fileURLToPath(metaURL)
  );
};

// --------------------------------------------------------------------------- //
