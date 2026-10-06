import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  APIResponse,
  PaginatedData,
  ProjectCard,
  ProjectDetail,
  Country,
  State,
  City,
  Locality,
  Amenity,
  PropertyType,
  Enquiry,
  User,
  Role,
  Permission,
  DashboardStats,
  AuditLog,
  WebsiteSetting,
} from "@/types";

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== "") {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    if (window.location.port === "3000") {
      return `http://${window.location.hostname}:8000`;
    }
    return "";
  }
  return process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";
};

const API_BASE = getBaseUrl();
const API_URL = API_BASE ? `${API_BASE}/api/v1` : "/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Interceptor to inject JWT Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("pavilion_access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for Refresh Token Rotation on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("pavilion_refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("pavilion_access_token");
        localStorage.removeItem("pavilion_refresh_token");
        localStorage.removeItem("pavilion_user");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post<APIResponse<{ access_token: string; refresh_token: string }>>(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        localStorage.setItem("pavilion_access_token", newAccessToken);
        localStorage.setItem("pavilion_refresh_token", newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        localStorage.removeItem("pavilion_access_token");
        localStorage.removeItem("pavilion_refresh_token");
        localStorage.removeItem("pavilion_user");
        if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // --- AUTH ---
  auth: {
    login: async (email: string, password: string, remember_me = false) => {
      const res = await api.post<APIResponse<{ access_token: string; refresh_token: string; user: User }>>(
        "/auth/login",
        { email, password, remember_me }
      );
      if (res.data.success && typeof window !== "undefined") {
        localStorage.setItem("pavilion_access_token", res.data.data.access_token);
        localStorage.setItem("pavilion_refresh_token", res.data.data.refresh_token);
        localStorage.setItem("pavilion_user", JSON.stringify(res.data.data.user));
      }
      return res.data;
    },
    logout: async () => {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("pavilion_refresh_token") : null;
      if (refreshToken) {
        try {
          await api.post("/auth/logout", { refresh_token: refreshToken });
        } catch {}
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("pavilion_access_token");
        localStorage.removeItem("pavilion_refresh_token");
        localStorage.removeItem("pavilion_user");
      }
    },
    getMe: async () => {
      const res = await api.get<APIResponse<User>>("/auth/me");
      return res.data;
    },
    changePassword: async (current_password: string, new_password: string) => {
      const res = await api.post<APIResponse<null>>("/auth/change-password", {
        current_password,
        new_password,
      });
      return res.data;
    },
  },

  // --- PUBLIC PROJECTS ---
  publicProjects: {
    getProjects: async (params?: Record<string, any>) => {
      const res = await api.get<APIResponse<PaginatedData<ProjectCard>>>("/projects", { params });
      return res.data;
    },
    getFeatured: async (limit = 6) => {
      const res = await api.get<APIResponse<ProjectCard[]>>("/projects/featured", { params: { limit } });
      return res.data;
    },
    getBySlug: async (slug: string) => {
      const res = await api.get<APIResponse<ProjectDetail>>(`/projects/${slug}`);
      return res.data;
    },
    getSimilar: async (slug: string, limit = 4) => {
      const res = await api.get<APIResponse<ProjectCard[]>>(`/projects/${slug}/similar`, { params: { limit } });
      return res.data;
    },
  },

  // --- PUBLIC LOCATIONS ---
  publicLocations: {
    getCountries: async () => {
      const res = await api.get<APIResponse<Country[]>>("/locations/countries");
      return res.data;
    },
    getStates: async (country_id?: number) => {
      const res = await api.get<APIResponse<State[]>>("/locations/states", { params: { country_id } });
      return res.data;
    },
    getCities: async (params?: { state_id?: number; featured_only?: boolean }) => {
      const res = await api.get<APIResponse<City[]>>("/locations/cities", { params });
      return res.data;
    },
    getLocalities: async (params?: { city_id?: number; popular_only?: boolean }) => {
      const res = await api.get<APIResponse<Locality[]>>("/locations/localities", { params });
      return res.data;
    },
    getAmenities: async () => {
      const res = await api.get<APIResponse<Amenity[]>>("/locations/amenities");
      return res.data;
    },
    getPropertyTypes: async () => {
      const res = await api.get<APIResponse<PropertyType[]>>("/locations/property-types");
      return res.data;
    },
  },

  // --- PUBLIC ENQUIRIES ---
  publicEnquiries: {
    submit: async (data: {
      project_id?: number;
      name: string;
      email: string;
      phone: string;
      country?: string;
      message?: string;
      preferred_bhk?: string;
      budget_range?: string;
      source?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      honeypot?: string;
    }) => {
      const res = await api.post<APIResponse<{ reference_id: string }>>("/enquiries", data);
      return res.data;
    },
  },

  // --- ADMIN DASHBOARD ---
  adminDashboard: {
    getStats: async () => {
      const res = await api.get<APIResponse<DashboardStats>>("/admin/dashboard/stats");
      return res.data;
    },
  },

  // --- ADMIN PROJECTS ---
  adminProjects: {
    list: async (params?: Record<string, any>) => {
      const res = await api.get<APIResponse<PaginatedData<ProjectCard>>>("/admin/projects", { params });
      return res.data;
    },
    getById: async (id: number) => {
      const res = await api.get<APIResponse<ProjectDetail>>(`/admin/projects/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await api.post<APIResponse<ProjectDetail>>("/admin/projects", data);
      return res.data;
    },
    update: async (id: number, data: any) => {
      const res = await api.put<APIResponse<ProjectDetail>>(`/admin/projects/${id}`, data);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/projects/${id}`);
      return res.data;
    },
    publish: async (id: number) => {
      const res = await api.post<APIResponse<null>>(`/admin/projects/${id}/publish`);
      return res.data;
    },
    unpublish: async (id: number) => {
      const res = await api.post<APIResponse<null>>(`/admin/projects/${id}/unpublish`);
      return res.data;
    },
    duplicate: async (id: number) => {
      const res = await api.post<APIResponse<ProjectDetail>>(`/admin/projects/${id}/duplicate`);
      return res.data;
    },
    uploadMedia: async (id: number, formData: FormData) => {
      const res = await api.post<APIResponse<any>>(`/admin/projects/${id}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    deleteMedia: async (mediaId: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/projects/media/${mediaId}`);
      return res.data;
    },
    updateMedia: async (mediaId: number, data: any) => {
      const res = await api.put<APIResponse<any>>(`/admin/projects/media/${mediaId}`, data);
      return res.data;
    },
    addVideo: async (id: number, data: any) => {
      const res = await api.post<APIResponse<any>>(`/admin/projects/${id}/videos`, data);
      return res.data;
    },
    deleteVideo: async (videoId: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/projects/videos/${videoId}`);
      return res.data;
    },
    uploadDocument: async (id: number, formData: FormData) => {
      const res = await api.post<APIResponse<any>>(`/admin/projects/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    deleteDocument: async (docId: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/projects/documents/${docId}`);
      return res.data;
    },
    addConfiguration: async (id: number, data: any) => {
      const res = await api.post<APIResponse<any>>(`/admin/projects/${id}/configurations`, data);
      return res.data;
    },
    deleteConfiguration: async (configId: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/projects/configurations/${configId}`);
      return res.data;
    },
  },

  // --- ADMIN LEADS / ENQUIRIES ---
  adminEnquiries: {
    list: async (params?: Record<string, any>) => {
      const res = await api.get<APIResponse<PaginatedData<Enquiry>>>("/admin/enquiries", { params });
      return res.data;
    },
    updateStatus: async (id: number, status: string) => {
      const res = await api.put<APIResponse<Enquiry>>(`/admin/enquiries/${id}/status`, { status });
      return res.data;
    },
    assignUser: async (id: number, user_id: number | null) => {
      const res = await api.put<APIResponse<Enquiry>>(`/admin/enquiries/${id}/assign`, { assigned_to: user_id });
      return res.data;
    },
    addNote: async (id: number, note: string) => {
      const res = await api.post<APIResponse<any>>(`/admin/enquiries/${id}/notes`, { note });
      return res.data;
    },
    getExportUrl: (params?: Record<string, any>) => {
      const query = new URLSearchParams(params).toString();
      return `${API_URL}/admin/enquiries/export/csv?${query}`;
    },
  },

  // --- ADMIN LOCATIONS ---
  adminLocations: {
    getCountries: async () => {
      const res = await api.get<APIResponse<Country[]>>("/admin/locations/countries");
      return res.data;
    },
    createCountry: async (data: any) => {
      const res = await api.post<APIResponse<Country>>("/admin/locations/countries", data);
      return res.data;
    },
    deleteCountry: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/locations/countries/${id}`);
      return res.data;
    },
    getStates: async (country_id?: number) => {
      const res = await api.get<APIResponse<State[]>>("/admin/locations/states", { params: { country_id } });
      return res.data;
    },
    createState: async (data: any) => {
      const res = await api.post<APIResponse<State>>("/admin/locations/states", data);
      return res.data;
    },
    deleteState: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/locations/states/${id}`);
      return res.data;
    },
    getCities: async (state_id?: number) => {
      const res = await api.get<APIResponse<City[]>>("/admin/locations/cities", { params: { state_id } });
      return res.data;
    },
    createCity: async (data: any) => {
      const res = await api.post<APIResponse<City>>("/admin/locations/cities", data);
      return res.data;
    },
    deleteCity: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/locations/cities/${id}`);
      return res.data;
    },
    getLocalities: async (city_id?: number) => {
      const res = await api.get<APIResponse<Locality[]>>("/admin/locations/localities", { params: { city_id } });
      return res.data;
    },
    createLocality: async (data: any) => {
      const res = await api.post<APIResponse<Locality>>("/admin/locations/localities", data);
      return res.data;
    },
    deleteLocality: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/locations/localities/${id}`);
      return res.data;
    },
  },

  // --- ADMIN AMENITIES ---
  adminAmenities: {
    getAmenities: async () => {
      const res = await api.get<APIResponse<Amenity[]>>("/admin/amenities");
      return res.data;
    },
    createAmenity: async (data: any) => {
      const res = await api.post<APIResponse<Amenity>>("/admin/amenities", data);
      return res.data;
    },
    deleteAmenity: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/amenities/${id}`);
      return res.data;
    },
    getPropertyTypes: async () => {
      const res = await api.get<APIResponse<PropertyType[]>>("/admin/amenities/property-types");
      return res.data;
    },
    createPropertyType: async (data: any) => {
      const res = await api.post<APIResponse<PropertyType>>("/admin/amenities/property-types", data);
      return res.data;
    },
    deletePropertyType: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/amenities/property-types/${id}`);
      return res.data;
    },
  },

  // --- ADMIN USERS ---
  adminUsers: {
    list: async () => {
      const res = await api.get<APIResponse<User[]>>("/admin/users");
      return res.data;
    },
    create: async (data: any) => {
      const res = await api.post<APIResponse<User>>("/admin/users", data);
      return res.data;
    },
    update: async (id: number, data: any) => {
      const res = await api.put<APIResponse<User>>(`/admin/users/${id}`, data);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await api.delete<APIResponse<null>>(`/admin/users/${id}`);
      return res.data;
    },
    getRoles: async () => {
      const res = await api.get<APIResponse<Role[]>>("/admin/users/roles");
      return res.data;
    },
    getPermissions: async () => {
      const res = await api.get<APIResponse<Permission[]>>("/admin/users/permissions");
      return res.data;
    },
  },

  // --- ADMIN AUDIT LOGS ---
  adminAudit: {
    list: async (params?: Record<string, any>) => {
      const res = await api.get<APIResponse<PaginatedData<AuditLog>>>("/admin/audit-logs", { params });
      return res.data;
    },
  },

  // --- ADMIN SETTINGS ---
  adminSettings: {
    getSettings: async () => {
      const res = await api.get<APIResponse<WebsiteSetting[]>>("/admin/settings");
      return res.data;
    },
    updateSetting: async (key: string, value: string, description?: string) => {
      const res = await api.put<APIResponse<WebsiteSetting>>(`/admin/settings/${key}`, { value, description });
      return res.data;
    },
    getPublicSiteInfo: async () => {
      const res = await api.get<APIResponse<Record<string, string>>>("/admin/settings/public/site-info");
      return res.data;
    },
  },
};

export default api;
