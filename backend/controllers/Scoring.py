from controllers import Locations, Preferences
from operator import itemgetter

class ScoringController:
    """
    A class for scoring and ranking locations based on various criteria.
    Refactored to be stateless.
    """
    
    @staticmethod
    def assign_score_n_rank_all_locations(locations: list, category='price', user_id=None):
        """
        Used for filter by category 
        Assigns a category score to a list of locations, re orders list of locations based on score.
        If the category is 'score', user is registered and top5 locations is returned instead.
        Else, user is not registered.

        Args: 
            locations: List of location dictionaries
            preferences: User preferences
            category: Category used for filter, default is price
        Return: 
            If unregistered, All locations ranked by category score. 
            If registered, top 5 locations ranked by score.
        """
        # Score for each location for each category is independent of other factors.
        # Only for scoring by user's preference will the importance rank be taken into consideration.
        match category:
            # Return top 5 locations, scored by user's importance rank
            case 'score':
                # If not registered, flag error
                if not user_id:
                    return Exception

                # Get UserID
                preferences = Preferences.PreferenceController.get_user_preferences(user_id)

                return ScoringController.calculate_score_for_preferences(locations=locations, preferences=preferences)

            # Default all other categories
            case _:
                # Rank list by highest to lowest for all categories
                reranked_list = sorted(locations, key=itemgetter(category), reverse=True)
                # for loc in reranked_list:
                #     print(loc.get("location_name"))

                normalised = ScoringController.normalise_score_for_categories(ranked_locations=reranked_list, category=category)

                # Sort the normalized list by score (second element of each tuple) in descending order
                sorted_by_score = sorted(normalised, key=lambda x: x[1], reverse=True)

                # print(f"sorted_by_score for category {category}")
                # for loc in sorted_by_score:
                #     print(loc[0].get("location_name"), loc[1])

                return sorted_by_score
    
    @staticmethod
    def normalise_score_for_categories(ranked_locations: list, category: str):
        """
        Category score for each district is calculated by dividing the current location score 
        vs the highest location score.
        
        Args:
            ranked_locations: List of location dictionaries, already sorted
            category: The category being scored
        Returns:
            List of tuples containing (location, normalized_score)
        """
        if not ranked_locations:
            return []
        
        # for price and crime rate, the lower the better
        if category == 'price' or category == 'crime_rate':
            # Create a list of valid values (non-zero)
            valid_values = [loc.get(category, 0) for loc in ranked_locations 
                            if loc.get(category, 0) > 0]
            
            # If no valid values found, return 0 scores for all
            if not valid_values:
                return [(location, 0) for location in ranked_locations]
            
            lowest = min(valid_values)
            
            # Handle zero values to avoid division by zero
            result = []
            for location in reversed(ranked_locations):
                current_value = location.get(category, 0)
                
                # If value is zero, assign a score of 0 for price (no HDB)
                # For crime_rate with value 0, assign the best score (1.0) 
                if current_value == 0:
                    if category == 'price':
                        result.append((location, 0))  # No HDB gets worst score
                    else:  # crime_rate == 0
                        result.append((location, 1.0))  # Zero crime gets best score
                else:
                    # Normal calculation for non-zero values
                    result.append((location, round(lowest / current_value, 1)))
                    
            return result
            
        # for num schools, malls, transport, the higher the better
        else:
            highest = ranked_locations[0].get(category, 0)
            
            if highest == 0:
                return [(location, 0) for location in ranked_locations]
                
            return [(location, round(location.get(category, 0) / highest, 1)) 
                    for location in ranked_locations]
    @staticmethod
    def calculate_score_for_preferences(locations: list, preferences: dict):
        """
        Calculates weighted scores for locations based on user preferences.
        
        Args:
            locations: List of location dictionaries
            preferences: Dictionary containing user preferences including:
                - importance_rank: List of categories ranked by importance
                - price: Ideal price
                - other category preferences
        
        Returns:
            List of top 5 locations with their scores, sorted by final score
        """
        # Calculate weights based on importance ranking
        weights = {}
        number_of_categories = len(preferences['importance_rank'])
        for cat_importance_idx in range(number_of_categories):
            category = preferences['importance_rank'][cat_importance_idx]
            weights[category] = number_of_categories - cat_importance_idx
        
        total_weight = sum(weights.values())
        
        # Find min/max values for normalization
        min_max_values = {
            'price': {'min': float('inf'), 'max': 0},
            'crime_rate': {'min': float('inf'), 'max': 0},
            'schools': {'min': float('inf'), 'max': 0},
            'malls': {'min': float('inf'), 'max': 0},
            'transport': {'min': float('inf'), 'max': 0}
        }
        
        for location in locations:
            for category in min_max_values.keys():
                if category in location:
                    min_max_values[category]['min'] = min(min_max_values[category]['min'], location[category])
                    min_max_values[category]['max'] = max(min_max_values[category]['max'], location[category])
        
        scored_locations = []
        for location in locations:
            # Calculate individual category scores
            category_scores = {}
            
            # Special handling for price (proximity to ideal price)
            if 'price' in location and 'price' in preferences:
                ideal_price = preferences['price']
                actual_price = location['price']
                # Calculate proximity score (10 = perfect match, 0 = very far)
                price_diff_percentage = abs(actual_price - ideal_price) / ideal_price if ideal_price > 0 else 1
                # Cap at 100% difference
                price_diff_percentage = min(price_diff_percentage, 1)
                category_scores['price'] = 10 * (1 - price_diff_percentage)
            else:
                category_scores['price'] = 0
            
            # Normalize crime_rate (lower is better)
            if 'crime_rate' in location:
                min_val = min_max_values['crime_rate']['min']
                max_val = min_max_values['crime_rate']['max']
                if max_val > min_val:
                    normalized = (max_val - location['crime_rate']) / (max_val - min_val)
                    category_scores['crime_rate'] = normalized * 10
                else:
                    category_scores['crime_rate'] = 10
            else:
                category_scores['crime_rate'] = 0
            
            # Normalize other attributes (higher is better)
            for category in ['schools', 'malls', 'transport']:
                if category in location:
                    min_val = min_max_values[category]['min']
                    max_val = min_max_values[category]['max']
                    if max_val > min_val:
                        normalized = (location[category] - min_val) / (max_val - min_val)
                        category_scores[category] = normalized * 10
                    else:
                        category_scores[category] = 10 if location[category] > 0 else 0
                else:
                    category_scores[category] = 0
            
            # Calculate final weighted score
            weighted_score = 0
            for category, score in category_scores.items():
                if category in weights:
                    weighted_score += score * weights[category]
            
            # Normalize final score
            final_score = weighted_score / total_weight if total_weight > 0 else 0
            
            # Create result object with all relevant data
            result = location.copy()  # Copy all original location data
            result['score'] = round(final_score, 2)
            result['category_scores'] = {k: round(v, 2) for k, v in category_scores.items()}
            
            scored_locations.append(result)
        
        # Sort by score (highest first) and return top 5
        return sorted(scored_locations, key=lambda x: x['score'], reverse=True)[:5]