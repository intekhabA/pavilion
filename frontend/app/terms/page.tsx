export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-slate-700 space-y-6">
        <h1 className="text-3xl font-bold font-serif text-slate-900 border-b pb-4">Terms & Conditions</h1>
        <p className="text-sm text-slate-500">Last updated: October 2025</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">1. Nature of Advisory Services</h2>
          <p className="text-xs leading-relaxed">
            Pavilion 360 provides promotional, marketing, and channel partner advisory services for government-registered real estate developments.
            We are not the developers or builders of the advertised properties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">2. Accuracy of Project Specifications</h2>
          <p className="text-xs leading-relaxed">
            All floor plans, architectural renderings, price brackets, and possession dates are derived from official developer brochures and RERA filings.
            Users are advised to execute agreements with the developer after independent verification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">3. RERA Compliance</h2>
          <p className="text-xs leading-relaxed">
            Each project presented contains its state-specific RERA registration number for independent verification by prospective buyers on respective state RERA portals.
          </p>
        </section>
      </div>
    </div>
  );
}
