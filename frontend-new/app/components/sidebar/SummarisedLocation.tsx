import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useMap } from '~/contexts/MapContext';
import { useRefocusMap } from '~/hooks/useRefocusMap';

interface SummarisedLocationProps {
  locationData: {
    location_name: string;
    crime_rate: number;
    price: number;
    num_transport: number;
    num_malls: number;
    num_schools: number;
    [key: string]: any;
  };
  score: number;
  rank: number;
  activeCategory: string;
}

export default function SummarisedLocation({
  locationData,
  score,
  rank,
  activeCategory
}: SummarisedLocationProps) {
  const navigate = useNavigate();
  const { selectedLocationCallback } = useMap();
  const { refocusByLocationName } = useRefocusMap(selectedLocationCallback);

  const formattedScore = score.toFixed(2);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'price': return '💰';
      case 'crime_rate': return '🛡️';
      case 'num_transport': return '🚆';
      case 'num_malls': return '🛒';
      case 'num_schools': return '🏫';
      default: return '⭐';
    }
  };

  const getCategoryValue = (category: string) => {
    if (category.toLowerCase() === 'price') {
      return `$${locationData.price.toLocaleString()}`;
    }
    return locationData[category] !== undefined
      ? locationData[category].toString()
      : 'N/A';
  };

  const handleViewDetails = () => {
    navigate('/compare', {
      state: {
        locationToAdd: locationData.location_name,
        shouldTriggerCompare: true
      }
    });
  };

  const handleLocationClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!(event.target as HTMLElement).closest('button')) {
      refocusByLocationName(locationData.location_name);
    }
  };

  return (
    <div
      onClick={handleLocationClick}
      className="bg-white/40 border border-white/30 backdrop-blur-md rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 p-4 cursor-pointer relative"
    >
      {/* Rank badge */}
      <div className="absolute -top-3 -left-3 bg-blue-600 text-white w-7 h-7 text-sm rounded-full flex items-center justify-center shadow-md font-semibold">
        {rank}
      </div>

      {/* Title Row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold text-gray-800 truncate">
          {locationData.location_name}
        </h3>
        <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
          ⭐ {formattedScore}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
        <div>
          <span className="inline-flex items-center gap-1">
            <span>{getCategoryIcon(activeCategory)}</span>
            <span className="font-medium">{activeCategory}:</span>
          </span>{' '}
          {getCategoryValue(activeCategory)}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleViewDetails}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-1.5 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
      >
        <MagnifyingGlassIcon className="w-4 h-4" />
        View Details
      </button>
    </div>
  );
}