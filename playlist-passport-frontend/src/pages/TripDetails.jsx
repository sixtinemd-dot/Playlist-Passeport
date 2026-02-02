import "../styles/TripDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/API";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

export default function TripDetails() {
  const { tripId } = useParams();

  const [trip, setTrip] = useState(null);
  const [memories, setMemories] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  const [newMemory, setNewMemory] = useState({
    locationName: "",
    song: null,
    photos: [],
    latitude: 48.8566,
    longitude: 2.3522,
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [songQuery, setSongQuery] = useState("");
  const [songResults, setSongResults] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [mapTarget, setMapTarget] = useState(null);

  /* =========================
     FETCH TRIP + MEMORIES
  ========================== */
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripRes = await API.get(`/trips/${tripId}`);
        setTrip(tripRes.data);

        const memoriesRes = await API.get(`/memories/${tripId}`);
        setMemories(memoriesRes.data);

        if (tripRes.data.is_finished) {
          const playlistRes = await API.get(`/playlists/${tripId}`);
          setPlaylist(playlistRes.data);
        }
      } catch (err) {
        console.error("Failed to load trip data", err);
      }
    };

    fetchTripData();
  }, [tripId]);

  /* =========================
     MEMORY HELPERS
  ========================== */
  const handleAddPhoto = () => {
    if (!newPhotoUrl) return;
    setNewMemory((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhotoUrl],
    }));
    setNewPhotoUrl("");
  };

  const searchSongs = async () => {
    if (!songQuery) return;
    try {
      const res = await API.get(`/songs/search?q=${songQuery}`);
      setSongResults(res.data);
    } catch (err) {
      console.error("Song search failed", err);
    }
  };

  const handleLocationSearch = async (event) => {
    event.preventDefault();
    if (!locationQuery.trim()) return;

    setLocationStatus("Searching...");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationQuery
        )}&limit=1`
      );
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        setLocationStatus("No locations found. Try another address.");
        return;
      }

      const [result] = data;
      const lat = Number(result.lat);
      const lng = Number(result.lon);

      setNewMemory((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        locationName: prev.locationName || result.display_name,
      }));
      setMapTarget({ lat, lng });
      setLocationStatus(`Pinned: ${result.display_name}`);
    } catch (err) {
      console.error("Location search failed", err);
      setLocationStatus("Search failed. Please try again.");
    }
  };

  const handleAddMemory = async () => {
    if (!newMemory.locationName || !newMemory.song) {
      alert("Please fill location and select a song");
      return;
    }

    try {
      const res = await API.post(`/memories/${tripId}`, {
        locationName: newMemory.locationName,
        song: {
            deezer_id: newMemory.song.deezer_id,
            title: newMemory.song.title,
            artist: newMemory.song.artist,
            preview_url: newMemory.song.preview_url,
            cover_url: newMemory.song.cover_url,
        },
        photos: newMemory.photos,
        latitude: newMemory.latitude,
        longitude: newMemory.longitude,
      });

      setMemories((prev) => [...prev, res.data]);

      setNewMemory({
        locationName: "",
        song: null,
        photos: [],
        latitude: 48.8566,
        longitude: 2.3522,
      });
    } catch (err) {
      console.error("Failed to create memory", err.response?.data || err);
    }
  };

    const handleFinishTrip = async () => {
    if (!window.confirm("Finish this trip and generate playlist?")) return;

    try {
        // 1) finish trip in DB
        const tripRes = await API.patch(`/trips/${tripId}/finish`);
        setTrip(tripRes.data);

        // 2) generate playlist (THIS WAS MISSING)
        await API.post(`/playlists/generate/${tripId}`);

        // 3) fetch playlist + songs
        const playlistRes = await API.get(`/playlists/${tripId}`);
        setPlaylist(playlistRes.data);

        alert("Trip finished! Playlist generated.");
    } catch (err) {
        console.error("Finish trip failed:", err.response?.data || err);
        alert("Finish trip failed — check console.");
    }
    };

  if (!trip) return <p>Loading trip...</p>;

  function MapClickHandler({ onPick }) {
    useMapEvents({
      click(e) {
        onPick(e.latlng);
      },
    });
    return null;
  }

  function MapViewController({ target }) {
    const map = useMap();

    useEffect(() => {
      if (!target) return;
      map.setView([target.lat, target.lng], 8, { animate: true });
    }, [map, target]);

    return null;
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="trip-details-container">
      <h1>{trip.title}</h1>
      <p>Status: {trip.is_finished ? "Finished" : "Ongoing"}</p>

      {!trip.is_finished && (
        <button className="finish-trip-btn" onClick={handleFinishTrip}>
          Finish Trip & Generate Playlist
        </button>
      )}

      <section className="map-panel">
        <div className="map-panel-header">
          <h2>Memories Map</h2>
          <p>Tap the map to drop a pin, or search an address below.</p>
        </div>
        {!trip.is_finished && (
          <form className="location-search" onSubmit={handleLocationSearch}>
            <input
              type="text"
              placeholder="Search an address or city"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        )}
        {locationStatus && (
          <p className="location-status">{locationStatus}</p>
        )}
        <MapContainer className="memories-map" center={[48.8566, 2.3522]} zoom={5}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewController target={mapTarget} />

          {/* click-to-pin */}
          <MapClickHandler
            onPick={({ lat, lng }) => {
              setNewMemory((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
              }));
            }}
          />

          {/* preview marker for new memory */}
          {!trip.is_finished && newMemory.latitude && newMemory.longitude && (
            <Marker position={[newMemory.latitude, newMemory.longitude]}>
              <Popup>📍 New memory location</Popup>
            </Marker>
          )}

          {/* existing memories */}
          {memories.map((mem) => (
            <Marker
              key={mem.id}
              position={[mem.latitude || 48.8566, mem.longitude || 2.3522]}
            >
              <Popup>
                <strong>{mem.location_name}</strong>
                <br />
                🎵 {mem.song_title} — {mem.song_artist}
                <div className="photos-container">
                  {mem.photos?.map((p, i) => (
                    <img key={i} src={p} alt="Memory" />
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {!trip.is_finished && (
        <div className="memory-form">
          <h2>Add New Memory</h2>

          <input
            type="text"
            placeholder="Location Name"
            value={newMemory.locationName}
            onChange={(e) =>
              setNewMemory({ ...newMemory, locationName: e.target.value })
            }
          />

          <h3>Choose a song</h3>

          <input
            type="text"
            placeholder="Search song (title or artist)"
            value={songQuery}
            onChange={(e) => setSongQuery(e.target.value)}
          />
          <button onClick={searchSongs}>Search</button>

          <ul>
            {songResults.map((song) => (
              <li
                key={song.deezer_id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                    setNewMemory((prev) => ({ ...prev, song }));
                    setSongResults([]);
                    setSongQuery(`${song.title} - ${song.artist}`);
                    }}
              >
                🎵 {song.title} — {song.artist}
                <audio controls src={song.preview_url} />
              </li>
            ))}
          </ul>

          {newMemory.song && (
            <p>
              ✅ Selected: <strong>{newMemory.song.title}</strong> —{" "}
              {newMemory.song.artist}
            </p>
          )}

          <input
            type="number"
            placeholder="Latitude"
            value={newMemory.latitude}
            onChange={(e) =>
              setNewMemory((prev) => ({
                ...prev,
                latitude: Number(e.target.value),
              }))
            }
          />
          <input
            type="number"
            placeholder="Longitude"
            value={newMemory.longitude}
            onChange={(e) =>
              setNewMemory({ ...newMemory, longitude: Number(e.target.value) })
            }
          />

          <input
            type="text"
            placeholder="Photo URL"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
          />
          <button onClick={handleAddPhoto}>Add Photo</button>

          <button onClick={handleAddMemory}>Save Memory</button>

          <h2>Memories / Pins</h2>
        {memories.length === 0 ? (
        <p>No memories yet.</p>
        ) : (
        <ul>
            {memories.map((mem) => (
            <li key={mem.id} style={{ marginBottom: "1rem" }}>
                <strong>{mem.location_name}</strong>
                <div>
                🎵 {mem.song_title} — {mem.song_artist}
                </div>
                {mem.photos?.length > 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    {mem.photos.map((p, i) => (
                    <img
                        key={i}
                        src={p}
                        alt="memory"
                        style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px" }}
                    />
                    ))}
                </div>
                )}
            </li>
            ))}
        </ul>
        )}
                </div>
                
            )}

        {trip.is_finished && (
        <div className="playlist-section">
            <h2>Playlist</h2>

            {playlist.length === 0 ? (
            <p>No playlist found yet.</p>
            ) : (
            playlist.map((pl) => (
                <div key={pl.id} style={{ marginBottom: "1rem" }}>
                <strong>{pl.name}</strong>
                <ul>
                    {pl.songs?.map((song, i) => (
                    <li key={i}>
                        {song.title} — {song.artist}
                        {song.preview_url && <audio controls src={song.preview_url} />}
                    </li>
                    ))}
                </ul>
                </div>
            ))
            )}
        </div>
        )}
    </div>
  );
}
