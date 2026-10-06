"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileSpreadsheet,
  Users2,
  TrendingUp,
  PlusCircle,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  ArrowUpRight,
  Server,
} from "lucide-react";
import { apiService } from "@/services/api";
import { DashboardStats } from "@/types";
import { formatDate } from "@/utils/format";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiService.adminDashboard.getStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Executive CMS Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, lead pipeline, and real estate inventory management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/new"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Project</span>
          </Link>
          <a
            href={apiService.adminEnquiries.getExportUrl()}
            target="_blank"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Leads</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Total Projects</span>
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-serif">{stats.total_projects}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{stats.published_projects} Published</span>
            <span>•</span>
            <span className="text-slate-400">{stats.draft_projects} Draft</span>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Total Inquiries / Leads</span>
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-serif">{stats.total_enquiries}</p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="text-amber-400 font-semibold">{stats.new_enquiries} New Action Items</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{stats.converted_enquiries} Converted</span>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Featured Luxury Units</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-white font-serif">{stats.featured_projects}</p>
          <p className="text-xs text-slate-400 mt-3">Promoted on homepage showcase</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>System & Cache Health</span>
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xl font-bold text-emerald-400 capitalize">
              {stats.system_health.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-mono">
            Cache: {stats.system_health.redis_cache} • DB: {stats.system_health.database}
          </p>
        </div>
      </div>

      {/* Charts & Analytics Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Enquiries Distribution */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
          <h3 className="text-base font-bold font-serif text-white mb-1">
            Buyer Lead Acquisition Trend
          </h3>
          <p className="text-xs text-slate-400 mb-6">Enquiries received across recent months</p>

          <div className="flex items-end justify-between gap-4 h-48 pt-6 px-2">
            {stats.enquiries_by_month.map((m, idx) => {
              const maxVal = Math.max(...stats.enquiries_by_month.map((x) => x.value), 1);
              const heightPct = Math.max((m.value / maxVal) * 100, 15);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">{m.value}</span>
                  <div className="w-full bg-slate-900 rounded-t-lg h-36 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects By City Breakdown */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
          <h3 className="text-base font-bold font-serif text-white mb-1">
            Inventory Distribution by City
          </h3>
          <p className="text-xs text-slate-400 mb-6">Active developments indexed across top markets</p>

          <div className="space-y-4">
            {stats.projects_by_city.map((c, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-200">{c.label}</span>
                  <span className="text-amber-400 font-mono">{c.value} projects</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min((c.value / (stats.total_projects || 1)) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Enquiries CRM Table */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold font-serif text-white">Recent Buyer Enquiries</h3>
            <p className="text-xs text-slate-400">Latest prospective client leads captured</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Target Project</th>
                <th className="py-3 px-4">Budget / BHK</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {stats.recent_enquiries.slice(0, 5).map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 text-slate-400">{formatDate(e.created_at)}</td>
                  <td className="py-3 px-4 font-semibold text-white">{e.name}</td>
                  <td className="py-3 px-4">
                    <p>{e.phone}</p>
                    <p className="text-[10px] text-slate-400">{e.email}</p>
                  </td>
                  <td className="py-3 px-4 text-amber-300">{e.project_name || "General Inquiry"}</td>
                  <td className="py-3 px-4">{e.preferred_bhk || e.budget_range || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        e.status === "New"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : e.status === "Converted"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
