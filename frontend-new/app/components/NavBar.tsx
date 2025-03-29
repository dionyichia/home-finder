import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  GlobeAltIcon, 
  DocumentMagnifyingGlassIcon, 
  HeartIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import SummarisedLocation from './sidebar/SummarisedLocation';
import { useMap } from '~/contexts/MapContext';

interface CollapsibleNavBarProps {
  locations: any[];
  activeCategory: string;
}

export default function CollapsibleNavBar({ locations, activeCategory }: CollapsibleNavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const { setSelectedLocation } = useMap();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // This function will be passed to the map context for callbacks
  const handleLocationSelected = (locationName: string) => {
    setSearchTerm(locationName);
    setIsOpen(true); // Ensure sidebar is open when a location is selected
  };

  // Expose the handler to the map context
  useEffect(() => {
    if (setSelectedLocation) {
      setSelectedLocation(handleLocationSelected);
    }
  }, [setSelectedLocation]);

  // Update filtered locations when locations change or search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location => 
        location[0].location_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [locations, searchTerm]);

  // Automatically open sidebar when locations are provided
  useEffect(() => {
    if (locations && locations.length > 0) {
      setIsOpen(true);
    }
  }, [locations]);

  // Reset search term when locations data changes
  useEffect(() => {
    setSearchTerm('');
  }, [activeCategory]);

  return (
    <div className="fixed top-0 left-0 h-full z-50 flex">
      {/* Fixed Purple Column */}
      <div className="w-10 bg-purple-200 text-gray-700 flex flex-col">
        {/* Toggle Button */}
        <div className="flex justify-end p-2">
          <button 
            onClick={toggleSidebar} 
            className="text-purple-700 hover:text-purple-900 focus:outline-none"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <MagnifyingGlassIcon className="h-6 w-6" />
            )}
          </button>
        </div>
        {/* Always Visible Icons */}
        <div className="mt-4 flex flex-col space-y-2">
          <a href="/" className="flex flex-col items-center hover:text-purple-900 px-2 py-2">
            <GlobeAltIcon className="h-6 w-6" />
            <span className="mt-1 text-[8px]">Explore</span>
          </a>
          <a href="/compare" className="flex flex-col items-center hover:text-purple-900 px-2 py-2">
            <DocumentMagnifyingGlassIcon className="h-6 w-6" />
            <span className="mt-1 text-[8px]">Compare</span>
          </a>
          <a href="/favourites" className="flex flex-col items-center hover:text-purple-900 px-2 py-2">
            <HeartIcon className="h-6 w-6" />
            <span className="mt-1 text-[8px]">Favourites</span>
          </a>
          <a href="/profile" className="flex flex-col items-center hover:text-purple-900 px-2 py-2">
            <UserCircleIcon className="h-6 w-6" />
            <span className="mt-1 text-[8px]">Profile</span>
          </a>
        </div>
      </div>

      {/* Extended White Section with Search Box and Location List */}
      {isOpen && (
        <div className="w-80 bg-white text-gray-700 flex flex-col p-4 h-full overflow-y-auto shadow-lg">
          {/* Search Input with Clear button */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search For Location"
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Locations List */}
          {locations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                {searchTerm ? `Search: "${searchTerm}"` : `Locations by ${activeCategory || 'Score'}`}
              </h2>
              
              <div className="space-y-4">
                {filteredLocations.map((locationData, index) => (
                  <SummarisedLocation 
                    key={`${locationData[0].location_name}-${index}`}
                    locationData={locationData[0]}
                    score={locationData[1]}
                    rank={locations.findIndex(item => 
                      item[0].location_name === locationData[0].location_name
                    ) + 1}
                    activeCategory={activeCategory || 'score'}
                  />
                ))}
              </div>
              
              {filteredLocations.length === 0 && searchTerm && (
                <p className="text-gray-500 text-center py-4">
                  No locations found matching "{searchTerm}"
                </p>
              )}
            </div>
          )}
          
          {locations.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Select a category to view locations
            </p>
          )}
        </div>
      )}
    </div>
  );
}