import { useState } from "react"; // Importing the useState hook from React to manage component state.
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"; // Importing a magnifying glass icon for the search button.

const SearchBar = () => {
  // Declaring a state variable 'query' to hold the user's search input.
  const [query, setQuery] = useState("");
  // Declaring a state variable 'locationDetails' to hold the search results.
  const [locationDetails, setLocationDetails] = useState(null);
  // Declaring a state variable 'loading' to indicate whether the search is in progress.
  const [loading, setLoading] = useState(false);
  // Declaring a state variable 'error' to hold any error messages during the search.
  const [error, setError] = useState("");

  // Function to handle the search operation when called.
  const handleSearch = async () => {
    // Check if the query is empty or just whitespace, and return early if so.
    if (!query.trim()) return;

    // Set loading to true to indicate the search has started.
    setLoading(true);
    // Clear any previous error messages.
    setError("");
    try {
      // Fetching search results from the API using the user's input.
      const response = await fetch(`http://127.0.0.1:5000/search?location_name=${encodeURIComponent(query)}`);
      // Parsing the response data as JSON.
      const data = await response.json();

      // If the response is successful, update the locationDetails state with the data.
      if (response.ok) {
        setLocationDetails(data);
      } else {
        // If there was an error, set the error state with the message from the response.
        setError(data.message || "Location not found.");
      }
    } catch (err) {
      // Log any errors that occur during the fetch request.
      console.error("Search error:", err);
      // Set a generic error message if something goes wrong.
      setError("Something went wrong while searching.");
    } finally {
      // Set loading to false to indicate the search has completed.
      setLoading(false);
    }
  };

  // Function to handle key down events in the input field.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If the Enter key is pressed, trigger the search function.
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // The component's return statement renders the JSX for the search bar.
  return (
    <div className="flex flex-col gap-2"> {/* Container for the search bar elements with flexbox layout. */}
      <div className="relative"> {/* Relative positioning for the input and button. */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search For Location"
        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
        <button
          onClick={handleSearch} // Call handleSearch when the button is clicked.
          className="absolute right-2 top-2 text-gray-500 hover:text-purple-600" // Styling for the search button.
        >
          <MagnifyingGlassIcon className="w-5 h-5" /> {/* Icon displayed inside the button. */}
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>} {/* Show loading text when searching. */}
      {error && <p className="text-sm text-red-500">{error}</p>} {/* Show error message if there's an error. */}

      {locationDetails && (
        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm"> {/* Container for displaying search results. */}
          <pre>{JSON.stringify(locationDetails, null, 2)}</pre> {/* Display the location details in a formatted way. */}
        </div>
      )}
    </div>
  );
};

export default SearchBar; // Exporting the SearchBar component for use in other parts of the application.