def test_create_project_and_rbac(client, admin_token, viewer_token):
    payload = {
        "name": "Luxury Test Residences",
        "developer_name": "Marquis Developers",
        "project_type": "Residential",
        "country_id": 1,
        "state_id": 1,
        "city_id": 1,
        "status": "draft",
        "min_price": 15000000.0,
        "max_price": 30000000.0,
        "price_label": "₹ 1.5 Cr - 3.0 Cr",
        "area_from": 1800.0,
        "area_to": 3200.0,
        "bedrooms_summary": "3, 4 BHK",
        "rera_number": "RERA-TEST-001",
    }

    # 1. Viewer cannot create project (RBAC check)
    forbidden_res = client.post(
        "/api/v1/admin/projects",
        json=payload,
        headers={"Authorization": f"Bearer {viewer_token}"},
    )
    assert forbidden_res.status_code == 403

    # 2. Admin creates project
    create_res = client.post(
        "/api/v1/admin/projects",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert create_res.status_code == 200
    project_data = create_res.json()["data"]
    project_id = project_data["id"]
    slug = project_data["slug"]
    assert project_data["name"] == "Luxury Test Residences"
    assert project_data["status"] == "draft"

    # 3. Draft project should not appear in public listing
    public_list = client.get("/api/v1/projects")
    slugs = [p["slug"] for p in public_list.json()["data"]["items"]]
    assert slug not in slugs

    # 4. Publish project
    pub_res = client.post(
        f"/api/v1/admin/projects/{project_id}/publish",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert pub_res.status_code == 200

    # 5. Published project now appears in public listing
    public_list_after = client.get("/api/v1/projects")
    slugs_after = [p["slug"] for p in public_list_after.json()["data"]["items"]]
    assert slug in slugs_after

    # 6. Retrieve single project detail by slug
    detail_res = client.get(f"/api/v1/projects/{slug}")
    assert detail_res.status_code == 200
    assert detail_res.json()["data"]["name"] == "Luxury Test Residences"

    # 7. Duplicate project
    dup_res = client.post(
        f"/api/v1/admin/projects/{project_id}/duplicate",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert dup_res.status_code == 200
    dup_data = dup_res.json()["data"]
    assert dup_data["status"] == "draft"
    assert "Copy" in dup_data["name"]

    # 8. Delete project
    del_res = client.delete(
        f"/api/v1/admin/projects/{project_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_res.status_code == 200
