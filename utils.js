// --------------------------------------------------------------------------- //

import { parse } from 'path';
import { lstatSync } from 'fs';

// --------------------------------------------------------------------------- //

/**
 * Returns true if path leads to a file.
 *
 * Includes files without extensions.
 * Touches the file system and needs error handling.
 *
 * @function isFile
 * @param {string} _path - The path to be checked.
 * @return {boolean} True if path is a file, false if it is a directory.
 */

const isFile = _path => lstatSync(_path).isFile();
// re-write to distinguish error from folder
// } catch (err) {
//   // lstatSync throws an error if path doesn't exist
//   console.error('isFile(): path does not exist', err);
//   // should prob not return false.. (indicates _path is a folder)
//   throw Error(err);
// }
// };

// --------------------------------------------------------------------------- //

// do i need/even use this?

/**
 * Returns true if value exists and is a string.
 * *
 * @function isString
 * @param {string} _path - The value to be checked.
 * @return {boolean} True if string, false if not.
 */
const isString = _path => typeof _path === 'string' || _path instanceof String;

// --------------------------------------------------------------------------- //

/**
 * Returns true if value exists and is a cased letter.
 * Cleverly checks if both-cases of a char are different.
 * From: https://stackoverflow.com/a/32567789
 *
 * @function isLetter
 * @param {string} letter - The value to be checked.
 * @return {boolean} True if a cased letter, false if not.
 */

const isLetter = letter => letter.toLowerCase() != letter.toUpperCase();

// --------------------------------------------------------------------------- //

/**
 * Returns true if path root contains the operating system.
 *
 * Root may be represented as '/' or 'C:\'.
 *
 * @function inOS
 * @param {string} _path - The path to be checked.
 * @return {boolean} True if path is in OS, false if not.
 */
const inOS = _path => {
  const osRoot = '/';
  const pathRoot = parse(_path).root;

  try {
    return pathRoot && pathRoot[0] === osRoot;
  } catch (err) {
    console.error('inOS error:', err);
    // should prob not return false.. (indicates _path is not in OS)
    return false;
  }
};

// --------------------------------------------------------------------------- //

/**
 * Checks if path contains windows system directories.
 *
 * Assumes input to be a POSIX path on the operating system drive.
 *
 * @function isSystemPath
 * @param {string} _path - The path to be checked.
 * @return {boolean} Returns true for system paths, false if not.
 *
 * */
const isSystemPath = _path => {
  // could shift this entire section to glob options...
  // ...but then couldn't pass in cwd
  // this function expects cleaned input from --path and process.cwd()
  // would only be called if path is on C:\ drive

  // requires inOS() = true and cleanSysRoot() and posixPath()

  // console.log('isSystemPath _path:', _path);

  // added trim() to catch oddities with whitespace
  if (_path.trim() === '/') {
    console.error('altering files from root level of system is forbidden');
    return true;
  }

  // forbidden path segments
  const forbiddenPaths = [
    '/jim/Application Data',
    '/jim/AppData',
    '/jim/Local Settings'
  ];

  for (const forbiddenPath of forbiddenPaths) {
    if (_path.includes(forbiddenPath)) {
      console.error(
        `altering files inside '${forbiddenPath}' system path is forbidden`
      );
      return true;
    }
  }

  // forbidden root paths
  const forbiddenRootPaths = [
    '/Windows',
    '/ProgramData',
    '/Program Files',
    '/Program Files (x86)',
    '/Recovery',
    '/PerfLogs',
    '/$Recycle.Bin',
    '/$RECYCLE.BIN',
    '/Documents and Settings',
    '/System Volume Information'
  ];

  for (const forbiddenRootPath of forbiddenRootPaths) {
    if (_path.startsWith(forbiddenRootPath)) {
      console.error(
        `altering files inside '${forbiddenRootPath}' root system path is forbidden`
      );
      return true;
    }
  }

  // is not a root system path
  return false;
};

// --------------------------------------------------------------------------- //

/**
 * Returns true if path is safe to edit.
 *
 * If not in OS or if in OS but not in a system path
 *
 * Stops editing of windows operating system files.
 * Allows editing across different letter drives.
 * Wraps other functions from this module in conditional logic.
 *
 * @function isSafeWinPath
 * @param {string} _path - The path to be checked.
 * @return {boolean} True if path is safe, false if not.
 * */
const isSafeWinPath = _path =>
  !inOS(_path) || (inOS(_path) && !isSystemPath(_path));

// --------------------------------------------------------------------------- //

/**
 * Windows filesystem utility functions.
 *
 * @module Utils
 *
 * */
export { isFile, isString, isLetter, inOS, isSystemPath, isSafeWinPath };

// --------------------------------------------------------------------------- //
