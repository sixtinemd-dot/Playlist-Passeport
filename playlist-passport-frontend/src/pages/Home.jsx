import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/API"; // Axios instance
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const { user, token, logout } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [newTripTitle, setNewTripTitle] = useState("");
  const navigate = useNavigate();

  // Fetch user's trips on mount
  useEffect(() => {
    if (!token) return;

    const fetchTrips = async () => {
      try {
        const res = await API.get("/trips", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips(res.data);
      } catch (err) {
        console.error("Error fetching trips:", err);
      }
    };

    fetchTrips();
  }, [token]);

  // Handle creating a new trip
  const handleCreateTrip = async () => {
    if (!newTripTitle.trim()) return alert("Enter a trip title!");

    try {
      const res = await API.post(
        "/trips",
        { title: newTripTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTrip = res.data;

      // Add the new trip to state
      setTrips([newTrip, ...trips]);
      setNewTripTitle("");

      // Redirect directly to the Trip Details page
      navigate(`/trips/${newTrip.id}`);
    } catch (err) {
      console.error("Error creating trip:", err);
      alert("Failed to create trip. Check console for details.");
    }
  };

  // Navigate to trip details (memories / playlist)
  const goToTrip = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;

    try {
      await API.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err);
      alert("Delete failed");
    }
  };


  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <p className="home-kicker">Welcome</p>
          <h1>{user?.email || "Traveler"}'s Trips</h1>
          <p className="home-subtitle">
            Capture memories, map your journey, and build the soundtrack to your
            adventures.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Log Out
        </button>
      </header>

      {/* Create Trip Form */}
      <section className="card create-trip-card">
        <h2>Start a new trip</h2>
        <div className="create-trip-form">
          <input
            type="text"
            placeholder="New Trip Title"
            value={newTripTitle}
            onChange={(e) => setNewTripTitle(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreateTrip}>
            Create Trip
          </button>
        </div>
      </section>

      {/* List of Trips */}
      <h2 className="section-title">My Trips</h2>
      {trips.length === 0 ? (
        <p className="empty-state">No trips yet. Start by creating one!</p>
      ) : (
        <ul className="trip-list">
          {trips.map((trip) => (
            <li key={trip.id} className="trip-card">
              <div>
                <p className="trip-title">{trip.title}</p>
                <p className="trip-status">
                  {trip.is_finished ? "Finished" : "Ongoing"}
                </p>
              </div>
              <div className="trip-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => goToTrip(trip.id)}
                >
                  View
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteTrip(trip.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
