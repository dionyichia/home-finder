import controllers.LocationDetails
import controllers.Locations
import controllers.Register
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import controllers

app = Flask(__name__)
CORS(app)
"""
App.py only handles handle HTTP logic, aligns with Single Responsibiltiy Principle
"""

# Explore route

# Route to get and display all location information
@app.route('/sort', methods=['GET'])
def get_all_locations():
    """
    Return: Jsonified List with dicts each containing a location's details
    """
    # Get data sent in request
    sorting_category = request.args.get('sort_by', default=None)

    if not sorting_category:
        return jsonify({"message": "Missing sorting category!"}), 400

    ranked_locations = controllers.Locations.LocationsController.sort_by_category(sorting_category=sorting_category)

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

    return jsonify(controllers.LocationDetails.LocationsDetailController.get_location_details(location_name=location_name))

# Register Route
@app.route('/register', methods=['POST'])
def register():
    """
    Return: Okay if registered
    """
    data = request.get_json()
    username = data['username']
    user_email = data['user_email']
    password = data['password']

    preferences = {
        'price': data['price'],
        'crime_rate': data['crime_rate'],
        'schools': data['schools'],
        'malls': data['malls'],
        'transport': data['transport'],
        'importance_rank': data['importance_rank'],
    }
    if username and user_email and password:
        if controllers.Register.RegisterController.check_if_user_does_not_exist(username=username, email=user_email):
            controllers.Register.RegisterController.register_new_user(username=username, email=user_email, password=password, preferences=preferences)
        
            return jsonify({"message": "User registered successfully!"}), 201
        else:
            return jsonify({"message": "User already exists!"}), 409
    else:
        return jsonify({"message": "Missing required fields!"}), 400
    
# Update user details
    
# Set favourites route

# Set notifications route 



if __name__ == '__main__':
    app.run(debug=True)