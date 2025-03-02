import { useState, useEffect } from 'react';
import { api } from '../api'; // Import the API client

export default function compare() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(null);
    
    const handleSearch = async () => {
      try {
        const data = await api.searchLocation(searchTerm);
        setResults(data);
      } catch (error) {
        console.error('Error searching:', error);
      }
    };

    return <>Hoi</>
}

// Above is an example of how to use the api.tsx to pull info from the backend