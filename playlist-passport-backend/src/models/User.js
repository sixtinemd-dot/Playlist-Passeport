const { pool } = require("../config/db");

// Create a new user in the database with a hashed password
const createUser = async (email, hashedPassword) => {
  const query = `
    INSERT INTO users (email, password)
    VALUES ($1, $2)
    RETURNING id, email, created_at
  `;
  const values = [email, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Retrieve a user by email (used for login and registration checks)
const getUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

module.exports = {
  createUser,
  getUserByEmail,
};

