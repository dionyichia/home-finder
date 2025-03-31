import { useState } from "react";
import {
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  AcademicCapIcon,
  TruckIcon,
  ShoppingBagIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import { useMap } from "../contexts/MapContext";

// Define filter options
const categories = [
  { name: "Resale Price", icon: <CurrencyDollarIcon className="w-5 h-5" />, query: "resale_price" },
  { name: "Crime Rate", icon: <ShieldExclamationIcon className="w-5 h-5" />, query: "crime_rate" },
  { name: "Schools", icon: <AcademicCapIcon className="w-5 h-5" />, query: "schools" },
  { name: "Public Transport", icon: <TruckIcon className="w-5 h-5" />, query: "transport" },
  { name: "Shopping Malls", icon: <ShoppingBagIcon className="w-5 h-5" />, query: "malls" },
  { name: "Districts", icon: <MapIcon className="w-5 h-5" />, query: "districts" },
];

const CategoryButton = () => {
  const { setFilteredLocations } = useMap();
  const [selectedCategory, setSelectedCategory] = useState<string | null>("resale_price");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilterClick = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/sort?sort_by=${category}`);
      if (!response.ok) throw new Error("Failed to fetch filtered data");

      const data = await response.json();
      setFilteredLocations(data);
    } catch (err) {
      setError("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30">
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => handleFilterClick(category.query)}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${
              selectedCategory === category.query
                ? "bg-gray-900 text-white shadow-lg scale-105"
                : "bg-white/60 text-black hover:bg-white/80"
            }`}
        >
          {category.icon}
          <span>{category.name}</span>
        </button>
      ))}

      {loading && (
        <span className="text-sm text-gray-600 ml-2 animate-pulse">Loading...</span>
      )}
      {error && (
        <span className="text-sm text-red-500 ml-2">{error}</span>
      )}
    </div>
  );
};

export default CategoryButton;