// React hook for managing local state
import { useState } from "react";

// Heroicons for displaying icons next to category buttons
import { CurrencyDollarIcon, ShieldExclamationIcon, AcademicCapIcon, TruckIcon, ShoppingBagIcon, MapIcon } from "@heroicons/react/24/outline";

// Custom hook to access the map context state and functions
import { useMap } from "../contexts/MapContext"; // ✅ Corrected import path

// Define all the filter categories as buttons with name, icon, and backend query key
const categories = [
  { name: "Resale Price", icon: <CurrencyDollarIcon className="w-5 h-5" />, query: "resale_price" },
  { name: "Crime Rate", icon: <ShieldExclamationIcon className="w-5 h-5" />, query: "crime_rate" },
  { name: "Schools", icon: <AcademicCapIcon className="w-5 h-5" />, query: "schools" },
  { name: "Public Transport", icon: <TruckIcon className="w-5 h-5" />, query: "transport" },
  { name: "Shopping Malls", icon: <ShoppingBagIcon className="w-5 h-5" />, query: "malls" },
  { name: "Districts", icon: <MapIcon className="w-5 h-5" />, query: "districts" },
];

// Functional component for the category filter buttons
const CategoryButton = () => {
  // Access the function to update map's filtered locations from context
  const { setFilteredLocations } = useMap();

  // Store currently selected category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Loading state for button activity
  const [loading, setLoading] = useState(false);
  // Error state for showing messages if fetch fails
  const [error, setError] = useState<string | null>(null);

  // Handle click on any category filter button
  const handleFilterClick = async (category: string) => {
    setSelectedCategory(category); // Save selected category
    setLoading(true); // Show loading state
    setError(null); // Reset any previous error

    try {
      // Make GET request to backend API with selected filter
      const response = await fetch(`http://127.0.0.1:5000/sort?sort_by=${category}`);
      if (!response.ok) throw new Error("Failed to fetch filtered data");

      // Convert response to JSON
      const data = await response.json();

      // Update the map's filtered locations with the result
      setFilteredLocations(data);
    } catch (err) {
      // Handle any fetch errors
      setError("Error fetching data");
      console.error(err);
    } finally {
      // Always remove loading state at the end
      setLoading(false);
    }
  };

  return (
    // Wrapper div to horizontally scroll category buttons
    <div className="flex gap-2 overflow-x-auto py-2 px-4 bg-white shadow-md rounded-lg">
      {/* Loop through each category and render a styled button */}
      {categories.map((category) => (
        <button
          key={category.name} // Unique key for React
          // Conditional styling based on which button is selected
          className={`flex items-center gap-1 px-4 py-2 rounded-full border ${
            selectedCategory === category.query ? "bg-gray-900 text-white" : "bg-white border-gray-300"
          } hover:bg-gray-200 transition`}
          // When clicked, trigger the fetch and update
          onClick={() => handleFilterClick(category.query)}
          // Disable button while loading
          disabled={loading}
        >
          {/* Icon from Heroicons */}
          {category.icon}
          {/* Display name */}
          <span className="text-sm">{category.name}</span>
        </button>
      ))}

      {/* Show loading status if active */}
      {loading && <p className="text-sm text-gray-600 ml-2">Loading...</p>}
      {/* Show error message if something went wrong */}
      {error && <p className="text-sm text-red-500 ml-2">{error}</p>}
    </div>
  );
};

// Export component for use in other parts of the app
export default CategoryButton;