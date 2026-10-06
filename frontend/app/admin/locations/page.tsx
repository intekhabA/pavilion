"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Globe, Building, CheckCircle2 } from "lucide-react";
import { apiService } from "@/services/api";
import { Country, State, City, Locality } from "@/types";

export default function AdminLocationsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [activeTab, setActiveTab] = useState<"cities" | "localities" | "states" | "countries">("cities");

  // New city form
  const [newCityName, setNewCityName] = useState("");
  const [newCityStateId, setNewCityStateId] = useState(1);
  const [isFeaturedCity, setIsFeaturedCity] = useState(true);

  // New locality form
  const [newLocName, setNewLocName] = useState("");
  const [newLocCityId, setNewLocCityId] = useState(1);
  const [newLocPin, setNewLocPin] = useState("");

  const loadData = async () => {
    try {
      const [cRes, sRes, ctRes, lRes] = await Promise.all([
        apiService.adminLocations.getCountries(),
        apiService.adminLocations.getStates(),
        apiService.adminLocations.getCities(),
        apiService.adminLocations.getLocalities(),
      ]);
      if (cRes.success) setCountries(cRes.data);
      if (sRes.success) setStates(sRes.data);
      if (ctRes.success) setCities(ctRes.data);
      if (lRes.success) setLocalities(lRes.data);
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName) return;
    try {
      await apiService.adminLocations.createCity({
        name: newCityName,
        state_id: newCityStateId,
        is_featured: isFeaturedCity,
      });
      setNewCityName("");
      loadData();
    } catch (err) {
      alert("Failed to create city.");
    }
  };

  const handleCreateLocality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName) return;
    try {
      await apiService.adminLocations.createLocality({
        name: newLocName,
        city_id: newLocCityId,
        pincode: newLocPin,
        is_popular: true,
      });
      setNewLocName("");
      setNewLocPin("");
      loadData();
    } catch (err) {
      alert("Failed to create locality.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
          Hierarchical Location Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage Countries → States → Cities → Localities for real estate project tagging.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {(["cities", "localities", "states", "countries"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
              activeTab === t
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CITIES TAB */}
      {activeTab === "cities" && (
        <div className="space-y-6">
          {/* Add City Card */}
          <form onSubmit={handleCreateCity} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="City Name (e.g. Pune, Hyderabad)..."
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <select
              value={newCityStateId}
              onChange={(e) => setNewCityStateId(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isFeaturedCity}
                onChange={(e) => setIsFeaturedCity(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500"
              />
              <span>Featured on Homepage</span>
            </label>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add City</span>
            </button>
          </form>

          {/* Cities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <div
                key={city.id}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{city.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Slug: {city.slug}</p>
                  {city.is_featured && (
                    <span className="inline-block mt-1 text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (confirm(`Delete city ${city.name}?`)) {
                      await apiService.adminLocations.deleteCity(city.id);
                      loadData();
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOCALITIES TAB */}
      {activeTab === "localities" && (
        <div className="space-y-6">
          <form onSubmit={handleCreateLocality} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="Locality Name (e.g. Cyber City)..."
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <select
              value={newLocCityId}
              onChange={(e) => setNewLocCityId(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Pincode (e.g. 122002)"
              value={newLocPin}
              onChange={(e) => setNewLocPin(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Locality</span>
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localities.map((loc) => (
              <div
                key={loc.id}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{loc.name}</h4>
                  <p className="text-[10px] text-slate-400">PIN: {loc.pincode || "N/A"}</p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm(`Delete locality ${loc.name}?`)) {
                      await apiService.adminLocations.deleteLocality(loc.id);
                      loadData();
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATES TAB */}
      {activeTab === "states" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((st) => (
            <div key={st.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{st.name}</h4>
                <p className="text-[10px] text-slate-400">Code: {st.code || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COUNTRIES TAB */}
      {activeTab === "countries" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((c) => (
            <div key={c.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{c.name}</h4>
                <p className="text-[10px] text-slate-400">
                  {c.code} • {c.currency_code} ({c.currency_symbol}) • {c.phone_code}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
