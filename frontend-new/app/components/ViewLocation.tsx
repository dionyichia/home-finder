import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon, ArrowLeftIcon, StarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ViewLocation = () => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Sample data for the location
  const location = {
    name: "Upper Thomson",
    price: "$600k",
    resaleTrends: {
      labels: ["2020", "2025", "2030"],
      data: [600, 590, 580],
    },
    crimeRate: 1, // out of 5
    nearestSchools: [
      { name: "Ai Tong School", distance: "1.2 km", time: "13 min" },
      { name: "Former Bishan Park Secondary School", distance: "1.5 km", time: "21 min" },
      { name: "Peirce Secondary School", distance: "1.8 km", time: "25 min" },
    ],
    nearestMalls: [
      { name: "Thomson Plaza", distance: "8 min" },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Button */}
      <div className="flex items-center space-x-2 mb-4">
        <Link to="/" className="p-2 bg-gray-200 rounded-full">
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h2 className="text-xl font-bold">{location.name}</h2>
      </div>

      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{location.name}</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">4.0</span>
          <div className="flex">
            {Array(4)
              .fill(<StarIcon className="w-6 h-6 text-yellow-500" />)
              .concat(<StarIcon className="w-6 h-6 text-gray-300" />)}
          </div>
        </div>
      </div>

      {/* Price & Google Maps Link */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-semibold text-gray-700">
          Price: <span className="text-blue-500">{location.price}</span>
        </p>
        <a href="https://www.google.com/maps" target="_blank" className="text-blue-500 text-sm">
          View on Google Maps
        </a>
      </div>

      {/* Favorite Button */}
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="mt-2 p-2 rounded-full border border-gray-300 hover:bg-gray-100"
      >
        <HeartIcon className={`w-6 h-6 ${isFavorite ? "text-red-500" : "text-gray-400"}`} />
      </button>

      {/* Resale Price Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Predicted Resale Price</h3>
        <Line
          data={{
            labels: location.resaleTrends.labels,
            datasets: [
              {
                label: "Price ($K)",
                data: location.resaleTrends.data,
                borderColor: "red",
                borderWidth: 2,
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>

      {/* Crime Rate */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Crime Rate</h3>
        <div className="flex space-x-2 mt-2">
          {Array(location.crimeRate)
            .fill(<StarIcon className="w-6 h-6 text-black" />)
            .concat(
              Array(5 - location.crimeRate).fill(
                <StarIcon className="w-6 h-6 text-gray-300" />
              )
            )}
        </div>
      </div>

      {/* Nearest Schools */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Nearest Schools</h3>
        {location.nearestSchools.map((school, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between">
            <div>
              <h4 className="font-bold">{school.name}</h4>
              <p className="text-gray-600 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" /> {school.distance} from Location
              </p>
            </div>
            <p className="text-gray-600 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" /> {school.time}
            </p>
          </div>
        ))}
      </div>

      {/* Nearest Malls */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Nearest Malls</h3>
        {location.nearestMalls.map((mall, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between">
            <h4 className="font-bold">{mall.name}</h4>
            <p className="text-gray-600 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" /> {mall.distance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewLocation;