from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)