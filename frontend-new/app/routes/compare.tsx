// import { useState, useEffect } from 'react';
// import { api } from '../api'; // Import the API client

// export default function compare() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [results, setResults] = useState(null);
    
//     const handleSearch = async () => {
//       try {
//         const data = await api.searchLocation(searchTerm);
//         setResults(data);
//       } catch (error) {
//         console.error('Error searching:', error);
//       }
//     };

//     return <>Hoi</>
// }

// Above is an example of how to use the api.tsx to pull info from the backend
import { useState } from "react";
import { api } from "../api";
import {
  HeartIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";

interface NearbyPlace {
  name: string;
  distance: string;
  time?: string;
}

const compare = () => {
  const [locationA, setLocationA] = useState("");
  const [locationB, setLocationB] = useState("");
  const [locationAData, setLocationAData] = useState<any>(null);
  const [locationBData, setLocationBData] = useState<any>(null);
  const [favA, setFavA] = useState(false);
  const [favB, setFavB] = useState(false);

  const handleCompare = async () => {
    try {
      const [dataA, dataB] = await Promise.all([
        api.searchLocation(locationA),
        api.searchLocation(locationB),
      ]);
      setLocationAData(dataA);
      setLocationBData(dataB);
    } catch (err) {
      console.error("Error comparing locations:", err);
    }
  };

  const renderLocation = (data: any, isFav: boolean, toggleFav: () => void) => {
    if (!data) return <p>Loading...</p>;

    return (
      <div className="max-w-xl w-full p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">{data.name}</h1>

        <div className="w-full h-40 bg-gray-300 rounded mb-4"></div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-700">
            Price: <span className="text-blue-500">{data.price}</span>
          </span>
          <button onClick={toggleFav}>
            <HeartIcon className={`w-6 h-6 ${isFav ? "text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold">Resale Price</h3>
          <Line
            data={{
              labels: data?.resaleTrends?.labels,
              datasets: [
                {
                  label: "Price ($K)",
                  data: data?.resaleTrends?.data,
                  borderColor: "red",
                  borderWidth: 2,
                  fill: false,
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
            style={{ height: '200px' }}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold">Crime Rate</h3>
          <div className="flex space-x-1">
            {Array(data.crimeRate).fill(0).map((_, i) => (
              <StarIcon key={i} className="w-6 h-6 text-black" />
            ))}
            {Array(5 - data.crimeRate).fill(0).map((_, i) => (
              <StarIcon key={i} className="w-6 h-6 text-gray-300" />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold">Nearest Schools</h3>
          {data.nearestSchools.map((school: NearbyPlace, i: number) => (
            <div key={i} className="bg-gray-100 p-2 rounded mt-1">
              <p className="font-semibold">{school.name}</p>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" /> {school.distance} - <ClockIcon className="w-4 h-4 mx-1" /> {school.time}
              </p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-bold">Nearest Malls</h3>
          {data.nearestMalls.map((mall: NearbyPlace, i: number) => (
            <div key={i} className="bg-gray-100 p-2 rounded mt-1 flex justify-between">
              <p className="font-semibold">{mall.name}</p>
              <p className="text-sm text-gray-600 flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" /> {mall.distance}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Compare Locations</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Enter Location A"
          value={locationA}
          onChange={(e) => setLocationA(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-64"
        />
        <input
          type="text"
          placeholder="Enter Location B"
          value={locationB}
          onChange={(e) => setLocationB(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-64"
        />
        <button
          onClick={handleCompare}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Compare
        </button>
      </div>

      {/* ✅ Visual Debug Info */}
      <div className="text-sm text-gray-300 mb-6">
        <p>Location A: {locationA || "Not entered"}</p>
        <p>Location B: {locationB || "Not entered"}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-6">
        {locationAData && renderLocation(locationAData, favA, () => setFavA(!favA))}
        {locationBData && renderLocation(locationBData, favB, () => setFavB(!favB))}
      </div>
    </div>
  );
};

export default compare;