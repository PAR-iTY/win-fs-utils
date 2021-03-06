import { fileURLToPath } from 'url';
import { parse, sep, posix, join } from 'path';
import { realpathSync } from 'fs';
import { isLetter } from './utils.js';

// --------------------------------------------------------------------------- //

// resolves symbolic links, normalises path etc
const realPath = _path => realpathSync(_path);

// --------------------------------------------------------------------------- //

/**
 * Sanitises input path into a posix path.
 *
 * Leaves drive letters intact.
 *
 * @function posixPath
 * @param {string} _path - The path to be sanitised.
 * @return {string} The sanitised posix path.
 */
const posixPath = _path => _path.split(sep).join(posix.sep);
// ensure _path is a posix path

// --------------------------------------------------------------------------- //

/**
 * Cleans a file URL into a path.
 *
 * Uses fileURLToPath from the url standard library.
 *
 * @function cleanFileURL
 * @param {string} _path - The file URL to be cleaned.
 * @return {string} The clean path.
 */
const cleanFileURL = _path => {
  // check if --path is a file URL
  // do this first because cleanSysRoot will parse a file URL wrong
  // and fileURLToPath returns path in some annoying format
  if (_path.toLowerCase().startsWith('file:')) {
    console.log('path is a file URL, cleaning..');
    return fileURLToPath(_path);
  } else {
    return _path;
  }
};

// --------------------------------------------------------------------------- //

/**
 * Trims 'C:' from system drive paths.
 *
 * Leaves other drive letters and delimiters intact.
 *
 * Clean --path C: drive root into unix / root.
 *
 * @function cleanSysRoot
 * @param {string} _path - The path to be cleaned.
 * @return {string} The clean path.
 */
const cleanSysRoot = _path => {
  // https://en.wikipedia.org/wiki/Drive_letter_assignment#Common_assignments

  // will not catch file url paths

  if (isLetter(_path[0]) && _path[0].toLowerCase() !== 'c') {
    // is letter drive so leave it alone
    return _path;
  }

  // slice path.dir by this many chars
  let n = 0;

  // surely this could be improved...
  switch (parse(_path).root.toLowerCase()) {
    case '/':
      // alg already so just return
      return _path;
    case 'c:/':
      n = 3;
      break;
    case 'c:\\':
      n = 3;
      break;
    case 'c:\\\\':
      n = 4;
      break;
    case '//':
      console.log(`unexpected '//' root!`);
      n = 2;
      break;
    case '\\':
      console.log(`unexpected '\\' root!`);
      n = 1;
      break;
    case '\\\\':
      console.log(`unexpected '\\\\' root!`);
      n = 2;
      break;
    case '':
      console.error('[pipe.js] empty path detected:', _path);
      break;
    default:
      console.error(
        `[path root switch statement error] path root: '${parse(_path).root}'`
      );
      break;
  }

  if (n) {
    // doesn't join use '/' as sep? so why did i need the prepended '/'?
    // console.log('old path:', _path);
    _path = join('/', parse(_path).dir.slice(n), parse(_path).base);
    // console.log('new path:', _path);
    // return _path;
  }
  return _path;
};

// --------------------------------------------------------------------------- //

/**
 * Catches an error with the '/' unix root in a bash shell.
 * When '/' root is used, bash thinks root = 'C:/Program Files/Git'.
 * Returns a clean unix root path.
 *
 * @function cleanBashRoot
 * @param {string} _path - The path to be cleaned.
 * @return {string} The clean unix path.
 * */
const cleanBashRoot = _path => {
  // check for git path
  if (_path.startsWith('C:/Program Files/Git')) {
    // --path came from bash shell and started with '/'
    return _path.replace('C:/Program Files/Git', '');
  } else {
    return _path;
  }
};

// --------------------------------------------------------------------------- //

/**
 * Create a n pipe composer using spread and reduce.
 *
 * Is fully synchronous and does not handle promises.
 *
 * @function syncPipe
 * @return {function} The pipe composer function.
 * */
// sync version
const syncPipe =
  (...funcs) =>
  val =>
    funcs.reduce((chain, func) => func(chain), val);

// --------------------------------------------------------------------------- //

// returns a function that contains promises
const asyncPipe =
  (...funcs) =>
  val =>
    funcs.reduce(async (chain, func) => func(await chain), val);

// const pipeAsyncFunctions = (...fns) => arg =>
//   fns.reduce((p, f) => p.then(f), Promise.resolve(arg));

// const sum = asyncPipe(
//   x => x + 1,
//   x => new Promise(resolve => setTimeout(() => resolve(x + 2), 1000)),
//   x => x + 3,
//   async x => (await x) + 4
// );

// (async () => {
//   console.log(await sum(5)); // 15 (after one second)
// })();

// --------------------------------------------------------------------------- //

// async sleep(ms) timer that alters path (for async debugging)
// returns a Promise that alters path
const sleep = _path => {
  return new Promise(resolve => {
    setTimeout(() => resolve(_path + '/sleep/'), 2000);
  });
};

// generic logger of a value passing through a pipe
// returns value back to pipe after logging
const log = x => {
  // is it possible to detect the previous function name?
  // a solution: wrap call to log in another function with 2 args
  // args are x and a optional message to explain what is being logged
  console.log('pipe-log:', x);
  return x;
};

// --------------------------------------------------------------------------- //

/**
 * Compose path cleaning sync pipe for the output filepaths of a glob search.
 * *
 * @function cleanGlobSyncPipe
 * @return {function} The composed glob path cleaning pipe.
 */
const cleanGlobSyncPipe = syncPipe(cleanSysRoot, posixPath);

// --------------------------------------------------------------------------- //

/**
 * Compose the cwd cleaning sync pipe.
 *
 * Assume: process.cwd() is always absolute and not a file url.
 *
 * @function cleanCwdSyncPipe
 * @return {function} The composed cwd cleaning sync pipe.
 */
const cleanCwdSyncPipe = syncPipe(cleanBashRoot, cleanGlobSyncPipe);

// --------------------------------------------------------------------------- //

// these composed pipes could accept _path and return result directly?

/**
 * Compose the path cleaning async pipe.
 *
 * @function cleanPathAsyncPipe
 * @return {function} The composed path cleaning pipe.
 */
const cleanPathAsyncPipe = asyncPipe(
  cleanBashRoot,
  cleanFileURL,
  realPath,
  cleanGlobSyncPipe
);

// --------------------------------------------------------------------------- //

/**
 * Windows filesystem pipe functions.
 *
 * @module Pipe
 *
 * */
export {
  realPath,
  posixPath,
  cleanFileURL,
  cleanSysRoot,
  cleanBashRoot,
  syncPipe,
  asyncPipe,
  cleanGlobSyncPipe,
  cleanCwdSyncPipe,
  cleanPathAsyncPipe,
  sleep,
  log
};

// --------------------------------------------------------------------------- //
