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
    <div className="absolute top-0 bottom-0 left-0 right-0">
        <div ref={mapContainer} className='min-h-full min-w-full'/>
        <div> 
            {/* Add some condition to open sidebar */}
            <Sidebar/>
        </div>

    </div>
    );
}