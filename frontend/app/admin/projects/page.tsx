"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { apiService } from "@/services/api";
import { ProjectCard } from "@/types";
import { formatPrice } from "@/utils/format";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiService.adminProjects.list({
        page: currentPage,
        page_size: 15,
        q: searchQuery,
        status: statusFilter || undefined,
      });
      if (res.success) {
        setProjects(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  const handleTogglePublish = async (project: ProjectCard) => {
    setActionLoading(true);
    try {
      if (project.status === "published") {
        await apiService.adminProjects.unpublish(project.id);
      } else {
        await apiService.adminProjects.publish(project.id);
      }
      fetchProjects();
    } catch (err) {
      alert("Failed to update project status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (projectId: number) => {
    setActionLoading(true);
    try {
      await apiService.adminProjects.duplicate(projectId);
      fetchProjects();
    } catch (err) {
      alert("Failed to duplicate project.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setActionLoading(true);
    try {
      await apiService.adminProjects.delete(deleteModalId);
      setDeleteModalId(null);
      fetchProjects();
    } catch (err) {
      alert("Failed to delete project.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Real Estate Projects CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage listings, draft developments, specifications, and media assets ({total} total).
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects, builders, RERA ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Developer</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Price Range</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <span>Loading real estate listings...</span>
                  </td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Project Name & Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-800 relative flex-shrink-0">
                          {p.primary_image_url ? (
                            <img
                              src={p.primary_image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/projects/${p.id}/edit`}
                            className="font-bold text-white hover:text-amber-400 transition-colors block line-clamp-1"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Slug: {p.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Developer */}
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {p.developer_name}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-medium">{p.city_name}</p>
                      <p className="text-[10px] text-slate-400">{p.locality_name || "-"}</p>
                    </td>

                    {/* Price Range */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-300">
                      {p.price_label || formatPrice(p.min_price, p.currency)}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          p.status === "published"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Publish/Unpublish */}
                        <button
                          onClick={() => handleTogglePublish(p)}
                          title={p.status === "published" ? "Unpublish (Save as Draft)" : "Publish Live"}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          {p.status === "published" ? (
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          title="Duplicate Project"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* View Public Page */}
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          title="View on Public Portal"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/admin/projects/${p.id}/edit`}
                          title="Edit Project"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteModalId(p.id)}
                          title="Delete Project"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-serif mb-2">Delete Project?</h3>
            <p className="text-xs text-slate-400 mb-6">
              This action cannot be undone. All associated gallery images, floor plans, and documents will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-xs text-white font-bold hover:bg-rose-700"
              >
                {actionLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
