import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`http://127.0.0.1:5000/search?location_name=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (response.ok) {
        setLocationDetails(data);
      } else {
        setError(data.message || "Location not found.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl p-5 w-full max-w-xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a location..."
          className="w-full pl-4 pr-10 py-2 rounded-lg bg-white/20 backdrop-blur-md text-black placeholder-gray-600 border border-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
        <button
          onClick={handleSearch}
          className="absolute right-3 top-2.5 text-gray-700 hover:text-purple-600 transition"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Feedback */}
      {loading && (
        <p className="text-sm text-gray-600 animate-pulse">Searching...</p>
      )}
      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}

      {/* Result Box */}
      {locationDetails && (
        <div className="p-4 rounded-lg bg-white/50 backdrop-blur-md border border-gray-300 text-sm font-mono whitespace-pre-wrap">
          <pre>{JSON.stringify(locationDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SearchBar;