const { pool } = require("../config/db");

// Create a new memory linked to a trip
// A memory represents a place, a song, optional photos, and geographic coordinates
const createMemory = async (
  tripId,
  locationName,
  song,
  latitude = null,
  longitude = null
) => {
  const query = `
    INSERT INTO memories 
    (trip_id, location_name, song_title, song_artist, song_deezer_id, song_preview_url, song_cover_url, latitude, longitude)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;

  const values = [
    tripId,
    locationName,
    song.title,
    song.artist,
    song.deezer_id,
    song.preview_url || null,
    song.cover_url || null,
    latitude ?? null,
    longitude ?? null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Retrieve all memories associated with a specific trip
const getMemoriesByTrip = async (tripId) => {
  const query = `
    SELECT * FROM memories
    WHERE trip_id = $1
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query, [tripId]);
  return result.rows;
};

module.exports = {
  createMemory,
  getMemoriesByTrip,
};
