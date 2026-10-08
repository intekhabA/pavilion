"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Phone, Mail, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/context/SettingsContext";

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useSiteSettings();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src="/logo2.png"
                alt="Pavilion 360"
                className="h-11 w-auto object-contain"
              />
              <div>
                <span className="text-xl font-bold tracking-wider text-white font-serif flex items-center gap-1.5">
                  PAVILION <span className="text-amber-400 text-xl tracking-widest font-sans font-light">360</span>
                </span>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase -mt-0.5">
                  {settings.site_tagline || "Curated Real Estate Advisory"}
                </p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              {settings.site_name || "Pavilion 360"} is a premier luxury real-estate advisory and portfolio consultancy.
              We partner exclusively with top-tier developers to offer verified luxury residences, sky penthouses, and signature estates.
            </p>
            <div className="flex items-center gap-3 text-xs text-amber-400/90 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
              <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>100% RERA Verified Inventory. Transparent Consultation. Zero Hidden Brokerage.</span>
            </div>
          </div>

          {/* Column 2: Popular Cities */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              Top Locations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/projects?city_id=2" className="hover:text-amber-400 transition-colors">
                  Gurgaon / Gurugram
                </Link>
              </li>
              <li>
                <Link href="/projects?city_id=1" className="hover:text-amber-400 transition-colors">
                  Noida & Expressway
                </Link>
              </li>
              <li>
                <Link href="/projects?city_id=3" className="hover:text-amber-400 transition-colors">
                  Mumbai Luxury
                </Link>
              </li>
              <li>
                <Link href="/projects?city_id=4" className="hover:text-amber-400 transition-colors">
                  Bengaluru Estates
                </Link>
              </li>
              <li>
                <Link href="/projects?city_id=5" className="hover:text-amber-400 transition-colors">
                  Dubai Waterfront
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Property Types */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              Property Portfolios
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/projects?property_type_id=1" className="hover:text-amber-400 transition-colors">
                  Luxury Apartments
                </Link>
              </li>
              <li>
                <Link href="/projects?property_type_id=2" className="hover:text-amber-400 transition-colors">
                  Sky Penthouses
                </Link>
              </li>
              <li>
                <Link href="/projects?property_type_id=3" className="hover:text-amber-400 transition-colors">
                  Signature Villas & Mansions
                </Link>
              </li>
              <li>
                <Link href="/projects?property_type_id=4" className="hover:text-amber-400 transition-colors">
                  High-Street Commercial
                </Link>
              </li>
              <li>
                <Link href="/projects?featured=true" className="hover:text-amber-400 transition-colors">
                  Featured Developments
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Concierge */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              Concierge HQ
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{settings.office_address || "Level 18, Pavilion Tower, Golf Course Road, DLF Phase 5, Gurugram, India"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a
                  href={`tel:${settings.contact_phone?.replace(/[^0-9+]/g, "") || "+918007284546"}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {settings.contact_phone || "+91 800-PAVILION / +91 98765 43210"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a
                  href={`mailto:${settings.contact_email || "concierge@pavilionrealty.com"}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {settings.contact_email || "concierge@pavilionrealty.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory RERA Compliance Disclaimer */}
        <div className="pt-8 pb-6 border-t border-slate-800/80 text-xs text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-300">RERA Compliance Disclaimer: </strong>
            {settings.rera_disclaimer || "Pavilion 360 acts solely as a registered real estate marketing and portfolio advisory consultant. All project images, floor plans, pricing estimates, specifications, and availability are provided by the respective project developers and are subject to change. Prospective buyers are advised to independently inspect the project site and verify government RERA approvals prior to any financial commitment."}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {settings.site_name || "Pavilion 360"} Advisory Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/sitemap.xml" className="hover:text-slate-200 transition-colors">
              Sitemap
            </Link>
            <Link href="/admin/login" className="hover:text-amber-400 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
