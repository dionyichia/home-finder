import api
import Locations, Plotter, Scoring

class LocationsDetailController:
    """
    On call, function gets location details from multiple caches
    Eliminates the need for a specific LocationsDetailsDB

    """

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
        past_resale_prices = location

        # Get Price Trend Graph
        price = Plotter.PricePlotterClass.plot_price_trend(past_resale_prices)

        # Get crimes and crime_rate
        crimes = api.fetch_crimes.fetch_all_crimes_by_location(location=location_name)
        crime_rate = location.get('crime_rate', 0.00)

        # Get nums schools /and distance to nearest schools
        schools = location.get('schools', 0)
        # api.fetch_district.fetch_all_schools_by_location() , havent do

        # Get malls /and distance to nearest schools
        malls = location.get('malls', 0)

        # Score Location according to preferences
        all_locations = Locations.LocationsController.get_locations()

        # Check if user has registered !!!! If no default to price, if yes change to score

        all_location_scored = Scoring.ScoringController.assign_score_n_rank_all_locations(all_locations, category='score')
        for location, score in all_location_scored:
            if location.get('name') == location_name:
                location_score = score
                break

        return {
            'price': price,
            'crime': crimes,
            'crime_rate': crime_rate,
            'schools': schools,
            'malls': malls,
            'score': location_score,
        }