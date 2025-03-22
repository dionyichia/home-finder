import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { api } from "../../routes/api.tsx"; // Import API methods from your api.tsx

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// PriceChart component for rendering resale price predictions
const PriceChart = () => {
  // Store the fetched chart labels (e.g., years)
  const [labels, setLabels] = useState<string[]>([]);
  // Store the resale prices corresponding to each label
  const [prices, setPrices] = useState<number[]>([]);

  // Fetch data from the backend on component mount
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Call the API method to get resale data for one location
        const data = await api.getLocationResaleData("Upper Thomson"); // you can make this dynamic
        // Extract year and price values from the data
        const years = data.map((item: any) => item.year);
        const values = data.map((item: any) => item.price);
        // Update state with chart data
        setLabels(years);
        setPrices(values);
      } catch (error) {
        console.error("Failed to fetch resale price data:", error);
      }
    };

    fetchChartData(); // Trigger data fetching
  }, []);

  // Chart configuration with fetched labels and data
  const data = {
    labels,
    datasets: [
      {
        label: "Resale Price",
        data: prices,
        borderColor: "#e11d48",
        backgroundColor: "rgba(225, 29, 72, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  // Display settings for chart (styling)
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: {
          callback: function (tickValue: any) {
            return `$${Number(tickValue) / 1000}k`;
          },
          color: "#6b7280",
        },
        grid: {
          color: "#e5e7eb",
        },
      },
      x: {
        ticks: {
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="mt-4">
      {/* Render the line chart with loaded data */}
      <Line data={data} options={options} />
    </div>
  );
};

export default PriceChart;