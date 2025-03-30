import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { api } from '../api';
import ViewLocation from "../components/ViewLocation";

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
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">My Favorite Locations</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Search and Favorites List */}
        <div className="lg:col-span-1">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Favorites List */}
          <h2 className="text-xl font-bold mb-4">Saved Locations</h2>
          {loading && !searchResults ? (
            <div className="text-center py-4">Loading...</div>
          ) : favorites.length === 0 ? (
            <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-md">
              <p>No favorite locations</p>
              <p className="text-sm mt-2">Search for locations to add them to your favorites</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {favorites.map((location) => (
                <div 
                  key={location.location_name}
                  className="flex justify-between items-center p-3 rounded-md hover:bg-gray-100 transition cursor-pointer bg-gray-50"
                  onClick={() => handleLocationSelect(location.location_name)}
                >
                  <span className="font-medium">{location.location_name}</span>
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
          <h2 className="text-xl font-bold mb-4">All Locations</h2>
          
          {loading && searchTerm ? (
            <div className="text-center py-4">Searching...</div>
          ) : displayLocations.length === 0 ? (
            <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-md">
              <p>No locations found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {displayLocations.map((location) => {
                  const isFavorite = isLocationFavorite(location.location_name);
                  const isSelected = searchResults?.location_name === location.location_name;
                  
                  return (
                    <div 
                      key={location.location_name}
                      className={`flex justify-between items-center p-3 rounded-md 
                        transition cursor-pointer border 
                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white hover:bg-gray-100'}`}
                      onClick={() => handleLocationSelect(location.location_name)}
                    >
                      <div className="flex-1">
                        <span className="font-medium">{location.location_name}</span>
                        
                        {/* Show brief stats if this is the selected location and we have data */}
                        {isSelected && searchResults && (
                          <div className="mt-2 text-sm text-gray-600 grid grid-cols-3 gap-2">
                            <div>
                              <span className="font-semibold">Crime Rate:</span> {searchResults.crime_rate}%
                            </div>
                            <div>
                              <span className="font-semibold">Schools:</span> {searchResults.schools?.length || 0}
                            </div>
                            <div>
                              <span className="font-semibold">Transport:</span> {searchResults.transport?.length || 0}
                            </div>
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
                        className={`flex items-center gap-1 px-3 py-1 rounded-md transition
                          ${isFavorite 
                            ? 'text-yellow-600 hover:text-red-600 bg-yellow-50 hover:bg-red-50' 
                            : 'text-gray-600 hover:text-yellow-600 bg-gray-100 hover:bg-yellow-50'
                          }`}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isFavorite ? (
                          <>
                            <StarIcon className="w-5 h-5 fill-yellow-500 stroke-yellow-500" />
                            <span className="hidden sm:inline">Favorited</span>
                          </>
                        ) : (
                          <>
                            <StarIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Favorite</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Detailed View of Selected Location */}
          {searchResults && (
            <div className="mt-6 bg-white rounded-md shadow-sm p-4">
              <h3 className="text-xl font-bold mb-4">{searchResults.location_name} Details</h3>
              <ViewLocation locationName={searchResults.location_name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;