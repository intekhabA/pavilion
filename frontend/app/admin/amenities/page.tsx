"use client";

import { useEffect, useState } from "react";
import { Sparkles, Building, Plus, Trash2 } from "lucide-react";
import { apiService } from "@/services/api";
import { Amenity, PropertyType } from "@/types";

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [newAmenityCat, setNewAmenityCat] = useState("Leisure");
  const [newPtName, setNewPtName] = useState("");

  const loadData = async () => {
    try {
      const [aRes, ptRes] = await Promise.all([
        apiService.adminAmenities.getAmenities(),
        apiService.adminAmenities.getPropertyTypes(),
      ]);
      if (aRes.success) setAmenities(aRes.data);
      if (ptRes.success) setPropertyTypes(ptRes.data);
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenityName) return;
    try {
      await apiService.adminAmenities.createAmenity({
        name: newAmenityName,
        category: newAmenityCat,
      });
      setNewAmenityName("");
      loadData();
    } catch (e) {
      alert("Failed to add amenity.");
    }
  };

  const handleCreatePt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtName) return;
    try {
      await apiService.adminAmenities.createPropertyType({
        name: newPtName,
      });
      setNewPtName("");
      loadData();
    } catch (e) {
      alert("Failed to add property type.");
    }
  };

  return (
    <div className="space-y-10">
      {/* Amenities Section */}
      <div>
        <div className="pb-2 border-b border-slate-800 mb-6">
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Project Amenities & Features
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global catalog of lifestyle amenities assigned to real estate projects.
          </p>
        </div>

        {/* Add Amenity Form */}
        <form onSubmit={handleCreateAmenity} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-2xl">
          <input
            type="text"
            required
            placeholder="Amenity Name (e.g. Heated Swimming Pool)..."
            value={newAmenityName}
            onChange={(e) => setNewAmenityName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
          />
          <select
            value={newAmenityCat}
            onChange={(e) => setNewAmenityCat(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
          >
            <option value="Leisure">Leisure & Wellness</option>
            <option value="Sports">Sports & Fitness</option>
            <option value="Safety">Safety & Security</option>
            <option value="Convenience">Convenience & Tech</option>
            <option value="Eco">Eco & Greenery</option>
          </select>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Amenity</span>
          </button>
        </form>

        {/* Amenities List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenities.map((a) => (
            <div
              key={a.id}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-white">{a.name}</p>
                <p className="text-[10px] text-amber-400">{a.category}</p>
              </div>
              <button
                onClick={async () => {
                  if (confirm(`Delete ${a.name}?`)) {
                    await apiService.adminAmenities.deleteAmenity(a.id);
                    loadData();
                  }
                }}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Property Types Section */}
      <div className="pt-8 border-t border-slate-800">
        <div className="pb-2 border-b border-slate-800 mb-6">
          <h2 className="text-xl font-bold font-serif text-white tracking-tight">
            Property Portfolios & Categories
          </h2>
          <p className="text-xs text-slate-400 mt-1">Classification types for listings and search filters.</p>
        </div>

        <form onSubmit={handleCreatePt} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex gap-3 mb-6 max-w-lg">
          <input
            type="text"
            required
            placeholder="Property Category (e.g. Duplex Mansions)..."
            value={newPtName}
            onChange={(e) => setNewPtName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {propertyTypes.map((pt) => (
            <div
              key={pt.id}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
            >
              <p className="text-xs font-semibold text-white">{pt.name}</p>
              <button
                onClick={async () => {
                  if (confirm(`Delete ${pt.name}?`)) {
                    await apiService.adminAmenities.deletePropertyType(pt.id);
                    loadData();
                  }
                }}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
