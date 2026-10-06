"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, SlidersHorizontal, RefreshCw, Building2, Loader2 } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { apiService } from "@/services/api";
import { ProjectCard as ProjectCardType, City, PropertyType } from "@/types";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [cityId, setCityId] = useState(searchParams.get("city_id") || "");
  const [propertyTypeId, setPropertyTypeId] = useState(searchParams.get("property_type_id") || "");
  const [bhk, setBhk] = useState(searchParams.get("bhk") || "");
  const [status, setStatus] = useState(searchParams.get("construction_status") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "created_at");

  // Options
  const [cities, setCities] = useState<City[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [cRes, ptRes] = await Promise.all([
          apiService.publicLocations.getCities(),
          apiService.publicLocations.getPropertyTypes(),
        ]);
        if (cRes.success) setCities(cRes.data);
        if (ptRes.success) setPropertyTypes(ptRes.data);
      } catch (e) {}
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          page_size: 9,
          sort_by: sortBy,
        };
        if (q) params.q = q;
        if (cityId) params.country_id = undefined, params.city_id = Number(cityId);
        if (propertyTypeId) params.property_type_id = Number(propertyTypeId);
        if (bhk) params.bhk = bhk;
        if (status) params.construction_status = status;

        const res = await apiService.publicProjects.getProjects(params);
        if (res.success) {
          setProjects(res.data.items);
          setTotal(res.data.total);
          setTotalPages(res.data.total_pages);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [currentPage, cityId, propertyTypeId, bhk, status, sortBy, q]);

  const handleResetFilters = () => {
    setQ("");
    setCityId("");
    setPropertyTypeId("");
    setBhk("");
    setStatus("");
    setSortBy("created_at");
    setCurrentPage(1);
    router.push("/projects");
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
            Verified Property Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight mt-1">
            Luxury Real Estate Portfolio
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Showing {total} verified residential and commercial developments
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search project or builder..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <select
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <select
                value={propertyTypeId}
                onChange={(e) => {
                  setPropertyTypeId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">All Property Types</option>
                {propertyTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BHK Filter */}
            <div>
              <select
                value={bhk}
                onChange={(e) => {
                  setBhk(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Any BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="5">5+ BHK / Penthouse</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="created_at">Latest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              <button
                onClick={handleResetFilters}
                title="Reset Filters"
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === pg
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 font-serif">No properties match your search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your filters or search keywords to explore other luxury inventory.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-28">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
