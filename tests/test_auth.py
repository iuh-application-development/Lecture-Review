def test_register(client):
    data = {
        'email': 'newuser@example.com',
        'password': 'newpassword',
        'first_name': 'New',
        'last_name': 'User',
        'gender': 'female'
    }
    response = client.post('/register', json=data)
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert 'redirect' in json_data

def test_register_existing_email(client):
    data = {
        'email': 'testuser@example.com',
        'password': 'any',
        'first_name': 'Test',
        'last_name': 'User',
        'gender': 'male'
    }
    response = client.post('/register', json=data)
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is False
    assert 'Email already exists.' in json_data['message']

def test_login_success(client):
    data = {
        'email': 'testuser@example.com',
        'password': 'testpassword'
    }
    response = client.post('/login', json=data)
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is True
    assert 'redirect' in json_data

def test_login_wrong_password(client):
    data = {
        'email': 'testuser@example.com',
        'password': 'wrongpassword'
    }
    response = client.post('/login', json=data)
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is False
    assert 'Incorrect password' in json_data['message']

def test_login_email_not_exist(client):
    data = {
        'email': 'notexist@example.com',
        'password': 'any'
    }
    response = client.post('/login', json=data)
    json_data = response.get_json()
    assert response.status_code == 200
    assert json_data['success'] is False
    assert 'Email does not exists' in json_data['message']

def test_logout(client):
    # Đăng nhập trước
    login_data = {
        'email': 'testuser@example.com',
        'password': 'testpassword'
    }
    client.post('/login', json=login_data)

    response = client.get('/logout', follow_redirects=True)
    assert response.status_code == 200
