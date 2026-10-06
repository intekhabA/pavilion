"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { apiService } from "@/services/api";

interface Props {
  projectId?: number;
  projectName?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export default function EnquiryForm({ projectId, projectName, onSuccess, compact = false }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India",
    preferred_bhk: "",
    budget_range: "",
    message: "",
    honeypot: "",
  });

  const [loading, setLoading] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage("Please fill in all mandatory fields (Name, Email, Phone).");
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.publicEnquiries.submit({
        project_id: projectId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        preferred_bhk: formData.preferred_bhk,
        budget_range: formData.budget_range,
        message: formData.message,
        source: "website",
        honeypot: formData.honeypot,
      });

      if (res.success) {
        setSuccessRef(res.data.reference_id);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || "Failed to submit enquiry.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "An error occurred while submitting your enquiry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (successRef) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-emerald-900 font-serif mb-1">Enquiry Submitted!</h4>
        <p className="text-xs text-emerald-700 mb-3">
          Thank you. Our senior luxury property consultant will reach out to you within 2 business hours.
        </p>
        <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-xs text-emerald-800 font-mono inline-block">
          Ref: {successRef.slice(0, 8)}...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden honeypot field for anti-bot protection */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Rajesh Singhania"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone / WhatsApp <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="+91-9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred BHK</label>
            <select
              value={formData.preferred_bhk}
              onChange={(e) => setFormData({ ...formData, preferred_bhk: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            >
              <option value="">Any Configuration</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="5+ BHK">5+ BHK</option>
              <option value="Penthouse">Sky Penthouse</option>
              <option value="Villa">Signature Villa</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Range</label>
            <select
              value={formData.budget_range}
              onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            >
              <option value="">Any Budget</option>
              <option value="₹ 2 Cr - 5 Cr">₹ 2 Cr - 5 Cr</option>
              <option value="₹ 5 Cr - 15 Cr">₹ 5 Cr - 15 Cr</option>
              <option value="₹ 15 Cr - 30 Cr">₹ 15 Cr - 30 Cr</option>
              <option value="Above ₹ 30 Cr">Above ₹ 30 Cr</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Requirements</label>
        <textarea
          rows={compact ? 2 : 3}
          placeholder="I would like to schedule a private site visit / download project brochure..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-slate-950 font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4 text-slate-950" />
            <span>Request Call Back & Brochure</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-400 text-center">
        🔒 Your contact information is kept strictly confidential. No spam guaranteed.
      </p>
    </form>
  );
}
