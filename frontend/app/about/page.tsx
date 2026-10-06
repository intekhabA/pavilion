import { Building2, ShieldCheck, Award, Users2, Landmark, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
            About Pavilion 360
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-slate-900 tracking-tight mt-2">
            Pioneering Luxury Real Estate Advisory
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-light">
            Founded on the pillars of institutional integrity, absolute transparency, and private wealth advisory,
            Pavilion 360 connects discerning home buyers and global investors with iconic developments.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold font-serif text-slate-900 mb-2">Uncompromising Due Diligence</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every project in our portfolio undergoes 360-degree legal due diligence, title scrutiny, and government RERA verification.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <Landmark className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold font-serif text-slate-900 mb-2">Direct Developer Alliances</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We work directly with India's and Dubai's premier corporate developers (DLF, Godrej, Oberoi, Sobha, Prestige), providing our clients first-access pricing.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <Users2 className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold font-serif text-slate-900 mb-2">Personal Wealth Concierge</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              From private chauffeur-driven site tours to banking mortgage processing, our advisors manage the complete acquisition journey.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-950 text-white rounded-3xl p-10 sm:p-14 border border-slate-800 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">15,000+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Happy Homeowners</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">250+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">RERA Projects</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">₹ 4,500+ Cr</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Advisory Volume</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">15+ Years</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Industry Legacy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
