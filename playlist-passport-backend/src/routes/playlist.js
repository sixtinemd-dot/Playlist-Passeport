const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { getMemoriesByTrip } = require("../models/Memory");
const {
  createPlaylist,
  addSongToPlaylist,
  getPlaylistByTrip,
} = require("../models/Playlist");

const { getSimilarTracks } = require("../services/deezerService");

/**
 * POST /playlist/generate/:tripId
 * Generate playlist automatically from memories
 */
router.post("/generate/:tripId", auth, async (req, res) => {
  try {
    const { tripId } = req.params;

    const memories = await getMemoriesByTrip(tripId);
    if (!memories.length) {
      return res.status(400).json({ msg: "No memories for this trip" });
    }

    const playlist = await createPlaylist(
      tripId,
      `Playlist Passport – ${new Date().toISOString().slice(0, 10)}`
    );

    for (const memory of memories) {
      if (!memory.song_deezer_id) continue;

      const similarTracks = await getSimilarTracks(memory.song_deezer_id, 5);

      for (const track of similarTracks) {
        await addSongToPlaylist(playlist.id, track);
      }
    }

    const playlists = await getPlaylistByTrip(tripId);
    res.json(playlists);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /playlists/:tripId
 * Fetch playlists + songs for a trip
 */
router.get("/:tripId", auth, async (req, res) => {
  try {
    const playlists = await getPlaylistByTrip(req.params.tripId);

    if (!playlists.length) {
      return res.status(404).json({ msg: "No playlists found for this trip" });
    }

    res.json(playlists);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
