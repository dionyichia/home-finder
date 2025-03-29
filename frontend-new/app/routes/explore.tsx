// pages/Explore.tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMap } from '../contexts/MapContext';
import Sidebar from "../components/sidebar/SideBar";
import MapPolygonOverlay from '../components/map/MapPolygonOverlay';
import CategorySelector from '../components/map/CategorySelector';
import CollapsibleNavBar from '~/components/NavBar';

import { api } from '~/api';
import { useLocationBubbles } from '~/hooks/useLocationBubbles';
import { useSideBar } from '~/hooks/useSideBar';
import { useRefocusMap } from '~/hooks/useRefocusMap';

export default function Explore() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const { mapInstance, mapState, locations_geodata, isLoading, overlaySourceData, initializeMap, updateMapState, destroyMap, selectedLocationCallback} = useMap();
    const [activeCategory, setActiveCategory] = useState<string>('price');
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [domReady, setDomReady] = useState(false);
    
    // Initialize map on mount and clean up on unmount

    // Debug unmounting
    useEffect(() => {
        console.log('Explore component mounted');

        return () => {
            console.log('Explore component unmounting');
        };
    }, []);

    useEffect(() => {
        setDomReady(true);
    }, []);

    useLayoutEffect(() => {        
        if (!domReady) return;

        // Wait for the component to be fully mounted
        console.log('Explore timer end', mapContainer, mapContainer.current);
        if (mapContainer.current && typeof window !== 'undefined') {
            console.log('Container is ready:', mapContainer.current);
            
            // Make sure the container has dimensions
            mapContainer.current.style.width = '100%';
            mapContainer.current.style.height = '100%';
            
            // Initialize the map
            if (!mapInstance.current) {
                initializeMap(mapContainer.current);
                setIsMapLoaded(true);
            }
            
            // Set up the map state update listener
            if (mapInstance.current) {
                updateMapState(mapInstance);
            }
        }
        
        // return () => {
        //     clearTimeout(timer);
        //     destroyMap();
        //     console.log('Explore component unmounting');
        // };
    }, [mapContainer.current, initializeMap, updateMapState, destroyMap]);
    
    useEffect(() => {
        // console.log('Trying to update mapstate:', mapContainer.current);

        if (typeof window === 'undefined' || !mapContainer) {
            return;
        }

        updateMapState(mapInstance);
    }, [updateMapState])

    const { updateLocationBubbles } = useLocationBubbles(mapInstance);
    const { updateSideBar, locations } = useSideBar(mapInstance);

    // Handler for category change
    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        console.log("active category swapped: ", category);
    };

    // On category change, get the new sorted list of locations from API
    useLayoutEffect(() => {
        console.log("Getting new sort data")
        const fetchSortedLocations = async () => {
        if (activeCategory && overlaySourceData) {
            // Jsonified List of list of tuples, (ranked location, their score), location is a dict of location, each db coloumn headder is a key.
            const sorted_locations = await api.getSortedLocations(activeCategory);

            // Update location bubbles with the new data, 
            if (sorted_locations && sorted_locations.length > 0) {
                // Update all the Location Markers on the map
                updateLocationBubbles(sorted_locations);

                // Upadte all the locations shown in the sidebar
                updateSideBar(sorted_locations)
            } else {
                console.log("No location retrieved: ", sorted_locations)
            }
        }
        };

        fetchSortedLocations();
    }, [activeCategory, overlaySourceData]);

    const { refocusMap, refocusByLocationName, initializeMapClickHandlers } = useRefocusMap(
        mapInstance,
        selectedLocationCallback
      );

    // Loading state
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading location data...</div>;
    }

    return (
        <div className="flex flex-1 h-screen w-screen">
            <div className="flex flex-1 relative">
                <div 
                    ref={mapContainer} 
                    className="absolute inset-0 bg-gray-100 h-full w-full" 
                />
                
                {/* Category selector */}
                <div className="absolute top-4 right-4 z-10">
                    <CategorySelector onCategoryChange={handleCategoryChange} activeCategory={activeCategory} />
                </div>
                
                {/* Map overlay with polygons and bubbles */}
                {isMapLoaded && locations_geodata && (
                    <MapPolygonOverlay activeCategory={activeCategory || "price"}/>
                )}
                
                {/* <Sidebar /> */}
                {/* Integrated NavBar with SideBar functionality */}
                <CollapsibleNavBar 
                    locations={locations} 
                    activeCategory={activeCategory} 
                />
            </div>
        </div>
    );
}


// import { useEffect, useRef, useState } from 'react';
// import { useMap } from '../contexts/MapContext';
// import Sidebar from "../components/SideBar";

// export default function Explore() {
//     const mapContainer = useRef<HTMLDivElement>(null);
//     const { mapInstance, mapState, locations_geodata, isLoading, initializeMap, updateMapState, destroyMap} = useMap();
//     const [containerReady, setContainerReady] = useState(false);    
//     const [isMapReady, setIsMapReady] = useState(false);

//     // Initialize map on mount and clean up on unmount
//     useEffect(() => {
//         console.log('Explore component mounted');

//         // Wait for the component to be fully mounted
//         const timer = setTimeout(() => {
//             if (mapContainer.current && typeof window !== 'undefined') {
//                 console.log('Container is ready:', mapContainer.current);

//                 // Make sure the container has dimensions
//                 mapContainer.current.style.width = '100%';
//                 mapContainer.current.style.height = '100%';

//                 // Initialize the map
//                 if (!mapInstance.current) {
//                     initializeMap(mapContainer.current);
//                 }

//                 // Set up the map state update listener
//                 if (mapInstance.current) {
//                     updateMapState(mapInstance);
//                 }
//             }
//         }, 100); // Small delay to ensure DOM is ready

//         // return () => {
//         //     clearTimeout(timer);
//         //     destroyMap();
//         //     console.log('Explore component unmounting');
//         // };
//     }, [initializeMap, updateMapState, destroyMap]);

//     // Save the mapState to sessionStorage so that the user still sees the same map sate on switching tabs or refreshing.
//     useEffect(() => {
//         console.log('Trying to update mapstate:', mapContainer.current);

//         if (typeof window === 'undefined' || !mapContainer) {
//             return;
//         }

//         updateMapState(mapInstance)
//     }, [updateMapState])

//     // Loading state
//     if (isLoading) {
//         return <div className="flex items-center justify-center h-screen">Loading location data...</div>;
//     }

//     return (
//         <div className="flex flex-1 h-screen w-screen">
//             <div className="flex flex-1 relative pt-12">
//                 <div 
//                     ref={mapContainer} 
//                     className="absolute inset-0 bg-gray-100" 
//                 />
//                 <Sidebar />
//             </div>
//         </div>
//     );
// }