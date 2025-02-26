from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import controllers

app = Flask(__name__)
CORS(app)
"""
App.py only handles handle HTTP logic, aligns with Single Responsibiltiy Principle
"""

# Fetch user preferences from the database
@app.route('/preferences', methods=['GET'])
def get_preferences():
    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM preferences")
    data = cursor.fetchall()
    conn.close()

    return jsonify({"preferences": data})

# Add a new user preference
@app.route('/preferences', methods=['POST'])
def add_preference():
    data = request.get_json()
    user = data['user']
    location = data['location']
    max_price = data['max_price']

    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO preferences (user, location, max_price) VALUES (?, ?, ?)", 
                   (user, location, max_price))
    conn.commit()
    conn.close()

    return jsonify({"message": "Preference added successfully!"})

# Route to get and display map information
@app.route('/map', methods=['GET'])
def get_locations():
    # Get data sent in request
    filter_param = request.args.get('filter', default=None)

    # Create a new Map instance for each request (stateless approach)
    map_instance = controllers.Map(filter_param)

    # Get and return the locations data
    map_data = map_instance.display_locations()

    # Return mapbox compatible GeoJSON to plot overlay on map
    return jsonify(map_data)

# Route to get location information to display on search, view and explore
@app.route('/search', methods=['GET'])
def get_locations():
    
    return jsonify(controllers.LocationsDetailController.get_location_details())



if __name__ == '__main__':
    app.run(debug=True)