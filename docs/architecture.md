# Architecture & System Design

## 1. System Overview

**Pavilion 360** is an enterprise-grade real-estate web application and secure administrative CMS built with a decoupled modern architecture:

```
+-------------------------------------------------------------------------+
|                               INTERNET                                  |
+-------------------------------------------------------------------------+
                                    |
                                    v
                     +-----------------------------+
                     |        NGINX PROXY          |
                     |   SSL, Gzip, Headers, Cache |
                     +-----------------------------+
                        /                       \
                       /                         \
                      v                           v
        +---------------------------+   +---------------------------+
        |     NEXT.JS FRONTEND      |   |      FASTAPI BACKEND      |
        |   SSR, SEO, React 18      |   |   Clean Architecture REST |
        |   Tailwind, TypeScript    |   |   SQLAlchemy 2, Pydantic  |
        +---------------------------+   +---------------------------+
                                                      |
                             +------------------------+------------------------+
                             |                                                 |
                             v                                                 v
              +-----------------------------+                   +-----------------------------+
              |       MYSQL 8.0 RDBMS       |                   |       REDIS 7 CACHE         |
              |   Normalized Schemas, WAL   |                   |  Sliding Window Rate Limit  |
              |   Foreign Keys & Indexes    |                   |   Project & Location Cache  |
              +-----------------------------+                   +-----------------------------+
```

---

## 2. Backend Clean Architecture

The backend follows Clean Architecture principles:

- **Core Layer (`app/core/`)**: Configuration via `pydantic-settings`, SQLAlchemy engine/session creation, Redis client with in-memory fallback, structured logging with correlation IDs, and security utilities.
- **Data Models (`app/models/`)**: Normalized SQLAlchemy ORM declarative models with foreign keys, indexes, and relationship cascades.
- **Schemas (`app/schemas/`)**: Pydantic v2 schemas providing strict input validation and response serialization.
- **Service Layer (`app/services/`)**: Encapsulates business logic, including authentication lockout, token rotation, project slug generation, image optimization (Pillow / WebP), YouTube ID parsing, and CSV exporting.
- **API Router Layer (`app/api/v1/`)**: Pure route dispatchers that delegate business logic to services and enforce declarative authorization via FastAPI dependencies.
- **Middleware Layer (`app/middleware/`)**:
  - `CorrelationIdMiddleware`: End-to-end request tracing (`X-Correlation-ID`).
  - `SecurityHeadersMiddleware`: Production HTTP headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
  - `rate_limiter.py`: Sliding window rate limiter backed by Redis.

---

## 3. Database Schema

The database contains 22 normalized entities:

1. `users`: Administrative staff, password hashes, lockout tracking.
2. `roles`: RBAC roles (`super_admin`, `admin`, `content_manager`, `project_manager`, `editor`, `viewer`).
3. `permissions`: Granular permission nodes (e.g. `projects.create`, `leads.view`).
4. `role_permissions`: Association table mapping roles to permissions.
5. `refresh_tokens`: SHA-256 hashed refresh tokens for session tracking and rotation.
6. `login_history`: Tamper-evident authentication attempts, IP addresses, user agents.
7. `countries`: Country definitions with currencies and phone codes.
8. `states`: Hierarchical state/province records linked to countries.
9. `cities`: Municipalities linked to states, with slug and featured status.
10. `localities`: Granular neighborhoods and sectors linked to cities.
11. `property_types`: Classification taxonomy (Apartments, Penthouses, Villas, Commercial, Plots).
12. `amenities`: Global lifestyle amenities with categories and icons.
13. `projects`: Master real estate listings with pricing, specifications, and SEO metadata.
14. `project_configurations`: Unit breakdown (1 BHK, 2 BHK, 3 BHK, Villa, Penthouse) with area, price, and floor plans.
15. `project_amenities`: Many-to-many relationship mapping amenities to projects.
16. `project_media`: Gallery images, thumbnails, WebP variants, dimensions, and cover status.
17. `project_videos`: YouTube embeds (with auto-extracted video IDs) and custom video URLs.
18. `project_documents`: Brochures, floor plans, and legal approvals.
19. `enquiries`: Prospective buyer leads with contact info, preferred BHK, budget, UTM tracking, and status.
20. `enquiry_notes`: Internal CRM follow-up timeline notes.
21. `audit_logs`: Activity trail capturing user actions, affected entities, and metadata.
22. `website_settings`: Dynamic CMS settings (site name, phone, email, RERA disclaimer).

---

## 4. Redis Caching & Invalidation Strategy

- **Read Caching**:
  - Listing queries: `projects:list:{hash}` (TTL: 300s)
  - Project detail: `project:{slug}` (TTL: 600s)
  - Hierarchical locations: `locations:countries`, `locations:cities` (TTL: 1800s)
- **Automatic Invalidation**:
  - When an admin creates, updates, deletes, publishes, or duplicates a project, `delete_cache_pattern("projects:*")` and `delete_cache(f"project:{slug}")` are executed immediately.
  - Changes to locations or amenities purge `locations:*` keys.
- **Graceful Fallback**: If Redis is offline, the cache layer degrades transparently to in-memory caching without throwing exceptions or interrupting traffic.
