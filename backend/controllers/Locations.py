import api
import api.fetch_crimes

class Locations:
    def __init__(self):
        pass

    def get_locations():
        pass

    def sortByPrice():
        pass

    @staticmethod
    def sort_by_crime():
        """
        Return: List of all locations ranked by crime rate
        """


        pass

    def sortBySchools():
        pass

    def sortByMalls():
        pass

    def sortByScore():
        pass


class LocationsDetailController:
    """
    
    """
    def __init__(self):
        """
        Composition relationship for PricePlotter
        """
        self.price = None
        self.crime = None
        self.crime_rate = None
        self.schools = None
        self.malls = None
        self.score = None
        pass

    def get_location_details(self, location_name: str) -> dict:
        """
        Args: Unique Location Name
        Return: Dict containing location details
        
        """

        # Get Location Details

        past_resale_prices = [(0,0)]

        # Get Price Trend Graph
        self.price = PricePlotterClass.plot_price_trend(past_resale_prices)

        # Get crimes and crime_rate from LocationDetails table
        self.crime_rate = api.fetch_crimes.fetch_all_crimes_by_location(location=location_name)

        # Get schools from LocationDetails table

        # Get malls from LocationDetails table

        # Score Location according to preferences

        pass

class PricePlotterClass:
    def __init__(self):
        pass

    @staticmethod
    def plot_price_trend(past_resale_prices):
        """
        Plot the price trend of resale prices for a given location.
        Args: Takes in past resale prices, plot graph of time vs price for ave 3 room flat
        Returns: 
        """
        pass

