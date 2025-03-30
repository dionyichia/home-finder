import React, { useState, useEffect } from "react";
import { api } from "~/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { UserUpdateData, UserProfile as UserProfileType, UserPreferences } from "~/api";

// Icons can be added if you want to use them
import { 
    BellIcon, 
    HeartIcon, 
    ArrowLeftEndOnRectangleIcon, 
    UserIcon, 
    PencilSquareIcon, 
    BookmarkIcon, 
    XMarkIcon, 
    ExclamationTriangleIcon 
  } from "@heroicons/react/24/outline";
  
import { useNavigate } from "react-router";

export default function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCredentials, setDeleteCredentials] = useState({
    username: "",
    user_email: "",
    password: "",
  });

  // User profile data
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  
  // Form data for editing
  const [formData, setFormData] = useState<UserUpdateData>({
    user_id: 0,
    new_username: "",
    new_user_email: "",
    new_password: "",
    price: "",
    crime_rate: "",
    schools: "",
    malls: "",
    transport: "",
    importance_rank: [],
  });

  // Preference options for ranking
  const [preferences, setPreferences] = useState<Array<{ id: string; label: string }>>([
    { id: "price", label: "Price" },
    { id: "crime_rate", label: "Crime Rate" },
    { id: "schools", label: "Schools" },
    { id: "malls", label: "Malls" },
    { id: "transport", label: "Transport" },
  ]);

  // Password validation
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState("");

  // Load user profile on mount
  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) {
        navigate("/");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await api.getUserProfile(parseInt(userId));
        setProfile(userProfile);
        
        // Initialize form data from profile
        setFormData({
          user_id: parseInt(userId),
          new_username: userProfile.username || "",
          new_user_email: userProfile.user_email || "",
          new_password: userProfile.password || "",
          price: userProfile.preferences.price || "",
          crime_rate: userProfile.preferences.crime_rate || "",
          schools: userProfile.preferences.num_schools || "",
          malls: userProfile.preferences.num_malls || "",
          transport: userProfile.preferences.num_transport || "",
          importance_rank: userProfile.preferences.importance_rank || [],
        });

        // Set the importance ranking order if it exists
        if (userProfile.preferences.importance_rank) {
          const rankingOrder = userProfile.preferences.importance_rank
          const newPreferences = [...preferences];
          
          // Reorder preferences based on saved ranking
          const orderedPrefs = rankingOrder.map(id => {
            return newPreferences.find(p => p.id === id) || { id, label: id.charAt(0).toUpperCase() + id.slice(1).replace("_", " ") };
          });
          
          setPreferences(orderedPrefs);
        }

        console.log('userProfile:', userProfile)
        console.log('formData:', formData)
        
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setError("Failed to load your profile. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for password validation
    if (name === "new_password") {
      if (value.length > 0 && value.length < 8) {
        setPasswordValid(false);
        setPasswordError("Password must be at least 8 characters long");
      } else {
        setPasswordValid(true);
        setPasswordError("");
      }
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle slider changes
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle drag and drop for preference ranking
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(preferences);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPreferences(items);
    
    // Update importance_rank in form data
    setFormData({
      ...formData,
      importance_rank: items.map(item => item.id),
    });
  };

  // Handle delete modal input changes
  const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeleteCredentials({
      ...deleteCredentials,
      [name]: value,
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate if password field is not empty but less than 8 chars
    if (formData.new_password && !passwordValid) {
        return;
    }

    try {
        const dataToUpdate = {
        ...formData,
        importance_rank: preferences.map(item => item.id),
        };
        
        // Call API once
        const response = await api.updateUserInfo(dataToUpdate as UserUpdateData);
        setSuccess(response.message || "Profile updated successfully");
        setIsEditing(false);
    } catch (err: any) {
        console.error("Update error:", err);
        
        // Check for specific uniqueness constraint errors
        if (err.message && err.message.includes("UNIQUE constraint failed")) {
        if (err.message.includes("users.username")) {
            setError("Username already exists. Please choose a different username.");
        } else if (err.message.includes("users.email") || err.message.includes("users.user_email")) {
            setError("Email address already exists. Please use a different email.");
        } else {
            // Generic uniqueness constraint error
            setError("The information you provided conflicts with an existing account. Please try different values.");
        }
        } else {
        // Generic error fallback
        setError(err.message || "Failed to update profile. Please try again.");
        }
    }
    };

  // Handle sign out
  const handleSignOut = () => {
    sessionStorage.removeItem("user_id");
    navigate("/");
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setError(null);
      const response = await api.removeUser(deleteCredentials);
      sessionStorage.removeItem("user_id");
      navigate("/");
    } catch (err: any) {
      console.error("Account deletion error:", err);
      setError(err.message || "Failed to delete account. Please verify your credentials.");
    }
  };

  // Format currency for price display
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(Number(value));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-b-blue-300 border-l-purple-300 border-r-blue-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-purple-300">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-600">My Profile</h1>
            <div className="flex space-x-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <PencilSquareIcon className="size-18 mr-1" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <XMarkIcon className="size-18 mr-1" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors"
              >
                <ArrowLeftEndOnRectangleIcon className="size-18 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-300">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {profile?.username ? profile.username.charAt(0).toUpperCase() : "U"}
                </div>
                <h2 className="text-xl font-semibold">{profile?.username}</h2>
                <p className="text-gray-500">{profile?.user_email}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center text-gray-600">
                    <HeartIcon className="size-18 mr-2 text-pink-500" />
                    Favorites
                  </div>
                  <span className="bg-pink-100 text-pink-600 py-1 px-2 rounded-full text-sm font-medium">
                    {profile?.favorites_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center text-gray-600">
                    <BellIcon className="size-18 mr-2 text-blue-500" />
                    Notifications
                  </div>
                  <span className="bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-sm font-medium">
                    {profile?.notifications_count || 0}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-2 mt-4 text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preferences */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-300">
              <h2 className="text-xl font-semibold mb-6">My Preferences</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-md">
                  {success}
                </div>
              )}

              <form onSubmit={handleUpdateSubmit}>
                {/* User Info Section */}
                {isEditing && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="new_username"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name
                        </label>
                        <input
                          id="new_username"
                          name="new_username"
                          type="text"
                          value={formData.new_username}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-300 focus:border-purple-300"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="new_user_email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email Address
                        </label>
                        <input
                          id="new_user_email"
                          name="new_user_email"
                          type="email"
                          value={formData.new_user_email}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-300 focus:border-purple-300"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label
                          htmlFor="new_password"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          New Password
                        </label>
                        <input
                          id="new_password"
                          name="new_password"
                          type="password"
                          value={formData.new_password}
                          onChange={handleChange}
                          className={`block w-full border ${
                            passwordError ? "border-red-300" : "border-gray-300"
                          } rounded-md shadow-sm p-2 focus:ring-purple-300 focus:border-purple-300`}
                          placeholder="Leave blank to keep current password"
                        />
                        {passwordError && (
                          <p className="mt-1 text-xs text-red-500">{passwordError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <span className="text-sm font-medium text-purple-600">
                      {formatCurrency(formData.price)}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      id="price"
                      name="price"
                      type="range"
                      min="0"
                      max="2000000"
                      step="50000"
                      value={formData.price}
                      onChange={handleSliderChange}
                      className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  ) : (
                    <div className="mt-2 w-full h-2 bg-gray-100 rounded-lg relative">
                      <div 
                        className="absolute top-0 left-0 h-2 bg-purple-400 rounded-lg"
                        style={{ width: `${(Number(formData.price) / 2000000) * 100}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$2,000,000</span>
                  </div>
                </div>

                {/* Crime Rate Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Crime Rate
                    </label>
                    <span className="text-sm font-medium text-purple-600">
                      {formData.crime_rate}/100
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      id="crime_rate"
                      name="crime_rate"
                      type="range"
                      min="1"
                      max="100"
                      value={formData.crime_rate}
                      onChange={handleSliderChange}
                      className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  ) : (
                    <div className="mt-2 w-full h-2 bg-gray-100 rounded-lg relative">
                      <div 
                        className="absolute top-0 left-0 h-2 bg-purple-400 rounded-lg"
                        style={{ width: `${Number(formData.crime_rate)}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low (1)</span>
                    <span>High (100)</span>
                  </div>
                </div>

                {/* Number of Schools Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Schools
                    </label>
                    <span className="text-sm font-medium text-purple-600">
                      {formData.schools}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      id="schools"
                      name="schools"
                      type="range"
                      min="1"
                      max="20"
                      value={formData.schools}
                      onChange={handleSliderChange}
                      className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  ) : (
                    <div className="mt-2 w-full h-2 bg-gray-100 rounded-lg relative">
                      <div 
                        className="absolute top-0 left-0 h-2 bg-purple-400 rounded-lg"
                        style={{ width: `${(Number(formData.schools) / 20) * 100}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Number of Malls Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Malls
                    </label>
                    <span className="text-sm font-medium text-purple-600">
                      {formData.malls}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      id="malls"
                      name="malls"
                      type="range"
                      min="1"
                      max="20"
                      value={formData.malls}
                      onChange={handleSliderChange}
                      className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  ) : (
                    <div className="mt-2 w-full h-2 bg-gray-100 rounded-lg relative">
                      <div 
                        className="absolute top-0 left-0 h-2 bg-purple-400 rounded-lg"
                        style={{ width: `${(Number(formData.malls) / 20) * 100}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Number of Stations Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Stations
                    </label>
                    <span className="text-sm font-medium text-purple-600">
                      {formData.transport}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      id="transport"
                      name="transport"
                      type="range"
                      min="1"
                      max="20"
                      value={formData.transport}
                      onChange={handleSliderChange}
                      className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  ) : (
                    <div className="mt-2 w-full h-2 bg-gray-100 rounded-lg relative">
                      <div 
                        className="absolute top-0 left-0 h-2 bg-purple-400 rounded-lg"
                        style={{ width: `${(Number(formData.transport) / 20) * 100}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Importance Ranking with Drag and Drop */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rank in terms of Importance
                    </label>
                    {isEditing && (
                      <span className="text-xs text-blue-600">
                        Drag to reorder
                      </span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="preferences" direction="horizontal">
                        {(provided) => (
                          <div
                            className="flex space-x-2 bg-blue-50 p-4 rounded-lg"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {preferences.map((pref, index) => (
                              <Draggable key={pref.id} draggableId={pref.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex-1 bg-white border border-purple-200 p-2 rounded-md text-center text-sm font-medium shadow-sm cursor-move hover:bg-purple-50 transition-colors"
                                  >
                                    <div className="text-gray-600">{pref.label}</div>
                                    <div className="text-xs text-purple-500 mt-1">#{index + 1}</div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <div className="flex space-x-2 bg-gray-50 p-4 rounded-lg">
                      {preferences.map((pref, index) => (
                        <div
                          key={pref.id}
                          className="flex-1 bg-white border border-gray-200 p-2 rounded-md text-center text-sm font-medium"
                        >
                          <div className="text-gray-600">{pref.label}</div>
                          <div className="text-xs text-purple-500 mt-1">#{index + 1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-md hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 transition-colors"
                    >
                      <BookmarkIcon className="size-18 inline-block mr-1" />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4 text-red-500">
              <ExclamationTriangleIcon className="size-24 mr-2" />
              <h3 className="text-xl font-bold">Delete Account</h3>
            </div>
            
            <p className="mb-4 text-gray-600">
              This action cannot be undone. Please confirm your credentials to permanently delete your account.
            </p>
            
            <div className="space-y-3 mb-4">
              <input
                name="username"
                type="text"
                value={deleteCredentials.username}
                onChange={handleDeleteInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-300 focus:border-red-300"
                placeholder="Username"
              />
              <input
                name="user_email"
                type="email"
                value={deleteCredentials.user_email}
                onChange={handleDeleteInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-300 focus:border-red-300"
                placeholder="Email"
              />
              <input
                name="password"
                type="password"
                value={deleteCredentials.password}
                onChange={handleDeleteInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-300 focus:border-red-300"
                placeholder="Password"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                disabled={!deleteCredentials.username || !deleteCredentials.user_email || !deleteCredentials.password}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}