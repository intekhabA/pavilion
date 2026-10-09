"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Banknote,
  Sparkles,
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  Loader2,
  ExternalLink,
  Star,
  AlertCircle,
} from "lucide-react";
import { apiService } from "@/services/api";
import {
  Country,
  State,
  City,
  Locality,
  Amenity,
  PropertyType,
  ProjectDetail,
  ProjectConfiguration,
} from "@/types";

interface Props {
  initialData?: ProjectDetail | null;
  isEdit?: boolean;
}

export default function ProjectFormTabs({ initialData, isEdit = false }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    developer_name: initialData?.developer_name || "",
    project_type: initialData?.project_type || "Residential",
    property_type_id: initialData?.property_type_id || 1,
    status: initialData?.status || "draft",
    construction_status: initialData?.construction_status || "Under Construction",
    featured: initialData?.featured || false,
    display_order: initialData?.display_order || 0,
    short_description: initialData?.short_description || "",
    full_description: initialData?.full_description || "",

    // Location
    country_id: initialData?.country_id || 1,
    state_id: initialData?.state_id || 1,
    city_id: initialData?.city_id || 1,
    locality_id: initialData?.locality_id || 1,
    address: initialData?.address || "",
    pincode: initialData?.pincode || "",
    google_maps_url: initialData?.google_maps_url || "",

    // Pricing & Specs
    min_price: initialData?.min_price || 0,
    max_price: initialData?.max_price || 0,
    currency: initialData?.currency || "INR",
    price_label: initialData?.price_label || "",
    area_from: initialData?.area_from || 0,
    area_to: initialData?.area_to || 0,
    area_unit: initialData?.area_unit || "sq.ft",
    bedrooms_summary: initialData?.bedrooms_summary || "",
    parking: initialData?.parking || "2 Covered Stalls",
    total_floors: initialData?.total_floors || 30,
    total_units: initialData?.total_units || 250,
    total_towers: initialData?.total_towers || 4,
    total_area_acres: initialData?.total_area_acres || 10,
    rera_number: initialData?.rera_number || "",
    possession_date: initialData?.possession_date || "",
    launch_date: initialData?.launch_date || "",

    // SEO
    seo_title: initialData?.seo_title || "",
    meta_description: initialData?.meta_description || "",
    canonical_url: initialData?.canonical_url || "",
    og_image: initialData?.og_image || "",
    is_indexable: initialData?.is_indexable ?? true,
  });

  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    initialData?.amenities?.map((a) => a.id) || []
  );

  // Configurations list
  const [configurations, setConfigurations] = useState<ProjectConfiguration[]>(
    initialData?.configurations || []
  );

  // New config draft
  const [newConfig, setNewConfig] = useState({
    name: "",
    bhk_type: "3 BHK",
    super_area: 2100,
    carpet_area: 1650,
    area_unit: "sq.ft",
    price: 25000000,
    price_label: "₹ 2.50 Cr",
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    availability_status: "Available",
  });

  // Options
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  // Video
  const [youtubeUrl, setYoutubeUrl] = useState(
    initialData?.videos?.find((v) => v.video_type === "youtube")?.video_url || ""
  );

  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docTitle, setDocTitle] = useState("Official Brochure");

  // Load dropdown options
  useEffect(() => {
    async function loadOptions() {
      try {
        const [cRes, stRes, ctRes, locRes, amRes, ptRes] = await Promise.all([
          apiService.adminLocations.getCountries(),
          apiService.adminLocations.getStates(),
          apiService.adminLocations.getCities(),
          apiService.adminLocations.getLocalities(),
          apiService.adminAmenities.getAmenities(),
          apiService.adminAmenities.getPropertyTypes(),
        ]);
        if (cRes.success) setCountries(cRes.data);
        if (stRes.success) setStates(stRes.data);
        if (ctRes.success) setCities(ctRes.data);
        if (locRes.success) setLocalities(locRes.data);
        if (amRes.success) setAmenities(amRes.data);
        if (ptRes.success) setPropertyTypes(ptRes.data);
      } catch (e) {}
    }
    loadOptions();
  }, []);

  const handleSaveProject = async (overrideStatus?: string) => {
    if (!formData.name || formData.name.trim().length < 2) {
      setErrorMsg("Project Title is required (minimum 2 characters).");
      return;
    }
    if (!formData.developer_name || formData.developer_name.trim().length < 2) {
      setErrorMsg("Developer / Builder Name is required (minimum 2 characters).");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      ...formData,
      status: overrideStatus || formData.status,
      amenity_ids: selectedAmenities,
      possession_date: formData.possession_date?.trim() ? formData.possession_date.trim() : null,
      launch_date: formData.launch_date?.trim() ? formData.launch_date.trim() : null,
      slug: formData.slug?.trim() || null,
      locality_id: formData.locality_id ? Number(formData.locality_id) : null,
      property_type_id: formData.property_type_id ? Number(formData.property_type_id) : null,
      country_id: Number(formData.country_id) || 1,
      state_id: Number(formData.state_id) || 1,
      city_id: Number(formData.city_id) || 1,
      min_price: formData.min_price ? Number(formData.min_price) : null,
      max_price: formData.max_price ? Number(formData.max_price) : null,
      area_from: formData.area_from ? Number(formData.area_from) : null,
      area_to: formData.area_to ? Number(formData.area_to) : null,
      total_area_acres: formData.total_area_acres ? Number(formData.total_area_acres) : null,
      total_floors: formData.total_floors ? Number(formData.total_floors) : null,
      total_units: formData.total_units ? Number(formData.total_units) : null,
      total_towers: formData.total_towers ? Number(formData.total_towers) : null,
    };

    try {
      if (isEdit && initialData?.id) {
        const res = await apiService.adminProjects.update(initialData.id, payload);
        if (res.success) {
          setSuccessMsg("Project updated successfully!");
        }
      } else {
        const createPayload = {
          ...payload,
          configurations: configurations.map((c) => ({
            name: c.name,
            bhk_type: c.bhk_type,
            super_area: c.super_area ? Number(c.super_area) : null,
            carpet_area: c.carpet_area ? Number(c.carpet_area) : null,
            area_unit: c.area_unit,
            price: c.price ? Number(c.price) : null,
            price_label: c.price_label,
            bedrooms: c.bedrooms ? Number(c.bedrooms) : 1,
            bathrooms: c.bathrooms ? Number(c.bathrooms) : 1,
            balconies: c.balconies ? Number(c.balconies) : 1,
            availability_status: c.availability_status,
          })),
          videos: youtubeUrl
            ? [
                {
                  video_type: "youtube" as const,
                  video_url: youtubeUrl,
                  title: `${formData.name} Video Tour`,
                },
              ]
            : [],
        };
        const res = await apiService.adminProjects.create(createPayload);
        if (res.success) {
          setSuccessMsg("Project created successfully!");
          router.push(`/admin/projects/${res.data.id}/edit`);
        }
      }
    } catch (err: any) {
      console.error("Save project error:", err.response?.data || err);
      const resp = err.response?.data;
      if (resp?.data?.errors && Array.isArray(resp.data.errors) && resp.data.errors.length > 0) {
        const errorList = resp.data.errors
          .map((e: any) => `${e.field ? e.field.replace(/^body\s*->\s*/, "") + ": " : ""}${e.message}`)
          .join(", ");
        setErrorMsg(errorList);
      } else if (Array.isArray(resp?.detail)) {
        const errorList = resp.detail
          .map((e: any) => `${e.loc ? e.loc.slice(-1)[0] + ": " : ""}${e.msg}`)
          .join(", ");
        setErrorMsg(errorList);
      } else if (typeof resp?.detail === "string") {
        setErrorMsg(resp.detail);
      } else {
        setErrorMsg(resp?.message || "Failed to save project.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!initialData?.id) {
      alert("Please save the basic project information first before uploading gallery images.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt_text", formData.name);
    fd.append("is_primary", "false");

    try {
      await apiService.adminProjects.uploadMedia(initialData.id, fd);
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!initialData?.id) {
      alert("Please save the basic project information first before uploading documents.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", docTitle);
    fd.append("doc_type", "brochure");

    try {
      await apiService.adminProjects.uploadDocument(initialData.id, fd);
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Document upload failed.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const tabs = [
    { id: 1, name: "1. Basic Info", icon: Building2 },
    { id: 2, name: "2. Location", icon: MapPin },
    { id: 3, name: "3. Pricing & Specs", icon: Banknote },
    { id: 4, name: "4. Amenities", icon: Sparkles },
    { id: 5, name: "5. Media Gallery", icon: ImageIcon },
    { id: 6, name: "6. Video Walkthrough", icon: Video },
    { id: 7, name: "7. Documents", icon: FileText },
    { id: 8, name: "8. SEO Metadata", icon: Search },
    { id: 9, name: "9. Publish & Live", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/50 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Header Strip */}
      <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-serif text-white mb-4 border-b border-slate-800 pb-2">
              Tab 1: Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLF The Camellias Luxury Residences"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Slug (optional, auto-generated if blank)
                </label>
                <input
                  type="text"
                  placeholder="e.g. dlf-the-camellias-luxury-residences"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Developer / Builder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLF Limited"
                  value={formData.developer_name}
                  onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Property Type
                </label>
                <select
                  value={formData.property_type_id}
                  onChange={(e) => setFormData({ ...formData, property_type_id: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {propertyTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Construction Status
                </label>
                <select
                  value={formData.construction_status}
                  onChange={(e) => setFormData({ ...formData, construction_status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="New Launch">New Launch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Featured Showcase
                </label>
                <label className="flex items-center gap-2 mt-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span>Display on Homepage Featured Carousel</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Highlight Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief one-line summary for cards and search snippets..."
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Architectural Description
              </label>
              <textarea
                rows={5}
                placeholder="Detailed project description, architectural highlights, materials used, etc..."
                value={formData.full_description}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* TAB 2: LOCATION */}
        {activeTab === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-serif text-white mb-4 border-b border-slate-800 pb-2">
              Tab 2: Hierarchical Location Management
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                <select
                  value={formData.country_id}
                  onChange={(e) => setFormData({ ...formData, country_id: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State / Province</label>
                <select
                  value={formData.state_id}
                  onChange={(e) => setFormData({ ...formData, state_id: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                <select
                  value={formData.city_id}
                  onChange={(e) => setFormData({ ...formData, city_id: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {cities.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Locality</label>
                <select
                  value={formData.locality_id}
                  onChange={(e) => setFormData({ ...formData, locality_id: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {localities.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Complete Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 42, Golf Course Road, DLF Phase 5"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode / ZIP</label>
                <input
                  type="text"
                  placeholder="e.g. 122002"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Google Maps Embed URL</label>
              <input
                type="text"
                placeholder="https://maps.google.com/..."
                value={formData.google_maps_url}
                onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* TAB 3: PRICING & CONFIGURATIONS */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif text-white mb-4 border-b border-slate-800 pb-2">
              Tab 3: Pricing, Specifications & Configurations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Starting Price (Min)</label>
                <input
                  type="number"
                  placeholder="15000000"
                  value={formData.min_price}
                  onChange={(e) => setFormData({ ...formData, min_price: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="50000000"
                  value={formData.max_price}
                  onChange={(e) => setFormData({ ...formData, max_price: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price Display Label</label>
                <input
                  type="text"
                  placeholder="₹ 1.85 Cr - 5.40 Cr"
                  value={formData.price_label}
                  onChange={(e) => setFormData({ ...formData, price_label: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Area From (sq.ft)</label>
                <input
                  type="number"
                  placeholder="1800"
                  value={formData.area_from}
                  onChange={(e) => setFormData({ ...formData, area_from: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Area To (sq.ft)</label>
                <input
                  type="number"
                  placeholder="4200"
                  value={formData.area_to}
                  onChange={(e) => setFormData({ ...formData, area_to: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bedrooms Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 2, 3, 4 BHK"
                  value={formData.bedrooms_summary}
                  onChange={(e) => setFormData({ ...formData, bedrooms_summary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official RERA Number *</label>
                <input
                  type="text"
                  placeholder="e.g. UPRERAPRJ704730"
                  value={formData.rera_number}
                  onChange={(e) => setFormData({ ...formData, rera_number: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Acres</label>
                <input
                  type="number"
                  placeholder="12.5"
                  value={formData.total_area_acres}
                  onChange={(e) => setFormData({ ...formData, total_area_acres: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Towers</label>
                <input
                  type="number"
                  placeholder="6"
                  value={formData.total_towers}
                  onChange={(e) => setFormData({ ...formData, total_towers: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Configurations Builder */}
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white mb-3">Unit Configurations (BHK)</h4>
              <div className="space-y-3 mb-4">
                {configurations.map((cfg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-400 mr-2">{cfg.bhk_type}</span>
                      <span className="text-white">{cfg.name}</span>
                      <span className="text-slate-400 ml-3">
                        ({cfg.super_area} {cfg.area_unit}) • {cfg.price_label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfigurations(configurations.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Configuration Mini-Form */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Unit Title (e.g. 3 BHK Elite)"
                  value={newConfig.name}
                  onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={newConfig.bhk_type}
                  onChange={(e) => setNewConfig({ ...newConfig, bhk_type: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
                <input
                  type="text"
                  placeholder="Price Label (e.g. ₹ 2.50 Cr)"
                  value={newConfig.price_label}
                  onChange={(e) => setNewConfig({ ...newConfig, price_label: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newConfig.name) return;
                    setConfigurations([...configurations, newConfig]);
                    setNewConfig({ ...newConfig, name: "" });
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs py-1.5 rounded-lg border border-slate-700"
                >
                  + Add Unit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AMENITIES */}
        {activeTab === 4 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-serif text-white mb-2 border-b border-slate-800 pb-2">
              Tab 4: Project Amenities
            </h3>
            <p className="text-xs text-slate-400 mb-6">Select all luxury amenities available at this project:</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenities.map((a) => {
                const isChecked = selectedAmenities.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAmenities([...selectedAmenities, a.id]);
                        } else {
                          setSelectedAmenities(selectedAmenities.filter((id) => id !== a.id));
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500"
                    />
                    <span className="text-xs font-medium">{a.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: MEDIA */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif text-white mb-2 border-b border-slate-800 pb-2">
              Tab 5: Media Gallery & Cover Photos
            </h3>

            {isEdit && initialData?.id ? (
              <div>
                {/* Upload Action */}
                <div className="p-6 bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 text-center mb-8">
                  <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-semibold mb-1">Upload New Property Image</p>
                  <p className="text-[11px] text-slate-500 mb-4">Supports WebP, JPEG, PNG up to 10MB</p>
                  <label className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{uploadingImage ? "Processing Image..." : "Select File"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {/* Existing Images */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {initialData.media?.map((m) => (
                    <div
                      key={m.id}
                      className="relative h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group"
                    >
                      <Image src={m.file_url} alt={m.alt_text || "img"} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {m.id && (
                          <button
                            onClick={async () => {
                              await apiService.adminProjects.deleteMedia(m.id!);
                              window.location.reload();
                            }}
                            className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {m.is_primary && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                <ImageIcon className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-300">
                  Please save the basic project record first (Tab 9) before uploading media files.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: VIDEO */}
        {activeTab === 6 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-serif text-white mb-2 border-b border-slate-800 pb-2">
              Tab 6: Video Walkthrough
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter a YouTube property walkthrough link. Validates format and displays live embed player.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                YouTube Property Walkthrough URL
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {youtubeUrl && (
              <div className="pt-4">
                <p className="text-xs text-amber-400 font-semibold mb-2">Live Video Preview</p>
                <div className="aspect-video max-w-xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <iframe
                    src={youtubeUrl.replace("watch?v=", "embed/")}
                    title="YouTube preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DOCUMENTS */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif text-white mb-2 border-b border-slate-800 pb-2">
              Tab 7: Project Documents (Brochure / Plans)
            </h3>

            {isEdit && initialData?.id ? (
              <div>
                <div className="p-6 bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 text-center mb-6 max-w-lg">
                  <FileText className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-semibold mb-2">Upload Project PDF Document</p>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document Title (e.g. Master Plan)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white mb-3"
                  />
                  <label className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">
                    {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{uploadingDoc ? "Uploading Document..." : "Select PDF Document"}</span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} className="hidden" />
                  </label>
                </div>

                {/* Existing Documents */}
                <div className="space-y-3">
                  {initialData.documents?.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-white">{d.title}</span>
                      </div>
                      <button
                        onClick={async () => {
                          if (d.id) {
                            await apiService.adminProjects.deleteDocument(d.id);
                            window.location.reload();
                          }
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Save the project record first to attach documents.</p>
            )}
          </div>
        )}

        {/* TAB 8: SEO */}
        {activeTab === 8 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-serif text-white mb-4 border-b border-slate-800 pb-2">
              Tab 8: Search Engine Optimization (SEO)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom SEO Meta Title (Max 60 chars)
              </label>
              <input
                type="text"
                placeholder="e.g. DLF The Camellias Golf Course Road | Super Luxury Residences"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meta Description (Max 160 chars)
              </label>
              <textarea
                rows={3}
                placeholder="Meta description for Google search snippet..."
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Canonical URL</label>
              <input
                type="text"
                placeholder="https://pavilionrealty.com/projects/..."
                value={formData.canonical_url}
                onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Google SERP Preview Box */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 font-semibold mb-2">Google Search Snippet Preview:</p>
              <div className="p-4 bg-white rounded-xl border border-slate-300 max-w-xl text-left">
                <p className="text-xs text-slate-600 font-mono">
                  https://pavilionrealty.com › projects › {formData.slug || "project-slug"}
                </p>
                <h4 className="text-base text-blue-800 font-medium hover:underline cursor-pointer line-clamp-1 mt-0.5">
                  {formData.seo_title || formData.name || "Project Title"}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 font-sans">
                  {formData.meta_description || formData.short_description || "Property description snippet displayed to search engines..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PUBLISH & VISIBILITY */}
        {activeTab === 9 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif text-white mb-4 border-b border-slate-800 pb-2">
              Tab 9: Publish & Final Visibility
            </h3>

            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 max-w-md space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                >
                  <option value="draft">Draft (Hidden from Public)</option>
                  <option value="published">Published (Live on Public Website)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveProject()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold py-3 px-8 rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
                <span>Save & Commit Project</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/projects")}
                className="py-3 px-6 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Return to Projects List
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons across tabs */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={activeTab === 1}
            onClick={() => setActiveTab((t) => Math.max(t - 1, 1))}
            className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-700 text-xs disabled:opacity-30"
          >
            ← Previous Tab
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveProject()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Quick Save</span>
            </button>
            {activeTab < 9 && (
              <button
                type="button"
                onClick={() => setActiveTab((t) => Math.min(t + 1, 9))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs"
              >
                Next Tab →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
