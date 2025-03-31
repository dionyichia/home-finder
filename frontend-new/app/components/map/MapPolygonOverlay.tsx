// components/map/MapPolygonOverlay.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useMap } from '../../contexts/MapContext';
import polylabel from 'polylabel';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import CategorySelector from './CategorySelector';
import { useLocationBubbles } from '~/hooks/useLocationBubbles';
import { useRefocusMap } from '~/hooks/useRefocusMap';

interface MapPolygonOverlayProps {
  activeCategory: string;
}

const MapPolygonOverlay = ({ activeCategory }: MapPolygonOverlayProps) => {
  const { mapInstance, locations_geodata, setOverlaySourceData, selectedLocationCallback } = useMap();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { initializeMapClickHandlers } = useRefocusMap(selectedLocationCallback);

  const calculatePolygonCenter = (coordinates: number[][]) => {
    const labelPosition = polylabel([coordinates], 0.0001);
    return {
      lat: labelPosition[1],
      lng: labelPosition[0],
    };
  };

  const prepareGeojsonData = useCallback(() => {
    if (!locations_geodata || locations_geodata.length === 0) {
      console.warn('No geodata available');
      return null;
    }

    const geojsonData = {
      type: 'FeatureCollection',
      features: locations_geodata.map(location => {
        if (!location || !location.geodata) {
          console.warn('Invalid location data:', location);
          return null;
        }

        try {
          return {
            type: 'Feature',
            properties: {
              name: location.location_name,
              center: calculatePolygonCenter(location.geodata),
              // Add additional props if needed
            },
            geometry: {
              type: 'Polygon',
              coordinates: [location.geodata]
            }
          };
        } catch (error) {
          console.error('Error processing location:', location, error);
          return null;
        }
      }).filter(Boolean)
    };

    return geojsonData;
  }, [locations_geodata]);

  const drawMapData = useCallback(() => {
    if (!mapInstance.current) return;

    // Remove existing layers and sources
    if (mapInstance.current.getSource('district_coords')) {
      ['district_coords-fills', 'district_coords-outlines'].forEach(layerId => {
        if (mapInstance.current.getLayer(layerId)) {
          mapInstance.current.removeLayer(layerId);
        }
      });
      mapInstance.current.removeSource('district_coords');
    }

    const geojsonData = prepareGeojsonData();

    if (!geojsonData) {
      console.error('Failed to prepare geojson data');
      return;
    }

    // Add new source
    mapInstance.current.addSource('district_coords', {
      type: 'geojson',
      data: geojsonData
    });

    console.log("Preparing map source data:", geojsonData);
    setOverlaySourceData(geojsonData);

// Frosted glassy fill with light blue tint
mapInstance.current.addLayer({
  id: 'district_coords-fills',
  type: 'fill',
  source: 'district_coords',
  layout: {},
  paint: {
    'fill-color': 'rgba(100, 149, 237, 0.25)', // deeper blue frost
    'fill-opacity': 1
  }
}, 'waterway-label');

    // Clean black outlines
    mapInstance.current.addLayer({
      id: 'district_coords-outlines',
      type: 'line',
      source: 'district_coords',
      layout: {},
      paint: {
        'line-color': '#000000',
        'line-width': 2
      }
    }, 'waterway-label');

    initializeMapClickHandlers();
  }, [mapInstance, prepareGeojsonData, setOverlaySourceData, initializeMapClickHandlers]);

  useEffect(() => {
    console.log("trying to drawMapData");
    if (!mapInstance.current || !locations_geodata) return;

    if (!mapInstance.current.loaded()) {
      mapInstance.current.on('load', () => {
        console.log("first loc ", locations_geodata[0]);
        drawMapData();
        console.log("drawn 1");
      });
    } else {
      console.log("first loc ", locations_geodata[0]);
      drawMapData();
      console.log("drawn 2");
    }

    // Optional: cleanup markers
    // return () => {
    //   markersRef.current.forEach(marker => marker.remove());
    // };
  }, [mapInstance.current, locations_geodata]);

  return null;
};

export default MapPolygonOverlay;