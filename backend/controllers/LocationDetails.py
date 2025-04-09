from api import fetch_crimes, fetch_districts, fetch_malls, fetch_resale, fetch_schools, fetch_transport
from controllers import Locations, Scoring
import os
import sqlite3

class LocationsDetailController:
    """
    On call, function gets location details from multiple caches
    Eliminates the need for a specific LocationsDetailsDB

    """
    @staticmethod
    def get_db_path(db_name=':memory:'):
        """Returns the database path based on the provided name"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)
    
    @staticmethod
    def initialise_db(db_name='app.db'):
        """
        Populates locations table in app.db
        """

        db_path = LocationsDetailController.get_db_path(db_name)

        # Save location_name
        fetch_districts.save_location_name_to_db(db_path=db_path)

        # Save location coordinates
        fetch_districts.save_location_coords_to_db(db_path=db_path)

        # Save location resale prices
        fetch_resale._migrate_csv_to_db()

        # Save location crime news
        fetch_crimes.save_crimes_to_db(db_path=db_path)

    @staticmethod
    def levenshtein_distance(s1: str, s2: str) -> int:
        """
        Calculate the Levenshtein (edit) distance between two strings.
        This indicates how many single-character edits are needed to change one string to another.
        
        Args:
            s1: First string
            s2: Second string
            
        Returns:
            The edit distance between s1 and s2
        """
        if len(s1) < len(s2):
            return LocationsDetailController.levenshtein_distance(s2, s1)
        
        if not s2:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    @staticmethod
    def get_best_location_match(query: str, locations: list) -> str:
        """
        Find the best matching location name from a partial search query
        
        Args:
            query: The search query string
            locations: List of valid location names
        
        Returns:
            The best matching location name or None if no match found
        """
        query = query.lower().strip()
        
        # Case 1: Direct match (case insensitive)
        for location in locations:
            if location.lower() == query:
                return location
        
        # Case 2: Starts with match
        starts_with_matches = [loc for loc in locations if loc.lower().startswith(query)]
        if starts_with_matches:
            # Return the shortest match as it's likely the most relevant
            return min(starts_with_matches, key=len)
        
        # Case 3: Contains match
        contains_matches = [loc for loc in locations if query in loc.lower()]
        if contains_matches:
            # Return the shortest match as it's likely the most relevant
            return min(contains_matches, key=len)
        
        # Case 4: Fuzzy match using levenshtein distance
        if len(query) >= 3:  # Only apply fuzzy matching for queries of at least 3 chars
            best_match = None
            best_score = float('inf')
            
            for location in locations:
                # Simple levenshtein distance calculation
                distance = levenshtein_distance(query, location.lower())
                
                # Normalize by dividing by the longer string length to get a score between 0-1
                score = distance / max(len(query), len(location))
                
                # If score is better than current best and below threshold (0.4 is 60% similar)
                if score < best_score and score < 0.4:
                    best_score = score
                    best_match = location
            
            if best_match:
                return best_match
        
        return None
    


    @staticmethod
    def get_location_details(location_name: str) -> dict:
        """
        SQL Query for DB data for single location details

        Args: Unique Location Name
        Return: Dict containing location details
        
        """

        location = Locations.LocationsController.get_location(location_name=location_name)

        # Get Location Details
        past_resale_prices = fetch_resale.get_all_transactions_by_location(location_name=location_name)

        # Get crimes and crime_rate
        crimes = fetch_crimes.fetch_all_crimes_by_location(location=location_name)
        crime_rate = location.get('crime_rate', 0.00)

        # Get nums schools /and distance to nearest schools
        schools = fetch_schools.get_all_schools_by_district(location_name=location_name)

        # Get num malls /and distance to nearest malls
        malls = fetch_malls.get_all_malls_by_location(location_name=location_name)

        # Get num transport /and distance to nearest transport
        transport = fetch_transport.get_all_stations_by_location(location_name=location_name)

        # # Score Location according to preferences
        # all_locations = Locations.LocationsController.get_locations()

        # # If no category, default to price, if cat="score", user preferences will be pulled from DB through Preference Controller
        # all_location_scored = Scoring.ScoringController.assign_score_n_rank_all_locations(all_locations, category='price')
        # for location, score in all_location_scored:
        #     if location.get('name') == location_name:
        #         location_score = score
        #         break

        return {
            'location_name': location_name,
            'price': past_resale_prices,
            'crime': crimes,
            'crime_rate': crime_rate,
            'schools': schools,
            'malls': malls,
            'transport': transport,
            # 'score': 1, 
        }
    
    @staticmethod
    def get_location_coordinates(location_name: str, db_name='app.db') -> list:
        """
        SQL Query for DB data for single location

        Return: 1 Dict of location or None if not found, key=location_name, value=coordinates.
        """
        return fetch_districts.get_location_geodata(location_name=location_name)