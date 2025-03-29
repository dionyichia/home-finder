import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createRoot, hydrateRoot } from "react-dom/client";
import mapboxgl from 'mapbox-gl';
import LocationBubbleComp from '~/components/map/LocationBubble';

import { useMap } from '~/contexts/MapContext';

export const useLocationBubbles = (mapInstance: React.RefObject<mapboxgl.Map | null>) => {
  const [markers, setMarkers] = useState<{
    marker: mapboxgl.Marker;
    locationData: any;
    container: HTMLDivElement;
  }[]>([]);
  const { overlaySourceData } = useMap();

  const updateLocationBubbles = useCallback((locations: any[]) => {
    // Clear existing markers
    console.log("trying to updateLocationBubbles, ", overlaySourceData);
    
    // Remove existing Mapbox markers
    if (markers.length > 0) {
      markers.forEach(({ marker }) => {
        marker.remove();
      });
    }
  
    if (!overlaySourceData || !mapInstance.current) {
      console.warn('No map source data or map instance available');
      return;
    }
  
    const newMarkers = locations.map((location, index) => {
      // Find the corresponding feature using location name
      const feature = overlaySourceData.features.find(
        (feature: any) => feature.properties.name === location[0].location_name
      );
  
      if (!feature) {
        console.warn(`No feature found for location: ${location[0].location_name}`);
        return null;
      }
  
      const center = feature.properties.center;
  
      if (!center) {
        console.warn(`No center found for location: ${location[0].location_name}`);
        return null;
      }
  
      // Create a container for the marker (THIS IS THE KEY CHANGE)
      const container = document.createElement('div');
      
      // Render React component into the container
      const componentRoot = createRoot(container);
      componentRoot.render(
        <LocationBubbleComp
          rank={index + 1}
          onClick={() => {
            // Handle click event if needed
            console.log(`Clicked on location: ${location[0].location_name}`);
            // You could show more details in a popup or sidebar here
          }}
        />
      );
  
      // Create the Mapbox marker WITH the custom element
      const marker = new mapboxgl.Marker({
        element: container,  // Use your React component as the marker element
        anchor: 'center'     // Center the marker on the coordinates
      })
        .setLngLat([center.lng, center.lat])
        .addTo(mapInstance.current!);
  
      return { marker, locationData: location[0], container };
    }).filter(Boolean);
  
    setMarkers(newMarkers);
  }, [overlaySourceData, mapInstance]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (markers.length > 0) {
        markers.forEach(({ marker }) => {
          marker.remove();
        });
      }
    };
  }, [markers]);

  return { updateLocationBubbles, markers };
};