
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { AuthContext } from "../context/AuthContext";

/**
 * CreateTripForm
 * ----------------
 * Form component allowing a logged-in user to create a new trip.
 * On success:
 * - optionally notifies the parent component
 * - redirects the user to the Trip Details page
 */
export default function CreateTripForm({ onTripCreated }) {
  const { token } = useContext(AuthContext);

  // Local form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Router navigation helper
  const navigate = useNavigate();

  /**
   * Handle form submission
   * - Sends POST /trips to the backend
   * - Redirects to the newly created trip page
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/trips",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTrip = res.data;

      // Inform parent component if callback is provided
      if (onTripCreated) onTripCreated(newTrip);

      // Redirect to Trip Details page
      navigate(`/trips/${newTrip.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render trip creation form
   */
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <h2>Create a New Trip</h2>

      <input
        type="text"
        placeholder="Trip title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Trip"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
