const axios = require("axios");

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
