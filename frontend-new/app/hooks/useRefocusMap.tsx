import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface RefocusOptions {
  zoom?: number;
  duration?: number;
  padding?: number | mapboxgl.PaddingOptions;
}

export const useRefocusMap = (
  mapInstance: React.RefObject<mapboxgl.Map | null>,
  onLocationSelected?: (locationName: string) => void
) => {
  /**
   * Refocus the map to a specific location with animation
   */
  const refocusMap = useCallback((
    coordinates: { lng: number; lat: number }, 
    options: RefocusOptions = {},
    locationName?: string
  ) => {
    if (!mapInstance.current) {
      console.warn('Map instance not available for refocusing');
      return;
    }

    const {
      zoom = 14,
      duration = 1500,
      padding = 0
    } = options;

    // Use mapbox's easeTo function to animate the transition
    mapInstance.current.easeTo({
      center: [coordinates.lng, coordinates.lat],
      zoom,
      duration,
      padding
    });

    console.log(`Map refocused to: ${coordinates.lng}, ${coordinates.lat} with zoom: ${zoom}`);
    
    // Call the onLocationSelected callback if provided and we have a location name
    if (onLocationSelected && locationName) {
      onLocationSelected(locationName);
    }
  }, [mapInstance, onLocationSelected]);

  /**
   * Refocus to a location by its name (using the polygon center)
   */
  const refocusByLocationName = useCallback((locationName: string, options?: RefocusOptions) => {
    if (!mapInstance.current) {
      console.warn('Map instance not available for refocusing');
      return false;
    }

    // Access the source data to find the location
    const source = mapInstance.current.getSource('district_coords') as mapboxgl.GeoJSONSource;
    
    if (!source) {
      console.warn('district_coords source not found');
      return false;
    }

    // Get the data from the source
    const data = (source as any)._data;
    
    if (!data || !data.features) {
      console.warn('Invalid source data structure');
      return false;
    }

    // Find the feature with the matching location name
    const feature = data.features.find(
      (f: any) => f.properties.name === locationName
    );

    if (!feature) {
      console.warn(`Location "${locationName}" not found in map data`);
      return false;
    }

    // Refocus the map to the center of the polygon and pass the location name
    refocusMap(feature.properties.center, options, locationName);
    return true;
  }, [mapInstance, refocusMap]);

  /**
   * Add click listeners to map features
   */
  const initializeMapClickHandlers = useCallback(() => {
    if (!mapInstance.current) {
      console.warn('Map instance not available for initializing click handlers');
      return;
    }

    // Add pointer cursor when hovering over polygons
    mapInstance.current.on('mouseenter', 'district_coords-fills', () => {
      if (mapInstance.current) {
        mapInstance.current.getCanvas().style.cursor = 'pointer';
      }
    });

    // Reset cursor when leaving polygons
    mapInstance.current.on('mouseleave', 'district_coords-fills', () => {
      if (mapInstance.current) {
        mapInstance.current.getCanvas().style.cursor = '';
      }
    });

    // Add click handler for polygons
    mapInstance.current.on('click', 'district_coords-fills', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (properties && properties.center) {
        // For backwards compatibility with how the data is stored
        let center = properties.center;
        
        // Check if center is a string (which happens when GeoJSON is processed)
        if (typeof center === 'string') {
          try {
            center = JSON.parse(center);
          } catch (error) {
            console.error('Error parsing center coordinates:', error);
            return;
          }
        }
        
        // Pass the location name to update the search filter
        const locationName = properties.name;
        console.log("refocusing on ", locationName )
        refocusMap(center, { zoom: 14 }, locationName);
      }
    });
  }, [mapInstance, refocusMap]);

  return {
    refocusMap,
    refocusByLocationName,
    initializeMapClickHandlers
  };
};