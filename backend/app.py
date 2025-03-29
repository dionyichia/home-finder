from controllers import Locations, LocationDetails, User, Notifications, Preferences, Favorites
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)
"""
App.py only handles handle HTTP logic, aligns with Single Responsibiltiy Principle
"""

# Explore route to get map geodata information
@app.route('/get_all_coords', methods=['GET'])
def get_all_coords():
    """
    Return: Jsonified List of list of dicts, {location name: their geodata}
    """
    locations = Locations.LocationsController.get_all_locations_geojson()

    # Return list of locations
    return jsonify(locations)

# Route to get and display all location information
@app.route('/sort', methods=['GET'])
def get_all_locations():
    """
    Return: Jsonified List of list of tuples, (ranked location, their score), location is a dict of location, each db coloumn headder is a key.
    """
    # Get data sent in request
    sorting_category = request.args.get('sort_by', default=None)

    if not sorting_category:
        return jsonify({"message": "Missing sorting category!"}), 400

    if sorting_category not in ["price", "crime_rate", "num_schools", "num_malls", "num_transport", "score"]:
        return jsonify({"message": "Unknown sorting category!"}), 400

    ranked_locations = Locations.LocationsController.sort_by_category(sorting_category=sorting_category)

    # Return list of ranked locations
    return jsonify(ranked_locations)

# Route to get a location's information to display on search, view and explore
@app.route('/search', methods=['GET'])
def search_for_location():
    """
    Return: Jsonified Dict with location details
    """
    location_name = request.args.get('location_name', default=None)

    if not location_name:
        return jsonify({"message": "Missing location name!"}), 400
    
    print("Searching for:", location_name.strip())

    return jsonify(LocationDetails.LocationsDetailController.get_location_details(location_name=location_name.strip()))

# Register Route
@app.route('/register', methods=['POST'])
def register():
    """
    Return: Okay if registered
    """
    data = request.get_json()
    username = data.get('username', '')
    user_email = data.get('user_email', '')
    password = data.get('password', '')

    preferences = {
        'price': data.get('price', ''),
        'crime_rate': data.get('crime_rate',''),
        'schools': data.get('schools',''),
        'malls': data.get('malls',''),
        'transport': data.get('transport',''),
        'importance_rank': data.get('importance_rank', ''),
    }

    for value in preferences.values():
        if not value:
            return jsonify({"message": "Missing required preference field(s)!"}), 400

    if username and user_email and password:
        if User.UserController.check_if_user_does_not_exist(username=username, email=user_email):
            User.UserController.create_new_user(username=username, email=user_email, password=password, preferences=preferences)
        
            return jsonify({"message": "User registered successfully!"}), 201
        else:
            return jsonify({"message": "User already exists!"}), 409
    else:
        return jsonify({"message": "Missing required fields!"}), 400
    
# Update user details
# Fix the verify_user route to return user_id
@app.route('/verify_user', methods=['POST'])  # Changed to POST for sending credentials
def verify_user():
    """
    Return: User ID if verified
    """
    data = request.get_json()
    username = data['username']
    user_email = data['user_email']
    password = data['password']

    user_id = User.UserController.verify_user(username=username, email=user_email, password=password)

    if user_id:
        return jsonify({"message": "Verified User!", "user_id": user_id}), 200
    else:
        return jsonify({"message": "Unverified User!"}), 401

# Fix the update_user_details route
@app.route('/update_user_info', methods=['POST'])
def update_user_info():
    """
    Return: Okay if updated
    """
    data = request.get_json()
    user_id = data['user_id']  # Get user_id directly instead of verifying again
    
    new_username = data['new_username']
    new_user_email = data['new_user_email']
    new_password = data['new_password']

    preferences = {
        'price': data['price'],
        'crime_rate': data['crime_rate'],  # Fixed to match the expected key
        'schools': data['schools'],
        'malls': data['malls'],
        'transport': data['transport'],
        'importance_rank': data['importance_rank'],
    }

    result = User.UserController.change_user_details(
        user_id=user_id, 
        new_username=new_username, 
        new_user_email=new_user_email,  # Fixed parameter name
        new_password=new_password,  # Fixed parameter name
        preferences=preferences
    )
    
    if result:
        return jsonify({"message": "User details changed successfully!"}), 200
    else:
        return jsonify({"message": "Failed to update user details!"}), 400


# Remove user 
@app.route('/remove_user', methods=['POST'])
def remove_user():
    data = request.get_json()
    username = data['username']
    user_email = data['user_email']
    password = data['password']
    
    user_id = User.UserController.verify_user(username=username, email=user_email, password=password)
    
    if user_id:
        # First remove user's related data (preferences, favorites, notifications)
        # This assumes you'll add a delete_user method to UserController
        result = User.UserController.delete_user(user_id)
        if result:
            return jsonify({"message": "User deleted successfully!"}), 200
        else:
            return jsonify({"message": "Error deleting user!"}), 500
    else:
        return jsonify({"message": "User verification failed!"}), 401
    
@app.route('/get_user_profile', methods=['GET'])
def get_user_profile():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID is required!"}), 400
    
    # Get user details
    user_details = User.UserController.get_user_login_details(user_id)
    if not user_details:
        return jsonify({"message": "User not found!"}), 404
    
    # Get user preferences 
    preferences = Preferences.PreferenceController.get_user_preferences(user_id)
    
    # Get user favorites count
    favorites_count = Favorites.FavoritesController.count_user_favourites(user_id)
    
    # Get user notifications count
    notifications = Notifications.NotificationsController.get_user_notifications(user_id)
    notifications_count = len(notifications) if notifications else 0
    
    response = {
        "user": user_details,
        "preferences": preferences,
        "favorites_count": favorites_count,
        "notifications_count": notifications_count
    }
    
    return jsonify(response), 200
    
# Get user favorites route
@app.route('/get_user_favourites', methods=['GET'])
def get_user_favourites():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID is required!"}), 400
    
    favorites = Favorites.FavoritesController.get_favourites(user_id)
    
    if favorites:
        return jsonify({"favorites": favorites}), 200
    else:
        return jsonify({"message": "No favorites found or error occurred!"}), 404

@app.route('/add_to_favourites', methods=['POST'])
def add_to_favourites():
    data = request.get_json()
    user_id = data['user_id']
    location_name = data['location_name']
    
    result = Favorites.FavoritesController.add_to_favorites(user_id, location_name)
    
    if result:
        return jsonify({"message": "Location added to favorites!"}), 201
    else:
        return jsonify({"message": "Failed to add to favorites!"}), 400

@app.route('/remove_from_favourites', methods=['POST'])
def remove_from_favourites():
    data = request.get_json()
    user_id = data['user_id']
    location_name = data['location_name']
    
    result = Favorites.FavoritesController.remove_from_favourites(user_id, location_name)
    
    if result:
        return jsonify({"message": "Location removed from favorites!"}), 200
    else:
        return jsonify({"message": "Failed to remove from favorites!"}), 400

# Notification routes
@app.route('/enable_notification', methods=['POST'])
def enable_notification():
    data = request.get_json()
    user_id = data['user_id']
    location_name = data['location_name']
    
    result = Notifications.NotificationsController.enable_notification(user_id, location_name)
    
    if result:
        return jsonify({"message": "Notifications enabled for location!"}), 200
    else:
        return jsonify({"message": "Failed to enable notifications!"}), 400

@app.route('/disable_notification', methods=['POST'])
def disable_notification():
    data = request.get_json()
    user_id = data['user_id']
    location_name = data['location_name']
    
    result = Notifications.NotificationsController.disable_notification(user_id, location_name)
    
    if result:
        return jsonify({"message": "Notifications disabled for location!"}), 200
    else:
        return jsonify({"message": "Failed to disable notifications!"}), 400

@app.route('/get_user_notifications', methods=['GET'])
def get_user_notifications():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID is required!"}), 400
    
    notifications = Notifications.NotificationsController.get_user_notifications(user_id)
    
    if notifications:
        return jsonify({"notifications": notifications}), 200
    else:
        return jsonify({"message": "No enabled notifications found!"}), 404

@app.route('/send_notifications', methods=['POST'])
def send_notifications():
    data = request.get_json()
    location_name = data['location_name']
    notification_type = data['notification_type']
    
    notified_users = Notifications.NotificationsController.send_notification(location_name, notification_type)
    
    if notified_users:
        return jsonify({
            "message": f"Notifications sent for {location_name}",
            "notified_users": len(notified_users)
        }), 200
    else:
        return jsonify({"message": "No users to notify or error occurred!"}), 404

if __name__ == '__main__':
    app.run(debug=True)
    