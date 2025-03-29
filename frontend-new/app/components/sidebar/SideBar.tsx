import React from 'react';
import { useMap } from '~/contexts/MapContext';
import { useSideBar } from '~/hooks/useSideBar';
import SummarisedLocation from './SummarisedLocation';

export default function Sidebar() {
  // Get the map instance from context
  const { mapInstance, activeCategory } = useMap();
  
  // Get the sidebar state from our custom hook
  const { locations, isVisible, toggleSidebar } = useSideBar(mapInstance);

  return (
    <div 
      className={`absolute top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 overflow-y-auto z-20 ${
        isVisible ? 'w-80' : 'w-0'
      }`}
    >
      {/* Sidebar toggle button */}
      <button 
        onClick={toggleSidebar}
        className={`absolute top-4 ${isVisible ? 'left-80' : 'left-4'} z-30 bg-white p-2 rounded-full shadow-md`}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {isVisible ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {isVisible && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">
            Locations by {activeCategory || 'Score'}
          </h2>
          
          <div className="space-y-4">
            {locations.map((locationData, index) => (
              <SummarisedLocation 
                key={`${locationData[0].location_name}-${index}`}
                locationData={locationData[0]}
                score={locationData[1]}
                rank={index + 1}
                activeCategory={activeCategory || 'score'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};