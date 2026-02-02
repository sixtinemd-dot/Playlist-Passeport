const { Pool } = require("pg");

// Create a connection pool to the Neon PostgreSQL database
// All credentials are loaded from environment variables for security
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

// Function to test and confirm the database connection on server startup
// This ensures the backend fails fast if the database is unreachable
const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Neon DB connected");
  } catch (err) {
    console.error("Neon DB connection error:", err);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };

