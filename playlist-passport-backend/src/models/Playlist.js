const { pool } = require("../config/db");

// Create playlist
const createPlaylist = async (tripId, name) => {
  const query = `
    INSERT INTO playlists (trip_id, name)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await pool.query(query, [tripId, name]);
  return result.rows[0];
};

// Add a song to the playlist while skipping duplicates.
const addSongToPlaylist = async (playlistId, song) => {
  const deezerId = song.deezerId ?? song.deezer_id;
  if (!deezerId) return;

  const existing = await pool.query(
    "SELECT 1 FROM playlist_songs WHERE playlist_id = $1 AND deezer_id = $2",
    [playlistId, deezerId]
  );
  if (existing.rowCount > 0) return;

  const query = `
    INSERT INTO playlist_songs
    (playlist_id, deezer_id, title, artist, preview_url, cover_url)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  await pool.query(query, [
    playlistId,
    deezerId,
    song.title,
    song.artist,
    song.previewUrl ?? song.preview_url,
    song.coverUrl ?? song.cover_url,
  ]);
};

// Get playlist with songs
const getPlaylistByTrip = async (tripId) => {
  // 1: Get playlists for this trip
  const playlistQuery = `SELECT * FROM playlists WHERE trip_id = $1`;
  const playlistRes = await pool.query(playlistQuery, [tripId]);
  const playlists = playlistRes.rows;

  if (!playlists.length) return [];

  // 2: Attach songs to each playlist
  for (const playlist of playlists) {
    const songsRes = await pool.query(
      "SELECT * FROM playlist_songs WHERE playlist_id = $1",
      [playlist.id]
    );
    playlist.songs = songsRes.rows;
  }

  return playlists;
};


module.exports = {
  createPlaylist,
  addSongToPlaylist,
  getPlaylistByTrip,
};
