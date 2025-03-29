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
import { useRef, useState } from "react";
import ViewLocation from "../components/ViewLocation";

const Compare = () => {
  const [locationA, setLocationA] = useState("");
  const [locationB, setLocationB] = useState("");
  const [triggerCompare, setTriggerCompare] = useState(false);

  const scrollRefA = useRef<HTMLDivElement>(null);
  const scrollRefB = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const syncScroll = (from: "A" | "B") => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const source = from === "A" ? scrollRefA.current : scrollRefB.current;
    const target = from === "A" ? scrollRefB.current : scrollRefA.current;

    if (source && target) {
      target.scrollTop = source.scrollTop;
    }

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 10);
  };

  const shouldShowScrollTip = triggerCompare && locationA && locationB;
  const shouldShowMainTip = !(locationA && locationB && triggerCompare);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start pl-20 p-6 bg-gradient-to-br from-[#E0C3FC] via-[#8EC5FC] to-[#FFFFFF] text-black overflow-hidden">
      {/* Title */}
      <h2 className="text-4xl font-semibold text-center text-gray-900 tracking-tight mb-4">
        Compare Locations
      </h2>

      {/* Input Fields + Button */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4 w-full max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Enter Location A"
          value={locationA}
          onChange={(e) => setLocationA(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-[300px] text-black"
        />
        <input
          type="text"
          placeholder="Enter Location B"
          value={locationB}
          onChange={(e) => setLocationB(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-[300px] text-black"
        />
        <button
          onClick={() => setTriggerCompare(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Compare
        </button>
      </div>

      {/* Tips */}
      <div className="text-sm text-gray-600 mb-4 text-center w-full max-w-3xl">
        {shouldShowMainTip && (
          <p>Tip: Enter two location names and press Compare to view their details side by side.</p>
        )}
        {shouldShowScrollTip && (
          <p>Hover your mouse pointer over the cards and scroll to see more details.</p>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-7xl justify-center items-stretch h-[80vh]">
        {triggerCompare && locationA && (
          <div className="flex-1 overflow-hidden rounded-xl">
            <div
              ref={scrollRefA}
              onScroll={() => syncScroll("A")}
              className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500"
            >
              <ViewLocation locationName={locationA} />
            </div>
          </div>
        )}
        {triggerCompare && locationB && (
          <div className="flex-1 overflow-hidden rounded-xl">
            <div
              ref={scrollRefB}
              onScroll={() => syncScroll("B")}
              className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500"
            >
              <ViewLocation locationName={locationB} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;