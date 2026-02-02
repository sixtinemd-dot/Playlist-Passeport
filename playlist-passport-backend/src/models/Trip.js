const { pool } = require("../config/db");

// Create a new trip
const createTrip = async (userId, title) => {
  const result = await pool.query(
    `INSERT INTO trips (user_id, title) VALUES ($1, $2) RETURNING *`,
    [userId, title]
  );
  return result.rows[0];
};

// Get all trips for a user
const getTripsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Get one trip
const getTripById = async (tripId) => {
  const result = await pool.query(
    `SELECT * FROM trips WHERE id = $1`,
    [tripId]
  );
  return result.rows[0];
};

// Finish trip (DB ONLY)
const finishTrip = async (tripId) => {
  const result = await pool.query(
    `UPDATE trips SET is_finished = true WHERE id = $1 RETURNING *`,
    [tripId]
  );
  return result.rows[0];
};

// Delete trip
const deleteTrip = async (tripId) => {
  await pool.query(`DELETE FROM trips WHERE id = $1`, [tripId]);
};

const { getSimilarTracks } = require("./Deezer"); // or deezerService path

// Finish trip + generate playlist
const finishTripAndGeneratePlaylist = async (tripId) => {
  // 1️⃣ Mark trip as finished
  const tripRes = await pool.query(
    `UPDATE trips SET is_finished = true WHERE id = $1 RETURNING *`,
    [tripId]
  );
  const trip = tripRes.rows[0];

  // 2️⃣ Get memories for this trip
  const memoriesRes = await pool.query(
    `SELECT * FROM memories WHERE trip_id = $1`,
    [tripId]
  );
  const memories = memoriesRes.rows;

  // 3️⃣ Create playlist
  const playlistRes = await pool.query(
    `INSERT INTO playlists (trip_id, name)
     VALUES ($1, $2)
     RETURNING *`,
    [tripId, `${trip.title} Playlist`]
  );
  const playlist = playlistRes.rows[0];

  // 4️⃣ For each memory, add the original song + similar songs
  for (const memory of memories) {
    if (!memory.song_deezer_id) continue;

    // Save original song
    await pool.query(
      `INSERT INTO playlist_songs
       (playlist_id, deezer_id, title, artist, preview_url, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        playlist.id,
        memory.song_deezer_id,
        memory.song_title,
        memory.song_artist,
        memory.song_preview_url || null,
        memory.cover_url || null
      ]
    );

    // Get similar songs from Deezer
    const relatedTracks = await getSimilarTracks(memory.song_deezer_id);

    for (const track of relatedTracks) {
      await pool.query(
        `INSERT INTO playlist_songs
         (playlist_id, deezer_id, title, artist, preview_url, cover_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          playlist.id,
          track.deezerId,
          track.title,
          track.artist,
          track.previewUrl,
          track.coverUrl
        ]
      );
    }
  }

  return {
    trip,
    playlist
  };
};


module.exports = {
  createTrip,
  getTripsByUser,
  getTripById,
  finishTrip,
  finishTripAndGeneratePlaylist,
  deleteTrip,
};
