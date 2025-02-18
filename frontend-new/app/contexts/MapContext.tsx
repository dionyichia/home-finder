import { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import type { ReactNode, RefObject }  from 'react';
import mapboxgl from 'mapbox-gl';

interface MapContextType {
  mapInstance: RefObject<mapboxgl.Map | null>;
  mapState: {
    lng: number;
    lat: number;
    zoom: number;
  };
  updateMapState: (state: { lng: number; lat: number; zoom: number }) => void;
  initializeMap: (container: HTMLElement) => void;
  destroyMap: () => void;  // Add this method
}
  
const MapContext = createContext<MapContextType | null>(null);
    
export const MapProvider = ({ children }: { children: ReactNode }) => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const [mapState, setMapState] = useState({
    lng: 103.8098,
    lat: 1.352,
    zoom: 11
  });

    // Save map state to localStorage whenever it changes
    // Safe way to handle client-side-only code
    useEffect(() => {
      setIsClient(true);
       
      // Try to load saved state
      try {
          const saved = localStorage.getItem('mapState');
          if (saved) {
              setMapState(JSON.parse(saved));
          }
      } catch (e) {
          console.error('Error reading from localStorage:', e);
      }
    }, []);
  
    // Only save to localStorage after initial client-side load
    useEffect(() => {
        if (!isClient) return;
        
        try {
            localStorage.setItem('mapState', JSON.stringify(mapState));
        } catch (e) {
            console.error('Error writing to localStorage:', e);
        }
    }, [mapState, isClient]);
    
    const updateMapState = (newState: { lng: number; lat: number; zoom: number }) => {
        setMapState(newState);
    };

    const destroyMap = useCallback(() => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    }, []);

    const initializeMap = useCallback((container: HTMLElement) => {
        if (typeof window === 'undefined') return; // Don't initialize on server
        if (mapInstance.current) return;

        mapInstance.current = new mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [mapState.lng, mapState.lat],
            zoom: mapState.zoom
        });

        mapInstance.current.on('moveend', () => {
            const center = mapInstance.current!.getCenter();
            updateMapState({
                lng: center.lng,
                lat: center.lat,
                zoom: mapInstance.current!.getZoom()
            });
        });
    }, [mapState, isClient]);
  
  return (
    <MapContext.Provider 
      value={{ 
        mapInstance, 
        mapState, 
        updateMapState, 
        initializeMap,
        destroyMap, 
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
  
export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};