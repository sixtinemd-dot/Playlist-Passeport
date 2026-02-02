const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createMemory, getMemoriesByTrip } = require("../models/Memory");
const { addPhotoToMemory, getPhotosByMemory } = require("../models/Photo");

// Create a memory for a trip
router.post("/:tripId", auth, async (req, res) => {
  try {
    const { locationName, song, photos, latitude, longitude } = req.body;

    const memory = await createMemory(
      req.params.tripId,
      locationName,
      song,
      latitude,
      longitude
    );

    // Add multiple photos
    if (photos && photos.length > 0) {
      for (const photoUrl of photos) {
        await addPhotoToMemory(memory.id, photoUrl);
      }
    }

    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get memories (with photos) for a trip
router.get("/:tripId", auth, async (req, res) => {
  try {
    const memories = await getMemoriesByTrip(req.params.tripId);

    for (const memory of memories) {
      const photos = await getPhotosByMemory(memory.id);
      memory.photos = photos;
    }

    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
