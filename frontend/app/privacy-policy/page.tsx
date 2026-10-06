export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-slate-700 space-y-6">
        <h1 className="text-3xl font-bold font-serif text-slate-900 border-b pb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: October 2025</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">1. Information We Collect</h2>
          <p className="text-xs leading-relaxed">
            When you inquire about a real estate property, request a brochure, or schedule a site visit, Pavilion 360 collects
            information such as your name, email address, phone number, and investment preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">2. How We Use Your Information</h2>
          <p className="text-xs leading-relaxed">
            We use your data solely to provide real estate advisory services, arrange site visits with verified project developers,
            and keep you updated regarding project milestones. We never sell your personal contact information to third-party telemarketers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">3. Data Security & Storage</h2>
          <p className="text-xs leading-relaxed">
            All submitted enquiry data is encrypted in transit via SSL/TLS and stored in protected, access-controlled databases
            in compliance with Indian and international data protection standards.
          </p>
        </section>
      </div>
    </div>
  );
}
