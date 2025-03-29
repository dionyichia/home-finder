// // hooks/useMapOverlays.ts
// import { useEffect, useRef } from 'react';
// import ReactDOM from 'react-dom';
// import LocationBubble from '../components/map/LocationBubble';

// export const useMapOverlays = (mapInstance, locationsData, activeCategory = null) => {
//   const markersRef = useRef([]);
  
//   // Clean up markers when component unmounts
//   useEffect(() => {
//     return () => {
//       markersRef.current.forEach(marker => marker.remove());
//     };
//   }, []);
  
//   const drawPolygons = () => {
//     if (!mapInstance || !locationsData) return;
    
//     // Implementation of polygon drawing
//     // ...similar to the code in MapPolygonOverlay.tsx
//   };
  
//   const createBubbles = () => {
//     if (!mapInstance || !locationsData) return;
    
//     // Clear existing markers
//     markersRef.current.forEach(marker => marker.remove());
//     markersRef.current = [];
    
//     locationsData.forEach(location => {
//       // Skip if category filtering is active and doesn't match
//       if (activeCategory && location.category !== activeCategory) return;
      
//       const coordinates = calculatePolygonCenter(location.geometry.coordinates);
      
//       // Create container div
//       const markerEl = document.createElement('div');
//       markerEl.className = 'location-bubble-container';
      
//       // Create a new marker
//       const marker = new mapboxgl.Marker(markerEl)
//         .setLngLat(coordinates)
//         .addTo(mapInstance);
      
//       // Render React component into the marker
//       ReactDOM.render(
//         <LocationBubble 
//           name={location.properties.name}
//           properties={location.properties}
//           category={activeCategory}
//         />,
//         markerEl
//       );
      
//       markersRef.current.push(marker);
//     });
//   };
  
//   // Helper functions...
  
//   return {
//     drawPolygons,
//     createBubbles,
//     // Any other functions you might need
//   };
// };