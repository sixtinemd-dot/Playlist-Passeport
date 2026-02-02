import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/API"; // Axios instance
import { useNavigate } from "react-router-dom";

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
      navigate(`/trip/${newTrip.id}`);
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
    <div style={{ padding: "2rem" }}>
      <h1>Welcome, {user?.email || "Traveler"}!</h1>
      <button onClick={logout} style={{ marginBottom: "1rem" }}>
        Log Out
      </button>

      {/* Create Trip Form */}
      <div style={{ margin: "2rem 0" }}>
        <input
          type="text"
          placeholder="New Trip Title"
          value={newTripTitle}
          onChange={(e) => setNewTripTitle(e.target.value)}
        />
        <button onClick={handleCreateTrip}>Create Trip</button>
      </div>

      {/* List of Trips */}
      <h2>My Trips</h2>
      {trips.length === 0 ? (
        <p>No trips yet. Start by creating one!</p>
      ) : (
        <ul>
          {trips.map((trip) => (
            <li key={trip.id} style={{ marginBottom: "1rem" }}>
              <strong>{trip.title}</strong> —{" "}
              {trip.is_finished ? "Finished" : "Ongoing"}{" "}
              <button onClick={() => goToTrip(trip.id)}>View</button>
              <button
                onClick={() => handleDeleteTrip(trip.id)}
                style={{ marginLeft: "8px", color: "red" }}
                >
                Delete
                </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
