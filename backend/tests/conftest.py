import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_realestate.db"
os.environ["APP_ENV"] = "testing"
os.environ["DEBUG"] = "true"
os.environ["REDIS_ENABLED"] = "false"

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.user import User, Role, Permission
from app.models.location import Country, State, City, Locality
from app.models.project import PropertyType, Amenity, Project

TEST_DB_URL = "sqlite:///./test_realestate.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Seed baseline roles and permissions
    db = TestingSessionLocal()
    perm_proj_create = Permission(name="projects.create", module="projects", description="Create project")
    perm_proj_view = Permission(name="projects.view", module="projects", description="View project")
    perm_proj_delete = Permission(name="projects.delete", module="projects", description="Delete project")
    perm_leads_view = Permission(name="leads.view", module="leads", description="View leads")
    perm_leads_update = Permission(name="leads.update", module="leads", description="Update leads")
    perm_dash_view = Permission(name="dashboard.view", module="dashboard", description="View dashboard")
    perm_settings = Permission(name="settings.manage", module="settings", description="Manage settings")

    db.add_all([
        perm_proj_create, perm_proj_view, perm_proj_delete,
        perm_leads_view, perm_leads_update, perm_dash_view, perm_settings
    ])
    db.flush()

    super_role = Role(name="Super Admin", slug="super_admin", is_system=True)
    viewer_role = Role(name="Viewer", slug="viewer", is_system=False, permissions=[perm_dash_view, perm_proj_view])
    db.add_all([super_role, viewer_role])
    db.flush()

    # Create test super admin
    admin = User(
        first_name="Test",
        last_name="Admin",
        email="testadmin@pavilionrealty.com",
        phone="+919876543210",
        password_hash=hash_password("SuperSecret@123!"),
        role_id=super_role.id,
        is_active=True,
        is_verified=True,
    )
    # Create test viewer user
    viewer = User(
        first_name="Test",
        last_name="Viewer",
        email="viewer@pavilionrealty.com",
        phone="+919876543211",
        password_hash=hash_password("SuperSecret@123!"),
        role_id=viewer_role.id,
        is_active=True,
        is_verified=True,
    )
    db.add_all([admin, viewer])

    # Seed test location
    country = Country(name="India", code="IN", currency_code="INR", currency_symbol="₹", phone_code="+91")
    db.add(country)
    db.flush()

    state = State(name="Haryana", code="HR", country_id=country.id)
    db.add(state)
    db.flush()

    city = City(name="Gurgaon", slug="gurgaon", state_id=state.id, is_featured=True)
    db.add(city)
    db.flush()

    pt = PropertyType(name="Luxury Apartment", slug="luxury-apartment", icon="Building")
    db.add(pt)

    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_realestate.db"):
        os.remove("./test_realestate.db")


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testadmin@pavilionrealty.com",
        "password": "SuperSecret@123!",
    })
    data = response.json()
    assert response.status_code == 200
    return data["data"]["access_token"]


@pytest.fixture
def viewer_token(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "viewer@pavilionrealty.com",
        "password": "SuperSecret@123!",
    })
    data = response.json()
    assert response.status_code == 200
    return data["data"]["access_token"]
