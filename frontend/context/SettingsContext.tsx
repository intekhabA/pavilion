"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiService } from "@/services/api";

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  contact_phone: string;
  contact_email: string;
  office_address: string;
  rera_disclaimer: string;
  meta_title: string;
  meta_description: string;
  [key: string]: string;
}

const defaultSettings: SiteSettings = {
  site_name: "Pavilion 360",
  site_tagline: "Curated Luxury Real Estate & Investment Portfolios",
  contact_phone: "+91 800-PAVILION / +91 98765 43210",
  contact_email: "concierge@pavilionrealty.com",
  office_address: "Pavilion Tower, Level 18, Golf Course Road, DLF Phase 5, Gurugram, India",
  rera_disclaimer:
    "Pavilion 360 is a registered Real Estate Regulatory Authority (RERA) compliant advisory firm. All project details, pricing, floor plans, and amenities are subject to developer specifications.",
  meta_title: "Pavilion 360 | India's Premier Luxury Real Estate Advisory",
  meta_description:
    "Discover India's and Dubai's most prestigious luxury apartments, villas, and penthouses. Transparent consultation, verified RERA documentation, and exclusive pricing.",
};

interface SettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiService.adminSettings.getPublicSiteInfo();
      if (res && res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (err) {
      console.warn("Failed to load website settings from API, using fallback defaults:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen for custom settings update events triggered by admin actions
    const handleSettingsUpdated = () => {
      fetchSettings();
    };

    window.addEventListener("pavilion_settings_updated", handleSettingsUpdated);
    return () => {
      window.removeEventListener("pavilion_settings_updated", handleSettingsUpdated);
    };
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
