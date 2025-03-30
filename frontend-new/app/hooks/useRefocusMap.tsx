import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { api } from '~/api';
import { useMap } from '~/contexts/MapContext';

interface RefocusOptions {
  zoom?: number;
  duration?: number;
  padding?: number | mapboxgl.PaddingOptions;
}

interface POIMarker {
  marker: mapboxgl.Marker;
  category: 'schools' | 'malls' | 'transport';
}

export const useRefocusMap = (
  onLocationSelected?: (locationName: string) => void
) => {
  // Use MapContext instead of passing mapInstance
  const { mapInstance, mapState } = useMap();
  
  const [currentLocationName, setCurrentLocationName] = useState<string | null>(null);
  const poiMarkersRef = useRef<POIMarker[]>([]);
  const zoomThreshold = 14; // Define the zoom threshold as a constant
  const lastHandledZoom = useRef<number>(mapState.zoom);

  // Hide the polygon overlay layers
  const hideOverlayLayers = useCallback(() => {
    if (!mapInstance.current) return;

    const layers = ['district_coords-fills', 'district_coords-outlines'];
    layers.forEach(layerId => {
      if (mapInstance.current?.getLayer(layerId)) {
        mapInstance.current.setLayoutProperty(layerId, 'visibility', 'none');
      }
    });
  }, [mapInstance]);

  // Show the polygon overlay layers
  const showOverlayLayers = useCallback(() => {
    if (!mapInstance.current) return;

    const layers = ['district_coords-fills', 'district_coords-outlines'];
    layers.forEach(layerId => {
      if (mapInstance.current?.getLayer(layerId)) {
        mapInstance.current.setLayoutProperty(layerId, 'visibility', 'visible');
      }
    });
  }, [mapInstance]);

  // Clear all POI markers
  const clearPOIMarkers = useCallback(() => {
    poiMarkersRef.current.forEach(({ marker }) => {
      marker.remove();
    });
    poiMarkersRef.current = [];
  }, []);

  // Create a marker for a POI
  const createPOIMarker = useCallback(
    (poi: any, category: 'schools' | 'malls' | 'transport') => {
      if (!mapInstance.current || !poi.latitude || !poi.longitude) return null;

      // Create element for the marker
      const el = document.createElement('div');
      el.className = 'poi-marker';

      // Apply styling based on category
      switch (category) {
        case 'schools':
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`;
          break;
        case 'malls':
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M16 16a4 4 0 0 1-8 0"/></svg>`;
          break;
        case 'transport':
          el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v16"/></svg>`;
          break;
      }

      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'white';
      el.style.padding = '4px';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      // Create popup for the marker
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div>
          <h3 class="font-bold">${poi.name || category}</h3>
          ${poi.Address ? `<p>${poi.Address}</p>` : ''}
        </div>`
      );

      // Create the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([poi.longitude, poi.latitude])
        .setPopup(popup)
        .addTo(mapInstance.current);

      return { marker, category };
    },
    [mapInstance]
  );

  // Add POI markers for a location
  const addPOIMarkers = useCallback(
    async (locationName: string) => {
      if (!mapInstance.current) return;

      try {
        // Fetch location data from API
        const locationData = await api.searchLocation(locationName);

        // Add markers for schools
        if (locationData.schools && Array.isArray(locationData.schools)) {
          console.log("Adding schools, ", locationData.schools)
          locationData.schools.forEach((school: any) => {
            const marker = createPOIMarker(school, 'schools');
            if (marker) poiMarkersRef.current.push(marker);
          });
        }

        // Add markers for malls
        if (locationData.malls && Array.isArray(locationData.malls)) {
          console.log("Adding malls, ", locationData.malls)
          locationData.malls.forEach((mall: any) => {
            const marker = createPOIMarker(mall, 'malls');
            if (marker) poiMarkersRef.current.push(marker);
          });
        }

        // Add markers for transport
        if (locationData.transport && Array.isArray(locationData.transport)) {
          console.log("Adding transport, ", locationData.transport)
          locationData.transport.forEach((transport: any) => {
            const marker = createPOIMarker(transport, 'transport');
            if (marker) poiMarkersRef.current.push(marker);
          });
        }
      } catch (error) {
        console.error('Error fetching POI data:', error);
      }
    },
    [mapInstance, createPOIMarker]
  );

  // Monitor zoom changes from mapState
  useEffect(() => {
    if (!currentLocationName) return;

    const currentZoom = mapState.zoom;
    
    // Only process if zoom has actually changed
    if (currentZoom !== lastHandledZoom.current) {
      if (currentZoom < zoomThreshold && lastHandledZoom.current >= zoomThreshold) {
        // User zoomed out past threshold
        clearPOIMarkers();
        showOverlayLayers();
        
        console.log(`Zoom (${currentZoom}) below threshold (${zoomThreshold}), showing default view`);
      } else if (currentZoom >= zoomThreshold && lastHandledZoom.current < zoomThreshold) {
        // User zoomed in past threshold
        hideOverlayLayers();
        
        // Only add markers if they're not already visible
        if (poiMarkersRef.current.length === 0) {
          addPOIMarkers(currentLocationName);
        }
        
        console.log(`Zoom (${currentZoom}) above threshold (${zoomThreshold}), showing POI markers`);
      }
      
      // Update the last handled zoom
      lastHandledZoom.current = currentZoom;
    }
  }, [
    mapState.zoom, 
    currentLocationName, 
    zoomThreshold, 
    clearPOIMarkers, 
    showOverlayLayers, 
    hideOverlayLayers, 
    addPOIMarkers
  ]);

  // Enhanced refocus function to handle detailed view mode
  const refocusMap = useCallback(
    (
      coordinates: { lng: number; lat: number },
      options: RefocusOptions = {},
      locationName?: string
    ) => {
      if (!mapInstance.current) {
        console.warn('Map instance not available for refocusing');
        return;
      }

      const { zoom = zoomThreshold, duration = 1500, padding = 0 } = options;

      // Update the lastHandledZoom ref to match what we're setting
      // This prevents the effect from triggering unnecessarily
      lastHandledZoom.current = zoom;

      // If we have a new location name, or different from the current one
      if (locationName && locationName !== currentLocationName) {
        // We're entering detailed mode for a specific location
        setCurrentLocationName(locationName);
        
        // Only show POI view if the zoom will be at or above threshold
        if (zoom >= zoomThreshold) {
          // Hide polygon layers
          hideOverlayLayers();
          
          // Clear any existing POI markers
          clearPOIMarkers();
          
          // Add POI markers for this location
          addPOIMarkers(locationName);
        } else {
          // We're below threshold, make sure overlays are visible
          showOverlayLayers();
        }
      } else if (!locationName && currentLocationName) {
        // We're exiting detailed mode
        setCurrentLocationName(null);
        
        // Show polygon layers
        showOverlayLayers();
        
        // Clear POI markers
        clearPOIMarkers();
      }

      // Animate the map to the new position
      mapInstance.current.easeTo({
        center: [coordinates.lng, coordinates.lat],
        zoom,
        duration,
        padding,
      });

      console.log(
        `Map refocused to: ${coordinates.lng}, ${coordinates.lat} with zoom: ${zoom}`
      );

      // Call the onLocationSelected callback if provided and we have a location name
      if (onLocationSelected && locationName) {
        onLocationSelected(locationName);
      }
    },
    [
      mapInstance,
      currentLocationName,
      hideOverlayLayers,
      clearPOIMarkers,
      addPOIMarkers,
      showOverlayLayers,
    ]
  );

  // Reset the map view to default (hide POIs, show overlays)
  const resetMapView = useCallback(() => {
    console.log("resetting map view")
    if (!mapInstance.current) return;

    // Show polygon layers
    showOverlayLayers();

    // Clear POI markers
    clearPOIMarkers();

    // Reset current location
    setCurrentLocationName(null);

    console.log('Map view reset to default');
  }, [mapInstance, currentLocationName, showOverlayLayers, clearPOIMarkers]);

  /**
   * Refocus to a location by its name (using the polygon center)
   */
  const refocusByLocationName = useCallback(
    (locationName: string, options?: RefocusOptions) => {
      if (!mapInstance.current) {
        console.warn('Map instance not available for refocusing');
        return false;
      }

      // Access the source data to find the location
      const source = mapInstance.current.getSource(
        'district_coords'
      ) as mapboxgl.GeoJSONSource;

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
    },
    [mapInstance, refocusMap]
  );

  /**
   * Add click listeners to map features
   */
  const initializeMapClickHandlers = useCallback(() => {
    if (!mapInstance.current) {
      console.warn('Map instance not available for initializing click handlers');
      return;
    }

    // Add pointer cursor when hovering over polygons
    mapInstance.current.on('mouseenter','district_coords-fills', () => {
      if (mapInstance.current) {
        mapInstance.current.getCanvas().style.cursor = 'pointer';
      }
    });

    // Reset cursor when leaving polygons
    mapInstance.current.on('mouseleave','district_coords-fills', () => {
      if (mapInstance.current) {
        mapInstance.current.getCanvas().style.cursor = '';
      }
    });

    // Add click handler for polygons
    mapInstance.current.on('click','district_coords-fills', (e) => {
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
        console.log('refocusing on ', locationName);
        refocusMap(center, { zoom: zoomThreshold }, locationName);
      }
    });
  }, [mapInstance, refocusMap]);

  return {
    refocusMap,
    refocusByLocationName,
    initializeMapClickHandlers,
    resetMapView,
    currentLocationName
  };
};