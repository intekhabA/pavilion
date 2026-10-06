def test_security_headers(client):
    response = client.get("/health")
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "SAMEORIGIN"
    assert "Content-Security-Policy" in response.headers
    assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"


def test_sql_injection_defense(client):
    # Injection payload in search query
    sql_injection = "' OR '1'='1' --"
    response = client.get(f"/api/v1/projects?q={sql_injection}")
    assert response.status_code == 200
    # Must not crash or return unescaped dump


def test_invalid_jwt_token(client):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.token"},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "TOKEN_INVALID"


def test_unauthenticated_admin_access(client):
    # Admin endpoints must reject unauthenticated requests
    endpoints = [
        "/api/v1/admin/dashboard/stats",
        "/api/v1/admin/projects",
        "/api/v1/admin/enquiries",
        "/api/v1/admin/users",
        "/api/v1/admin/audit-logs",
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 401
