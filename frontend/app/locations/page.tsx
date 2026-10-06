"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building, ArrowRight } from "lucide-react";
import { apiService } from "@/services/api";
import { City } from "@/types";

export default function LocationsPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await apiService.publicLocations.getCities();
        if (res.success) setCities(res.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadCities();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
            City Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 tracking-tight mt-1">
            Explore Strategic Real Estate Markets
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Prime residential and commercial opportunities across high-appreciation urban centers.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/projects?city_id=${city.id}`}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 hover:border-amber-400 transition-all"
              >
                <Image
                  src={city.image_url || "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800"}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold font-serif text-white group-hover:text-amber-400 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>{city.project_count || 4}+ Verified Projects</span>
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <span>Browse Properties</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
