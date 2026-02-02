const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { getMemoriesByTrip } = require("../models/Memory");
const {
  createPlaylist,
  addSongToPlaylist,
  getPlaylistByTrip,
} = require("../models/Playlist");

const {
  getSimilarTracks,
  getArtistTopTracksByTrackId,
} = require("../services/deezerService");

// Generate a playlist automatically from a trip’s memories
// Uses the songs saved in memories and enriches them with Deezer recommendations
router.post("/generate/:tripId", auth, async (req, res) => {
  try {
    const { tripId } = req.params;

    // Retrieve all memories linked to the trip
    const memories = await getMemoriesByTrip(tripId);
    if (!memories.length) {
      return res.status(400).json({ msg: "No memories for this trip" });
    }

    // Reuse an existing playlist if it already exists, otherwise create one
    const existingPlaylists = await getPlaylistByTrip(tripId);
    const playlist =
      existingPlaylists[0] ||
      (await createPlaylist(
        tripId,
        `Playlist Passport – ${new Date().toISOString().slice(0, 10)}`
      ));

    // Track already-added songs to avoid duplicates
    const addedTrackIds = new Set();
    if (existingPlaylists[0]?.songs?.length) {
      for (const song of existingPlaylists[0].songs) {
        if (song.deezer_id) {
          addedTrackIds.add(song.deezer_id);
        }
      }
    }

    // Process each memory and enrich the playlist
    for (const memory of memories) {
      const baseTrack = {
        deezerId: memory.song_deezer_id,
        title: memory.song_title,
        artist: memory.song_artist,
        previewUrl: memory.song_preview_url,
        coverUrl: memory.song_cover_url,
      };

      // Add the original memory song to the playlist
      if (!addedTrackIds.has(baseTrack.deezerId)) {
        await addSongToPlaylist(playlist.id, baseTrack);
        addedTrackIds.add(baseTrack.deezerId);
      }

      // Fetch similar and top tracks from Deezer
      const similarTracks = await getSimilarTracks(memory.song_deezer_id, 3);
      const artistTopTracks = await getArtistTopTracksByTrackId(
        memory.song_deezer_id,
        3
      );
      const candidateTracks = [...similarTracks, ...artistTopTracks];

      // Add recommended tracks while avoiding duplicates
      for (const track of candidateTracks) {
        if (!track.deezerId || addedTrackIds.has(track.deezerId)) continue;
        await addSongToPlaylist(playlist.id, track);
        addedTrackIds.add(track.deezerId);
      }
    }

    // Return the updated playlist with all generated songs
    const playlists = await getPlaylistByTrip(tripId);
    res.json(playlists);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch all playlists (with songs) for a specific trip
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
