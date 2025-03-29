// components/map/MapPolygonOverlay.tsx
import { useEffect, useRef, useCallback} from 'react';
import { useMap } from '../../contexts/MapContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import CategorySelector from './CategorySelector';
import { useLocationBubbles } from '~/hooks/useLocationBubbles';

interface MapPolygonOverlayProps {
  activeCategory: string;
}

const MapPolygonOverlay = ({ activeCategory }: MapPolygonOverlayProps) => {
  const { mapInstance, locations_geodata, setOverlaySourceData } = useMap();
  const markersRef = useRef<mapboxgl.Marker[]>([]);

//   useEffect(() => {
//     if (!mapInstance.current) {
//       console.log("trying to draw maine");
//       return;
//     }

//     if (mapInstance.current.getSource('maine')) {
//           if (mapInstance.current.getLayer('outline')) {
//             mapInstance.current.removeLayer('outline');
//           }
//         mapInstance.current.removeSource('maine');
//       }

//     mapInstance.current.on('load', () => {
//       console.log("Adding maine")
//       mapInstance.current.addSource('maine', {
//         type: 'geojson',
//         data: {
//           type: 'Feature',
//           geometry: {
//             type: 'Polygon',
//             // These coordinates outline Maine.
//             coordinates: [
//               [
//                 [-67.13734, 45.13745],
//                 [-66.96466, 44.8097],
//                 [-68.03252, 44.3252],
//                 [-69.06, 43.98],
//                 [-70.11617, 43.68405],
//                 [-70.64573, 43.09008],
//                 [-70.75102, 43.08003],
//                 [-70.79761, 43.21973],
//                 [-70.98176, 43.36789],
//                 [-70.94416, 43.46633],
//                 [-71.08482, 45.30524],
//                 [-70.66002, 45.46022],
//                 [-70.30495, 45.91479],
//                 [-70.00014, 46.69317],
//                 [-69.23708, 47.44777],
//                 [-68.90478, 47.18479],
//                 [-68.2343, 47.35462],
//                 [-67.79035, 47.06624],
//                 [-67.79141, 45.70258],
//                 [-67.13734, 45.13745]
//               ]
//             ]
//           }
//         }
//       });

//       mapInstance.current.addLayer({
//         id: 'maine',
//         type: 'fill',
//         source: 'maine',
//         layout: {},
//         paint: {
//           'fill-color': '#0080ff',
//           'fill-opacity': 0.5
//         }
//       });

//       mapInstance.current.addLayer({
//         id: 'outline',
//         type: 'line',
//         source: 'maine',
//         layout: {},
//         paint: {
//           'line-color': '#000',
//           'line-width': 3
//         }
//       });
//     });
//   }, [mapInstance.current]);

    const calculatePolygonCenter = (coordinates: number[][]) => {
        if (!coordinates || coordinates.length === 0) {
            console.log("No coordinates provided");
            return { lat: 0, lng: 0 };
        }

        const sumX = coordinates.reduce((sum, point) => sum + point[0], 0);
        const sumY = coordinates.reduce((sum, point) => sum + point[1], 0);

        return { 
            lat: sumY / coordinates.length,
            lng: sumX / coordinates.length 
        };
    };

    // Memoized data preparation to ensure consistent data structure
    const prepareGeojsonData = useCallback(() => {
        if (!locations_geodata || locations_geodata.length === 0) {
        console.warn('No geodata available');
        return null;
        }

        const geojsonData = {
        type: 'FeatureCollection',
        features: locations_geodata.map(location => {
            // Defensive checks
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
                // Add any additional properties you need
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
        }).filter(Boolean) // Remove any null entries
        };

        return geojsonData;
    }, [locations_geodata]);


  
  useEffect(() => {
    console.log("trying to drawMapData")
    if (!mapInstance.current || !locations_geodata) return;
    console.log("can drawMapData")
    
    // Wait for map to load fully
    if (!mapInstance.current.loaded()) {
      mapInstance.current.on('load', () => {
        console.log("first loc ", locations_geodata[0])
        drawMapData()
        console.log("drawn 1")
    });
    } else {
        console.log("first loc ", locations_geodata[0])
        drawMapData();
        console.log("drawn 2")
    }

    // drawMapData()
    
    // return () => {
    //   // Clean up markers on unmount
    //   markersRef.current.forEach(marker => marker.remove());
    // };
  }, [mapInstance.current, locations_geodata]); // This works [mapInstance.current, locations_geodata, activeCategory]);
  
  const drawMapData = () => {
    // Remove existing layers and sources if they exist
    if (mapInstance.current.getSource('district_coords')) {
      ['district_coords-fills', 'district_coords-outlines'].forEach(layerId => {
        if (mapInstance.current.getLayer(layerId)) {
          mapInstance.current.removeLayer(layerId);
        }
      });
      mapInstance.current.removeSource('district_coords');
    }
    
    // // Clean up existing markers
    // markersRef.current.forEach(marker => marker.remove());
    // markersRef.current = [];
    
    // Create GeoJSON data from locations_geodata
    // const filteredLocations = activeCategory 
    //   ? locations_geodata.filter(loc => loc.properties.category === activeCategory)
    //   : locations_geodata;

    // console.log("raw locations_geodata:", JSON.stringify(locations_geodata[0], null, 2));
      
    // Prepare geojson data
    const geojsonData = prepareGeojsonData();

    if (!geojsonData) {
        console.error('Failed to prepare geojson data');
        return;
    }

    // console.log("geojsonData:", JSON.stringify(geojsonData, null, 2));
      
    // Add source for polygon data
    mapInstance.current.addSource('district_coords', {
      type: 'geojson',
      data: geojsonData
    });
    console.log("Preparing map source data:", geojsonData);
    setOverlaySourceData(geojsonData);
    
    // Add polygon fill layer
    mapInstance.current.addLayer({
      id: 'district_coords-fills',
      type: 'fill',
      source: 'district_coords',
      layout: {},
      paint: {
        'fill-color': '#0080ff',
        'fill-opacity': 0.5
      }
    }, 'waterway-label');
    console.log("layer added")
    
    // Add polygon outline layer
    mapInstance.current.addLayer({
      id: 'district_coords-outlines',
      type: 'line',
      source: 'district_coords',
      layout: {},
      paint: {
        'line-color': '#000',
        'line-width': 2
      }
    }, 'waterway-label');
    console.log("outline added")

    // Fit the map to the polygons
    // const bounds = new mapboxgl.LngLatBounds();
    // geojsonData.features.forEach(feature => {
    //     feature.geometry.coordinates[0].forEach(coord => {
    //     bounds.extend(coord);
    //     });
    // });
    // mapInstance.current.fitBounds(bounds, {
    //     padding: 50,
    //     maxZoom: 12
    // });

    console.log("Map sources:", mapInstance.current.getStyle().sources);
    console.log("Map layers:", mapInstance.current.getStyle().layers);
    
    // Add hover effects
    // mapInstance.current.on('mouseenter', 'district_coords-fills', () => {
    //   mapInstance.current.getCanvas().style.cursor = 'pointer';
    // });
    
    // mapInstance.current.on('mouseleave', 'district_coords-fills', () => {
    //   mapInstance.current.getCanvas().style.cursor = '';
    // });
    
    // Add info bubbles
    // updateLocationBubbles(geojsonData.features, activeCategory);
  };
  
//   const updateLocationBubbles = (locations: any[], activeCategory: string) => {
//     locations.forEach(location => {
//       // Calculate center of polygon
//       const center = calculatePolygonCenter(location.geometry.coordinates);
      
//       // Create HTML element for the marker
//       const el = document.createElement('div');
//       el.className = 'location-bubble';

//     // Add click listener to expand/collapse
//     //   el.addEventListener('click', () => {
//     //     const infoElement = el.querySelector('p');
//     //     if (infoElement.style.display === 'none') {
//     //       infoElement.style.display = 'block';
//     //     } else {
//     //       infoElement.style.display = 'none';
//     //     }
//     //   });

//       const marker = new mapboxgl.Marker(el)
//           .setLngLat([center.lat, center.lng])
//           .setPopup(
//             new mapboxgl.Popup({ offset: 25 }) // add popups
//               .setHTML(
//                 `<h3>${location.properties.rank}</h3><p>${location.properties.description}</p>`
//               )
//           )
//           .addTo(mapInstance.current);
        
//       markersRef.current.push(marker);
//     });
//   };
  
// //   Helper function to calculate center of polygon
//   const calculatePolygonCenter = (coordinates: any) => {
//     if (!coordinates || !coordinates[0] || !coordinates[0][0]) {
//         console.log("Coordinates provided are in an invalid format")
//         return { lat: 0, lng: 0};
//     }
    
//     // For multi-polygons, use the first polygon
//     const points = coordinates[0];
//     let sumX = 0;
//     let sumY = 0;
    
//     points.forEach(point => {
//       sumX += point[0];
//       sumY += point[1];
//     });
    
//     return { 'lat': sumX / points.length, 'lng': sumY / points.length };
//   };
  
//   // Helper function to create display text
//   const getDisplayInfo = (properties: any) => {
//     const excludeKeys = ['name', 'id'];
//     return Object.entries(properties)
//       .filter(([key]) => !excludeKeys.includes(key))
//       .map(([key, value]) => `${key}: ${value}`)
//       .join('<br>');
//   };
  
  // This component doesn't render anything directly
  return null;
};

export default MapPolygonOverlay;