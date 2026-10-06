"use client";

import { X, Building2 } from "lucide-react";
import EnquiryForm from "./EnquiryForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  projectName?: string;
  title?: string;
}

export default function EnquiryModal({ isOpen, onClose, projectId, projectName, title }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <img src="/logo2.png" alt="Pavilion 360" className="w-8 h-8 object-contain" />
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                {title || (projectName ? `Enquiry for ${projectName}` : "Private Advisory Consultation")}
              </h3>
              <p className="text-[11px] text-amber-400">Direct Developer Pricing & Priority Allotment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <EnquiryForm projectId={projectId} projectName={projectName} onSuccess={() => setTimeout(onClose, 3000)} />
        </div>
      </div>
    </div>
  );
}
