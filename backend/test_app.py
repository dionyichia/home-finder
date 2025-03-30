import pytest
import json
from app import app

"""
This script is for testing the rest api endpoints
"""

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def create_test_user(client):
    """Create a test user for sorting by score tests"""
    test_user = {
        "username": "sortuser",
        "user_email": "sort@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    
    # Register the test user
    response = client.post('/register', 
                         data=json.dumps(test_user),
                         content_type='application/json')
    
    # Get the user_id from the response
    if response.status_code == 201:
        user_data = json.loads(response.data)
        return user_data.get('user_id')
    
    # If user already exists, try to get their ID
    elif response.status_code == 409:
        # You might need to implement a login endpoint or a way to fetch existing user ID
        # For this example, we'll just return a hardcoded ID that we expect to exist
        return 1
    
    return None

def test_sort_endpoint(client, create_test_user):
    """Test the sorting endpoint"""
    user_id = create_test_user
    assert user_id is not None, "Failed to create or retrieve test user"
    
    print("Test with valid sorting categories =======")
    
    # Test each category individually with the correct URL for each
    for cat in ["price", "crime_rate", "num_schools", "num_malls", "num_transport"]:
        print(f"Sorting for category {cat}")
        response = client.get(f'/sort?sort_by={cat}')
        assert response.status_code == 200
        data = json.loads(response.data)
        print(data[:3] if len(data) >= 3 else data)
        print("\n")
        assert isinstance(data, list)
        # Verify the data is sorted correctly (higher values first for these categories)
        if len(data) >= 2:
            assert data[0][1] >= data[1][1], f"Results for {cat} are not properly sorted"
    
    # Test specifically for the 'score' category with user_id
    print("Sorting for category score")
    response = client.get(f'/sort?sort_by=score&user_id={user_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    print(data[:3] if len(data) >= 3 else data)
    print("\n")
    assert isinstance(data, list)
    # Verify the data is sorted by score (higher values first)
    if len(data) >= 2:
        assert data[0][1] >= data[1][1], "Results for score are not properly sorted"
    
    # Test score sorting without user_id (should fail)
    response = client.get('/sort?sort_by=score')
    assert response.status_code == 400
    
    # Test with missing sorting category
    response = client.get('/sort')
    assert response.status_code == 400
    
    # Test with invalid sorting category
    response = client.get('/sort?sort_by=invalid_category')
    assert response.status_code == 400

def test_search_endpoint(client):
    """Test the search endpoint"""
    # Test with a valid sorting category
    response = client.get('/search?location_name=Ang Mo Kio')
    assert response.status_code == 200
    data = json.loads(response.data)
    for key in data.keys():
        print(f"Showing first 5 results for {key}: ")
        if type(data[key]) == list and len((data[key])) > 5:
            print(data[key][:5])
        else:
            print(data[key])

    assert isinstance(data, dict)
    
    # Test with missing sorting category
    response = client.get('/search')
    assert response.status_code == 400

def test_register_endpoint(client):
    """Test the registration endpoint"""
    # Prepare test data
    test_user = {
        "username": "testuser",
        "user_email": "test@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    
    # Test successful registration
    response = client.post('/register', 
                         data=json.dumps(test_user),
                         content_type='application/json')
    print(json.loads(response.data))
    assert response.status_code == 201
    
    # Test duplicate registration
    response = client.post('/register', 
                         data=json.dumps(test_user),
                         content_type='application/json')
    print(json.loads(response.data))
    assert response.status_code == 409
    
    # Test missing required fields
    incomplete_user = {
        "username": "testuser2",
        "user_email": "test2@example.com"
        # Missing password and preferences
    }
    response = client.post('/register',
                         data=json.dumps(incomplete_user),
                         content_type='application/json')
    assert response.status_code == 400

def test_verify_user_endpoint(client):
    """Test the user verification endpoint"""
    # Register a test user first
    test_user = {
        "username": "verifyuser",
        "user_email": "verify@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    client.post('/register', 
               data=json.dumps(test_user),
               content_type='application/json')
    
    # Test successful verification
    credentials = {
        "username": "verifyuser",
        "user_email": "verify@example.com",
        "password": "password123"
    }
    response = client.post('/verify_user',
                         data=json.dumps(credentials),
                         content_type='application/json')
    data = json.loads(response.data)
    assert response.status_code == 200
    assert "user_id" in data
    
    # Test failed verification
    wrong_credentials = {
        "username": "verifyuser",
        "user_email": "verify@example.com",
        "password": "wrongpassword"
    }
    response = client.post('/verify_user',
                         data=json.dumps(wrong_credentials),
                         content_type='application/json')
    assert response.status_code == 401

def test_update_user_info_endpoint(client):
    """Test updating user information"""
    # Register and verify a test user first
    test_user = {
        "username": "updateuser",
        "user_email": "update@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    client.post('/register', 
               data=json.dumps(test_user),
               content_type='application/json')
    
    # Verify user to get user_id
    credentials = {
        "username": "updateuser",
        "user_email": "update@example.com",
        "password": "password123"
    }
    response = client.post('/verify_user',
                         data=json.dumps(credentials),
                         content_type='application/json')
    print(response)
    data = json.loads(response.data)
    user_id = data["user_id"]
    
    # Test updating user information
    updated_info = {
        "user_id": user_id,
        "new_username": "updateduser",
        "new_user_email": "updated@example.com",
        "new_password": "newpassword123",
        "price": 600000,
        "crime_rate": 1,
        "schools": 4,
        "malls": 3,
        "transport": 5,
        "importance_rank": ["schools", "crime_rate", "price", "transport", "malls"]
    }
    response = client.post('/update_user_info',
                         data=json.dumps(updated_info),
                         content_type='application/json')
    assert response.status_code == 200
    
    # Test with invalid user_id
    updated_info["user_id"] = "invalid_id"
    response = client.post('/update_user_info',
                         data=json.dumps(updated_info),
                         content_type='application/json')
    assert response.status_code == 400

def test_remove_user_endpoint(client):
    """Test removing a user"""
    # Register a test user first
    test_user = {
        "username": "removeuser",
        "user_email": "remove@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    client.post('/register', 
               data=json.dumps(test_user),
               content_type='application/json')
    
    # Test removing the user
    credentials = {
        "username": "removeuser",
        "user_email": "remove@example.com",
        "password": "password123"
    }
    response = client.post('/remove_user',
                         data=json.dumps(credentials),
                         content_type='application/json')
    assert response.status_code == 200
    
    # Test that the user can no longer be verified
    response = client.post('/verify_user',
                         data=json.dumps(credentials),
                         content_type='application/json')
    assert response.status_code == 401

def test_user_profile_endpoint(client):
    """Test getting user profile"""
    # Register a test user first
    test_user = {
        "username": "profileuser",
        "user_email": "profile@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    client.post('/register', 
               data=json.dumps(test_user),
               content_type='application/json')
    
    # Verify user to get user_id
    credentials = {
        "username": "profileuser",
        "user_email": "profile@example.com",
        "password": "password123"
    }
    response = client.post('/verify_user',
                         data=json.dumps(credentials),
                         content_type='application/json')
    data = json.loads(response.data)
    user_id = data["user_id"]
    
    # Test getting user profile
    response = client.get('/get_user_profile',
                        data=json.dumps({"user_id": user_id}),
                        content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "user" in data
    assert "preferences" in data
    assert "favorites_count" in data
    assert "notifications_count" in data
    
    # Test with invalid user_id
    response = client.get('/get_user_profile',
                        data=json.dumps({"user_id": "invalid_id"}),
                        content_type='application/json')
    assert response.status_code == 404

def test_favorites_endpoints(client):
    """Test favorites-related endpoints"""
    # Register a test user first
    test_user = {
        "username": "favoritesuser",
        "user_email": "favorites@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    client.post('/register', 
               data=json.dumps(test_user),
               content_type='application/json')
    
    # Verify user to get user_id
    credentials = {
        "username": "favoritesuser",
        "user_email": "favorites@example.com",
        "password": "password123"
    }
    response = client.post('/verify_user',
                         data=json.dumps(credentials),
                         content_type='application/json')
    data = json.loads(response.data)
    user_id = data["user_id"]
    
    # Test adding a location to favorites
    favorite_data = {
        "user_id": user_id,
        "location_name": "Ang Mo Kio"
    }
    response = client.post('/add_to_favourites',
                         data=json.dumps(favorite_data),
                         content_type='application/json')
    assert response.status_code == 201
    
    # Test getting user favorites
    response = client.get('/get_user_favourites',
                        data=json.dumps({"user_id": user_id}),
                        content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "favorites" in data
    
    # Test removing a location from favorites
    response = client.post('/remove_from_favourites',
                         data=json.dumps(favorite_data),
                         content_type='application/json')
    assert response.status_code == 200
    
    # Verify the favorites list is now empty
    response = client.get('/get_user_favourites',
                        data=json.dumps({"user_id": user_id}),
                        content_type='application/json')
    assert response.status_code == 404

def test_notification_endpoints(client):
    """Test notification-related endpoints"""
    # Register a test user first
    test_user = {
        "username": "notificationuser",
        "user_email": "notification@example.com",
        "password": "password123",
        "price": 500000,
        "crime_rate": 2,
        "schools": 3,
        "malls": 2,
        "transport": 4,
        "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
    }
    client.post('/register', 
               data=json.dumps(test_user),
               content_type='application/json')
    
    # Verify user to get user_id
    credentials = {
        "username": "notificationuser",
        "user_email": "notification@example.com",
        "password": "password123"
    }
    response = client.post('/verify_user',
                         data=json.dumps(credentials),
                         content_type='application/json')
    data = json.loads(response.data)
    user_id = data["user_id"]
    
    # Test enabling notifications for a location
    notification_data = {
        "user_id": user_id,
        "location_name": "Ang Mo Kio"
    }
    response = client.post('/enable_notification',
                         data=json.dumps(notification_data),
                         content_type='application/json')
    assert response.status_code == 200
    
    # Test getting user notifications
    response = client.get('/get_user_notifications',
                        data=json.dumps({"user_id": user_id}),
                        content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "notifications" in data
    
    # Test sending notifications
    notification_send_data = {
        "location_name": "Ang Mo Kio",
        "notification_type": "price"
    }
    response = client.post('/send_notifications',
                         data=json.dumps(notification_send_data),
                         content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "notified_users" in data
    
    # Test disabling notifications
    response = client.post('/disable_notification',
                         data=json.dumps(notification_data),
                         content_type='application/json')
    assert response.status_code == 200
    
    # Verify no notifications are enabled
    response = client.get('/get_user_notifications',
                        data=json.dumps({"user_id": user_id}),
                        content_type='application/json')
    assert response.status_code == 404

def test_search_endpoint(client):
    """Test the search endpoint"""
    # Test with a valid location name
    response = client.get('/search?location_name=Ang Mo Kio')
    assert response.status_code == 200
    data = json.loads(response.data)
    for key in data.keys():
        print(f"Showing first 5 results for {key}: ")
        if type(data[key]) == list and len((data[key])) > 5:
            print(data[key][:5])
        else:
            print(data[key])
    
    assert isinstance(data, dict)
        
    # Test with missing location name
    response = client.get('/search')
    assert response.status_code == 400