"use client";

import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { WebsiteSetting } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<WebsiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await apiService.adminSettings.getSettings();
      if (res.success) setSettings(res.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSave = async (key: string, value: string) => {
    try {
      await apiService.adminSettings.updateSetting(key, value);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (e) {
      alert("Failed to update setting.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
          Website & Corporate CMS Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure official company branding, contact hotlines, and RERA disclaimers.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Setting updated successfully!</span>
        </div>
      )}

      <div className="space-y-5 max-w-3xl">
        {settings.map((s) => (
          <div key={s.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-xs text-white capitalize font-mono">
                  {s.key.replace(/_/g, " ")}
                </label>
                <p className="text-[11px] text-slate-400">{s.description}</p>
              </div>
              <button
                onClick={() => handleSave(s.key, s.value)}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
            {s.value.length > 80 ? (
              <textarea
                rows={3}
                value={s.value}
                onChange={(e) => handleChange(s.key, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            ) : (
              <input
                type="text"
                value={s.value}
                onChange={(e) => handleChange(s.key, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
