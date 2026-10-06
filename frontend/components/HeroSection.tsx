"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, Banknote, BedDouble, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [cityId, setCityId] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("");
  const [budget, setBudget] = useState("");
  const [bhk, setBhk] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (cityId) params.append("city_id", cityId);
    if (propertyTypeId) params.append("property_type_id", propertyTypeId);
    if (bhk) params.append("bhk", bhk);

    if (budget === "under_2cr") {
      params.append("max_price", "20000000");
    } else if (budget === "2cr_5cr") {
      params.append("min_price", "20000000");
      params.append("max_price", "50000000");
    } else if (budget === "5cr_15cr") {
      params.append("min_price", "50000000");
      params.append("max_price", "150000000");
    } else if (budget === "above_15cr") {
      params.append("min_price", "150000000");
    }

    router.push(`/projects?${params.toString()}`);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
      {/* Background Image with Cinematic Luxury Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform animate-pulse duration-[10000ms]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0,transparent_70%)]" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md shadow-lg shadow-amber-500/10">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>India & Dubai's Verified Luxury Property Portal</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight leading-tight mb-6">
          Find Your Sanctuary Among <br className="hidden sm:inline" />
          <span className="gold-gradient-text">World-Class Residences</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Curated portfolio of prime apartments, sky penthouses, and gated private estates.
          Direct developer pricing, certified RERA documentation, and end-to-end bespoke advisory.
        </p>

        {/* High-Conversion Search Box (Investors Clinic Style) */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-2xl shadow-black/80 max-w-4xl mx-auto text-left">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> City / Location
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="">All Cities</option>
                <option value="2">Gurgaon (Golf Course Rd)</option>
                <option value="1">Noida (Expressway)</option>
                <option value="3">Mumbai (Worli / South)</option>
                <option value="4">Bengaluru (Central)</option>
                <option value="5">Dubai (Waterfront)</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" /> Property Type
              </label>
              <select
                value={propertyTypeId}
                onChange={(e) => setPropertyTypeId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="">All Categories</option>
                <option value="1">Luxury Apartments</option>
                <option value="2">Sky Penthouses</option>
                <option value="3">Signature Villas</option>
                <option value="4">Commercial High-Street</option>
              </select>
            </div>

            {/* BHK Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-amber-400" /> Bedrooms / BHK
              </label>
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="">Any BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="5">5+ BHK / Penthouse</option>
                <option value="Villa">Villa / Mansion</option>
              </select>
            </div>

            {/* Budget Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-amber-400" /> Investment Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="">Any Budget</option>
                <option value="under_2cr">Under ₹ 2 Cr</option>
                <option value="2cr_5cr">₹ 2 Cr - 5 Cr</option>
                <option value="5cr_15cr">₹ 5 Cr - 15 Cr</option>
                <option value="above_15cr">Ultra-Luxury (₹ 15 Cr+)</option>
              </select>
            </div>

            {/* CTA Search Submit */}
            <div className="sm:col-span-2 lg:col-span-4 mt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-slate-950 font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-base hover:-translate-y-0.5"
              >
                <Search className="w-5 h-5 text-slate-950" />
                <span>Explore Properties</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Trust & Proof Metrics */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif flex items-center justify-center gap-1">
              <span className="text-amber-400">15,000+</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Verified Units Advised</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif flex items-center justify-center gap-1">
              <span className="text-amber-400">250+</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">RERA Registered Projects</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif flex items-center justify-center gap-1">
              <span className="text-amber-400">₹ 4,500+ Cr</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Transaction Value</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-serif flex items-center justify-center gap-1">
              <span className="text-amber-400">Zero Brokerage</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">On New Developer Units</p>
          </div>
        </div>
      </div>
    </div>
  );
}
