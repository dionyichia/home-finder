import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { mapInstance, selectedLocationCallback } = useMap();
  const { refocusByLocationName } = useRefocusMap(selectedLocationCallback);
  
  // Format the score to 2 decimal places
  const formattedScore = score.toFixed(2);
  
  // Get the icon based on active category
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'price':
        return '💰';
      case 'crime_rate':
        return '🛡️';
      case 'num_transport':
        return '🚆';
      case 'num_malls':
        return '🛒';
      case 'num_schools':
        return '🏫';
      default:
        return '📊';
    }
  };

  // Get the value for the active category
  const getCategoryValue = (category: string) => {
    // For price, we might want to format it as currency
    if (category.toLowerCase() === 'price') {
      return `$${locationData.price.toLocaleString()}`;
    }
    
    // For other categories, just return the value
    return locationData[category] !== undefined 
      ? locationData[category].toString() 
      : 'N/A';
  };

  // Handle View Details button click
  const handleViewDetails = () => {
    // Navigate to compare page
    navigate('/compare', { 
      state: { 
        locationToAdd: locationData.location_name,
        shouldTriggerCompare: true 
      } 
    });
  };

  // Handle location card click to focus map on this location
  const handleLocationClick = (event: React.MouseEvent) => {
    // Prevent the click from bubbling up to parent elements
    event.stopPropagation();
    
    // Only trigger refocus if the click wasn't on the button
    if (!(event.target as HTMLElement).closest('button')) {
      refocusByLocationName(locationData.location_name);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleLocationClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="flex items-center justify-center rounded-full bg-blue-500 text-white font-bold mr-3"
            style={{ width: '28px', height: '28px', fontSize: '14px' }}>
            {rank}
          </div>
          <h3 className="font-bold text-lg">{locationData.location_name}</h3>
        </div>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
          {formattedScore}
        </span>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="text-sm text-gray-700">
          <span className="mr-1">{getCategoryIcon(activeCategory)}</span>
          <span className="font-medium">{activeCategory}: </span>
          {getCategoryValue(activeCategory)}
        </div>
        <div className="text-sm text-gray-700">
          <span className="mr-1">💰</span>
          <span className="font-medium">Price: </span>
          ${locationData.price.toLocaleString()}
        </div>
      </div>
      
      <button 
        className="mt-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2 rounded text-sm transition-colors duration-200"
        onClick={handleViewDetails}
      >
        View Details
      </button>
    </div>
  );
}