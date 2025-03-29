import { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { LocationGeoData } from '~/api';
import { api } from '~/api';

// Type definition for mapboxgl to avoid import during SSR
interface MapboxMap {
  remove: () => void;
  getCenter: () => { lng: number; lat: number };
  getZoom: () => number;
  on: (event: string, callback: () => void) => void;
}

// Defer mapbox import to runtime only
let mapboxgl: any = null;

interface MapContextType {
  mapInstance: RefObject<MapboxMap | null>;
  mapState: {
    lng: number;
    lat: number;
    zoom: number;
  };
  locations_geodata: LocationGeoData[]; 
  isLoading: boolean;
  updateMapState: (mapInstance: any) => void;
  initializeMap: (container: HTMLElement) => void;
  destroyMap: () => void; 
  activeCategory: any;
  filterLocationsByCategory: (data: any) => void;
  overlaySourceData: any;
  setOverlaySourceData: (data: any) => void;
}
  
const MapContext = createContext<MapContextType | null>(null);
      
export const MapProvider = ({ children } : { children: ReactNode }) => {
  const mapInstance = useRef<MapboxMap | null>(null);
  const [locations_geodata, setLocationsGeodata] = useState<LocationGeoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapState, setMapState] = useState({
    lng: 103.8098,
    lat: 1.352,
    zoom: 11
  });
  const [mapInitialized, setMapInitialized] = useState(false);

  // Debug unmounting
  useEffect(() => {
    console.log('Map component mounted');

    return () => {
        console.log('Map component unmounting');
    };
  }, []);

  // Safely load mapboxgl only on client-side
  useEffect(() => {
    async function loadMapbox() {
      try {
        // Dynamic import to avoid SSR issues
        mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
      } catch (error) {
        console.error("Error loading mapbox-gl:", error);
      }
    }
    
    loadMapbox();
    console.log("Mapbox loaded");
  }, []);

  // Fetch locations data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAllLocationsGeodata();
        setLocationsGeodata(data);
        console.log("getting data from backend")
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocations();
    console.log("location geodata loaded");
  }, []);

  // Save map state to session storage when it changes
  useEffect(() => {
    console.log("Trying to save to session ", mapInitialized)
    if (mapInitialized) {
      try {
        sessionStorage.setItem("mapState", JSON.stringify(mapState));
      } catch (e) {
        console.error("Error saving map state:", e);
      }
    }

  }, [mapState, mapInitialized]);

  const loadFromSessionStorage = () => {
    console.log("Trying to load from session storage")
    try {
      const savedMapState = sessionStorage.getItem("mapState");
      console.log("Loading saved Mapstate" ,savedMapState)

      if (savedMapState) {
        const parsedMapState = JSON.parse(savedMapState)
        console.log("parsedMapState" , parsedMapState)
        setMapState(parsedMapState);

        return parsedMapState;
      }

      console.log("No saved Mapstate")

    } catch (e) {
      console.error("Error loading saved map state:", e);
    }
  }

  // Initialize map function
  const initializeMap = useCallback((container: HTMLElement) => {
    console.log("Trying to initilize Map");

    if (!container) {
      console.error('Container element is null');
      return;
    }

    if (!mapboxgl) {
        console.error('Mapbox GL not loaded yet');
        return;
    }

    if (mapInstance.current) {
        console.log('Map already initialized');
        return;
    }

    const parsedMapState = loadFromSessionStorage() || mapState; 

    try {

      console.log("Can Initilize Map");

      mapInstance.current = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [parsedMapState.lng, parsedMapState.lat],
        zoom: parsedMapState.zoom
      });

      // Set up event listeners after map is loaded
      mapInstance.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapInitialized(true);
      });

    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, []);

  const updateMapState = useCallback((mapInstance: any) => {

    if (!mapboxgl || !mapInstance.current) {
      console.warn("Mapbox GL not loaded yet");
      return;
    }

    mapInstance.current.on('moveend', () => {      
      const center = mapInstance.current.getCenter();
      setMapState({
        lng: center.lng,
        lat: center.lat,
        zoom: mapInstance.current.getZoom()
      });
    });

  }, [mapState, mapInstance, mapInitialized]);
  
  const destroyMap = useCallback(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      setMapInitialized(false);
    }
  }, []);


  // this for category button and switching sorting category
  const [activeCategory, setActiveCategory] = useState(null);

  const filterLocationsByCategory = (category: any) => {
    setActiveCategory(category);
  };

  // this is for the reloading the markers on each polygon and location
  const [overlaySourceData, setOverlaySourceData] = useState<any>(null);

  return (
    <MapContext.Provider 
      value={{ 
        mapInstance, 
        mapState, 
        locations_geodata,
        isLoading,
        updateMapState,
        initializeMap,
        destroyMap, 
        activeCategory,
        filterLocationsByCategory,
        overlaySourceData,
        setOverlaySourceData,
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