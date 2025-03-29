const API_BASE_URL = 'http://127.0.0.1:5000';

export interface LocationGeoData {
  location_name: string;
  geodata: any[]; 
}

export interface ScoredLocation {
  location: Record<string, any>; 
  score: number;
}

export const api = {
  /**
   * Get all locations geodata
   */
  getAllLocationsGeodata: async (): Promise<LocationGeoData[]> => {
    const response = await fetch(`${API_BASE_URL}/get_all_coords`);

    if (!response.ok) {
      throw new Error(`Error fetching locations geodata: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all locations sorted by a specific category, 
   */
  getSortedLocations: async (sortBy: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/sort?sort_by=${sortBy}`);

    if (!response.ok) {
      throw new Error(`Error fetching sorted locations: ${response.statusText}`);
    }

    return response.json();
  },
  
  /**
   * Search for a location by name
   */
  // searchLocation: async (locationName: string) => {
  //   const response = await fetch(`${API_BASE_URL}/search?location_name=${encodeURIComponent(locationName)}`);
    
  //   if (!response.ok) {
  //     throw new Error(`Error searching for location: ${response.statusText}`);
  //   }
    
  //   return response.json();
  // },
  
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


// const API_BASE_URL = 'http://127.0.0.1:5000';

// export interface LocationGeoData {
//   location_name: string;
//   geodata: any[]; 
// }

// export interface ScoredLocation {
//   location: Record<string, any>; 
//   score: number;
// }

// export const api = {
//   /**
//    * Get all locations geodata
//    */
//   getAllLocationsGeodata: async (): Promise<LocationGeoData[]> => {
//   //   const response = await fetch(${API_BASE_URL}/get_all_coords);

//   //   if (!response.ok) {
//   //     throw new Error(Error fetching locations geodata: ${response.statusText});
//   //   }

//   //   return response.json();

//   return [{location_name: "test", geodata: []}]
// },

//   /**
//    * Get all locations sorted by a specific category
//    */
//   getSortedLocations: async (sortBy: string): Promise<ScoredLocation[]> => {
//   //   const response = await fetch(${API_BASE_URL}/sort?sort_by=${sortBy});

//   //   if (!response.ok) {
//   //     throw new Error(Error fetching sorted locations: ${response.statusText});
//   //   }

//   //   return response.json();

//   return [{location: { test: null }, score: 0}]
//   },
  
//   /**
//    * Search for a location by name
//    */
//   searchLocation: async (locationName: string) => {
//     // const response = await fetch(${API_BASE_URL}/search?location_name=${encodeURIComponent(locationName)});
    
//     // if (!response.ok) {
//     //   throw new Error(Error searching for location: ${response.statusText});
//     // }
    
//     // return response.json();

//     return {location_name: "test"}
//   },
  
//   /**
//    * Get user preferences (based on your useEffect code)
//    */
//   getPreferences: async () => {
//     // const response = await fetch(${API_BASE_URL}/preferences);
    
//     // if (!response.ok) {
//     //   throw new Error(Error fetching preferences: ${response.statusText});
//     // }
    
//     // return response.json();

//     return {preferences: []}
//   }
// };