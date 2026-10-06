"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Plus,
  Loader2,
  X,
  Phone,
  Mail,
  Calendar,
  Globe,
} from "lucide-react";
import { apiService } from "@/services/api";
import { Enquiry } from "@/types";
import { formatDate } from "@/utils/format";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Enquiry | null>(null);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await apiService.adminEnquiries.list({
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      });
      if (res.success) {
        setLeads(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await apiService.adminEnquiries.updateStatus(leadId, newStatus);
      fetchLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus as any });
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNote.trim()) return;

    setSubmittingNote(true);
    try {
      await apiService.adminEnquiries.addNote(selectedLead.id, newNote);
      setNewNote("");
      // Refresh lead details
      const updated = leads.find((l) => l.id === selectedLead.id);
      fetchLeads();
    } catch (err) {
      alert("Failed to add note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  const statuses = ["All", "New", "Contacted", "Qualified", "Follow-up", "Converted", "Closed", "Spam"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Leads & Inquiries CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track buyer interactions, schedule site tours, and record deal progression ({total} inquiries).
          </p>
        </div>

        <button
          onClick={() => apiService.adminEnquiries.downloadExportCsv({ status: statusFilter || undefined }, `leads_${statusFilter || "all"}.csv`)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors w-fit cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statuses.map((st) => {
          const isSelected = (st === "All" && !statusFilter) || statusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st === "All" ? "" : st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                  : "bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800"
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Preferences</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <span>Loading CRM pipeline...</span>
                  </td>
                </tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {lead.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-200">{lead.phone}</p>
                      <p className="text-[10px] text-slate-400">{lead.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-medium">
                      {lead.project_name || "General Portal Inquiry"}
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.preferred_bhk || lead.budget_range ? (
                        <span>
                          {lead.preferred_bhk} • {lead.budget_range}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2.5 py-1 border focus:outline-none ${
                          lead.status === "New"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : lead.status === "Converted"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-900 text-slate-300 border-slate-700"
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                        <option value="Spam">Spam</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        View Card
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No leads found matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <span className="text-[10px] font-mono text-amber-400">Ref: {selectedLead.uuid.slice(0, 8)}</span>
                <h3 className="text-lg font-bold font-serif text-white">{selectedLead.name}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedLead.country || "India"}</span>
                </div>
              </div>

              {selectedLead.message && (
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Message Requirements</p>
                  <p className="text-slate-200 leading-relaxed">{selectedLead.message}</p>
                </div>
              )}

              {/* CRM Activity Notes */}
              <div className="pt-2">
                <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Interaction Log & Notes</span>
                </h4>

                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.map((n) => (
                      <div key={n.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                        <p className="text-slate-200">{n.note}</p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {n.user_name || "Staff"} • {formatDate(n.created_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-[11px]">No notes logged yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Add follow-up notes (e.g. called buyer, site tour booked)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={submittingNote}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1"
                  >
                    {submittingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
