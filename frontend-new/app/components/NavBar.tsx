import React, { useState, useEffect } from 'react';
import { useMap } from '~/contexts/MapContext';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  DocumentMagnifyingGlassIcon,
  HeartIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import SummarisedLocation from './sidebar/SummarisedLocation';
import { useRefocusMap } from '~/hooks/useRefocusMap';

interface CollapsibleNavBarProps {
  locations: any[];
  activeCategory: string | null;
}

export default function CollapsibleNavBar({ locations = [], activeCategory = 'price'}: CollapsibleNavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const { setSelectedLocation } = useMap();

  const {
    refocusMap,
    refocusByLocationName,
    initializeMapClickHandlers,
    resetMapView,
    currentLocationName
  } = useRefocusMap(handleLocationSelected);

  function handleLocationSelected(locationName: string) {
    console.log("circular 3", locationName)
    setSearchTerm(locationName);
    setIsOpen(true);
  }

  const handleClearSearch = () => {
    setSearchTerm('');
    if (currentLocationName) {
      resetMapView();
    }
  };

  useEffect(() => {
    if (setSelectedLocation) {
      setSelectedLocation(handleLocationSelected);
    }
  }, [setSelectedLocation]);

  useEffect(() => {
    console.log("circular", locations, "search", searchTerm)
    if (!searchTerm.trim()) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((location) =>
        location[0]?.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [locations, searchTerm]);

  useEffect(() => {
    if (locations && locations.length > 0) {
      setIsOpen(true);
    }
  }, [locations]);

  // useEffect(() => {
  //   setSearchTerm('');
  //   if (currentLocationName) {
  //     resetMapView();
  //   }
  // }, [activeCategory, currentLocationName, resetMapView]);

  useEffect(() => {
    console.log("circular 2", currentLocationName, currentLocationName)
    if (currentLocationName && currentLocationName !== currentLocationName) {
      // Prevent back-and-forth triggering
      setSearchTerm((prev) => {
        if (prev !== currentLocationName) {
          return currentLocationName;
        }
        return prev;
      });
    }
  }, [currentLocationName]);

  const navItems = [
    { href: '/', icon: GlobeAltIcon, label: 'Explore' },
    { href: '/compare', icon: DocumentMagnifyingGlassIcon, label: 'Compare' },
    { href: '/favourites', icon: HeartIcon, label: 'Favourites' },
    { href: '/profile', icon: UserCircleIcon, label: 'Profile' }
  ];

  return (
    <div className="fixed top-0 left-0 h-full z-50 flex">
      {/* Glassmorphism Navbar */}
      <div className="w-16 mt-4 ml-2 bg-white/40 backdrop-blur-md text-black rounded-xl shadow-lg p-2 flex flex-col items-center space-y-4">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-black hover:drop-shadow-[0_0_6px_rgba(0,0,0,0.6)] focus:outline-none"
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <MagnifyingGlassIcon className="h-6 w-6" />
          )}
        </button>

        {/* Navigation */}
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = window.location.pathname === href;
          return (
            <a
              key={label}
              href={href}
              title={label}
              className={`flex flex-col items-center p-2 w-full rounded-xl transition-all ${
                isActive
                  ? 'bg-white/70 text-black font-bold drop-shadow-md ring-2 ring-black/10'
                  : 'hover:bg-white/50 hover:drop-shadow-md text-black/70'
              }`}
            >
              <Icon className="h-6 w-6 text-black" />
              <span className="mt-1 text-[10px] font-medium">{label}</span>
            </a>
          );
        })}
      </div>

      {/* Sidebar Panel */}
      {isOpen && (
        <div className="w-80 h-full p-4 backdrop-blur-md bg-white/30 border border-white/30 shadow-2xl text-gray-800 flex flex-col overflow-y-auto rounded-xl ml-2 mt-4 transition-all duration-300">
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search For Location"
              className="w-full text-black placeholder-black/50 bg-white/80 border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                onClick={handleClearSearch}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {currentLocationName && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{currentLocationName}</h2>
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={handleClearSearch}
                >
                  Back to list
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <AcademicCapIcon className="h-6 w-6 mx-auto text-blue-600" />
                  <div className="text-sm mt-1 font-medium">Schools</div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg text-center">
                  <ShoppingBagIcon className="h-6 w-6 mx-auto text-red-600" />
                  <div className="text-sm mt-1 font-medium">Malls</div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg text-center">
                  <TruckIcon className="h-6 w-6 mx-auto text-green-600" />
                  <div className="text-sm mt-1 font-medium">Transport</div>
                </div>
              </div>
            </div>
          )}

          {!currentLocationName && locations.length > 0 && (
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
                    rank={
                      locations.findIndex(
                        (item) => item[0].location_name === locationData[0].location_name
                      ) + 1
                    }
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


