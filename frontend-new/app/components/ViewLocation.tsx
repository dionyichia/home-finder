import {
  useEffect,
  useState,
} from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import CrimeCard from './view_location/CrimeCard'
import {
  HeartIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShoppingBagIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";


Chart.register(...registerables);

interface PriceData {
  flat_type: string;
  month: string;
  resale_price: number;
}

interface SchoolData {
  name: string;
  latitude: string;
  longitude: string;
  "Planning Area": string;
}

interface MallData {
  name: string;
  latitude: number;
  longitude: number;
  planning_area: string;
}

interface TransportData {
  name: string;
  latitude: number;
  longitude: number;
  planning_area: string;
}

interface LocationDataResponse {
  price: PriceData[];
  crime: any[];
  crime_rate: number;
  schools: SchoolData[];
  malls: MallData[];
  transport: TransportData[];
  score: number;
}

const FLAT_COLORS: Record<string, string> = {
  "2 ROOM": "#a855f7",
  "3 ROOM": "#ef4444",
  "4 ROOM": "#3b82f6",
  "5 ROOM": "#eab308",
  "EXECUTIVE": "#10b981",
  "MULTI-GENERATION": "#8b5cf6",
};

const ViewLocation = ({ locationName: propName }: { locationName?: string }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [locationData, setLocationData] = useState<LocationDataResponse | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);
  const { locationName: paramName } = useParams();
  const locationName = propName || paramName;

  // //What the fuck rand???
  // const calculateDistance = (lat: string | number, lng: string | number) => {
  //   return (Math.random() * 2.9 + 0.1).toFixed(1);
  // };

  const formatCurrency = (value: number) => `S$${value.toLocaleString()}`;

  const normalizeCrimeRate = (crimeRate: number) => {
    if (crimeRate <= 200) return 5;
    if (crimeRate <= 400) return 4;
    if (crimeRate <= 600) return 3;
    if (crimeRate <= 800) return 2;
    return 1;
  };

  const getCrimeLevelColor = (rate: number) => {
    if (rate <= 200) return "bg-green-500";
    if (rate <= 400) return "bg-yellow-400";
    if (rate <= 600) return "bg-orange-400";
    return "bg-red-600";
  };

  const processPriceData = (priceData: PriceData[]) => {
    const sortedData = [...priceData].sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    const grouped: Record<string, Record<string, number[]>> = {};
    const labelsSet = new Set<string>();

    sortedData.forEach(({ month, resale_price, flat_type }) => {
      labelsSet.add(month);
      if (!grouped[flat_type]) grouped[flat_type] = {};
      if (!grouped[flat_type][month]) grouped[flat_type][month] = [];
      grouped[flat_type][month].push(resale_price);
    });

    const labels = Array.from(labelsSet)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-12)
      .map(date => {
        const [year, month] = date.split("-");
        return `${month}/${year.slice(2)}`;
      });

    const datasets = Object.entries(grouped).map(([flatType, monthlyMap]) => {
      const color = FLAT_COLORS[flatType] || "#999999";
      const rawMonths = Object.keys(monthlyMap).sort();
      const slicedMonths = rawMonths.slice(-12);

      const data = slicedMonths.map(month => {
        const values = monthlyMap[month];
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.round(avg);
      });

      return {
        label: flatType,
        data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      };
    });

    return { labels, datasets };
  };

  const processLocationData = (data: LocationDataResponse) => {
    const resaleTrends = processPriceData(data.price);
    const latestPrices = data.price
      .filter(p => p.month === data.price[0].month)
      .map(p => p.resale_price);
    const avgPrice =
      latestPrices.length > 0
        ? Math.round(
            latestPrices.reduce((sum, price) => sum + price, 0) /
              latestPrices.length
          )
        : 0;

    const schoolsFormatted = data.schools
      .map(s => ({
        name: s['name'],
        // distance: calculateDistance(s.latitude, s.longitude) + " km",
        // time:
        //   Math.round(
        //     parseFloat(calculateDistance(s.latitude, s.longitude)) * 10
        //   ) + " min walk",
      }))
      .slice(0, 3);

    const mallsFormatted = data.malls
      .map(m => ({
        name: m.name,
        // distance: calculateDistance(m.latitude, m.longitude) + " km",
      }))
      .slice(0, 3);

    const transportFormatted = data.transport
      .map(t => ({
        name: t.name,
        // distance: calculateDistance(t.latitude, t.longitude) + " km",
      }))
      .slice(0, 3);

      const crimeFormatted = data.crime

    return {
      name: locationName,
      price: formatCurrency(avgPrice),
      crimeRate: normalizeCrimeRate(data.crime_rate),
      rawCrimeRate: data.crime_rate,
      resaleTrends,
      nearestSchools: schoolsFormatted,
      nearestMalls: mallsFormatted,
      nearestTransport: transportFormatted,
      crime: crimeFormatted,
      score: data.score,
    };
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (!locationName) return;
        const data = await api.searchLocation(locationName);
        console.log("pulled loc data from backend: ", data)
        setLocationData(data);
        setProcessedData(processLocationData(data));
      } catch (error) {
        console.error("Error fetching location details:", error);
      }
    };

    fetchLocation();
  }, [locationName]);

  if (!processedData) return <p>Loading...</p>;

  return (
    <div className="w-full max-w-[700px] p-6 pb-20 bg-white/60 backdrop-blur-md rounded-2xl shadow-md mx-auto text-black border border-gray-200">
      {!propName && (
        <div className="flex items-center space-x-2 mb-4">
          <Link to="/" className="p-2 bg-gray-200 rounded-full">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h2 className="text-xl font-bold">{processedData.name}</h2>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{processedData.name}</h1>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-transform duration-150 active:scale-110"
            >
              <HeartIcon
                className={`w-5 h-5 transition-all duration-300 ease-in-out ${
                  isFavorite ? "text-red-500 scale-110" : "text-gray-400"
                }`}
              />
            </button>
          </div>
          <p className="text-lg font-semibold">
            Avg. Price: <span className="text-purple-800 font-bold">{processedData.price}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">4.0</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                  key={i}
                  className={`w-6 h-6 ${
                    i < processedData.crimeRate ? "text-black" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(
              processedData.name
            )}`}
            target="_blank"
            className="text-purple-700 underline text-sm mt-1"
          >
            View on Google Maps
          </a>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Resale Price Trends</h3>
        <div className="h-[300px]">
          <Line
            data={{
              labels: processedData.resaleTrends.labels,
              datasets: processedData.resaleTrends.datasets,
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: {
                legend: {
                  position: "top" as const,
                  labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 10,
                  },
                },
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value) => `${value}k`,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Crime Bar (show if crime_rate OR crime data) */}
      {(typeof processedData.rawCrimeRate === "number" || locationData?.crime?.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
            <ShieldExclamationIcon className="w-5 h-5" />
            Crime Data
          </h3>
          <div className="flex items-center mt-2 gap-2">
            {["bg-green-500", "bg-yellow-400", "bg-orange-400", "bg-red-600"].map((color, idx) => (
              <div
                key={idx}
                className={`w-6 h-3 rounded-full ${color} ${
                  getCrimeLevelColor(processedData.rawCrimeRate) === color
                    ? "ring-2 ring-black"
                    : ""
                }`}
              />
            ))}
            <span className="text-sm text-gray-700">Low to High</span>
          </div>
        </div>
      )}

      {/* Transport */}
      <div className="mt-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TruckIcon className="w-5 h-5 text-blue-600" />
          Nearest Transport
        </h3>
        {processedData.nearestTransport.map((station: any, index: number) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between"
          >
            <h4 className="font-bold">{station.name}</h4>
            {/* <p className="text-gray-600 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" /> {station.distance}
            </p> */}
          </div>
        ))}
      </div>

      {/* Schools */}
      <div className="mt-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
          Nearest Schools
        </h3>
        {processedData.nearestSchools.map((school: any, index: number) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between"
          >
            <div>
              <h4 className="font-bold">{school.name}</h4>
              {/* <p className="text-gray-600 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" /> {school.distance} from Location
              </p> */}
            </div>
            {/* <p className="text-gray-600 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" /> {school.time}
            </p> */}
          </div>
        ))}
      </div>

      {/* Malls */}
      <div className="mt-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ShoppingBagIcon className="w-5 h-5 text-pink-500" />
          Nearest Malls
        </h3>
        {processedData.nearestMalls.map((mall: any, index: number) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between"
          >
            <h4 className="font-bold">{mall.name}</h4>
            {/* <p className="text-gray-600 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" /> {mall.distance}
            </p> */}
          </div>
        ))}
      </div>

      {/* Past Major Crimes */}
      {processedData.crime && processedData.crime.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            Past Major Crimes
          </h3>
          {processedData.crime.map((crime, index) => (
            <CrimeCard key={index} crime={crime} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewLocation;