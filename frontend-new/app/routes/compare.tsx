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
  const [submitted, setSubmitted] = useState(false);

  const scrollRefA = useRef<HTMLDivElement>(null);
  const scrollRefB = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const handleCompare = () => {
    if (locationA && locationB) {
      setSubmitted(true);
    }
  };

  const syncScroll = (from: "A" | "B") => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const source = from === "A" ? scrollRefA.current : scrollRefB.current;
    const target = from === "A" ? scrollRefB.current : scrollRefA.current;

    if (source && target) {
      requestAnimationFrame(() => {
        target.scrollTop = source.scrollTop;
        isSyncingScroll.current = false;
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pl-20 p-6 bg-black text-white overflow-auto">
      <h2 className="text-4xl font-bold mb-6 text-center">Compare Locations</h2>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 w-full max-w-4xl">
        <input
          type="text"
          placeholder="Enter Location A"
          value={locationA}
          onChange={(e) => setLocationA(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-[260px] text-black bg-white shadow-sm"
        />
        <input
          type="text"
          placeholder="Enter Location B"
          value={locationB}
          onChange={(e) => setLocationB(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-[260px] text-black bg-white shadow-sm"
        />
        <button
          onClick={handleCompare}
          className="px-6 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          Compare
        </button>
      </div>

      {submitted && (
        <div className="flex flex-col md:flex-row gap-10 w-full max-w-7xl justify-center items-stretch">
          {locationA && (
            <div className="flex-1 overflow-y-auto bg-transparent">
              <div
                ref={scrollRefA}
                onScroll={() => syncScroll("A")}
                className="w-full h-full overflow-y-auto"
              >
                <ViewLocation locationName={locationA} />
              </div>
            </div>
          )}
          {locationB && (
            <div className="flex-1 overflow-y-auto bg-transparent">
              <div
                ref={scrollRefB}
                onScroll={() => syncScroll("B")}
                className="w-full h-full overflow-y-auto"
              >
                <ViewLocation locationName={locationB} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Compare;