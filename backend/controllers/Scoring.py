import Locations, Preferences

from operator import itemgetter

class ScoringController:
    def __init__(self, importance_rank):
        """
        Upon registering, take importance rank and set it as attribute of scoring class. 
        """
        self.importance_rank = importance_rank
        self.weights = [1, 0.75, 0.5, 0.25] 


    @staticmethod
    def assign_score_n_rank_all_locations(locations, category='price', importance_rank=['price', 'crime', 'transport', 'schools', 'malls']):
        """
        Used for filter by category 
        Assigns a category score to a list of locations, re orders list of locations based on score.
        If the category is 'score', user is registered and top5 locations is returned instead.
        Else, user is not registered.

        Args: Category used for filter, default is price
        Return: If unregistered, All locations ranked by category score. If registered, top 5 locations ranked by score.

        Assumptions: Assumes an importance rank of ['price', 'crime', 'transport', 'schools', 'malls']
        Chosen category assumes rank 1, followed by rest in the same order as above. 
        """

        scored_and_ranked_locations = {}

        # # Alter list of importance rank, make the categroy rank 1
        # if category != 'score':
        #     importance_rank.remove(category)
        #     importance_rank.insert(0, category)

        # Score for each location for each category is independent of other factors. I.e. if filtering by crime rate, the score shown will be purely ranked by crime rate.
        # Only for scoring by user's preference will the importance rank be taken into consideration.
        match category:

            # case 'crime':
            #     return sorted(locations, key=itemgetter('crime_rate'), reverse=True)

            # case 'schools':
            #     return sorted(locations, key=itemgetter('schools'), reverse=True)

            # case 'malls':
            #     return sorted(locations, key=itemgetter('malls'), reverse=True)

            # case 'transport':
            #     return sorted(locations, key=itemgetter('transport'), reverse=True)

            # Return top 5 locations, scored by user's importance rank
            case 'score':
                ranked_by_pref = []
                
            
                for location in locations:
                    total_score = 0

                    # Importance weight: 1, 0.8, 0.6, 0.4, 0.2
                    for idx in range(len(importance_rank)):
                        total_score += location.get(importance_rank[idx]) * (1 - 0.25 * idx) 
                        
                    ranked_by_pref.append((location, total_score))

                # Sort in descending order based on score
                ranked_by_pref.sort(reverse=True, key=lambda x: x[1])
                            

                # return top 5 locations
                return ranked_by_pref[:5]

            # Default all other categories
            case _:
                reranked_list =  sorted(locations, key=itemgetter(category), reverse=True)
                return ScoringController.calculate_score(ranked_locations=reranked_list, category=category)

        return scored_and_ranked_locations
    
    # Category score for each district is calculated by dividing the current location score vs the highest location score.
    def calculate_score_for_categories(ranked_locations: list, category: str):
        highest = ranked_locations[0].get(category)

        return [(location, round(location.get(category, 0) / highest, 1)) if highest != 0 else (location, 0) 
            for location in ranked_locations]
    



# import Locations, Preferences
# from operator import itemgetter

# class ScoringController:
#     """
#     A class for scoring and ranking locations based on various criteria.
#     Refactored to be stateless.
#     """
    
#     @staticmethod
#     def assign_score_n_rank_all_locations(locations, category='price', importance_rank=['price', 'crime', 'transport', 'schools', 'malls']):
#         """
#         Used for filter by category 
#         Assigns a category score to a list of locations, re orders list of locations based on score.
#         If the category is 'score', user is registered and top5 locations is returned instead.
#         Else, user is not registered.

#         Args: 
#             locations: List of location dictionaries
#             category: Category used for filter, default is price
#             importance_rank: User's preference ranking of categories
#         Return: 
#             If unregistered, All locations ranked by category score. 
#             If registered, top 5 locations ranked by score.
#         """
#         scored_and_ranked_locations = {}

#         # Score for each location for each category is independent of other factors.
#         # Only for scoring by user's preference will the importance rank be taken into consideration.
#         match category:
#             # Return top 5 locations, scored by user's importance rank
#             case 'score':
#                 # Calculate weighted scores for each location
#                 ranked_by_pref = []
                
#                 # Standard weights for importance ranking
#                 weights = [1, 0.75, 0.5, 0.25, 0]
                
#                 for location in locations:
#                     total_score = 0
                    
#                     # Apply weights based on importance ranking
#                     for idx, category in enumerate(importance_rank):
#                         # Use the appropriate weight based on ranking position
#                         weight = weights[idx] if idx < len(weights) else 0
#                         total_score += location.get(category, 0) * weight
                        
#                     ranked_by_pref.append((location, total_score))

#                 # Sort in descending order based on score
#                 ranked_by_pref.sort(reverse=True, key=lambda x: x[1])
                            
#                 # Return top 5 locations
#                 return ranked_by_pref[:5]

#             # Default all other categories
#             case _:
#                 reranked_list = sorted(locations, key=itemgetter(category), reverse=True)
#                 return ScoringController.calculate_score(ranked_locations=reranked_list, category=category)

#         return scored_and_ranked_locations
    
#     @staticmethod
#     def calculate_score(ranked_locations: list, category: str):
#         """
#         Category score for each district is calculated by dividing the current location score 
#         vs the highest location score.
        
#         Args:
#             ranked_locations: List of location dictionaries, already sorted
#             category: The category being scored
#         Returns:
#             List of tuples containing (location, normalized_score)
#         """
#         if not ranked_locations:
#             return []
            
#         highest = ranked_locations[0].get(category, 0)

#         return [(location, round(location.get(category, 0) / highest, 1)) if highest != 0 else (location, 0) 
#             for location in ranked_locations]