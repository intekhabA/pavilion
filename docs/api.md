# REST API Reference & Documentation

Interactive OpenAPI / Swagger documentation is available at `http://localhost:8000/docs`.

## 1. Standard Response Envelope

All API endpoints return JSON conforming to standard envelope structures:

### Success Response (HTTP 200/201)
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": { ... },
  "error_code": null
}
```

### Error Response (HTTP 4xx/5xx)
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "error_code": "INVALID_CREDENTIALS",
  "data": null
}
```

---

## 2. Public API Endpoints

### Projects
- `GET /api/v1/projects`: Search and filter projects with pagination (`page`, `page_size`, `q`, `city_id`, `property_type_id`, `bhk`, `min_price`, `max_price`, `sort_by`).
- `GET /api/v1/projects/featured`: Retrieve featured projects for homepage carousel.
- `GET /api/v1/projects/{slug}`: Retrieve complete project details by SEO slug.
- `GET /api/v1/projects/{slug}/similar`: Get recommended similar developments.

### Locations & Taxonomies
- `GET /api/v1/locations/countries`: List active countries.
- `GET /api/v1/locations/states?country_id={id}`: List states by country.
- `GET /api/v1/locations/cities?state_id={id}&featured_only=true`: List cities.
- `GET /api/v1/locations/localities?city_id={id}`: List localities.
- `GET /api/v1/locations/amenities`: List all lifestyle amenities.
- `GET /api/v1/locations/property-types`: List property categories.

### Lead Capture
- `POST /api/v1/enquiries`: Public submission endpoint.
  ```json
  {
    "name": "Rajesh Singhania",
    "email": "rajesh@corporate.com",
    "phone": "+91-9876543210",
    "country": "India",
    "project_id": 1,
    "preferred_bhk": "4 BHK",
    "budget_range": "₹ 20 Cr - 35 Cr",
    "message": "Requesting private site visit.",
    "honeypot": ""
  }
  ```

---

## 3. Authentication & Sessions

- `POST /api/v1/auth/login`: Authenticate with email and password. Returns `access_token` (60m) and `refresh_token` (14d).
- `POST /api/v1/auth/refresh`: Rotate refresh token and issue new token pair.
- `POST /api/v1/auth/logout`: Revoke active refresh token.
- `POST /api/v1/auth/logout-all`: Invalidate all active sessions across all devices for the current user.
- `GET /api/v1/auth/me`: Retrieve current profile, assigned role, and permissions.
- `POST /api/v1/auth/change-password`: Change password with strength validation.

---

## 4. Admin CMS Endpoints (Protected by RBAC)

All endpoints require `Authorization: Bearer <access_token>`.

### Projects
- `GET /api/v1/admin/projects`: List projects including drafts and archived listings.
- `GET /api/v1/admin/projects/{id}`: Detailed project information by ID.
- `POST /api/v1/admin/projects`: Create new project.
- `PUT /api/v1/admin/projects/{id}`: Update project details.
- `DELETE /api/v1/admin/projects/{id}`: Delete project.
- `POST /api/v1/admin/projects/{id}/publish`: Publish project live.
- `POST /api/v1/admin/projects/{id}/unpublish`: Revert project to draft.
- `POST /api/v1/admin/projects/{id}/duplicate`: Clone project as a draft copy.
- `POST /api/v1/admin/projects/{id}/media`: Multipart upload of images.
- `DELETE /api/v1/admin/projects/media/{media_id}`: Delete image.
- `POST /api/v1/admin/projects/{id}/videos`: Add YouTube or custom video walkthrough.
- `POST /api/v1/admin/projects/{id}/documents`: Upload official brochure or floor plan.
- `POST /api/v1/admin/projects/{id}/configurations`: Add BHK configuration layout.

### Leads CRM
- `GET /api/v1/admin/enquiries`: List enquiries with status, project, and keyword filters.
- `PUT /api/v1/admin/enquiries/{id}/status`: Update lead status (`New`, `Contacted`, `Qualified`, `Follow-up`, `Converted`, `Closed`, `Spam`).
- `PUT /api/v1/admin/enquiries/{id}/assign`: Assign lead to team member.
- `POST /api/v1/admin/enquiries/{id}/notes`: Add timeline note.
- `GET /api/v1/admin/enquiries/export/csv`: Export filtered enquiries to CSV.

### Analytics & System
- `GET /api/v1/admin/dashboard/stats`: Complete analytics counters, charts, recent activities.
- `GET /api/v1/admin/audit-logs`: Query tamper-evident audit records.
- `GET /api/v1/admin/users`: User management and role assignment.
- `GET /api/v1/admin/settings`: Manage global CMS website settings.
