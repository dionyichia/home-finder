import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, DocumentMagnifyingGlassIcon, HeartIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function CollapsibleNavBar() {
  const [isOpen, setIsOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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
        </div>
      </div>

      {/* Extended White Section with Search Box */}
      {isOpen && (
        <div className="w-64 bg-white text-gray-700 flex flex-col p-4">
          <input
            type="text"
            placeholder="Search For Location"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      )}
    </div>
  );
}