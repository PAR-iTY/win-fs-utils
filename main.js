console.time('import load time');

// local modules
import isMainESM from './isMainESM.js';
// can just import wrapper function that call the others
import { isSafeWinPath, isFile } from './utils.js';

import {
  cleanGlobSyncPipe,
  cleanCwdSyncPipe,
  cleanPathAsyncPipe
} from './pipe.js';
import { tweakTags } from './id3-tags.js';

// npm modules
import minimist from 'minimist';
import prompts from 'prompts';
import glob from 'glob';
// glob is CommonJS module and sync cannot be name imported?
// const { sync } = glob;

// standard library modules
import { parse, join, extname } from 'path';
// import { resolve, parse, join, sep, posix, win32, extname, normalize, basename, dirname, isAbsolute } from 'path';
// import { inspect } from 'util';
// import { homedir } from 'os';

console.timeEnd('import load time');

// --------------------------------------------------------------------------- //

/**
 * Initiate module functions in sequence of clean, check, get, use.
 *
 * Is called after sanitising the command-line arguments provided.
 * Accepts a path from the command line via minimist args.
 *
 * @async
 * @function init
 */
const init = async () => {
  // console.log('init 🚦');

  // sanitise and handle args and get results object back
  const args = await argsHandle();
  // console.log('args: ', args);

  // could use destructuring/spread to pull arg props out?

  // free to use --path
  const files = getFiles(args.path, args.ext, args.recurse);
  console.log('files:', files);

  // move on to mp3 handling (functionalise)
  // || extname(args.path).toLowerCase() === '.mp3'
  if (files.length && args.ext === '.mp3') {
    console.log('extension is mp3');
    if (args.tagType && args.tagReplace) {
      console.log('passing to id3-tags..');
      // CLI params for tag-type, find-str, and replace-str
      tweakTags(files, args.tagType, args.tagFind || undefined, args.tagReplace);
    }
  }
};

// --------------------------------------------------------------------------- //

/**
 * Handle command line arguments given to the main.js program.
 *
 * sanitises and handles the command-line arguments provided.
 * Accepts a path from the command line via minimist args.
 *
 * @async
 * @function argsHandle
 */
const argsHandle = async () => {
  // must flatten these conditions somewhat...
  // would be good to loop them based off common checks
  // but some differences remain like maybe cwd

  // atm glob is not working properly idk why exactly
  // could be to do with awaits? but i doubt it
  // i changed args

  // defaults object for minimist arguments
  const argDefaults = { ext: '' }; // recurse: ''

  // instantiate minimist args parser
  const args = minimist(process.argv.slice(2), { default: argDefaults });
  console.log('minimist args:', args);

  // handle extension arg (uses minimist default empty string)
  // check if --ext (extension) flag was set
  if (args.hasOwnProperty('ext') && args.ext && args.ext !== true) {
    console.log('ext detected:', args.ext);
    // add dot to beginning of ext if needed
    if (args.ext[0] !== '.') {
      args.ext = '.' + args.ext;
    }
  } else if (args.hasOwnProperty('path') && extname(args.path)) {
    // if not set --ext but path has an extension use that
    // extname() always returns a dot .{ext} if an extension exists
    args.ext = extname(args.path);
  } else {
    console.log('ext error', args.ext);
  }

  // normalise to lower case
  // (relies on glob search being case-insensitive?)
  args.ext = args.ext.toLowerCase();

  // check if --recurse flag was set
  // this should just use minimist default args object at top of function
  // if (args.recurse) {}
  args.recurse =
    args.hasOwnProperty('recurse') && args.recurse === true ? '/' : '';

  // handle no path arg
  if (!args.hasOwnProperty('path')) {
    console.log(`cmd did not include '--path'`);
    console.log('trying cwd..');

    let cwd = await pipeHandle(process.cwd(), cleanCwdSyncPipe);

    // if path value is falsy pipeHandle rejected path
    // instead of if-conditioning this...
    // what if all the pipes ended with a sorting function?
    // the sorting function must make existence/value/type checks etc
    // and handle the different errors, close gracefully etc
    if (!cwd) {
      // no --path and cwd is unsafe
      console.error('[cwd error]', cwd);
      console.log('calling prompt..');

      args.path = await promptHandle();
      return args;
    }

    // safe to use cwd as default
    console.log('no --path and cwd is a safe default search location:', cwd);

    args.path = cwd;
    return args;
  }

  // handle minimist path arg edge case
  // check if '--path' in args but is missing a value
  // (minimist resolves missing value to true)
  if (!args.path || args.path === true) {
    console.error('[--path is falsy or empty]', args.path);
    console.log('calling prompt..');

    args.path = await promptHandle();
    return args;
  }

  // both conditions above resolve to using cwd or a prompt
  // --> assume this space in code is safe to check and use --path

  // TEST PIPE FUNCTIONS HERE - cli-args are handled, path is uncleaned

  args.path = await pipeHandle(args.path, cleanPathAsyncPipe);

  if (!args.path) {
    // pipeHandle error --> call prompt
    console.error('[path handle error]', args.path);
    console.log('calling prompt..');

    args.path = await promptHandle();
    return args;
  }

  // generalised return
  return args;
};

// --------------------------------------------------------------------------- //

/**
 * Runs composed sync and async pipes.
 *
 * run path cleaning and safety checking functions.
 *
 * @async
 * @function pipeHandle
 * @param {string} _path - The path to be piped.
 * @param {function} pipe - The pipe function to use. (default to cleanPathAsyncPipe?)
 * @return The clean path on success, false on error.
 */
const pipeHandle = async function (_path, pipe) {
  try {
    // pass in path to composed path cleaning pipe and return
    _path = await pipe(_path);
  } catch (err) {
    console.error('[pipe error]', err);
    return false;
  }

  // isSafeWinPath uses inOS and isSystemPath which rely on unix-path input
  // && isSafeWinPath(_path)
  if (_path) {
    //   console.log(`[pipeHandle] path is clean and safe: '${_path}'`);
    return _path;
  }
  //  else {
  //   console.error('[path is not clean and/or safe]');
  //   return false;
  // }
};

// --------------------------------------------------------------------------- //

/**
 * Uses prompts module to ask for a new path.
 * @async
 * @function promptHandle
 * @param {string} message - Optional custom message to use in prompt.
 * @return {string} The new path from prompt response.
 */
const promptHandle = async message => {
  const prompt = await prompts({
    type: 'text',
    name: 'path',
    message:
      message ||
      'Please enter a path to search or press enter to default to current directory',
    validate: async _path => {
      return !(await pipeHandle(_path, cleanPathAsyncPipe))
        ? `❌ Path is forbidden, please try again`
        : true;
    }
  });

  // MORE ESSENTIAL PROBLEM:
  // promptHandle basically doesn't understand relative vs absolute
  // and is occasionally bailed out by bash/shell path intellisense

  // a prompted user should be able to use a relative path
  // if one is detected, path must be concatentated:
  // safe cwd + relative path + glob pattern

  // catch empty path error
  // ultimately, i could add a 'detectEmpty' function to the pipe
  if (prompt.path === '' || prompt.path === '.' || prompt.path === './') {
    const cwd = await pipeHandle(process.cwd(), cleanCwdSyncPipe);
    // if cwd is false need to re-prompt for new path instead of just returning false...
    prompt.path = cwd ? cwd : false;
  }

  // return the new path from user
  return prompt.path;
};

// --------------------------------------------------------------------------- //

/**
 * Search for files and get matching absolute paths.
 * If _path is ommitted the current working directory is defaulted to.
 * If extension is ommitted no file extension is added.
 *
 * @function getFiles
 * @param {string} _path - The directory path to search for matches.
 * @param {string} ext - {optional} The file extension (including the dot) to search for.
 * @param {string} recurse - {optional} flag for recursive glob search.
 * @return {array} The list of matching paths in posix format.
 */
const getFiles = (_path, ext, recurse) => {
  // use glob ignore for hiding on the fly
  // use inSysPath etc for prompting user

  // (later) implement some kind of db/storage for this and other data
  // are these case insensitive due to glob options? (test --> no they are sensitive)
  const ignoreGlobs = [
    // files
    '**/*NTUSER*',
    '**/*ntuser*',
    '**/*.DAT',
    '**/*.dat',
    '**/*.SYS',
    '**/*.sys',
    '**/*msdownld.tmp',
    '**/*Recovery.txt',
    // folders
    '**/AppData/**',
    '**/Application Data/**',
    '**/$AVG/**',
    '**/$RECYCLE.BIN/**',
    '**/$Recycle.Bin/**',
    '**/System Volume Information/**',
    '**/Windows/**',
    '**/Application Data/**',
    '**/Local Settings/**',
    '**/ProgramData/**',
    '**/Program Files/**',
    '**/Program Files (x86)/**',
    '**/Recovery/**',
    '**/PerfLogs/**',
    '**/Documents and Settings/**',
    // likely convienent
    '**/node_modules/**',
    // glob error: Error: EPERM: operation not permitted, scandir 'C:/Config.Msi'
    'C:/*Config*',
    // filepaths specific to personal external HDD
    // convienient non c-drive folder exclusions
    'F:/Utility/**',
    // attempt to handle system image scan errors
    'F:/UMIT/OS/**'
  ];

  // glob object
  const options = {
    ignore: ignoreGlobs,
    // my approach to controlling error behaviour here is:
    // this is a CLI tool for users, hide failure to access and move on
    strict: false,
    silent: true,
    // if ext is set then need to only return files and not folders
    // (avoids false-positive folders that end in an ext-like string)
    nodir: ext ? true : false,
    nocase: true,
    // potential nocase + drive-letter issues:
    // https://github.com/isaacs/node-glob/issues/42
    // https://github.com/isaacs/node-glob/issues/123
    statCache: true
  };

  // fix from: https://stackoverflow.com/questions/33086985/how-to-obtain-case-exact-path-of-a-file-in-node-js-on-windows
  let pathRoot = parse(_path).root;
  let noDrivePath = _path.slice(Math.max(pathRoot.length - 1, 0));
  let pattern = '**/*';

  // console.log(`_path: '${_path}'`);
  // console.log(`pathRoot: '${pathRoot}'`);
  // console.log(`noDrivePath: '${noDrivePath}'`);
  // console.log(`recurse: '${recurse}'`);
  // console.log(`pattern: '${pattern}'`);

  // console.log(`old glob-string: '${_path}${recurse}${pattern}${ext}'`);

  if (_path === '/') {
    // c root search
    console.log('c root-level search detected..');

    if (recurse) {
      // wipe path --> recurse + pattern '/**/*'
      console.log(`..recurse detected --> editing _path..`);
      _path = '';
    } else {
      // edit pattern to '*' --> path + recurse + pattern '/*'
      console.log(`..recurse not detected --> editing pattern..`);
      pattern = '*';
    }
  }

  // detect non-c letter drive path root and apply fix
  if (pathRoot[0] !== '/') {
    // not c drive
    console.log('non-c letter drive detected..');

    if (noDrivePath === '/') {
      console.log('..root-level search detected');
      // wipe it cos config.cwd will provide it
      noDrivePath = '';

      // wipe pattern if non-c-root search isnt recursive
      if (!recurse) {
        console.log('..recurse not detected');
        // console.log('old pattern: ', pattern);
        pattern = '/*';
      }
    }

    // apply fix
    options.cwd = pathRoot;
    _path = noDrivePath;

    // now letter drive searches should work whether they are root or not
    console.log(`set '${pathRoot}' as cwd and '${noDrivePath}' as path`);
  }

  // seperate path into ${parse(_path).dir}*/*${filename}*${ext} ?
  // if someone wants to search X dir using Y substring, that'd be useful

  // catch file-path
  // in case of non-c path send isFile a combination path to include root
  if (isFile(join(pathRoot, noDrivePath))) {
    console.log('file-path detected');
    // wipe all flag values
    recurse = '';
    pattern = '';
    ext = '';
    // supply just the file-path
    _path = join(pathRoot, noDrivePath);
    console.log('file-path:', _path);
  }

  // glob-string should be ready now
  console.log(`new glob-string: '${_path}${recurse}${pattern}${ext}'`);

  console.time('search execution time');

  try {
    // todo: make this and other sync calls async
    const files = glob.sync(`${_path}${recurse}${pattern}${ext}`, options);

    // console.log(
    //   '[passed glob.sync] path:',
    //   `${_path}${recurse}${pattern}${ext}`
    // );

    console.timeEnd('search execution time');

    // if file(s) exist sanitise path(s)
    if (files.length) {
      // return files
      return files.map(file => cleanGlobSyncPipe(file));
    } else {
      // no files found
      console.log('no files found', files);
      return false;
    }
  } catch (err) {
    console.error('glob error:', err);
    return false;
  }
};

// --------------------------------------------------------------------------- //

// init pre-init check to see if this module was run directly
// is it clunky to have to pass in import.meta.url?
// how can isMainESM.js be refactored so its code is executed in this context?
if (isMainESM(import.meta.url)) {
  // console.log('main.js called directly');

  if (process.platform === 'win32') {
    // proceed with main (only works on windows)
    console.time('init() execution time');
    init();
    console.timeEnd('init() execution time');
    // some functions can be used universally (seperate + document)
  } else {
    console.error('[platform is not win32] platform:', process.platform);
  }
}

// else module wasn't called directly, some function of it was, so don't run init

// --------------------------------------------------------------------------- //

/**
 * Windows filesystem utilities.
 *
 * Runs pipe-utils functions in sequence.
 * Clean, check, search, get, clean, use.
 *
 * @module Main
 *
 * */
export { init, pipeHandle, promptHandle, getFiles };

// --------------------------------------------------------------------------- //
