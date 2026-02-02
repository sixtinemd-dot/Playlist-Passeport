import { useState } from "react";
import API from "../services/api";

// Component allowing users to search and select a song via the Deezer API
export default function SongSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch songs matching the search query
  const search = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await API.get(`/songs/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search song or artist"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={search}>Search</button>

      {loading && <p>Searching…</p>}

      <ul>
        {results.map(song => (
          <li
            key={song.deezer_id}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(song)}
          >
            <strong>{song.title}</strong> — {song.artist}
            <audio src={song.preview_url} controls />
          </li>
        ))}
      </ul>
    </div>
  );
}
