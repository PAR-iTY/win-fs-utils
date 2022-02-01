// --------------------------------------------------------------------------- //

import NodeID3 from 'node-id3';
// use to 'remind' NodeID3 of file states
// import touch from 'touch';

// --------------------------------------------------------------------------- //

/**
 * Reads ID3 tag values, edits them and saves changes to file.
 *
 * @function tweakTags
 * @param {string[]} files - The targeted mp3 files.
 * @param {string} tag - The key name of the target tag.
 * @param {string} find - The substring of the target tag to be replaced.
 * @param {string} replace - The replacement substring for the target tag.
 */
const tweakTags = (files, tag, find, replace) => {
  // console.log('running tweakTags..');
  console.time('tweakTags load time');

  // read options
  // include: ['artist', 'album', 'title'],
  const options = {
    noRaw: true
  };

  try {
    for (const file of files) {
      // get tags of file as an object
      const tags = NodeID3.read(file, options);

      // console.log('calling tweakTagsObject..');
      // update tags object

      const tweakedTags = tweakTagsObject(tags, tag, find, replace);
      // const tweakedTags = tweakTagsObject(tags, tag, tags.artist, '');

      // write updated tags back to file
      const updated = NodeID3.write(tweakedTags, file);

      // catch write failure
      if (!updated) {
        console.error('[tag write error]', file);
      }
    }
  } catch (err) {
    console.error('NodeID3 error:', err);
  }

  console.timeEnd('tweakTags load time');
};

/**
 * ID3 tag substring replacer/remover.
 * this could accept a general metadata object if it were flat
 * @function tweakTagsObject
 * @param {Object} tags - The ID3 tags object of an mp3 file.
 * @param {string} tag - The keyname of the tag to be targeted.
 * @param {string} find - The substring of the target tag to be replaced.
 * @param {string} replace - The replacement substring for the target tag.
 * @return {Object} The updated ID3 tags object of an mp3 file.
 */
const tweakTagsObject = (tags, tag, find, replace) => {
  // console.log('tags: ', tags);
  console.log(`tags.${tag}:`, tags[`${tag}`]);

  // ID3-tags.js will not be called if tag and replace args not supplied
  // find arg is optional
  if (find) {
    // match and edit an existing tag string
    console.log(`looking for '${find}' substring in '${tag}' tag..`);

    if (tag.toLowerCase() === 'artist') {
      // find and replace artist and contributing artist values
      tags.artist = tags.artist.replace(`${find}`, replace);
      tags.performerInfo = tags.performerInfo.replace(`${find}`, replace);
    }

    // generalised find and replace method
    tags[`${tag}`] = tags[`${tag}`].replace(`${find}`, replace);
  } else {
    // replace a tag value with a new value
    if (tag.toLowerCase() === 'artist') {
      // replace artist and contributing artist values
      tags.artist = replace;
      tags.performerInfo = replace;
    } else {
      // generalised replace method
      tags[`${tag}`] = replace;
    }
  }

  return tags;
};

// --------------------------------------------------------------------------- //

/**
 * ID3 metadata editor.
 *
 * @module ID3-tags
 *
 * */
export { tweakTags, tweakTagsObject };

// --------------------------------------------------------------------------- //

// new idea: avoid writing whole tags object back to file
// 1) pass only necessary tags: (tags.tag, tag, tag.artist)
// 2) make changes to tag value
// 3) use NodeID3.update() with a custom object of just the changed tags
// 4) NodeID3.update( { tags.tag: updatedValue } )
// console.log('Contributing artists:', tags?.artist);
// console.log('Album artist:', tags?.performerInfo);
// then task is to match and edit an existing tag string
// attempted generalisation (update ' - ' suffix approach):

// test:
// faster way to update metadata if the values are known before-hand
// to add: pass in object as an argument
// const addTags = () => {
//   console.log('running addTags..');

//   const tags_update = { title: 'EFFICIENCY GAINZ' };

//   const success = NodeID3.update(tags_update, './1.mp3');

//   console.log('success:', success);
// };

// remove '[Artist] - ' prefix from song title
// dont do checks so deep in this loop-nested-function:
// eventually use a config object as an arg, much easier
// use properties to drive modes like artist/album
// can include presets like youtube-dl common mistakes
// artist name in title, clean youtube-id off (do in yt-dl args?)

// console.log('Contributing artists:', tags?.artist);
// console.log('Album artist:', tags?.performerInfo);
// console.log(`\ntags.${tag}:`, tags[`${tag}`]);

// --------------------------------------------------------------------------- //
