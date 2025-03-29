import { useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from '~/contexts/MapContext';

export const useSideBar = (mapInstance: React.RefObject<mapboxgl.Map | null>) => {
  const [locations, setLocations] = useState<any[]>([]);
  const { overlaySourceData, activeCategory } = useMap();

  const updateSideBar = useCallback((sortedLocations: any[]) => {
    console.log("Updating sidebar with sorted locations:", sortedLocations);
    
    if (!overlaySourceData || !mapInstance.current) {
      console.warn('No map source data or map instance available for sidebar');
      return;
    }
    
    // Update the locations state with the sorted locations
    setLocations(sortedLocations);
  }, [overlaySourceData, mapInstance]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Any cleanup needed
    };
  }, []);

  return { 
    updateSideBar, 
    locations,
    activeCategory
  };
};