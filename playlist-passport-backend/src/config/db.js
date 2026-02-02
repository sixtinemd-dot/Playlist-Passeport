const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

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

