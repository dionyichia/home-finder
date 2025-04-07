import React, { useState, useEffect } from 'react';
import { HeartIcon, BellIcon, BellSlashIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon, BellIcon as SolidBellIcon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import CollapsibleNavBar from '~/components/NavBar';

// Location interface
interface Location {
  location_name: string;
  crime_rate?: number;
  price?: number;
  num_transport?: number;
  num_malls?: number;
  num_schools?: number;
  has_notification?: boolean;
}

// Notification interface
interface Notification {
  location_name: string;
  message: string;
  created_at: string;
  read: boolean;
}

// Interface for FavoritesPage props
interface FavoritesPageProps {
  userId: string;
}

const FavoritesPage: React.FC<FavoritesPageProps> = () => {
  const navigate = useNavigate();
  
  // State management
  const [userId, setUserID] = useState<string>('');
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    console.log("userId", userId)

    if (!userId) {
        console.log("User not logged in!")
    } else {
      setUserID(userId)
    }
  }, [])

  // Fetch favorites and notifications
  useEffect(() => {
    const fetchUserData = async () => {

      if (!userId) return;
  
      setLoading(true);
      setError(null);
      
      try {
        // Fetch favorites with null check
        const favoritesResponse = await api.getUserFavorites(userId);
        console.log("favoritesResponse", favoritesResponse);
      
        // Return early if no favorites exist
        if (!favoritesResponse?.favorites || favoritesResponse.favorites.length === 0) {
          setFavorites([]);
          setNotifications([]);
          return;
        }
      
        // Fetch notifications with null check
        const notificationsResponse = await api.getUserNotifications(userId);
        const notifications = notificationsResponse?.notifications || [];
        setNotifications(notifications);
      
        // Return early if no notifications exist
        if (!notifications || notifications.length === 0) {
          setFavorites(favoritesResponse.favorites.map((fav: Location) => ({
            ...fav,
            has_notification: false
          })));
          return;
        }
      
        // Combine data to mark locations with notifications
        const enhancedFavorites = favoritesResponse.favorites.map((fav: Location) => {
          const hasNotification = notifications.some(
            (notification: Notification) => 
              notification?.location_name === fav.location_name && 
              !notification.read
          );
          
          return {
            ...fav,
            has_notification: hasNotification
          };
        });
        
        setFavorites(enhancedFavorites);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load your favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Navigate to compare page with selected location
  const handleLocationSelect = (locationName: string) => {
    navigate('/compare', {
      state: {
        locationToAdd: locationName,
        shouldTriggerCompare: true
      }
    });
  };

  // Remove from favorites
  const removeFavorite = async (e: React.MouseEvent, locationName: string) => {
    e.stopPropagation();
    if (!userId) return;
    
    try {
      await api.removeFromFavorites(String(userId), locationName);
      setFavorites(favorites.filter(fav => fav.location_name !== locationName));
    } catch (err) {
      console.error("Error removing favorite:", err);
      setError("Failed to remove from favorites");
    }
  };

  // Toggle notification status
  const toggleNotification = async (e: React.MouseEvent, locationName: string, currentStatus: boolean) => {
    e.stopPropagation();
    if (!userId) return;
    
    try {
      if (currentStatus) {
        await api.disableNotification(userId, locationName);
      } else {
        await api.enableNotification(userId, locationName);
      }
      
      // Update the local state
      setFavorites(favorites.map(fav => 
        fav.location_name === locationName 
          ? { ...fav, has_notification: !currentStatus }
          : fav
      ));
    } catch (err) {
      console.error("Error toggling notification:", err);
      setError(`Failed to ${currentStatus ? 'disable' : 'enable'} notification`);
    }
  };

  // Get notification count for a location
  const getNotificationCount = (locationName: string) => {
    return notifications.filter(
      notification => notification.location_name === locationName && !notification.read
    ).length;
  };

  // Helper to render location stats
  const renderLocationStats = (location: Location) => {
    const getCrimeLevelColor = (safetyScore: number) => {
      if (safetyScore >= 8) return "text-green-600";
      if (safetyScore >= 6) return "text-yellow-600";
      if (safetyScore >= 4) return "text-orange-600";
      return "text-red-600";
    };

    const safetyScore = location.crime_rate || 0;
    const safetyColor = getCrimeLevelColor(safetyScore);

    return (
      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mt-1">
        {location.crime_rate !== undefined && (
          <div>Safety: <span className={`font-medium ${safetyColor}`}>{safetyScore.toFixed(1)}/10</span></div>
        )}
        {location.num_schools !== undefined && (
          <div>Schools: <span className="font-medium">{location.num_schools}</span></div>
        )}
        {location.num_transport !== undefined && (
          <div>Transport: <span className="font-medium">{location.num_transport}</span></div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0C3FC] via-[#8EC5FC] to-white py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">My Favorite Locations</h1>
        
        {/* Status messages */}
        {loading && (
          <div className="text-center py-4 text-gray-600">Loading your favorites...</div>
        )}
        
        {error && (
          <div className="text-center py-3 px-4 bg-red-100 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {/* Favorites list */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30">
          {favorites.length === 0 && !loading ? (
            <div className="text-center p-10 bg-white/40 rounded-lg border border-white/20">
              <p className="text-gray-700 font-medium">You haven't added any favorite locations yet</p>
              <p className="text-sm text-gray-600 mt-2">
                Search for locations and add them to your favorites to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((location) => {
                const notificationCount = getNotificationCount(location.location_name);
                const hasNotifications = notificationCount > 0;
                
                return (
                  <div 
                    key={location.location_name}
                    onClick={() => handleLocationSelect(location.location_name)}
                    className="relative flex items-center bg-white/60 hover:bg-white/80 p-4 rounded-xl 
                      shadow-sm border border-white/30 transition-all cursor-pointer"
                  >
                    {/* Location information */}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900">{location.location_name}</h3>
                        
                        {/* Notification indicator */}
                        {hasNotifications && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                            {notificationCount} new
                          </span>
                        )}
                      </div>
                      
                      {/* Location stats */}
                      {renderLocationStats(location)}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Notification toggle button */}
                      <button
                        onClick={(e) => toggleNotification(e, location.location_name, Boolean(location.has_notification))}
                        className={`p-2 rounded-full transition-colors ${
                          location.has_notification
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        aria-label={location.has_notification ? "Disable notifications" : "Enable notifications"}
                      >
                        {location.has_notification ? (
                          <SolidBellIcon className="w-5 h-5" />
                        ) : (
                          <BellIcon className="w-5 h-5" />
                        )}
                      </button>
                      
                      {/* Remove from favorites button */}
                      <button
                        onClick={(e) => removeFavorite(e, location.location_name)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                        aria-label="Remove from favorites"
                      >
                        <SolidHeartIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation bar */}
      <CollapsibleNavBar locations={[]} activeCategory={''} />
    </div>
  );
};

export default FavoritesPage;