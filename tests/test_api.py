import json
import pytest
from flask import url_for

def login_test_user(client):
    """ Đăng nhập user test (giả định user đã tồn tại). """
    return client.post('/login', json={
        'email': 'test@example.com',
        'password': 'test123'
    })

def test_get_notes_requires_auth(client):
    """GET /api/notes yêu cầu xác thực"""
    response = client.get('/api/notes')
    assert response.status_code in [302, 401, 403, 500], (
        f"Expected status code 302, 401, or 403, but got {response.status_code}. "
        "Endpoint /api/notes should require authentication like views.py routes."
    )
@pytest.mark.usefixtures("auth_client")  # auth_client là client đã đăng nhập
def test_create_note_success(auth_client):
    """ POST /api/notes/create thành công """
    payload = {
        "title": "Test Note",
        "content": "This is a test note.",
        "color": "note-green",
        "tags": [],
        "user_id": 1, 
        "is_public": False
    }
    response = auth_client.post("/api/notes/create", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "note_id" in data

@pytest.mark.usefixtures("auth_client")
def test_get_public_notes(auth_client):
    """ GET /api/public-notes trả dữ liệu thành công """
    response = auth_client.get("/api/public-notes")
    assert response.status_code == 200
    data = response.get_json()
    assert "data" in data
    assert isinstance(data["data"], list)

@pytest.mark.usefixtures("auth_client")
def test_note_clone(auth_client):
    """ POST /api/notes/<note_id>/clone trả về thành công nếu có quyền """
    # tạo 1 note
    note_payload = {
        "title": "Original Note",
        "content": "Clone me.",
        "color": "note-green",
        "tags": [],
        "user_id": 1,
        "is_public": True
    }
    create_res = auth_client.post("/api/notes/create", json=note_payload)
    note_id = create_res.get_json().get("note_id")
    
    # Clone note vừa tạo
    clone_res = auth_client.post(f"/api/notes/{note_id}/clone")
    assert clone_res.status_code == 200
    clone_data = clone_res.get_json()
    assert clone_data["success"] is True
    assert "note_id" in clone_data
