import { createContext, useContext, useRef, useState, ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapContextType {
    mapInstance: React.MutableRefObject<mapboxgl.Map | null>;
    mapState: {
      lng: number;
      lat: number;
      zoom: number;
    };
    updateMapState: (state: { lng: number; lat: number; zoom: number }) => void;
    initializeMap: (container: HTMLElement) => void;
  }
  
  const MapContext = createContext<MapContextType | null>(null);
  
  export const MapProvider = ({ children }: { children: ReactNode }) => {
    const mapInstance = useRef<mapboxgl.Map | null>(null);
    const [mapState, setMapState] = useState({
      lng: -70.9,
      lat: 42.35,
      zoom: 9
    });
  
    const updateMapState = (newState: { lng: number; lat: number; zoom: number }) => {
      setMapState(newState);
    };
  
    const initializeMap = (container: HTMLElement) => {
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
    };
  
    return (
      <MapContext.Provider 
        value={{ 
          mapInstance, 
          mapState, 
          updateMapState, 
          initializeMap 
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