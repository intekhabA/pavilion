def test_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testadmin@pavilionrealty.com",
        "password": "SuperSecret@123!",
    })
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "access_token" in json_data["data"]
    assert "refresh_token" in json_data["data"]
    assert json_data["data"]["user"]["email"] == "testadmin@pavilionrealty.com"


def test_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testadmin@pavilionrealty.com",
        "password": "WrongPassword123!",
    })
    assert response.status_code == 401
    assert response.json()["error_code"] == "INVALID_CREDENTIALS"


def test_refresh_token_rotation(client):
    # 1. Login to get token pair
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testadmin@pavilionrealty.com",
        "password": "SuperSecret@123!",
    })
    refresh_token = login_res.json()["data"]["refresh_token"]

    # 2. Use refresh token
    refresh_res = client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()["data"]
    new_refresh_token = new_data["refresh_token"]
    assert new_refresh_token != refresh_token

    # 3. Old refresh token reuse must be rejected (Token Rotation)
    reuse_res = client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert reuse_res.status_code == 401


def test_get_current_user_profile(client, admin_token):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["email"] == "testadmin@pavilionrealty.com"
    assert data["data"]["role"]["slug"] == "super_admin"


def test_logout(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testadmin@pavilionrealty.com",
        "password": "SuperSecret@123!",
    })
    refresh_token = login_res.json()["data"]["refresh_token"]

    logout_res = client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logout_res.status_code == 200

    # Refresh after logout must fail
    refresh_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 401
