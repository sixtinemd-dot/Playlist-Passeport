const { pool } = require("../config/db");

// Add a photo to a memory
const addPhotoToMemory = async (memoryId, photoUrl) => {
  const query = `
    INSERT INTO photos (memory_id, photo_url)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await pool.query(query, [memoryId, photoUrl]);
  return result.rows[0];
};

// Get all photos for a memory
const getPhotosByMemory = async (memoryId) => {
  const query = `
    SELECT * FROM photos
    WHERE memory_id = $1
  `;
  const result = await pool.query(query, [memoryId]);
  return result.rows;
};

module.exports = {
  addPhotoToMemory,
  getPhotosByMemory,
};
