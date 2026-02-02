const axios = require("axios");

// Get similar songs from Deezer
const getSimilarTracks = async (deezerTrackId, limit = 5) => {
  if (!deezerTrackId) return [];

  const url = `https://api.deezer.com/track/${deezerTrackId}/related`;

  const response = await axios.get(url);
  const tracks = Array.isArray(response.data?.data) ? response.data.data : [];

  return tracks.slice(0, limit).map((track) => ({
    deezerId: track.id,
    title: track.title,
    artist: track.artist?.name || "Unknown",
    previewUrl: track.preview || null,
    coverUrl: track.album?.cover_medium || null,
  }));
};

module.exports = {
  getSimilarTracks,
};
