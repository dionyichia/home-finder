import {
  useEffect,
  useState,
} from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import {
  HeartIcon,
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface NearbyPlace {
  name: string;
  distance: string;
  time?: string;
}

const ViewLocation = ({ locationName: propName }: { locationName?: string }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const { locationName: paramName } = useParams();
  const locationName = propName || paramName;

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (!locationName) return;
        const data = await api.searchLocation(locationName);
        setLocationData(data);
      } catch (error) {
        console.error("Error fetching location details:", error);
      }
    };

    fetchLocation();
  }, [locationName]);

  if (!locationData) return <p className="text-black">Loading...</p>;

  return (
    <div className="w-full max-w-[700px] p-6 pb-20 bg-white rounded-2xl shadow-lg mx-auto">
      {!propName && (
        <div className="flex items-center space-x-2 mb-4">
          <Link to="/" className="p-2 bg-gray-200 rounded-full">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h2 className="text-xl font-bold text-black">{locationData?.name}</h2>
        </div>
      )}

      <div className="w-full h-40 bg-gray-300 rounded mb-4" />

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-black">{locationData?.name}</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-black">4.0</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon
                key={i}
                className={`w-6 h-6 ${
                  i < locationData.crimeRate ? "text-black" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-semibold text-black">
          Price: <span className="text-blue-500">{locationData?.price}</span>
        </p>
        <a
          href="https://www.google.com/maps"
          target="_blank"
          className="text-blue-500 text-sm"
        >
          View on Google Maps
        </a>
      </div>

      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="mt-2 p-2 rounded-full border border-gray-300 hover:bg-gray-100"
      >
        <HeartIcon
          className={`w-6 h-6 ${isFavorite ? "text-red-500" : "text-gray-400"}`}
        />
      </button>

      {/* Crime Rate */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3 text-black">Crime Rate</h3>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon
              key={i}
              className={`w-6 h-6 ${
                i < locationData.crimeRate ? "text-black" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Schools */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-black">
          <AcademicCapIcon className="w-5 h-5 text-blue-500" />
          Nearest Schools
        </h3>
        {locationData?.nearestSchools.map((school: NearbyPlace, index: number) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between"
          >
            <div>
              <h4 className="font-bold text-black">{school.name}</h4>
              <p className="text-gray-800 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" /> {school.distance} from Location
              </p>
            </div>
            <p className="text-gray-800 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" /> {school.time}
            </p>
          </div>
        ))}
      </div>

      {/* Malls */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-black">
          <ShoppingBagIcon className="w-5 h-5 text-pink-500" />
          Nearest Malls
        </h3>
        {locationData?.nearestMalls.map((mall: NearbyPlace, index: number) => (
          <div
            key={index}
            className={`bg-gray-100 p-4 rounded-lg mt-2 flex justify-between ${
              index === locationData.nearestMalls.length - 1 ? "mb-6" : ""
            }`}
          >
            <h4 className="font-bold text-black">{mall.name}</h4>
            <p className="text-gray-800 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" /> {mall.distance}
            </p>
          </div>
        ))}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default ViewLocation;