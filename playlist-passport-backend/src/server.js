const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const memoryRoutes = require("./routes/memories");
const playlistRoutes = require("./routes/playlist");
const songsRoutes = require("./routes/songs");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/trips", tripRoutes);
app.use("/memories", memoryRoutes);

app.use("/songs", songsRoutes);

// ...other routes
app.use("/playlists", playlistRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Playlist Passport API is running");
});

// Connect to Neon DB
connectDB();

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
