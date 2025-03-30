import React, { useState, useEffect } from 'react';
import { useMap } from '../contexts/MapContext';

interface LocationDetails {
  price: any[];
  crime: any[];
  crime_rate: number;
  schools: any[];
  malls: any[];
  transport: any[];
}

const Sidebar: React.FC = () => {
  const { locations_geodata, selectedLocation } = useMap();
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (selectedLocation) {
        setIsLoading(true);
        try {
          const response = await fetch(`/search?location_name=${selectedLocation}`);
          const data = await response.json();
          setLocationDetails(data);
        } catch (error) {
          console.error('Error fetching location details:', error);
        }
        setIsLoading(false);
      }
    };

    fetchLocationDetails();
  }, [selectedLocation]);

  if (!selectedLocation) {
    return (
      <div className="w-96 bg-white p-4 shadow-lg overflow-y-auto">
        <h2>Select a Location</h2>
        <p>Click on a location on the map to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-96 bg-white p-4 shadow-lg overflow-y-auto">
        Loading location details...
      </div>
    );
  }

  return (
    <div className="w-96 bg-white p-4 shadow-lg overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">{selectedLocation}</h2>
      
      <section className="mb-4">
        <h3 className="font-semibold">Crime Rate</h3>
        <p>{locationDetails?.crime_rate}%</p>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Schools</h3>
        <p>{locationDetails?.schools.length} schools nearby</p>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Malls</h3>
        <p>{locationDetails?.malls.length} malls nearby</p>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Transport</h3>
        <p>{locationDetails?.transport.length} transport stations nearby</p>
      </section>

      <section>
        <h3 className="font-semibold">Past Resale Prices</h3>
        {locationDetails?.price.map((priceData, index) => (
          <div key={index} className="mb-2">
            <p>{priceData.address}: ${priceData.price}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Sidebar;