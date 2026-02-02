// Import route handlers
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const memoryRoutes = require("./routes/memories");
const playlistRoutes = require("./routes/playlist");
const songsRoutes = require("./routes/songs");
const uploadsRoutes = require("./routes/uploads");

// Core dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Database connection helper
const { connectDB } = require("./config/db");

const app = express();

/**
 * =========================
 * Global Middleware
 * =========================
 * - CORS: allow frontend requests
 * - JSON parsing for request bodies
 */
app.use(cors());
app.use(express.json());

/**
 * =========================
 * API Routes
 * =========================
 * Each route is responsible for a specific feature of the app
 */
app.use("/auth", authRoutes);         // User authentication (login/register)
app.use("/trips", tripRoutes);        // Trip creation, listing, finishing
app.use("/memories", memoryRoutes);   // Memories (locations + songs + photos)
app.use("/songs", songsRoutes);       // Song search via Deezer API
app.use("/playlists", playlistRoutes); // Playlist generation & retrieval
app.use("/uploads", uploadsRoutes);   // Photo uploads

/**
 * =========================
 * Static Files
 * =========================
 * Serve uploaded images so they can be accessed publicly
 */
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

/**
 * =========================
 * Health Check Route
 * =========================
 * Simple endpoint to verify the API is running
 */
app.get("/", (req, res) => {
  res.send("Playlist Passport API is running");
});

/**
 * =========================
 * Database Connection
 * =========================
 * Connect to the Neon PostgreSQL database
 */
connectDB();

/**
 * =========================
 * Server Startup
 * =========================
 */
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
