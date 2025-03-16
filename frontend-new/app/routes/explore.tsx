import { useEffect, useRef, useState } from 'react';
import { useMap } from '../contexts/MapContext';
import Sidebar from "../components/SideBar";

export default function Explore() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const { mapInstance, mapState, locations_geodata, isLoading, initializeMap, updateMapState, destroyMap} = useMap();
    const [containerReady, setContainerReady] = useState(false);    
    const [isMapReady, setIsMapReady] = useState(false);

    // Debug unmounting
    useEffect(() => {
        console.log('Explore component mounted');
        if (mapContainer.current) {
          setContainerReady(true);
        }

        return () => {
            console.log('Explore component unmounting');
        };
    }, []);

    // Initialize map on mount and clean up on unmount
    useEffect(() => {
        console.log('Trying to ini map with container:', mapContainer.current);
        // Only initialize if we're in the browser and the container exists
        if (typeof window === 'undefined' || !mapContainer.current) {
            return;
        }
    
        // Set explicit dimensions before initialization
        mapContainer.current.style.width = '100%';
        mapContainer.current.style.height = '100%';

        if (!mapInstance.current) {
            try {
                console.log('Initializing map with container:', mapContainer.current);

                // Initialize the map
                initializeMap(mapContainer.current);
                setIsMapReady(true);
                
                // Debug check
                const checkInterval = setInterval(() => {
                    if (mapInstance.current) {
                        console.log('Map state:', mapState);
                        clearInterval(checkInterval);
                    }
                }, 500);
                
                // Clean up interval after 5 seconds max
                setTimeout(() => clearInterval(checkInterval), 5000);
            } catch (err) {
                console.error('Error initializing map:', err);
            }
        } 
        
        // // Cleanup function
        // return () => {
        //     console.log('Cleaning up map - component is unmounting');
        //     destroyMap();
        //     setIsMapReady(false);
        // };
    }, [initializeMap, destroyMap, containerReady, mapContainer.current]);

    useEffect(() => {
        console.log('Trying to update mapstate:', mapContainer.current);

        if (typeof window === 'undefined' || !mapContainer.current) {
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