from api import fetch_districts, fetch_crimes, fetch_malls, fetch_resale, fetch_schools, fetch_transport
from controllers import Preferences, Scoring
import os
import sqlite3

class LocationsController:

    @staticmethod
    def get_db_path(db_name=':memory:'):
        """Returns the database path based on the provided name"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)
    
    @staticmethod
    def initialise_db(db_name='app.db'):
        """
        Populates locations table in app.db
        """
        db_path = LocationsController.get_db_path(db_name)

        # Save location_name
        fetch_districts.save_location_name_to_db(db_path=db_path)

        # Save crime_rate
        fetch_crimes.save_crime_rate_to_db(db_path=db_path)

        # Save num_schools
        fetch_schools.save_num_schools_to_db(db_path=db_path)

        # Save transport
        fetch_transport.save_num_stations_to_db(db_path=db_path)

        # Save location resale_prices
        fetch_resale.save_resale_price_to_db(db_path=db_path)


    @staticmethod
    def get_locations(db_name='app.db'):
        """
        SQL Query for DB data for all locations

        Return: List of dicts, each location 1 dict
        """
        db_path = LocationsController.get_db_path(db_name)

        try:
            all_location_details = []
            # Establish a database connection
            with sqlite3.connect(db_path) as conn:
                # Set row_factory to get dictionaries instead of tuples
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                # Query to get all locations
                query = "SELECT * FROM locations"
                cursor.execute(query)
                
                # Fetch all results and convert to dictionaries
                rows = cursor.fetchall()
                
                if rows:
                    for row in rows:
                        # Convert each sqlite3.Row to a dictionary
                        location_details = dict(row)

                        all_location_details.append(location_details)
                
                    return all_location_details

                else:
                    return []
                
        except Exception as e:
            print(f"Error occurred: {e}")
            return []

    @staticmethod
    def get_location(location_name, db_name='app.db'):
        """
        SQL Query for DB data for single location

        Return: 1 dict of location or None if not found
        """
        db_path = LocationsController.get_db_path(db_name)

        try:
            # Establish a database connection
            with sqlite3.connect(db_path) as conn:
                # Set row_factory to get dictionary instead of tuple
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                # Query to get location by name
                query = "SELECT * FROM locations WHERE location_name = ?"
                cursor.execute(query, (location_name,))
                
                # Fetch the result
                result = cursor.fetchone()

                if result:
                    # Convert sqlite3.Row to dictionary
                    return dict(result)
                else:
                    return None

        except Exception as e:
            print(f"Error occurred: {e}")
            return None
        
    def get_all_locations_geojson():
        """
        Return: List of dicts, each location 1 dict
        """
        return fetch_districts.get_all_locations_geodata()


    @staticmethod
    def sort_by_category(sorting_category, user_id=None):
        """
        Return: A list of tuples, (ranked location, their score)
        """

        locations = LocationsController.get_locations()

        if sorting_category == 'score':
            return Scoring.ScoringController.assign_score_n_rank_all_locations(locations=locations, category='score', user_id=user_id)
            
        else:
            return Scoring.ScoringController.assign_score_n_rank_all_locations(locations=locations, category=sorting_category)
            

    def summarised_details(location: str, sorting_category='price'):
        """
        WHEN WILL U EVER NEED THIS??

        Get the summarised details of the location.
        Sumarised details include: 
        1. Category Rank
        2. Category score, i.e. if Price score
        3. Average price of housing

        Return: A dict, (top 5 locations, their score) 
        """
        pass

if __name__ == "__main__":
    for cat in ["price", "crime_rate", "num_schools", "num_malls", "num_transport", "score"]:
        print(cat)
        data = LocationsController.sort_by_category(sorting_category=cat)
        print('\n')