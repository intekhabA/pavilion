export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  currency_code: string;
  currency_symbol: string;
  phone_code: string;
  is_active: boolean;
}

export interface State {
  id: number;
  country_id: number;
  name: string;
  code?: string;
  is_active: boolean;
}

export interface City {
  id: number;
  state_id: number;
  name: string;
  slug: string;
  is_featured: boolean;
  image_url?: string;
  is_active: boolean;
  project_count?: number;
}

export interface Locality {
  id: number;
  city_id: number;
  name: string;
  slug: string;
  pincode?: string;
  is_popular: boolean;
}

export interface PropertyType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  is_active: boolean;
}

export interface Amenity {
  id: number;
  name: string;
  slug: string;
  category: string;
  icon?: string;
}

export interface ProjectConfiguration {
  id?: number;
  project_id?: number;
  name: string;
  bhk_type: string;
  super_area?: number;
  carpet_area?: number;
  area_unit: string;
  price?: number;
  price_label?: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  floor_plan_image_url?: string;
  availability_status: string;
  description?: string;
}

export interface ProjectMedia {
  id?: number;
  project_id?: number;
  file_url: string;
  thumbnail_url?: string;
  webp_url?: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  display_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface ProjectVideo {
  id?: number;
  project_id?: number;
  video_type: "youtube" | "custom";
  video_url: string;
  youtube_video_id?: string;
  title?: string;
  thumbnail_url?: string;
  created_at?: string;
}

export interface ProjectDocument {
  id?: number;
  project_id?: number;
  title: string;
  doc_type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at?: string;
}

export interface ProjectCard {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  developer_name: string;
  project_type: string;
  status: string;
  construction_status: string;
  featured: boolean;
  city_name: string;
  locality_name?: string;
  min_price?: number;
  max_price?: number;
  currency: string;
  price_label?: string;
  bedrooms_summary?: string;
  area_from?: number;
  area_to?: number;
  area_unit: string;
  rera_number?: string;
  primary_image_url?: string;
  property_type_name?: string;
  created_at: string;
}

export interface ProjectDetail {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  developer_name: string;
  project_type: string;
  property_type_id?: number;
  status: string;
  construction_status: string;
  featured: boolean;
  display_order: number;
  country_id: number;
  state_id: number;
  city_id: number;
  locality_id?: number;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  min_price?: number;
  max_price?: number;
  currency: string;
  price_label?: string;
  area_from?: number;
  area_to?: number;
  area_unit: string;
  bedrooms_summary?: string;
  bathrooms_summary?: string;
  parking?: string;
  total_floors?: number;
  total_units?: number;
  total_towers?: number;
  total_area_acres?: number;
  possession_date?: string;
  launch_date?: string;
  rera_number?: string;
  primary_image_url?: string;
  seo_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_image?: string;
  is_indexable: boolean;
  created_at: string;
  updated_at: string;
  country?: Country;
  state?: State;
  city?: City;
  locality?: Locality;
  property_type?: PropertyType;
  amenities: Amenity[];
  configurations: ProjectConfiguration[];
  media: ProjectMedia[];
  videos: ProjectVideo[];
  documents: ProjectDocument[];
}

export interface EnquiryNote {
  id: number;
  note: string;
  user_name?: string;
  created_at: string;
}

export interface Enquiry {
  id: number;
  uuid: string;
  project_id?: number;
  project_name?: string;
  project_slug?: string;
  name: string;
  email: string;
  phone: string;
  country?: string;
  message?: string;
  preferred_bhk?: string;
  budget_range?: string;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ip_address?: string;
  status: "New" | "Contacted" | "Qualified" | "Follow-up" | "Converted" | "Closed" | "Spam";
  assigned_to?: number;
  assigned_user_name?: string;
  notes: EnquiryNote[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  permissions: Permission[];
}

export interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: Role;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DashboardStats {
  total_projects: number;
  published_projects: number;
  draft_projects: number;
  featured_projects: number;
  total_enquiries: number;
  new_enquiries: number;
  converted_enquiries: number;
  total_users: number;
  system_health: {
    status: string;
    database: string;
    redis_cache: string;
    timestamp: string;
  };
  enquiries_by_month: ChartDataPoint[];
  projects_by_city: ChartDataPoint[];
  recent_projects: ProjectCard[];
  recent_enquiries: Enquiry[];
  recent_audit_logs: AuditLog[];
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  entity: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
  created_at: string;
}

export interface WebsiteSetting {
  id: number;
  key: string;
  value: string;
  group: string;
  description?: string;
}
