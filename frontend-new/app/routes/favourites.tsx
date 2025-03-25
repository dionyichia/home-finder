import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Location {
  location_name: string;
  description?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  population?: number;
  [key: string]: any;
}

// API Methods
const api = {
  /**
   * Search for a location by name
   */
  searchLocation: async (locationName: string): Promise<Location> => {
    // Simulated location data for demo purposes
    // Have to change this to work with the api -> need to set up favourites database for each user?
    const mockLocations: {[key: string]: Location} = {
      "Jurong": {
        location_name: "Jurong",
        description: "The most populous city in the Singapore",
        coordinates: { lat: 40.7128, lon: -74.0060 },
        population: 8804190
      },
      "Clementi": {
        location_name: "Clementi",
        description: "clementi is great",
        coordinates: { lat: 48.8566, lon: 2.3522 },
        population: 2140526
      },
      "Boon Lay": {
        location_name: "Boon Lay",
        description: "Going to school",
        coordinates: { lat: 35.6762, lon: 139.6503 },
        population: 13960000
      },
      "Changi": {
        location_name: "Changi",
        description: "flying off?",
        coordinates: { lat: -33.8688, lon: 151.2093 },
        population: 5312163
      },
      "Orchard": {
        location_name: "Orchard",
        description: "Famous for its carnival and beautiful roads",
        coordinates: { lat: -22.9068, lon: -43.1729 },
        population: 6320446
      }
    };

    const location = mockLocations[locationName];
    if (location) return location;

    throw new Error(`Location not found: ${locationName}`);
  },
  
  /**
   * Get user preferences
   */
  getPreferences: async () => {
    return {
      preferences: [],
      favorites: ["Jurong", "Clementi", "Boon Lay"] // Default favorites
    }
  }
};

// Favorites Page Component
const FavoritesPage: React.FC = () => {
  // State management
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [query, setQuery] = useState("");
  const [locationDetails, setLocationDetails] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Fetch initial favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const preferences = await api.getPreferences();
        
        if (preferences.favorites && preferences.favorites.length > 0) {
          const favoriteLocations = await Promise.all(
            preferences.favorites.map(async (locationName: string) => {
              return await api.searchLocation(locationName);
            })
          );
          
          setFavorites(favoriteLocations);
        }
      } catch (err) {
        setError('Failed to fetch favorite locations');
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Search handler
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.searchLocation(query);
      setLocationDetails(data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Location not found. Try another search.");
    } finally {
      setLoading(false);
    }
  };

  // Key down handler for search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Remove a specific favorite
  const removeFavorite = (locationName: string) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(location => location.location_name !== locationName)
    );
  };

  // Add location to favorites
  const addToFavorites = () => {
    if (locationDetails && !favorites.some(fav => fav.location_name === locationDetails.location_name)) {
      setFavorites(prevFavorites => [...prevFavorites, locationDetails]);
    }
  };

  // Render loading state
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-full pl-16">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-4 pl-20 overflow-hidden">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative"> 
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search For Location"
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 text-gray-500 hover:text-purple-600"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {locationDetails && (
          <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm">
            <div className="flex justify-between items-center text-black">
              <div>
                <strong>{locationDetails.location_name}</strong>
                <p>{locationDetails.description}</p>
                {locationDetails.coordinates && (
                  <p>Coordinates: {locationDetails.coordinates.lat}, {locationDetails.coordinates.lon}</p>
                )}
                {locationDetails.population && (
                  <p>Population: {locationDetails.population.toLocaleString()}</p>
                )}
              </div>
              <button 
                onClick={addToFavorites}
                className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add to Favorites
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Favorites List */}
      <h1 className="text-2xl font-bold mb-4">My Favorite Locations</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center text-gray-500 flex items-center justify-center h-full">
          No favorite locations yet. Start exploring and add some!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
          {favorites.map((location) => (
            <div 
              key={location.location_name} 
              className="bg-white text-black shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{location.location_name}</h2>
                <button
                  onClick={() => removeFavorite(location.location_name)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
              
              {location.description && (
                <p className="text-gray-600 text-sm mb-2">{location.description}</p>
              )}
              
              {location.coordinates && (
                <div className="text-gray-600 text-sm">
                  <strong>Coordinates:</strong> {location.coordinates.lat}, {location.coordinates.lon}
                </div>
              )}
              
              {location.population && (
                <div className="text-gray-600 text-sm">
                  <strong>Population:</strong> {location.population.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;