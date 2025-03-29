import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Location {
  location_name: string;
  description?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  crime_rate?: number;
  price?: number;
  num_transport?: number;
  num_malls?: number;
  num_schools?: number;
}

const FavoritesMapSidebar: React.FC = () => {
  // State management
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allLocations, setAllLocations] = useState<Location[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all locations with GeoJSON data
        const locationsResponse = await axios.get('/get_all_coords');
        const locationsGeoData = locationsResponse.data;
        setAllLocations(locationsGeoData);

        // Fetch favorites
        const favoritesResponse = await axios.get('/api/favorites', { 
          params: { userId: 'user123' } 
        });
        const favoritesData = favoritesResponse.data;
        
        // Transform favorites to include coordinates
        const locationsWithCoordinates: Location[] = favoritesData.map((fav: any) => {
          // Find corresponding location in all locations to get coordinates
          const locationDetails = locationsGeoData.find(
            (loc: Location) => loc.location_name === fav.location_name
          );

          return {
            location_name: fav.location_name,
            coordinates: locationDetails?.coordinates || undefined,
            crime_rate: fav.crime_rate,
            price: fav.price,
            num_transport: fav.num_transport,
            num_malls: fav.num_malls,
            num_schools: fav.num_schools
          };
        });

        setFavorites(locationsWithCoordinates);
      } catch (err) {
        setError('Failed to fetch locations or favorites');
        console.error(err);
      }
    };

    fetchInitialData();
  }, []);

  // Search handler
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Search in all locations
      const foundLocation = allLocations.find(
        loc => loc.location_name.toLowerCase() === query.toLowerCase()
      );
      
      if (foundLocation) {
        setSelectedLocation(foundLocation);
      } else {
        setError("Location not found. Try another search.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Location not found. Try another search.");
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async () => {
    if (selectedLocation) {
      try {
        // Replace 'user123' with actual user ID
        const response = await axios.post('/api/favorites/add', { 
          userId: 'user123', 
          locationName: selectedLocation.location_name 
        });
        
        if (response.data.success) {
          // Add to favorites list if not already present
          if (!favorites.some(fav => fav.location_name === selectedLocation.location_name)) {
            setFavorites([...favorites, selectedLocation]);
          }
        }
      } catch (err) {
        console.error("Error adding to favorites:", err);
      }
    }
  };

  // Remove from favorites
  const removeFavorite = async (locationName: string) => {
    try {
      // Replace 'user123' with actual user ID
      const response = await axios.delete('/api/favorites/remove', { 
        data: { 
          userId: 'user123', 
          locationName 
        } 
      });
      
      if (response.data.success) {
        setFavorites(favorites.filter(fav => fav.location_name !== locationName));
        
        // Clear selection if removed location was selected
        if (selectedLocation?.location_name === locationName) {
          setSelectedLocation(null);
        }
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-[400px] h-screen overflow-y-auto bg-white p-4 border-r">
        {/* Search Bar */}
        <div className="mb-4 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search For Location"
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
          />
          <button 
            onClick={handleSearch} 
            className="absolute right-2 top-2 text-gray-500"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Selected Location Details */}
        {selectedLocation && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{selectedLocation.location_name}</h2>
              <button 
                onClick={addToFavorites}
                className="text-green-500 hover:text-green-700"
              >
                <MapPinIcon className="w-6 h-6" />
              </button>
            </div>
            {/* Location Details */}
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              {selectedLocation.crime_rate && (
                <p>Crime Rate: {selectedLocation.crime_rate}</p>
              )}
              {selectedLocation.price && (
                <p>Price: ${selectedLocation.price}</p>
              )}
              {selectedLocation.num_transport && (
                <p>Transport Stations: {selectedLocation.num_transport}</p>
              )}
              {selectedLocation.num_malls && (
                <p>Malls: {selectedLocation.num_malls}</p>
              )}
              {selectedLocation.num_schools && (
                <p>Schools: {selectedLocation.num_schools}</p>
              )}
            </div>
          </div>
        )}

        {/* Favorites List */}
        <h2 className="text-xl font-bold mb-4">My Favorites</h2>
        {favorites.length === 0 ? (
          <p className="text-gray-500 text-center">No favorite locations</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((location) => (
              <div 
                key={location.location_name}
                className="flex justify-between items-center p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                onClick={() => setSelectedLocation(location)}
              >
                <span>{location.location_name}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(location.location_name);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alternative Visualization */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        {selectedLocation ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{selectedLocation.location_name}</h2>
            {selectedLocation.coordinates && (
              <p>Coordinates: {selectedLocation.coordinates.lat}, {selectedLocation.coordinates.lon}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Select a location to view details</p>
        )}
      </div>
    </div>
  );
};

export default FavoritesMapSidebar;