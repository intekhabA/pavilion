# PAVILION REALTY

### Complete Production-Ready Full-Stack Real Estate Platform & Secure Admin CMS

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red)](https://www.sqlalchemy.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-red?logo=redis)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

Pavilion Realty is a full-stack, enterprise-grade real estate marketing portal and administrative Content Management System (CMS). Built with design and UX inspiration from premier property consultancy portals (such as *investorsclinic.in*), Pavilion Realty features an original luxury architectural aesthetic, institutional due diligence standards, and a complete administrative control panel.

---

## 🌟 Key Features

### 1. Public-Facing Portal
- **High-Impact Hero Section**: Multi-faceted filter interface (City, Property Category, BHK Bedrooms, Investment Budget) with trust metrics.
- **Featured Luxury Developments**: Handpicked properties from Tier-1 developers (DLF, Godrej, Oberoi, Sobha) with RERA verification badges.
- **Advanced Property Search (`/projects`)**: Server-side filtering, keyword matching, sorting (Price, Date, Name), and pagination.
- **Ultra-Detailed Project Pages (`/projects/[slug]`)**:
  - Image gallery with interactive preview
  - Price brackets and configuration facts
  - Floor plans & BHK tabs (1/2/3/4 BHK, Villa, Penthouse) with area and price
  - World-class amenities grid with icons
  - YouTube property walkthrough player (with automatic video ID extractor)
  - Verified project documents & brochure download
  - Sticky consultation lead form (desktop sidebar + mobile bottom action bar)
  - Similar developments recommendation engine
  - Schema.org JSON-LD `RealEstateListing` structured data
- **Locations Directory (`/locations`)**: Hierarchical exploration of key markets (Gurgaon, Noida, Mumbai, Bengaluru, Dubai).

### 2. Secure Administrative CMS (`/admin`)
- **Executive Analytics Dashboard**: Real-time project counts, monthly buyer lead acquisition trends, inventory distribution by city, and system health status.
- **9-Tab Project Management CMS**:
  1. *Basic Info*: Name, slug, developer, status, descriptions.
  2. *Location*: Country → State → City → Locality hierarchy.
  3. *Pricing & Specs*: Price range, area units, RERA ID, and dynamic BHK configuration builder.
  4. *Amenities*: Interactive multi-selector of lifestyle features.
  5. *Media Gallery*: Drag-and-drop image uploads, WebP optimization, primary cover selector.
  6. *Video*: YouTube URL validator and custom video support.
  7. *Documents*: Official brochures, master plans, and floor plans.
  8. *SEO*: Meta title, description, canonical URL, and real-time Google SERP preview.
  9. *Publish*: Instant status switcher (Draft, Published, Archived).
- **Leads & Inquiries CRM**: Lead status pipeline (`New`, `Contacted`, `Qualified`, `Follow-up`, `Converted`, `Closed`, `Spam`), follow-up notes timeline, and one-click CSV export.
- **Hierarchical Location Manager**: CRUD for Countries, States, Cities, and Localities.
- **Amenities & Category Manager**: Lifestyle amenities and property taxonomy builder.
- **RBAC & User Management**: Admin staff accounts with granular permissions (`projects.create`, `leads.view`, `settings.manage`, etc.).
- **Security & Activity Audit Logs**: Tamper-evident logging of administrative actions, logins, and IP addresses.
- **Corporate CMS Settings**: Site branding, direct hotlines, and mandatory RERA disclaimers.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyMySQL, Cryptography, Pillow |
| **Database** | MySQL 8.0 (Normalized schema, indexed queries, foreign key cascades) |
| **Caching** | Redis 7 (Listing and detail caching, automatic invalidation on CRUD, sliding window rate limits) |
| **Security** | Argon2/bcrypt password hashing, JWT with refresh token rotation, CORS restrictions, CSP headers, honeypot anti-spam |
| **Reverse Proxy** | Nginx (Gzip compression, static media proxy, SSL termination readiness) |
| **Containerization** | Docker, Docker Compose (Multi-stage builds, internal network isolation) |

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+ (Node 20+ recommended)
- MySQL 8.0 & Redis (or use Docker)

### 1. Clone & Configure
```bash
git clone <repo-url> pavilion
cd pavilion
cp .env.example .env
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed sample luxury inventory
export DATABASE_URL="sqlite:///./realestate.db"  # or configure your MySQL connection
alembic upgrade head
python ../scripts/seed.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Website will be available at: `http://localhost:3000`  
Admin CMS will be available at: `http://localhost:3000/admin`

---

## 🔑 Default Seed Admin Credentials

Upon running `scripts/seed.py`, the following Super Admin user is created:

- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@pavilionrealty.com`
- **Password**: `Admin@Pavilion2025!`
- **Role**: `Super Admin` (full unrestricted permissions)

*(You can customize these in `.env` before running the seeder)*

---

## 🧪 Automated Testing

### Backend Test Suite (Pytest)
Run the automated test suite covering authentication, token rotation, RBAC, project lifecycle, CRM leads, spam protection, and security headers:
```bash
cd backend
venv/bin/pytest tests/ -v
```

### Frontend Build Verification
Verify type safety, linting, and Next.js static page generation:
```bash
cd frontend
npm run build
```

---

## 🐳 Docker / Podman Deployment

To launch the complete containerized stack (Next.js, FastAPI, MySQL, Redis, and Nginx):

```bash
# 1. Build and start containers
docker-compose up -d --build

# 2. Seed initial luxury real estate projects, roles, and super admin
docker-compose exec -T backend python seed.py
```

Access the application:
- **Public Portal**: `http://localhost:8080` (or `http://localhost` if `NGINX_PORT=80` is configured)
- **Admin Panel**: `http://localhost:8080/admin`
- **API Health**: `http://localhost:8080/health`
- **Swagger Documentation**: `http://localhost:8080/docs` (or direct backend: `http://localhost:8000/docs`)

---

## 📦 Project Structure

```
pavilion/
├── backend/                    # FastAPI Clean Architecture REST API
│   ├── app/
│   │   ├── api/                # API routes (v1 public and admin)
│   │   ├── core/               # Configuration, security, database, redis, logging
│   │   ├── middleware/         # Rate limiting, security headers, correlation IDs
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── services/           # Business logic, image processing, CRM, caching
│   │   └── main.py             # FastAPI app factory
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Automated pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # Next.js 14 App Router Frontend
│   ├── app/
│   │   ├── admin/              # Secure Admin Panel & CMS Pages
│   │   ├── projects/           # Listing & [slug] property detail pages
│   │   ├── locations/          # Cities directory
│   │   ├── about/, contact/    # Corporate pages
│   │   ├── sitemap.xml, robots.txt
│   │   ├── layout.tsx, page.tsx
│   ├── components/             # Reusable UI components (Hero, Navbar, Footer, Cards)
│   ├── services/               # Centralized Axios API client with token rotation
│   ├── types/                  # TypeScript interface definitions
│   ├── utils/                  # Currency and date formatting utilities
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                      # Nginx reverse proxy configuration
│   └── nginx.conf
├── scripts/                    # Maintenance & automation scripts
│   ├── seed.py                 # Comprehensive luxury property seeder
│   ├── backup.sh               # MySQL backup with retention policy
│   └── restore.sh              # MySQL restore utility
├── docs/                       # Architecture, API, deployment & security docs
├── docker-compose.yml          # Local container orchestration
├── docker-compose.production.yml # Hardened production orchestration
├── .env.example
└── README.md
```

---

## 🛡 Security Checklist Verified

- [x] No hardcoded passwords or API secrets in source code
- [x] Passwords securely hashed with bcrypt / Argon2
- [x] JWT access tokens with strict refresh token rotation
- [x] Server-side RBAC validation on all administrative routes
- [x] Redis-backed sliding window rate limiting
- [x] Anti-bot honeypot protection on public inquiry forms
- [x] Sanitized image processing with WebP optimization via Pillow
- [x] Production HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [x] MySQL and Redis isolated inside internal container network
- [x] Tamper-evident audit logging for sensitive operations

---

## 📄 License
Proprietary & Confidential. Designed for Pavilion Realty Advisory.
