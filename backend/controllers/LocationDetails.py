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
    def get_location_details(location_name: str) -> dict:
        """
        SQL Query for DB data for single location details

        Args: Unique Location Name
        Return: Dict containing location details
        
        """

        """"""
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
            'price': past_resale_prices,
            'crime': crimes,
            'crime_rate': crime_rate,
            'schools': schools,
            'malls': malls,
            'transport': transport,
            # 'score': 1, # There is a problem with scoring.
        }
    
    @staticmethod
    def get_location_coordinates(location_name: str, db_name='app.db') -> list:
        """
        SQL Query for DB data for single location

        Return: 1 Dict of location or None if not found, key=location_name, value=coordinates.
        """
        return fetch_districts.get_location_geodata(location_name=location_name)