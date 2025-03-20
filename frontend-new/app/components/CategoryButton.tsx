import { useState } from "react";
import { CurrencyDollarIcon, ShieldExclamationIcon, AcademicCapIcon, TruckIcon, ShoppingBagIcon, MapIcon } from "@heroicons/react/24/outline";
import { useMap } from "../contexts/MapContext"; // ✅ Corrected import path

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    <div className="flex gap-2 overflow-x-auto py-2 px-4 bg-white shadow-md rounded-lg">
      {categories.map((category) => (
        <button
          key={category.name}
          className={`flex items-center gap-1 px-4 py-2 rounded-full border ${
            selectedCategory === category.query ? "bg-gray-900 text-white" : "bg-white border-gray-300"
          } hover:bg-gray-200 transition`}
          onClick={() => handleFilterClick(category.query)}
          disabled={loading}
        >
          {category.icon}
          <span className="text-sm">{category.name}</span>
        </button>
      ))}

      {loading && <p className="text-sm text-gray-600 ml-2">Loading...</p>}
      {error && <p className="text-sm text-red-500 ml-2">{error}</p>}
    </div>
  );
};

export default CategoryButton;