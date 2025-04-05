import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import ViewLocation from "../components/ViewLocation";
import CollapsibleNavBar from "~/components/NavBar";

interface LocationState {
  locationToAdd?: string;
  shouldTriggerCompare?: boolean;
}

const Compare = () => {
  const [ activeLocations, setActiveLocations ] = useState(['', ''])
  const [triggerCompare, setTriggerCompare] = useState(false);
  
  const location = useLocation();
  const state = location.state as LocationState;

  const scrollRefA = useRef<HTMLDivElement>(null);
  const scrollRefB = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);


  // Save active locations to session storage when it changes
  useEffect(() => {
    if (activeLocations[0] || activeLocations[1]) {
      if (activeLocations[0] && activeLocations[1]) {
        try {
          sessionStorage.setItem("activeComparedLocations", JSON.stringify(activeLocations));
        } catch (e) {
          console.error("Error saving activeComparedLocations:", e);
        }
      }
      if (activeLocations[0]) {
        sessionStorage.setItem("activeComparedLocations", JSON.stringify([activeLocations[0], '']));
      } else {
        sessionStorage.setItem("activeComparedLocations", JSON.stringify([activeLocations[1], '']));
      }
    }
  }, [activeLocations]);

  const loadFromSessionStorage = () => {
    console.log("Trying to load from session storage")
    try {
      const savedActiveLocations = sessionStorage.getItem("activeComparedLocations");
      console.log("Loading saved activeComparedLocations" ,savedActiveLocations)

      if (savedActiveLocations) {
        const parsedActiveLocations = JSON.parse(savedActiveLocations)
        setActiveLocations(parsedActiveLocations);

        return parsedActiveLocations;
      }

      console.log("No saved activeComparedLocations")
      

    } catch (e) {
      console.error("Error loading saved activeComparedLocations:", e);
    }
  }

  // Initial mount load
  useEffect(() => {
    const storedLocations = loadFromSessionStorage();
    if (storedLocations?.[0] || storedLocations?.[1]) {
      setTriggerCompare(true);
    }
  }, []);
  

  // Handle the location routing from the sidebar
  useEffect(() => {
    if (state?.locationToAdd) {
      const parsed_locations = loadFromSessionStorage() || ["", ""];

      const locationA = parsed_locations[0];
      const locationB = parsed_locations[1];

      // const [locationA, locationB] = loadFromSessionStorage();

      if (state.locationToAdd != locationA && state.locationToAdd != locationB ) {
        // If both location slots are filled, replace locationA
        if (locationA && locationB) {
          setActiveLocations([state.locationToAdd, locationB])
        } 
        // If locationA is empty, fill it
        else if (!locationA) {
          setActiveLocations([state.locationToAdd, locationB])
        } 
        // If locationA is filled but locationB is empty, fill locationB
        else {
          setActiveLocations([locationA, state.locationToAdd])
        }

        // console.log("activeLocations", activeLocations)

        // Trigger the compare if requested
        if (state.shouldTriggerCompare) {
          setTriggerCompare(true);
        }
      }
    }
  }, [state?.locationToAdd]);

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

  const shouldShowScrollTip = triggerCompare && activeLocations[0] && activeLocations[1];
  const shouldShowMainTip = !(activeLocations[0] && activeLocations[1] && triggerCompare);

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
          value={activeLocations[0]}
          onChange={(e) => setActiveLocations([e.target.value, activeLocations[1]])}
          className="border rounded px-4 py-2 w-full md:w-[300px] text-black"
        />
        <input
          type="text"
          placeholder="Enter Location B"
          value={activeLocations[1]}
          onChange={(e) => setActiveLocations([activeLocations[0], e.target.value])}
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
        {triggerCompare && activeLocations[0] && (
          <div className="flex-1 overflow-hidden rounded-xl">
            <div
              ref={scrollRefA}
              onScroll={() => syncScroll("A")}
              className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500"
            >
              <ViewLocation locationName={activeLocations[0]} />
            </div>
          </div>
        )}
        {triggerCompare && activeLocations[1] && (
          <div className="flex-1 overflow-hidden rounded-xl">
            <div
              ref={scrollRefB}
              onScroll={() => syncScroll("B")}
              className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500"
            >
              <ViewLocation locationName={activeLocations[1]} />
            </div>
          </div>
        )}
      </div>
      {/* Integrated NavBar */}
      <CollapsibleNavBar locations={[]} activeCategory={''}/>
    </div>
  );
};

export default Compare;