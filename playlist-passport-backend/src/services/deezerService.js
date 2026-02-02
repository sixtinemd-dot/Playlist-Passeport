const axios = require("axios");

// Get similar songs from Deezer
const getSimilarTracks = async (deezerTrackId, limit = 5) => {
  if (!deezerTrackId) return [];

  const url = `https://api.deezer.com/track/${deezerTrackId}/related`;

  const response = await axios.get(url);

  return response.data.data.slice(0, limit).map(track => ({
    deezer_id: track.id,
    title: track.title,
    artist: track.artist?.name || "Unknown",
    preview_url: track.preview || null,
    cover_url: track.album?.cover_medium || null,
  }));
};

module.exports = {
  getSimilarTracks,
};

