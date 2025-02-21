import Locations

class Map:
    def __init__(self, filter_by: str):
        self.filter = filter_by

    def display_locations(self):
        match self.filter:

            # Swtich infomation on overlay, should be the same overlay for all cases, just adjusted based on cat
            case 'crime':
                Locations.sort_by_crime()
                pass

            case 'schools':
                pass

            case 'malls':
                pass

            case 'score':
                # 
                pass

            # Default Price
            case _:

                pass
            
