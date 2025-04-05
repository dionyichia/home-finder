import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BuildingStorefrontIcon, 
  AcademicCapIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  StarIcon
} from '@heroicons/react/24/outline';
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
    category_scores?: Record<string, number>;
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

  // Format price to include commas
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };
  
  // Calculate crime safety as an inverse of crime rate (lower crime rate is better)
  const getCrimeSafetyRating = () => {
    // Assuming crime rate of 200 is low and 500 is high
    const crimeSafety = Math.max(0, Math.min(10, 10 - ((locationData.crime_rate - 200) / 30)));
    return crimeSafety.toFixed(1);
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
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold text-gray-800 truncate">
          {locationData.location_name}
        </h3>
        {activeCategory === 'score' ? (
          <div className="bg-blue-600 text-white text-sm font-medium py-1 px-2 rounded-full flex items-center gap-1">
            <StarIcon className="w-4 h-4" />
            {score.toFixed(1)}/10
          </div>
        ) : (
          <div className="bg-green-600 text-white text-sm font-medium py-1 px-2 rounded-full flex items-center gap-1">
            <CurrencyDollarIcon className="w-4 h-4" />
            ${formatPrice(locationData.price)}
          </div>
        )}
      </div>
      
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center text-gray-600">
          <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-purple-500" />
          <span className="text-sm">{locationData.num_malls} {locationData.num_malls === 1 ? 'Mall' : 'Malls'}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <AcademicCapIcon className="w-4 h-4 mr-2 text-blue-500" />
          <span className="text-sm">{locationData.num_schools} Schools</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <TruckIcon className="w-4 h-4 mr-2 text-green-500" />
          <span className="text-sm">{locationData.num_transport} MRTs </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <ShieldCheckIcon className="w-4 h-4 mr-2 text-red-500" />
          <span className="text-sm">Safety: {getCrimeSafetyRating()}/10</span>
        </div>
      </div>
      
      {/* Show category scores only when sorting by score */}
      {activeCategory === 'score' && locationData.category_scores && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2">CATEGORY SCORES</h4>
          <div className="grid grid-cols-5 gap-1">
            {Object.entries(locationData.category_scores).map(([category, value]) => (
              <div key={category} className="flex flex-col items-center">
                <span className="text-xs text-gray-500 capitalize">
                  {category === 'crime_rate' ? 'Safety' : 
                   category === 'malls' ? 'Malls' : 
                   category === 'transport' ? 'Transit' : 
                   category === 'price' ? 'Value' : category}
                </span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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