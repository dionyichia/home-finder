import { useEffect, useRef } from 'react';
import { useMap } from '../contexts/MapContext';

import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";

export default function explore () {

    const mapContainer = useRef<HTMLDivElement>(null);
    const { initializeMap, mapState } = useMap();

    useEffect(() => {
        if (mapContainer.current) {
          initializeMap(mapContainer.current);
        }
      }, [initializeMap]);

    return (
    <div className="h-screen">
        <div ref={mapContainer} className="h-full w-full" />
        <NavBar/>
        <div> 
            {/* Add some condition to open sidebar */}
            <Sidebar/>
        </div>

    </div>
    );
}