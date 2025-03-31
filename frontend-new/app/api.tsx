const API_BASE_URL = 'http://127.0.0.1:5000';

export interface LocationGeoData {
  location_name: string;
  geodata: any[]; 
}

export interface ScoredLocation {
  location: Record<string, any>; 
  score: number;
}

export interface UserPreferences {
  price: string;
  crime_rate: string;
  num_schools: string;
  num_malls: string;
  num_transport: string;
  importance_rank: string[];
}

export interface UserRegistrationData {
  username: string;
  user_email: string;
  password: string;
  price: string;
  crime_rate: string;
  schools: string;
  malls: string;
  transport: string;
  importance_rank: string[];
}

export interface UserPartialCredentials {
  username: string;
  user_email: string;
}

export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface UserCredentials {
  username: string;
  user_email: string;
  password: string;
}

export interface UserUpdateData {
  user_id: number;
  new_username: string;
  new_user_email: string;
  new_password: string;
  price: string;
  crime_rate: string;
  schools: string;
  malls: string;
  transport: string;
  importance_rank: string[];
}

export interface UserProfile {
  username: string;
  user_email: string;
  password: string;
  preferences: UserPreferences;
  favorites_count: number;
  notifications_count: number;
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
   * Get all locations sorted by a specific category
   */
  getSortedLocations: async (sortBy: string): Promise<ScoredLocation[]> => {
    const response = await fetch(`${API_BASE_URL}/sort?sort_by=${sortBy}`);

    if (!response.ok) {
      throw new Error(`Error fetching sorted locations: ${response.statusText}`);
    }

    return response.json();
  },
  
  /**
   * Search for a location by name
   */
  searchLocation: async (locationName: string): Promise<Record<string, any>> => {
    const response = await fetch(`${API_BASE_URL}/search?location_name=${encodeURIComponent(locationName)}`);
    
    if (!response.ok) {
      throw new Error(`Error searching for location: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Register a new user
   */
  registerUser: async (userData: UserRegistrationData): Promise<{ message: string, user_id: number }> => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Check if a new user with same email and user_name
   */
  checkUserExist: async (partialCredentials: UserPartialCredentials): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/check_user_exist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partialCredentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Verify user credentials
   */
  verifyUser: async (credentials: LoginCredentials): Promise<{ message: string, user_id: number }> => {
    const response = await fetch(`${API_BASE_URL}/verify_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Verification failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Update user information
   */
  updateUserInfo: async (userData: UserUpdateData): Promise<{ message: string }> => {
    console.log("here1 ", userData)
    const response = await fetch(`${API_BASE_URL}/update_user_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    console.log("here2", response)
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Update failed: ${response.statusText}`);
    }
    console.log("here3")
    
    return response.json();
  },
  
  /**
   * Remove a user account
   */
  removeUser: async (credentials: UserCredentials): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/remove_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Account removal failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get user profile
   */  
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/get_user_profile?user_id=${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch user profile: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get user favorites
   */
  getUserFavorites: async (userId: number): Promise<{ favorites: any[] }> => {
    const response = await fetch(`${API_BASE_URL}/get_user_favourites?user_id=${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch favorites: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Add a location to favorites
   */
  addToFavorites: async (userId: number, locationName: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/add_to_favourites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        location_name: locationName,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add to favorites: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Remove a location from favorites
   */
  removeFromFavorites: async (userId: number, locationName: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/remove_from_favourites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        location_name: locationName,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to remove from favorites: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Enable notifications for a location
   */
  enableNotification: async (userId: number, locationName: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/enable_notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        location_name: locationName,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to enable notification: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Disable notifications for a location
   */
  disableNotification: async (userId: number, locationName: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/disable_notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        location_name: locationName,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to disable notification: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get user notifications
   */
  getUserNotifications: async (userId: number): Promise<{ notifications: any[] }> => {
    const response = await fetch(`${API_BASE_URL}/get_user_notifications?user_id=${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch notifications: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Send notifications for a location
   */
  sendNotifications: async (locationName: string, notificationType: string): Promise<{ message: string, notified_users: number }> => {
    const response = await fetch(`${API_BASE_URL}/send_notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location_name: locationName,
        notification_type: notificationType,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to send notifications: ${response.statusText}`);
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
//  * Search for a location by name
//  */
//   searchLocation: async (locationName: string) => {
//     return {
//       name: locationName,
//       price: "$500K",
//       resaleTrends: {
//         labels: ["2020", "2021", "2022"],
//         data: [480, 490, 500],
//       },
//       crimeRate: 3,
//       nearestSchools: [
//         { name: "School A", distance: "500m", time: "7 mins" },
//         { name: "School B", distance: "800m", time: "10 mins" },
//       ],
//       nearestMalls: [
//         { name: "Mall X", distance: "1.2km" },
//         { name: "Mall Y", distance: "2km" },
//       ],
//     };
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