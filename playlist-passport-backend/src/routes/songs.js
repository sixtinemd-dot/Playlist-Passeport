const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { searchSongs } = require("../models/Songs");

// GET /songs/search
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;
    const songs = await searchSongs(q);
    res.json(songs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search songs" });
  }
});

module.exports = router;
