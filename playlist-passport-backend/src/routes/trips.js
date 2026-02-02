const { pool } = require("../config/db");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createTrip,
  getTripsByUser,
  getTripById,
  finishTrip,
  finishTripAndGeneratePlaylist,
  deleteTrip, 
} = require("../models/Trip");

// Create a trip
router.post("/", auth, async (req, res) => {
  try {
    const trip = await createTrip(req.user.id, req.body.title);
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all trips for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const trips = await getTripsByUser(req.user.id);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single trip
router.get("/:id", auth, async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// When a trip is finished
router.patch("/:id/finish", auth, async (req, res) => {
  try {
    const tripId = req.params.id;

    // Get trip title
    const tripRes = await pool.query("SELECT title FROM trips WHERE id = $1", [tripId]);
    if (!tripRes.rows.length) return res.status(404).json({ msg: "Trip not found" });
    const tripTitle = tripRes.rows[0].title;

    // Finish trip + generate playlist
    const result = await finishTripAndGeneratePlaylist(tripId, tripTitle);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a trip
router.delete("/:id", auth, async (req, res) => {
  try {
    await deleteTrip(req.params.id);
    res.json({ msg: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;