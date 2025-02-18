import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { useEffect, useState } from "react";

import { MapProvider } from './contexts/MapContext';

// Overall Wrapper for all pages and routes
function App() {
  
  const [count, setCount] = useState(0);
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/preferences")
      .then(response => response.json())
      .then(data => setPreferences(data.preferences));
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card flex flex-col nowrap">
          <div>
            <h4 className=''>User Preferences</h4>
            <ul>
              {preferences.map((pref, index) => (
                <li key={index}>{pref[1]} - {pref[2]} (${pref[3]})</li>
              ))}
            </ul>
          </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
