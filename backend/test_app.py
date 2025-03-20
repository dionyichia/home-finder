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

def test_sort_endpoint(client):
    """Test the sorting endpoint"""
    # Test with a valid sorting category
    response = client.get('/sort?sort_by=price')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    
    # Test with missing sorting category
    response = client.get('/sort')
    assert response.status_code == 400

# def test_register_endpoint(client):
#     """Test the registration endpoint"""
#     # Prepare test data
#     test_user = {
#         "username": "testuser",
#         "user_email": "test@example.com",
#         "password": "password123",
#         "price": 500000,
#         "crime_rate": 2,
#         "schools": 3,
#         "malls": 2,
#         "transport": 4,
#         "importance_rank": ["price", "crime_rate", "schools", "malls", "transport"]
#     }
    
#     # Test successful registration
#     response = client.post('/register', 
#                            data=json.dumps(test_user),
#                            content_type='application/json')
#     print(json.loads(response.data))
#     assert response.status_code == 201
    
#     # Test duplicate registration
#     response = client.post('/register', 
#             data=json.dumps(test_user),
#             content_type='application/json')
    
#     print(json.loads(response.data))
#     assert response.status_code == 409

    # Test successful updating of user information
    # response = client.post('/register', 
    #         data=json.dumps(test_user),
    #         content_type='application/json')

    # print(json.loads(response.data))
    # assert response.status_code == 409

    # Test successful removing of user
    # response = client.post('/register', 
    #         data=json.dumps(test_user),
    #         content_type='application/json')

    # print(json.loads(response.data))
    # assert response.status_code == 409

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