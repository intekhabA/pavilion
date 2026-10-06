import { MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";

export default function ContactPage() {
  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
            Concierge Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 tracking-tight mt-1">
            Connect With Our Senior Advisors
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Schedule a private boardroom discussion or arrange a complimentary site tour.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif mb-1">Corporate Headquarters</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Level 18, Pavilion Tower, Golf Course Road, DLF Phase 5, Gurugram, Haryana - 122002, India
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif mb-1">Direct Hotline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Toll Free: <strong>800-PAVILION</strong> <br />
                Direct Desk: +91 98765 43210
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif mb-1">Email Advisory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                concierge@pavilionrealty.com <br />
                investor.relations@pavilionrealty.com
              </p>
            </div>
          </div>

          {/* Right: Lead Capture Form */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">
              Send an Advisory Request
            </h2>
            <p className="text-xs text-slate-500 mb-8">
              Fill in your contact preferences and our senior relationship director will contact you promptly.
            </p>
            <EnquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
