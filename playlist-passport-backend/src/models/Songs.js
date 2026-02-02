const axios = require("axios");

// Search songs on the Deezer API based on a text query
// Returns a simplified list of tracks used by the frontend
const searchSongs = async (query, limit = 10) => {
  if (!query) return [];

  const res = await axios.get(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );

  return res.data.data.map(track => ({
    deezer_id: track.id,
    title: track.title,
    artist: track.artist.name,
    preview_url: track.preview,
    cover_url: track.album.cover_medium,
  }));
};

module.exports = { searchSongs };

