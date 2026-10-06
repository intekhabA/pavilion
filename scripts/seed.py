import os
import sys
from datetime import date, datetime, timezone

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User, Role, Permission
from app.models.location import Country, State, City, Locality
from app.models.project import (
    PropertyType,
    Amenity,
    Project,
    ProjectConfiguration,
    ProjectMedia,
    ProjectVideo,
    ProjectDocument,
)
from app.models.enquiry import Enquiry, EnquiryNote
from app.models.setting import WebsiteSetting


def seed_database():
    db = SessionLocal()
    print("Starting database seeding...")

    try:
        # 1. PERMISSIONS
        permissions_data = [
            ("dashboard.view", "dashboard", "View dashboard analytics and metrics"),
            ("users.view", "users", "View admin users and roles"),
            ("users.create", "users", "Create new admin users"),
            ("users.update", "users", "Update existing admin users"),
            ("users.delete", "users", "Delete admin users"),
            ("projects.view", "projects", "View real estate projects"),
            ("projects.create", "projects", "Create new projects"),
            ("projects.update", "projects", "Update existing projects"),
            ("projects.delete", "projects", "Delete projects"),
            ("projects.publish", "projects", "Publish or unpublish projects"),
            ("media.upload", "media", "Upload media, images, and documents"),
            ("media.delete", "media", "Delete media and documents"),
            ("leads.view", "leads", "View incoming enquiries and buyer leads"),
            ("leads.update", "leads", "Update lead status and assign team"),
            ("settings.manage", "settings", "Manage website and system settings"),
        ]

        permission_objs = {}
        for name, module, desc in permissions_data:
            perm = db.query(Permission).filter(Permission.name == name).first()
            if not perm:
                perm = Permission(name=name, module=module, description=desc)
                db.add(perm)
                db.flush()
            permission_objs[name] = perm
        print(f"Verified {len(permission_objs)} permissions.")

        # 2. ROLES
        roles_data = [
            ("Super Admin", "super_admin", "Full unrestricted administrative access", True, list(permission_objs.values())),
            ("Admin", "admin", "General administrative and CMS management", True, list(permission_objs.values())),
            ("Content Manager", "content_manager", "Manages projects, content, media, and leads", False, [
                p for k, p in permission_objs.items() if not k.startswith("users.") and k != "settings.manage"
            ]),
            ("Project Manager", "project_manager", "Creates and manages real estate listings", False, [
                permission_objs["dashboard.view"],
                permission_objs["projects.view"],
                permission_objs["projects.create"],
                permission_objs["projects.update"],
                permission_objs["media.upload"],
                permission_objs["leads.view"],
            ]),
            ("Editor", "editor", "Edits property descriptions and updates media", False, [
                permission_objs["dashboard.view"],
                permission_objs["projects.view"],
                permission_objs["projects.update"],
                permission_objs["media.upload"],
            ]),
            ("Viewer", "viewer", "Read-only access to view listings and analytics", False, [
                permission_objs["dashboard.view"],
                permission_objs["projects.view"],
                permission_objs["leads.view"],
            ]),
        ]

        role_objs = {}
        for name, slug, desc, is_sys, perms in roles_data:
            role = db.query(Role).filter(Role.slug == slug).first()
            if not role:
                role = Role(name=name, slug=slug, description=desc, is_system=is_sys, permissions=perms)
                db.add(role)
                db.flush()
            else:
                role.permissions = perms
            role_objs[slug] = role
        print(f"Verified {len(role_objs)} roles.")

        # 3. INITIAL ADMIN USER
        admin_email = settings.INITIAL_ADMIN_EMAIL.lower().strip()
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                first_name=settings.INITIAL_ADMIN_FIRST_NAME,
                last_name=settings.INITIAL_ADMIN_LAST_NAME,
                email=admin_email,
                phone="+91-9876543210",
                password_hash=hash_password(settings.INITIAL_ADMIN_PASSWORD),
                role_id=role_objs["super_admin"].id,
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.flush()
            print(f"Created Super Admin: {admin_email}")
        else:
            print(f"Admin user {admin_email} already exists.")

        # 4. COUNTRIES
        india = db.query(Country).filter(Country.code == "IN").first()
        if not india:
            india = Country(name="India", code="IN", currency_code="INR", currency_symbol="₹", phone_code="+91", is_active=True)
            db.add(india)
            db.flush()

        uae = db.query(Country).filter(Country.code == "AE").first()
        if not uae:
            uae = Country(name="United Arab Emirates", code="AE", currency_code="AED", currency_symbol="AED", phone_code="+971", is_active=True)
            db.add(uae)
            db.flush()

        # 5. STATES
        states_data = [
            ("Uttar Pradesh", "UP", india.id),
            ("Haryana", "HR", india.id),
            ("Maharashtra", "MH", india.id),
            ("Karnataka", "KA", india.id),
            ("Dubai", "DXB", uae.id),
        ]
        state_objs = {}
        for s_name, s_code, c_id in states_data:
            st = db.query(State).filter(State.name == s_name, State.country_id == c_id).first()
            if not st:
                st = State(name=s_name, code=s_code, country_id=c_id, is_active=True)
                db.add(st)
                db.flush()
            state_objs[s_name] = st

        # 6. CITIES
        cities_data = [
            ("Noida", "noida", state_objs["Uttar Pradesh"].id, True, "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800"),
            ("Gurgaon", "gurgaon", state_objs["Haryana"].id, True, "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800"),
            ("Mumbai", "mumbai", state_objs["Maharashtra"].id, True, "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800"),
            ("Bengaluru", "bengaluru", state_objs["Karnataka"].id, True, "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800"),
            ("Dubai", "dubai", state_objs["Dubai"].id, True, "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800"),
            ("Greater Noida", "greater-noida", state_objs["Uttar Pradesh"].id, False, "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800"),
        ]
        city_objs = {}
        for c_name, c_slug, s_id, is_feat, img_url in cities_data:
            ct = db.query(City).filter(City.slug == c_slug).first()
            if not ct:
                ct = City(name=c_name, slug=c_slug, state_id=s_id, is_featured=is_feat, image_url=img_url, is_active=True)
                db.add(ct)
                db.flush()
            city_objs[c_name] = ct

        # 7. LOCALITIES
        localities_data = [
            ("Golf Course Extension Road", "golf-course-extension-road", city_objs["Gurgaon"].id, "122002", True),
            ("Sector 42, DLF Golf Links", "sector-42-dlf-golf-links", city_objs["Gurgaon"].id, "122009", True),
            ("Sector 43, Noida Expressway", "sector-43-noida-expressway", city_objs["Noida"].id, "201301", True),
            ("Sector 128, Wish Town", "sector-128-wish-town", city_objs["Noida"].id, "201304", True),
            ("Worli Sea Face", "worli-sea-face", city_objs["Mumbai"].id, "400030", True),
            ("Sarjapur Road", "sarjapur-road", city_objs["Bengaluru"].id, "560035", True),
            ("Downtown Dubai", "downtown-dubai", city_objs["Dubai"].id, "00000", True),
            ("Palm Jumeirah", "palm-jumeirah", city_objs["Dubai"].id, "00000", True),
        ]
        locality_objs = {}
        for l_name, l_slug, c_id, pin, is_pop in localities_data:
            loc = db.query(Locality).filter(Locality.slug == l_slug).first()
            if not loc:
                loc = Locality(name=l_name, slug=l_slug, city_id=c_id, pincode=pin, is_popular=is_pop)
                db.add(loc)
                db.flush()
            locality_objs[l_name] = loc

        # 8. PROPERTY TYPES
        pt_data = [
            ("Luxury Apartments", "luxury-apartments", "Building2", "Premium high-rise residential residences"),
            ("Penthouses", "penthouses", "Crown", "Exclusive sky penthouses with panoramic private terraces"),
            ("Signature Villas", "signature-villas", "Home", "Independent luxury mansions with private landscape"),
            ("Commercial High-Street", "commercial-high-street", "Briefcase", "Grade-A retail and corporate spaces"),
            ("Residential Plots", "residential-plots", "MapPin", "Freehold gated plotted developments"),
        ]
        pt_objs = {}
        for p_name, p_slug, icon, desc in pt_data:
            pt = db.query(PropertyType).filter(PropertyType.slug == p_slug).first()
            if not pt:
                pt = PropertyType(name=p_name, slug=p_slug, icon=icon, description=desc, is_active=True)
                db.add(pt)
                db.flush()
            pt_objs[p_slug] = pt

        # 9. AMENITIES
        amenities_data = [
            ("Infinity Swimming Pool", "infinity-swimming-pool", "Leisure", "Waves"),
            ("State-of-the-art Gym", "state-of-the-art-gym", "Sports", "Dumbbell"),
            ("Private Grand Clubhouse", "private-grand-clubhouse", "Leisure", "Building"),
            ("Multi-tier 24x7 Security & CCTV", "24x7-security-cctv", "Safety", "ShieldCheck"),
            ("Concierge & Valet Service", "concierge-valet-service", "Convenience", "UserCheck"),
            ("Landscaped Sky Gardens", "landscaped-sky-gardens", "Eco", "Trees"),
            ("Children's Adventure Play Area", "childrens-play-area", "Leisure", "Gamepad2"),
            ("100% Full Power Backup", "100-power-backup", "Convenience", "Zap"),
            ("High-Speed Private Elevators", "high-speed-elevators", "Convenience", "ArrowUpDown"),
            ("Badminton & Squash Courts", "badminton-squash-courts", "Sports", "Activity"),
            ("Full-sized Tennis Court", "tennis-court", "Sports", "Trophy"),
            ("Spa & Ayurvedic Wellness Center", "spa-wellness-center", "Leisure", "HeartPulse"),
            ("EV Fast Charging Stations", "ev-charging-stations", "Eco", "BatteryCharging"),
            ("Jogging & Cycling Track", "jogging-cycling-track", "Sports", "Footprints"),
        ]
        amenity_objs = []
        for a_name, a_slug, cat, icon in amenities_data:
            am = db.query(Amenity).filter(Amenity.slug == a_slug).first()
            if not am:
                am = Amenity(name=a_name, slug=a_slug, category=cat, icon=icon)
                db.add(am)
                db.flush()
            amenity_objs.append(am)

        # 10. REAL ESTATE PROJECTS
        projects_data = [
            {
                "name": "DLF The Camellias Luxury Residences",
                "slug": "dlf-the-camellias-luxury-residences",
                "short_description": "India's pinnacle of super-luxury living on Golf Course Road with private golf course vistas and world-class amenities.",
                "full_description": """DLF The Camellias stands as the undisputed benchmark of super-luxury residential architecture in India. Situated in the heart of DLF Phase 5 on Golf Course Road, Gurgaon, this ultra-luxurious development offers unmatched panoramic views of the Aravalli hills and the manicured DLF Golf Course.

Each residence is an expansive masterpiece crafted with double-height ceiling entries, soundproof floor-to-ceiling glass facades, private elevator lobbies, and custom Italian marble finishes. The property features a colossal 1.6 lakh sq.ft. seven-star clubhouse managed by international hospitality concierges, Michelin-standard dining pavilions, infinity lap pools, indoor tennis courts, and comprehensive wellness sanctuaries.""",
                "developer_name": "DLF Limited",
                "project_type": "Residential",
                "property_type_id": pt_objs["penthouses"].id,
                "status": "published",
                "construction_status": "Ready to Move",
                "featured": True,
                "display_order": 1,
                "country_id": india.id,
                "state_id": state_objs["Haryana"].id,
                "city_id": city_objs["Gurgaon"].id,
                "locality_id": locality_objs["Sector 42, DLF Golf Links"].id,
                "address": "Sector 42, Golf Course Road, DLF Phase 5",
                "pincode": "122009",
                "min_price": 285000000.0,
                "max_price": 750000000.0,
                "price_label": "₹ 28.5 Cr - 75.0 Cr",
                "area_from": 7400.0,
                "area_to": 16000.0,
                "area_unit": "sq.ft",
                "bedrooms_summary": "4, 5, 6 BHK & Penthouses",
                "bathrooms_summary": "5-7 Bathrooms",
                "parking": "4 Covered Stalls",
                "total_floors": 38,
                "total_units": 429,
                "total_towers": 9,
                "total_area_acres": 17.5,
                "possession_date": date(2022, 6, 1),
                "launch_date": date(2017, 3, 1),
                "rera_number": "HRERA-PKL-GGM-102-2018",
                "primary_image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
                "seo_title": "DLF The Camellias Golf Course Road | Super Luxury Residences Gurgaon",
                "meta_description": "Explore DLF The Camellias on Golf Course Road, Gurgaon. Ultra-luxury 4, 5, 6 BHK residences & penthouses with golf course views. Verified RERA, prices, floor plans.",
                "configurations": [
                    {
                        "name": "4 BHK Imperial Suite",
                        "bhk_type": "4 BHK",
                        "super_area": 7400.0,
                        "carpet_area": 5800.0,
                        "price": 285000000.0,
                        "price_label": "₹ 28.50 Cr",
                        "bedrooms": 4,
                        "bathrooms": 5,
                        "balconies": 3,
                        "floor_plan_image_url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800",
                        "availability_status": "Few Units Left",
                        "description": "Expansive 4-bedroom layout with double living salons and staff quarters.",
                    },
                    {
                        "name": "5 BHK Grand Presidential Penthouse",
                        "bhk_type": "Penthouse",
                        "super_area": 11000.0,
                        "carpet_area": 8900.0,
                        "price": 520000000.0,
                        "price_label": "₹ 52.00 Cr",
                        "bedrooms": 5,
                        "bathrooms": 6,
                        "balconies": 4,
                        "floor_plan_image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
                        "availability_status": "Available",
                        "description": "Duplex sky penthouse with private infinity plunge pool and terrace garden.",
                    },
                ],
                "images": [
                    ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200", "Facade View", True),
                    ("https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200", "Living Lounge", False),
                    ("https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200", "Master Suite", False),
                    ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200", "Infinity Pool", False),
                ],
                "video": ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ", "DLF The Camellias Luxury Tour"),
            },
            {
                "name": "Godrej Woods Forest Residences",
                "slug": "godrej-woods-forest-residences",
                "short_description": "Urban forest themed luxury residences in Sector 43, Noida next to the Golf Course with over 1,100 indigenous trees.",
                "full_description": """Godrej Woods is a premier residential sanctuary in the heart of Sector 43, Noida. Designed around a sprawling private urban forest with more than 1,100 full-grown trees, it offers pristine oxygen-rich microclimates just minutes from Central Noida and Delhi.

Featuring elevated skywalk walkways, forest-edge clubhouse, cascading waterfall decks, and temperature-controlled indoor swimming pools, Godrej Woods redefines holistic biophilic luxury. Residences boast wrap-around balconies, Italian marble lobbies, VRV air conditioning, and home automation systems.""",
                "developer_name": "Godrej Properties",
                "project_type": "Residential",
                "property_type_id": pt_objs["luxury-apartments"].id,
                "status": "published",
                "construction_status": "Under Construction",
                "featured": True,
                "display_order": 2,
                "country_id": india.id,
                "state_id": state_objs["Uttar Pradesh"].id,
                "city_id": city_objs["Noida"].id,
                "locality_id": locality_objs["Sector 43, Noida Expressway"].id,
                "address": "Plot GH-01, Sector 43, Noida",
                "pincode": "201301",
                "min_price": 18500000.0,
                "max_price": 54000000.0,
                "price_label": "₹ 1.85 Cr - 5.40 Cr",
                "area_from": 1550.0,
                "area_to": 3750.0,
                "area_unit": "sq.ft",
                "bedrooms_summary": "2, 3, 4 BHK",
                "bathrooms_summary": "2-4 Bathrooms",
                "parking": "2 Reserved Stalls",
                "total_floors": 32,
                "total_units": 820,
                "total_towers": 10,
                "total_area_acres": 11.0,
                "possession_date": date(2026, 12, 1),
                "launch_date": date(2021, 5, 1),
                "rera_number": "UPRERAPRJ704730",
                "primary_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200",
                "seo_title": "Godrej Woods Sector 43 Noida | 2, 3, 4 BHK Forest Homes",
                "meta_description": "Book luxury forest residences at Godrej Woods Sector 43, Central Noida. Prices, floor plans, RERA approvals, brochure download.",
                "configurations": [
                    {
                        "name": "2 BHK Forest Classic",
                        "bhk_type": "2 BHK",
                        "super_area": 1550.0,
                        "carpet_area": 1180.0,
                        "price": 18500000.0,
                        "price_label": "₹ 1.85 Cr",
                        "bedrooms": 2,
                        "bathrooms": 2,
                        "balconies": 2,
                        "availability_status": "Available",
                        "description": "Forest-facing 2 BHK with sunlit master suite and modular kitchen.",
                    },
                    {
                        "name": "3 BHK Premium Sanctuary",
                        "bhk_type": "3 BHK",
                        "super_area": 2250.0,
                        "carpet_area": 1720.0,
                        "price": 29500000.0,
                        "price_label": "₹ 2.95 Cr",
                        "bedrooms": 3,
                        "bathrooms": 3,
                        "balconies": 3,
                        "availability_status": "Available",
                        "description": "Spacious 3-bedroom apartment with domestic staff room and grand balcony.",
                    },
                    {
                        "name": "4 BHK Royal Woodland Suite",
                        "bhk_type": "4 BHK",
                        "super_area": 3750.0,
                        "carpet_area": 2850.0,
                        "price": 54000000.0,
                        "price_label": "₹ 5.40 Cr",
                        "bedrooms": 4,
                        "bathrooms": 4,
                        "balconies": 4,
                        "availability_status": "Few Units Left",
                        "description": "Double-height living pavilion overlooking central forest canopy.",
                    },
                ],
                "images": [
                    ("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200", "Tower Elevation", True),
                    ("https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=1200", "Interior Living", False),
                    ("https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1200", "Clubhouse Deck", False),
                ],
                "video": ("https://www.youtube.com/watch?v=kJQP7kiw5Fk", "kJQP7kiw5Fk", "Godrej Woods Project Walkthrough"),
            },
            {
                "name": "Oberoi 360 West Sea View Residences",
                "slug": "oberoi-360-west-sea-view-residences",
                "short_description": "Iconic twin-tower skyscraper development on Worli Sea Face Mumbai managed by The Ritz-Carlton.",
                "full_description": """Oberoi 360 West is Mumbai's premier landmark skyscraper residence, located at Worli. Rising prominently over the Arabian Sea, this project is designed by renowned architects Kohn Pedersen Fox (KPF) with interior design by Tony Chi.

Featuring branded hotel residences with legendary Ritz-Carlton hospitality services, the project boasts sea-facing grand salons, private cantilevered infinity pools, helipad access, and Mumbai's most elite social address.""",
                "developer_name": "Oberoi Realty",
                "project_type": "Residential",
                "property_type_id": pt_objs["penthouses"].id,
                "status": "published",
                "construction_status": "Ready to Move",
                "featured": True,
                "display_order": 3,
                "country_id": india.id,
                "state_id": state_objs["Maharashtra"].id,
                "city_id": city_objs["Mumbai"].id,
                "locality_id": locality_objs["Worli Sea Face"].id,
                "address": "Worli Sea Face, Worli, Mumbai",
                "pincode": "400030",
                "min_price": 450000000.0,
                "max_price": 950000000.0,
                "price_label": "₹ 45.0 Cr - 95.0 Cr",
                "area_from": 5200.0,
                "area_to": 12500.0,
                "area_unit": "sq.ft",
                "bedrooms_summary": "4, 5 BHK & Duplexes",
                "bathrooms_summary": "4-6 Bathrooms",
                "parking": "4 Covered Stalls",
                "total_floors": 66,
                "total_units": 150,
                "total_towers": 2,
                "total_area_acres": 4.5,
                "possession_date": date(2023, 1, 1),
                "launch_date": date(2018, 1, 1),
                "rera_number": "P51900008535",
                "primary_image_url": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200",
                "seo_title": "Oberoi 360 West Worli Mumbai | Sea Facing Ritz Carlton Residences",
                "meta_description": "Luxury sea view residences at Oberoi 360 West, Worli, Mumbai. Explore 4 & 5 BHK luxury homes, price list, floor plans.",
                "configurations": [
                    {
                        "name": "4 BHK Arabian Sea Suite",
                        "bhk_type": "4 BHK",
                        "super_area": 5200.0,
                        "carpet_area": 4100.0,
                        "price": 450000000.0,
                        "price_label": "₹ 45.00 Cr",
                        "bedrooms": 4,
                        "bathrooms": 5,
                        "balconies": 2,
                        "availability_status": "Available",
                        "description": "Uninterrupted 180-degree Arabian Sea views with bespoke concierge access.",
                    },
                ],
                "images": [
                    ("https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200", "Tower Skyline", True),
                    ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200", "Luxury Salon", False),
                ],
                "video": ("https://www.youtube.com/watch?v=kJQP7kiw5Fk", "kJQP7kiw5Fk", "Oberoi 360 West Property Showcase"),
            },
            {
                "name": "Sobha Hartland Waterfront Sanctuary",
                "slug": "sobha-hartland-waterfront-sanctuary",
                "short_description": "Exclusive freehold waterfront canal villas in Mohammed Bin Rashid City, Dubai, minutes from Downtown.",
                "full_description": """Sobha Hartland is an ultra-exclusive 8 million sq.ft. waterfront development situated along the Dubai Canal in Mohammed Bin Rashid Al Maktoum City. Surrounded by 2.4 million sq.ft. of lush parklands and crystal lagoons, Hartland represents the pinnacle of private estate craftsmanship.

Each mansion features private elevator, temperature-controlled swimming pool, private rooftop terrace, cinema room, and private yacht berth options.""",
                "developer_name": "Sobha Realty",
                "project_type": "Residential",
                "property_type_id": pt_objs["signature-villas"].id,
                "status": "published",
                "construction_status": "Under Construction",
                "featured": True,
                "display_order": 4,
                "country_id": uae.id,
                "state_id": state_objs["Dubai"].id,
                "city_id": city_objs["Dubai"].id,
                "locality_id": locality_objs["Downtown Dubai"].id,
                "address": "MBR City, Dubai Water Canal, Dubai",
                "pincode": "00000",
                "currency": "AED",
                "min_price": 7500000.0,
                "max_price": 28000000.0,
                "price_label": "AED 7.5 M - 28.0 M",
                "area_from": 3800.0,
                "area_to": 11500.0,
                "area_unit": "sq.ft",
                "bedrooms_summary": "4, 5, 6 Bedroom Villas",
                "bathrooms_summary": "4-7 Bathrooms",
                "parking": "3 Covered Garages",
                "total_floors": 3,
                "total_units": 280,
                "total_towers": 1,
                "total_area_acres": 185.0,
                "possession_date": date(2025, 9, 1),
                "launch_date": date(2021, 10, 1),
                "rera_number": "DLD-RERA-21840",
                "primary_image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200",
                "seo_title": "Sobha Hartland Waterfront Villas Dubai | MBR City Luxury Mansions",
                "meta_description": "Buy luxury waterfront villas at Sobha Hartland, MBR City Dubai. Freehold properties, crystal lagoon views, payment plans.",
                "configurations": [
                    {
                        "name": "5 Bedroom Canal Villa",
                        "bhk_type": "Villa",
                        "super_area": 6800.0,
                        "carpet_area": 5600.0,
                        "price": 14500000.0,
                        "price_label": "AED 14.5 M",
                        "bedrooms": 5,
                        "bathrooms": 6,
                        "balconies": 3,
                        "availability_status": "Available",
                        "description": "Three-storey waterfront mansion with private garden and pool deck.",
                    },
                ],
                "images": [
                    ("https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200", "Canal Front View", True),
                    ("https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200", "Villa Living", False),
                ],
                "video": ("https://www.youtube.com/watch?v=kJQP7kiw5Fk", "kJQP7kiw5Fk", "Sobha Hartland Villa Walkthrough"),
            },
        ]

        for pdata in projects_data:
            existing_p = db.query(Project).filter(Project.slug == pdata["slug"]).first()
            if not existing_p:
                cfgs_data = pdata.pop("configurations")
                imgs_data = pdata.pop("images")
                vid_data = pdata.pop("video")

                p_obj = Project(**pdata, created_by=admin_user.id)
                db.add(p_obj)
                db.flush()

                # Amenities
                p_obj.amenities = amenity_objs[:10]

                # Configurations
                for c in cfgs_data:
                    cfg_obj = ProjectConfiguration(project_id=p_obj.id, **c)
                    db.add(cfg_obj)

                # Images
                for idx, (img_url, caption, is_prim) in enumerate(imgs_data):
                    med = ProjectMedia(
                        project_id=p_obj.id,
                        file_url=img_url,
                        file_name=f"property_{idx}.jpg",
                        file_size=245000,
                        mime_type="image/jpeg",
                        caption=caption,
                        alt_text=f"{p_obj.name} - {caption}",
                        display_order=idx,
                        is_primary=is_prim,
                    )
                    db.add(med)

                # Video
                vid_url, yt_id, title = vid_data
                vid = ProjectVideo(
                    project_id=p_obj.id,
                    video_type="youtube",
                    video_url=vid_url,
                    youtube_video_id=yt_id,
                    title=title,
                    thumbnail_url=f"https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg",
                )
                db.add(vid)

                # Document brochure
                doc = ProjectDocument(
                    project_id=p_obj.id,
                    title=f"{p_obj.name} Official Brochure",
                    doc_type="brochure",
                    file_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    file_name="brochure.pdf",
                    file_size=1048576,
                    mime_type="application/pdf",
                )
                db.add(doc)
                db.commit()
                print(f"Seeded Project: {p_obj.name}")

        # 11. SAMPLE ENQUIRIES / LEADS
        camellias_proj = db.query(Project).filter(Project.slug == "dlf-the-camellias-luxury-residences").first()
        woods_proj = db.query(Project).filter(Project.slug == "godrej-woods-forest-residences").first()

        sample_leads = [
            ("Rajesh Malhotra", "rajesh.malhotra@corporate.com", "+91-9811223344", camellias_proj.id if camellias_proj else None, "New", "5 BHK Penthouse", "₹ 40 Cr - 60 Cr", "Interested in scheduling a private site visit this Saturday.", "google_ads", "cpc", "luxury_homes_delhi"),
            ("Priya Sharma", "priya.sharma@investor.in", "+91-9822334455", woods_proj.id if woods_proj else None, "Contacted", "3 BHK", "₹ 2.5 Cr - 3.5 Cr", "Please share the payment plans and possession dates.", "website", "organic", "homepage_cta"),
            ("Amitabh Khanna", "amitabh.khanna@dubaiholding.ae", "+971-501234567", None, "Qualified", "Signature Villa", "₹ 15 Cr+", "Looking for prime investment properties in Dubai and Mumbai.", "meta_ads", "instagram", "dubai_investors"),
            ("Vikram Singhania", "vikram.s@familyoffice.com", "+91-9988776655", camellias_proj.id if camellias_proj else None, "Follow-up", "4 BHK", "₹ 30 Cr", "Discussed with client. Waiting on board approval for site tour.", "referral", None, None),
            ("Rohit Vermani", "rohit.vermani@techcorp.io", "+91-9711002233", woods_proj.id if woods_proj else None, "Converted", "3 BHK", "₹ 3.0 Cr", "Booking token advance received.", "direct", None, None),
        ]

        for name, email, phone, p_id, status, bhk, budget, msg, src, utm_s, utm_c in sample_leads:
            existing_lead = db.query(Enquiry).filter(Enquiry.email == email).first()
            if not existing_lead:
                lead = Enquiry(
                    project_id=p_id,
                    name=name,
                    email=email,
                    phone=phone,
                    country="India",
                    status=status,
                    preferred_bhk=bhk,
                    budget_range=budget,
                    message=msg,
                    source=src,
                    utm_source=utm_s,
                    utm_campaign=utm_c,
                    assigned_to=admin_user.id,
                )
                db.add(lead)
                db.flush()
                # Add sample note
                note = EnquiryNote(
                    enquiry_id=lead.id,
                    user_id=admin_user.id,
                    note=f"Initial contact established via {src}. Client is responsive.",
                )
                db.add(note)
                db.commit()
        print("Sample leads and CRM notes verified.")

        # 12. WEBSITE SETTINGS
        settings_defaults = [
            ("site_name", "Pavilion 360", "general", "Official company portal name"),
            ("site_tagline", "Curated Luxury Real Estate & Investment Portfolios", "general", "Public site tagline"),
            ("contact_phone", "+91 800-PAVILION / +91 98765 43210", "contact", "Primary concierge phone number"),
            ("contact_email", "concierge@pavilionrealty.com", "contact", "Official enquiry email"),
            ("office_address", "Pavilion Tower, Level 18, Golf Course Road, DLF Phase 5, Gurugram, India", "contact", "Corporate headquarters"),
            ("rera_disclaimer", "Pavilion 360 is a registered Real Estate Regulatory Authority (RERA) compliant advisory firm. All project details, pricing, floor plans, and amenities are subject to developer specifications.", "legal", "Mandatory RERA compliance disclaimer"),
            ("meta_title", "Pavilion 360 | India's Premier Luxury Real Estate Advisory", "seo", "Global SEO title"),
            ("meta_description", "Discover India's and Dubai's most prestigious luxury apartments, villas, and penthouses. Transparent consultation, verified RERA documentation, and exclusive pricing.", "seo", "Global SEO description"),
        ]

        for k, val, grp, desc in settings_defaults:
            s_obj = db.query(WebsiteSetting).filter(WebsiteSetting.key == k).first()
            if not s_obj:
                s_obj = WebsiteSetting(key=k, value=val, group=grp, description=desc)
                db.add(s_obj)
        db.commit()
        print("Website settings verified.")

        print("Database seeded successfully with realistic luxury real estate data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
