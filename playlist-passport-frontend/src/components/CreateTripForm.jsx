// src/components/CreateTripForm.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Axios instance
import { AuthContext } from "../context/AuthContext";

export default function CreateTripForm({ onTripCreated }) {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      // Optionally inform parent component
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
