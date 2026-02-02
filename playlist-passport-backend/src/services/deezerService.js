const axios = require("axios");

// Get similar songs from Deezer based on a track id.
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

// Get top tracks for the artist behind a track id
const getArtistTopTracksByTrackId = async (deezerTrackId, limit = 3) => {
  if (!deezerTrackId) return [];

  const trackRes = await axios.get(`https://api.deezer.com/track/${deezerTrackId}`);
  const artistId = trackRes.data?.artist?.id;
  if (!artistId) return [];

  const topRes = await axios.get(
    `https://api.deezer.com/artist/${artistId}/top?limit=${limit}`
  );
  const tracks = Array.isArray(topRes.data?.data) ? topRes.data.data : [];

  return tracks.map((track) => ({
    deezerId: track.id,
    title: track.title,
    artist: track.artist?.name || "Unknown",
    previewUrl: track.preview || null,
    coverUrl: track.album?.cover_medium || null,
  }));
};

module.exports = {
  getSimilarTracks,
  getArtistTopTracksByTrackId,
};
