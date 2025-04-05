// React hook for managing local state
import { useState } from "react";

// Heroicons for displaying icons next to category buttons
import { CurrencyDollarIcon, ShieldExclamationIcon, AcademicCapIcon, TruckIcon, ShoppingBagIcon, MapIcon } from "@heroicons/react/24/outline";

// Custom hook to access the map context state and functions
import { useMap } from "~/contexts/MapContext";

// Define all the filter categories as buttons with name, icon, and backend query key
const categories = [
  { name: "Resale Price", icon: <CurrencyDollarIcon className="w-5 h-5" />, query: "price" },
  { name: "Crime Rate", icon: <ShieldExclamationIcon className="w-5 h-5" />, query: "crime_rate" },
  { name: "Schools", icon: <AcademicCapIcon className="w-5 h-5" />, query: "num_schools" },
  { name: "Public Transport", icon: <TruckIcon className="w-5 h-5" />, query: "num_transport" },
  { name: "Shopping Malls", icon: <ShoppingBagIcon className="w-5 h-5" />, query: "num_malls" },
  { name: "For You", icon: <MapIcon className="w-5 h-5" />, query: "score" },
];

const CategorySelector = ({ onCategoryChange, activeCategory }) => {
  const { filterLocationsByCategory } = useMap();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilterClick = async (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category); // Notify parent component
    filterLocationsByCategory(category);
    setError(null);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-3 px-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30">
  {categories.map((category) => (
    <button
      key={category.name}
      className={`flex items-center gap-1 px-4 py-2 rounded-full border transition text-sm font-medium
        ${
          selectedCategory === category.query
            ? "bg-gray-900 text-white shadow-lg"
            : "bg-white/60 text-gray-900 border-gray-300 hover:bg-white/80"
        }`}
      onClick={() => handleFilterClick(category.query)}
      disabled={loading}
    >
      {category.icon}
      <span>{category.name}</span>
    </button>
  ))}
  {loading && <p className="text-sm text-gray-600 ml-2">Loading...</p>}
  {error && <p className="text-sm text-red-500 ml-2">{error}</p>}
</div>
  );
};


// Export component for use in other parts of the app
export default CategorySelector;

// // React hook for managing local state
// import { useState } from "react";

// // Heroicons for displaying icons next to category buttons
// import { CurrencyDollarIcon, ShieldExclamationIcon, AcademicCapIcon, TruckIcon, ShoppingBagIcon, MapIcon } from "@heroicons/react/24/outline";

// // Custom hook to access the map context state and functions
// import { useMap } from "../../contexts/MapContext"; 

// // Define all the filter categories as buttons with name, icon, and backend query key
// const categories = [
//   { name: "Resale Price", icon: <CurrencyDollarIcon className="w-5 h-5" />, query: "resale_price" },
//   { name: "Crime Rate", icon: <ShieldExclamationIcon className="w-5 h-5" />, query: "crime_rate" },
//   { name: "Schools", icon: <AcademicCapIcon className="w-5 h-5" />, query: "schools" },
//   { name: "Public Transport", icon: <TruckIcon className="w-5 h-5" />, query: "transport" },
//   { name: "Shopping Malls", icon: <ShoppingBagIcon className="w-5 h-5" />, query: "malls" },
//   { name: "Districts", icon: <MapIcon className="w-5 h-5" />, query: "districts" },
// ];

// // Functional component for the category filter buttons
// const CategorySelector = () => {
//   // Access the function to update map's filtered locations from context
//   const { activeCategory, isLoading} = useMap();

//   // Store currently selected category
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   // Error state for showing messages if fetch fails
//   const [error, setError] = useState<string | null>(null);

//   // Handle click on any category filter button
//   const handleFilterClick = async (category: string) => {
//     // Change the parent state of activeCategory
//   };

//   return (
//     // Wrapper div to horizontally scroll category buttons
//     <div className="flex gap-2 overflow-x-auto py-2 px-4 bg-white shadow-md rounded-lg">
//       {/* Loop through each category and render a styled button */}
//       {categories.map((category) => (
//         <button
//           key={category.name} // Unique key for React
//           // Conditional styling based on which button is selected
//           className={`flex items-center gap-1 px-4 py-2 rounded-full border ${
//             selectedCategory === category.query ? "bg-gray-900 text-white" : "bg-white border-gray-300"
//           } hover:bg-gray-200 transition`}
//           // When clicked, trigger the fetch and update
//           onClick={() => handleFilterClick(category.query)}
//           // Disable button while loading
//           disabled={loading}
//         >
//           {/* Icon from Heroicons */}
//           {category.icon}
//           {/* Display name */}
//           <span className="text-sm">{category.name}</span>
//         </button>
//       ))}

//       {/* Show loading status if active */}
//       {isLoading && <p className="text-sm text-gray-600 ml-2">Loading...</p>}
//       {/* Show error message if something went wrong */}
//       {error && <p className="text-sm text-red-500 ml-2">{error}</p>}
//     </div>
//   );
// };

// // Export component for use in other parts of the app
// export default CategorySelector;