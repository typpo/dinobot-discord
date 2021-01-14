const axios = require('axios');

async function getRandomDino(eats, period, region) {
  const url = `https://dinosaurpictures.org/api/dinosaur/random?eats=${eats || ''}&period=${period || ''}&region=${
    region || ''
  }&bust=${new Date().getTime()}`;
  const resp = await axios.get(url);
  return resp.data;
}

async function getDino(opts) {
  const { diet, when, where } = opts;

  for (let count = 0; count < 20; count++) {
    // Not great, but just keep trying until we get a dino with full information.
    console.log('Try random with', diet, when, where);
    const dino = await getRandomDino(diet, when, where);
    if (Object.keys(dino).length < 1) {
      return null;
    }
    const { name, period, eats } = dino;

    const regions = dino.regions.join(', ');
    if (!period || !eats || !regions || !dino.shouldShowMap || eats === '(unknown)') {
      continue;
    }

    const imageUrl = dino.pics[0].url;
    const pageUrl = `https://dinosaurpictures.org/${name}-pictures`;
    const globeUrl = `https://dinosaurpictures.org/ancient-earth/view/${name}`;

    return { name, pageUrl, period, eats, regions, globeUrl, imageUrl };
  }
  return null;
}

module.exports = {
  getDino,
};
