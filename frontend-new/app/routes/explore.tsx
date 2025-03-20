import { useEffect, useRef, useState } from 'react';
import { useMap } from '../contexts/MapContext';
import Sidebar from "../components/SideBar";

export default function Explore() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const { mapInstance, mapState, locations_geodata, isLoading, initializeMap, updateMapState, destroyMap} = useMap();
    const [containerReady, setContainerReady] = useState(false);    
    const [isMapReady, setIsMapReady] = useState(false);


    // Initialize map on mount and clean up on unmount
    useEffect(() => {
        console.log('Explore component mounted');
        
        // Wait for the component to be fully mounted
        const timer = setTimeout(() => {
            if (mapContainer.current && typeof window !== 'undefined') {
                console.log('Container is ready:', mapContainer.current);
                
                // Make sure the container has dimensions
                mapContainer.current.style.width = '100%';
                mapContainer.current.style.height = '100%';
                
                // Initialize the map
                if (!mapInstance.current) {
                    initializeMap(mapContainer.current);
                }
                
                // Set up the map state update listener
                if (mapInstance.current) {
                    updateMapState(mapInstance);
                }
            }
        }, 100); // Small delay to ensure DOM is ready
        
        // return () => {
        //     clearTimeout(timer);
        //     destroyMap();
        //     console.log('Explore component unmounting');
        // };
    }, [initializeMap, updateMapState, destroyMap]);

    useEffect(() => {
        console.log('Trying to update mapstate:', mapContainer.current);

        if (typeof window === 'undefined' || !mapContainer) {
            return;
        }

        updateMapState(mapInstance)
    }, [updateMapState])

    // Loading state
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading location data...</div>;
    }

    return (
        <div className="flex flex-1 h-screen w-screen">
            <div className="flex flex-1 relative pt-12">
                <div 
                    ref={mapContainer} 
                    className="absolute inset-0 bg-gray-100" 
                />
                <Sidebar />
            </div>
        </div>
    );
}