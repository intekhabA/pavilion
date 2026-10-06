def test_enquiry_submission_and_crm(client, admin_token):
    # 1. Public user submits enquiry
    payload = {
        "name": "Jane Buyer",
        "email": "jane.buyer@example.com",
        "phone": "+91-9988776655",
        "message": "Interested in scheduling a site visit.",
        "preferred_bhk": "3 BHK",
        "budget_range": "₹ 2 Cr - 3 Cr",
    }
    submit_res = client.post("/api/v1/enquiries", json=payload)
    assert submit_res.status_code == 200
    assert submit_res.json()["success"] is True

    # 2. Bot fills honeypot field -> blocked
    spam_payload = payload.copy()
    spam_payload["honeypot"] = "I am a bot"
    spam_res = client.post("/api/v1/enquiries", json=spam_payload)
    assert spam_res.status_code == 422 or spam_res.status_code == 400

    # 3. Admin fetches enquiries list
    list_res = client.get(
        "/api/v1/admin/enquiries",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert list_res.status_code == 200
    items = list_res.json()["data"]["items"]
    enquiry = next((e for e in items if e["email"] == "jane.buyer@example.com"), None)
    assert enquiry is not None
    enquiry_id = enquiry["id"]
    assert enquiry["status"] == "New"

    # 4. Admin updates lead status to "Contacted"
    status_res = client.put(
        f"/api/v1/admin/enquiries/{enquiry_id}/status",
        json={"status": "Contacted"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["data"]["status"] == "Contacted"

    # 5. Admin adds a note to the lead
    note_res = client.post(
        f"/api/v1/admin/enquiries/{enquiry_id}/notes",
        json={"note": "Called the buyer. Agreed to visit Saturday 11am."},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert note_res.status_code == 200
    assert "Saturday" in note_res.json()["data"]["note"]

    # 6. Admin exports CSV
    csv_res = client.get(
        "/api/v1/admin/enquiries/export/csv",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "jane.buyer@example.com" in csv_res.text
