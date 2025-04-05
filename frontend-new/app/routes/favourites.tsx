import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import { api } from '../api';
import ViewLocation from "../components/ViewLocation";
import CollapsibleNavBar from '~/components/NavBar';

// Location geodata interface
interface LocationGeoData {
  location_name: string;
  lat?: number;
  lon?: number;
  // Alternative structure based on fetch_districts.get_location_geodata
  geodata?: {
    lat: number;
    lon: number;
  };
}

// Price history structure
interface ResalePrice {
  date: string;
  price: number;
  flat_type?: string;
  area_sqm?: number;
}

// Crime data structure
interface Crime {
  id: number;
  title: string;
  description: string;
  date: string;
}

// School data structure
interface School {
  name: string;
  distance?: number;
  level?: string;
}

// Mall data structure
interface Mall {
  name: string;
  distance?: number;
}

// Transport station data structure
interface TransportStation {
  name: string;
  type: string; // MRT, LRT, Bus, etc.
  distance?: number;
}

// Full location details interface
interface LocationDetails {
  location_name: string;
  price: ResalePrice[];
  crime: Crime[];
  crime_rate: number;
  schools: School[];
  malls: Mall[];
  transport: TransportStation[];
  score?: number;
}

// Combined interface for frontend display
interface Location {
  location_name: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  crime_rate?: number;
  price?: number; // This would be the average or latest price
  num_transport?: number;
  num_malls?: number;
  num_schools?: number;
}

// Interface for favorites response
interface FavoritesResponse {
  favorites: Location[];
  message?: string;
}

// Interface for API responses
interface ApiResponse {
  message: string;
  status?: string;
  data?: any;
}

// Interface for FavoritesPage props
interface FavoritesPageProps {
  userId: number; // Keep userId as a prop
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ userId }) => {
  // State management
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allLocations, setAllLocations] = useState<LocationGeoData[]>([]);
  const [displayLocations, setDisplayLocations] = useState<LocationGeoData[]>([]);

  const locationDetailsRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all locations geodata
        const locationsGeoData = await api.getAllLocationsGeodata();
        setAllLocations(locationsGeoData);
        setDisplayLocations(locationsGeoData);

        // Fetch user favorites
        if (userId) {
          try {
            const favoritesResponse = await api.getUserFavorites(userId);
            const favoritesData = favoritesResponse.favorites;
            
            if (favoritesData && favoritesData.length > 0) {
              // Transform favorites to include coordinates if available
              const locationsWithCoordinates = favoritesData.map((fav: any) => {
                // Find corresponding location in all locations to get coordinates
                const locationDetails = locationsGeoData.find(
                  (loc) => loc.location_name === fav.location_name
                );

                // Handle different possible coordinate structures
                let coordinates; 
                if (locationDetails?.geodata) {
                  coordinates = locationDetails.geodata;
                } else if (locationDetails?.lat && locationDetails?.lon) {
                  coordinates = { lat: locationDetails.lat, lon: locationDetails.lon };
                }

                return {
                  location_name: fav.location_name,
                  coordinates: coordinates,
                  crime_rate: fav.crime_rate,
                  price: fav.price,
                  num_transport: fav.num_transport,
                  num_malls: fav.num_malls,
                  num_schools: fav.num_schools
                };
              });

              setFavorites(locationsWithCoordinates);
            }
          } catch (favError) {
            console.error("Error fetching favorites:", favError);
            // We'll continue even if favorites fail to load
          }
        }
      } catch (err) {
        console.error("Error fetching locations data:", err);
        setError('Failed to fetch locations data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userId]);

  // Search handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reset to show all locations if search is empty
      setDisplayLocations(allLocations);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Filter locations based on search term
      const filteredLocations = allLocations.filter(location => 
        location.location_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Sort locations by relevance (exact match first, then by prefix, then contains)
      const sortedLocations = [...filteredLocations].sort((a, b) => {
        const aName = a.location_name.toLowerCase();
        const bName = b.location_name.toLowerCase();
        const term = searchTerm.toLowerCase();
        
        // Exact match gets highest priority
        if (aName === term && bName !== term) return -1;
        if (bName === term && aName !== term) return 1;
        
        // Starts with gets second priority
        if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
        if (bName.startsWith(term) && !aName.startsWith(term)) return 1;
        
        // Alphabetical order for the rest
        return aName.localeCompare(bName);
      });
      
      setDisplayLocations(sortedLocations);
      
      // Also try to search for specific location data
      try {
        const locationData = await api.searchLocation(searchTerm.trim());
        if (locationData) {
          setSearchResults(locationData);
        }
      } catch (searchErr) {
        console.log("Specific location search failed, showing filtered list only");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search locations");
    } finally {
      setLoading(false);
    }
  };

  // Add to favorites
  const addToFavorites = async (locationName: string) => {
    if (userId) {
      try {
        const response: ApiResponse = await api.addToFavorites(userId, locationName);
        
        if (response.message.includes("added to favorites")) {
          // If not already in favorites, add it
          if (!favorites.some(fav => fav.location_name === locationName)) {
            // Get location details to add to favorites
            let locationData = searchResults && searchResults.location_name === locationName 
              ? searchResults 
              : await api.searchLocation(locationName);
            
            const newFavorite: Location = {
              location_name: locationName,
              crime_rate: locationData?.crime_rate,
              num_schools: locationData?.schools?.length,
              num_malls: locationData?.malls?.length,
              num_transport: locationData?.transport?.length
            };
            
            setFavorites([...favorites, newFavorite]);
          }
        }
      } catch (err) {
        console.error("Error adding to favorites:", err);
        setError("Failed to add to favorites");
      }
    }
  };

  // Remove from favorites
  const removeFavorite = async (locationName: string) => {
    if (!userId) return;
    
    try {
      const response: ApiResponse = await api.removeFromFavorites(userId, locationName);
      
      if (response.message.includes("removed from favorites")) {
        setFavorites(favorites.filter(fav => fav.location_name !== locationName));
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
      setError("Failed to remove from favorites");
    }
  };

  // Handle location selection
  const handleLocationSelect = async (locationName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch full location details
      const locationData = await api.searchLocation(locationName);
      setSearchResults(locationData);
      setSelectedLocation({
        location_name: locationData.location_name,
        crime_rate: locationData.crime_rate,
        num_schools: locationData.schools?.length,
        num_malls: locationData.malls?.length,
        num_transport: locationData.transport?.length
      });
      
      // Scroll to details on mobile
      if (window.innerWidth < 1024 && locationDetailsRef.current) {
        locationDetailsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Error fetching location details:", err);
      setError("Failed to load location details");
    } finally {
      setLoading(false);
    }
  };

  // Check if a location is a favorite
  const isLocationFavorite = (locationName: string) => {
    return favorites.some(fav => fav.location_name === locationName);
  };

  return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#E0C3FC] via-[#8EC5FC] to-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">My Favorite Locations</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column - Search and Favorites List */}
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="mb-4 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search For Location"
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 bg-white/70 text-black placeholder-gray-500"
              />
              <button 
                onClick={handleSearch} 
                className="absolute right-3 top-2.5 text-gray-500"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Saved Locations</h2>
            {loading && !searchResults ? (
              <div className="text-center py-4 text-gray-600">Loading...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center text-gray-600 p-4 bg-white/40 rounded-lg border border-white/20">
                <p>No favorite locations</p>
                <p className="text-sm mt-2">Search for locations to add them to your favorites</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {favorites.map((location) => (
                  <div 
                    key={location.location_name}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/60 backdrop-blur-md hover:bg-white/80 transition cursor-pointer"
                    onClick={() => handleLocationSelect(location.location_name)}
                  >
                    <span className="font-medium text-gray-900">{location.location_name}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(location.location_name);
                      }}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove from favorites"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column - All Locations List */}
          <div ref={locationDetailsRef} className="lg:col-span-2">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">All Locations</h2>

              {loading && searchTerm ? (
                <div className="text-center py-4 text-gray-600">Searching...</div>
              ) : displayLocations.length === 0 ? (
                <div className="text-center text-gray-600 p-4 bg-white/40 rounded-lg border border-white/20">
                  <p>No locations found</p>
                  <p className="text-sm mt-2">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {displayLocations.map((location) => {
                    const isFavorite = isLocationFavorite(location.location_name);
                    const isSelected = searchResults?.location_name === location.location_name;
                    
                    return (
                      <div 
                        key={location.location_name}
                        className={`flex justify-between items-center p-4 rounded-lg transition border
                          ${isSelected 
                            ? 'bg-blue-100/60 border-blue-500' 
                            : 'bg-white/60 hover:bg-white/80 border-white/20 backdrop-blur-md'
                          }`}
                        onClick={() => handleLocationSelect(location.location_name)}
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{location.location_name}</span>
                          {isSelected && searchResults && (
                            <div className="mt-2 text-sm text-gray-700 grid grid-cols-3 gap-2">
                              <div><strong>Crime:</strong> {searchResults.crime_rate}%</div>
                              <div><strong>Schools:</strong> {searchResults.schools?.length || 0}</div>
                              <div><strong>Transport:</strong> {searchResults.transport?.length || 0}</div>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            isFavorite 
                              ? removeFavorite(location.location_name)
                              : addToFavorites(location.location_name);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md transition font-medium
                            ${isFavorite 
                              ? 'text-yellow-700 bg-yellow-100 hover:bg-red-100 hover:text-red-600' 
                              : 'text-gray-700 bg-white/70 hover:bg-yellow-100 hover:text-yellow-600'
                            }`}
                        >
                          {isFavorite ? (
  <SolidHeartIcon className="w-5 h-5 text-pink-500" />
) : (
  <HeartIcon className="w-5 h-5 text-gray-600 hover:text-pink-500 transition" />
)}
                          <span className="hidden sm:inline">{isFavorite ? "Favorited" : "Favorite"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View Section */}
              {searchResults && (
                <div className="mt-6 bg-white/70 rounded-xl shadow-lg p-6 border border-white/30">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">{searchResults.location_name} Details</h3>
                  <ViewLocation locationName={searchResults.location_name} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      {/* Integrated NavBar */}
      <CollapsibleNavBar locations={[]} activeCategory={''}/>
    </div>
  );
};

export default FavoritesPage;