import { useState } from "react"; // Importing useState hook from React for managing state
import { Link } from "react-router-dom"; // Importing Link component for navigation
import { HeartIcon, ArrowLeftIcon, StarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline"; // Importing icons from Heroicons for UI elements
import { Line } from "react-chartjs-2"; // Importing Line component for rendering line charts
import { Chart, registerables } from "chart.js"; // Importing Chart and registerables from Chart.js for chart functionality

Chart.register(...registerables); // Registering all necessary components for Chart.js

const ViewLocation = () => { // Defining the ViewLocation functional component
  const [isFavorite, setIsFavorite] = useState(false); // State to track if the location is marked as favorite

  // Sample data for the location
  const location = {
    name: "Upper Thomson", // Name of the location
    price: "$600k", // Price of the location
    resaleTrends: { // Resale trends data for charting
      labels: ["2020", "2025", "2030"], // Labels for the x-axis of the chart
      data: [600, 590, 580], // Data points for the y-axis of the chart
    },
    crimeRate: 1, // Crime rate on a scale from 1 to 5
    nearestSchools: [ // List of nearest schools with their details
      { name: "Ai Tong School", distance: "1.2 km", time: "13 min" },
      { name: "Former Bishan Park Secondary School", distance: "1.5 km", time: "21 min" },
      { name: "Peirce Secondary School", distance: "1.8 km", time: "25 min" },
    ],
    nearestMalls: [ // List of nearest malls
      { name: "Thomson Plaza", distance: "8 min" },
    ],
  };

  return ( // JSX to render the component
    <div className="max-w-4xl mx-auto p-4"> {/* Container for the entire component */}
      {/* Back Button */}
      <div className="flex items-center space-x-2 mb-4"> {/* Flexbox for back button and title */}
        <Link to="/" className="p-2 bg-gray-200 rounded-full"> {/* Link to navigate back to home */}
          <ArrowLeftIcon className="w-6 h-6" /> {/* Left arrow icon */}
        </Link>
        <h2 className="text-xl font-bold">{location.name}</h2> {/* Title displaying the location name */}
      </div>

      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div> {/* Placeholder for an image of the location */}

      {/* Header Section */}
      <div className="flex justify-between items-center"> {/* Flexbox for header layout */}
        <h1 className="text-2xl font-bold">{location.name}</h1> {/* Main title displaying the location name */}
        <div className="flex items-center space-x-2"> {/* Flexbox for rating display */}
          <span className="text-xl font-bold">4.0</span> {/* Displaying the rating */}
          <div className="flex"> {/* Flexbox for star icons */}
            {Array(4) // Loop to create 4 filled star icons
              .fill(<StarIcon className="w-6 h-6 text-yellow-500" />)
              .concat(<StarIcon className="w-6 h-6 text-gray-300" />)} {/* Adding 1 empty star icon */}
          </div>
        </div>
      </div>

      {/* Price & Google Maps Link */}
      <div className="flex justify-between items-center mt-2"> {/* Flexbox for price and link layout */}
        <p className="text-lg font-semibold text-gray-700"> {/* Displaying the price */}
          Price: <span className="text-blue-500">{location.price}</span>
        </p>
        <a href="https://www.google.com/maps" target="_blank" className="text-blue-500 text-sm"> {/* Link to Google Maps */}
          View on Google Maps
        </a>
      </div>

      {/* Favorite Button */}
      <button
        onClick={() => setIsFavorite(!isFavorite)} // Toggle favorite state on button click
        className="mt-2 p-2 rounded-full border border-gray-300 hover:bg-gray-100" // Button styling
      >
        <HeartIcon className={`w-6 h-6 ${isFavorite ? "text-red-500" : "text-gray-400"}`} /> {/* Heart icon indicating favorite status */}
      </button>

      {/* Resale Price Chart */}
      <div className="mt-6"> {/* Container for resale price chart */}
        <h3 className="text-lg font-bold">Predicted Resale Price</h3> {/* Chart title */}
        <Line
          data={{
            labels: location.resaleTrends.labels, // X-axis labels from location data
            datasets: [
              {
                label: "Price ($K)", // Label for the dataset
                data: location.resaleTrends.data, // Y-axis data points from location data
                borderColor: "red", // Line color
                borderWidth: 2, // Line width
                fill: false, // No fill under the line
              },
            ],
          }}
          options={{
            responsive: true, // Responsive chart
            maintainAspectRatio: false, // Allow chart to adjust aspect ratio
          }}
        />
      </div>

      {/* Crime Rate */}
      <div className="mt-6"> {/* Container for crime rate section */}
        <h3 className="text-lg font-bold">Crime Rate</h3> {/* Section title */}
        <div className="flex space-x-2 mt-2"> {/* Flexbox for star rating display */}
          {Array(location.crimeRate) // Loop to create filled star icons based on crime rate
            .fill(<StarIcon className="w-6 h-6 text-black" />)
            .concat(
              Array(5 - location.crimeRate).fill( // Loop to create empty star icons
                <StarIcon className="w-6 h-6 text-gray-300" />
              )
            )}
        </div>
      </div>

      {/* Nearest Schools */}
      <div className="mt-6"> {/* Container for nearest schools section */}
        <h3 className="text-lg font-bold">Nearest Schools</h3> {/* Section title */}
        {location.nearestSchools.map((school, index) => ( // Mapping over nearest schools to display each
          <div key={index} className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between"> {/* Container for each school */}
            <div> {/* Container for school details */}
              <h4 className="font-bold">{school.name}</h4> {/* School name */}
              <p className="text-gray-600 flex items-center"> {/* Distance and time display */}
                <MapPinIcon className="w-4 h-4 mr-1" /> {school.distance} from Location
              </p>
            </div>
            <p className="text-gray-600 flex items-center"> {/* Travel time display */}
              <ClockIcon className="w-4 h-4 mr-1" /> {school.time}
            </p>
          </div>
        ))}
      </div>

      {/* Nearest Malls */}
      <div className="mt-6"> {/* Container for nearest malls section */}
        <h3 className="text-lg font-bold">Nearest Malls</h3> {/* Section title */}
        {location.nearestMalls.map((mall, index) => ( // Mapping over nearest malls to display each
          <div key={index} className="bg-gray-100 p-4 rounded-lg mt-2 flex justify-between"> {/* Container for each mall */}
            <h4 className="font-bold">{mall.name}</h4> {/* Mall name */}
            <p className="text-gray-600 flex items-center"> {/* Travel time display */}
              <ClockIcon className="w-4 h-4 mr-1" /> {mall.distance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewLocation; // Exporting the ViewLocation component for use in other parts of the application