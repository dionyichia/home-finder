import React from 'react';
import { useMap } from '~/contexts/MapContext';
import { useSideBar } from '~/hooks/useSideBar';
import SummarisedLocation from './SummarisedLocation';

export default function Sidebar() {
  const { mapInstance, activeCategory } = useMap();
  const { locations, isVisible, toggleSidebar } = useSideBar(mapInstance);

  return (
    <div
      className={`fixed top-4 left-4 h-[calc(100%-2rem)] z-40 transition-all duration-500 ease-in-out transform ${
        isVisible ? 'translate-x-0 opacity-100 w-80 p-4' : '-translate-x-full opacity-0 w-0 p-0'
      } 
      bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl overflow-y-auto`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-4 -right-5 z-50 bg-white shadow-md rounded-full p-1.5 hover:scale-105 hover:shadow-lg transition`}
        title={isVisible ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          className="w-6 h-6 text-gray-600"
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
        <div className="space-y-6 pt-2">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
            Locations by <span className="capitalize">{activeCategory || 'score'}</span>
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
}