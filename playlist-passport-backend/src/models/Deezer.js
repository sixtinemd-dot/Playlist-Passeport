const axios = require("axios");

// Get related tracks from Deezer for a song
const getSimilarTracks = async (title, artist, limit = 3) => {
  try {
    // Search track on Deezer
    const query = `track:"${encodeURIComponent(title)}" artist:"${encodeURIComponent(artist)}"`;
    const searchRes = await axios.get(`https://api.deezer.com/search?q=${query}&limit=1`);

    if (!searchRes.data || !searchRes.data.data.length) return [];

    const trackId = searchRes.data.data[0].id;

    // Get related tracks
    const relatedRes = await axios.get(`https://api.deezer.com/track/${trackId}/related`);
    const tracks = relatedRes.data.data.slice(0, limit).map((t) => ({
      title: t.title,
      artist: t.artist.name,
      deezer_id: t.id,
      preview_url: t.preview,   // 30-sec preview
      cover_url: t.album.cover_medium
    }));

    return tracks;
  } catch (err) {
    console.error("Deezer API error:", err.message);
    return [];
  }
};

module.exports = { getSimilarTracks };
