const API_BASE_URL = 'http://127.0.0.1:5000';

export interface Location {
  // Define your location type here based on your backend data structure
  name: string;
  // Add other properties as needed
}

export const api = {
  /**
   * Get all locations sorted by a specific category
   */
  getSortedLocations: async (sortBy: string): Promise<Location[]> => {
    const response = await fetch(`${API_BASE_URL}/sort?sort_by=${sortBy}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching sorted locations: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Search for a location by name
   */
  searchLocation: async (locationName: string) => {
    const response = await fetch(`${API_BASE_URL}/search?location_name=${encodeURIComponent(locationName)}`);
    
    if (!response.ok) {
      throw new Error(`Error searching for location: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get user preferences (based on your useEffect code)
   */
  getPreferences: async () => {
    const response = await fetch(`${API_BASE_URL}/preferences`);
    
    if (!response.ok) {
      throw new Error(`Error fetching preferences: ${response.statusText}`);
    }
    
    return response.json();
  }
};