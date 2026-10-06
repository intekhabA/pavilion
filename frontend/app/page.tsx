"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  Users2,
  KeyRound,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ProjectCard from "@/components/ProjectCard";
import EnquiryModal from "@/components/EnquiryModal";
import { apiService } from "@/services/api";
import { ProjectCard as ProjectCardType, City } from "@/types";

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<ProjectCardType[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, cityRes] = await Promise.all([
          apiService.publicProjects.getFeatured(6),
          apiService.publicLocations.getCities({ featured_only: true }),
        ]);

        if (projRes.success) setFeaturedProjects(projRes.data);
        if (cityRes.success) setCities(cityRes.data);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. FEATURED PROJECTS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif tracking-tight">
              Featured Luxury Developments
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Verified prestigious developments by Tier-1 developers offering unparalleled lifestyle and capital appreciation.
            </p>
          </div>
          <Link
            href="/projects"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors group"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-500" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No featured properties found at this moment.</p>
          </div>
        )}
      </section>

      {/* 3. PRIME CITIES / REGIONS SHOWCASE */}
      <section className="py-20 bg-slate-950 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
              Strategic Growth Corridors
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight mt-2 text-white">
              Explore Properties by Prime Location
            </h2>
            <p className="text-sm text-slate-400 mt-3 font-light">
              High-yielding real-estate hotspots across India's metropolitan cities and the United Arab Emirates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                name: "Gurgaon",
                sub: "Golf Course Rd & SPR",
                img: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=600",
                cityId: 2,
              },
              {
                name: "Noida",
                sub: "Expressway & Sector 128",
                img: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600",
                cityId: 1,
              },
              {
                name: "Mumbai",
                sub: "Worli, BKC & South Mumbai",
                img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=600",
                cityId: 3,
              },
              {
                name: "Bengaluru",
                sub: "Central & Tech Parks",
                img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600",
                cityId: 4,
              },
              {
                name: "Dubai",
                sub: "Downtown & Palm Jumeirah",
                img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600",
                cityId: 5,
              },
            ].map((city) => (
              <Link
                key={city.name}
                href={`/projects?city_id=${city.cityId}`}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-xl border border-slate-800 hover:border-amber-400/60 transition-all duration-300"
              >
                <Image
                  src={city.img}
                  alt={city.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-xl font-bold font-serif text-white group-hover:text-amber-400 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">{city.sub}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    <span>Explore Projects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE PAVILION (INVESTORS CLINIC VALUE PROPOSITION) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">
            The Pavilion Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight mt-2">
            Why Discerning Buyers Choose Us
          </h2>
          <p className="text-sm text-slate-500 mt-3">
            A boutique real-estate advisory combining institutional research with high-touch personal concierge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: "100% RERA Verified",
              desc: "Every project in our registry undergoes rigorous legal title verification and government regulatory checks.",
            },
            {
              icon: KeyRound,
              title: "Zero Brokerage Fee",
              desc: "Enjoy complete transparent developer-direct pricing with zero commission on original builder bookings.",
            },
            {
              icon: Users2,
              title: "Dedicated Wealth Concierge",
              desc: "A personal relationship manager assists you with site tours, inventory reservation, and legal paperwork.",
            },
            {
              icon: FileCheck2,
              title: "Loan & Legal Assistance",
              desc: "Pre-approved mortgage assistance across all major banks, with complete home loan documentation support.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CONSULTATION / SITE VISIT BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
              Private Site Visit Invitation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight mt-2 text-white">
              Experience Your Next Home in Person
            </h2>
            <p className="text-sm text-slate-300 mt-4 leading-relaxed font-light">
              We arrange chauffeur-driven private site tours and complimentary developer walkthroughs at your convenience.
              Speak with a senior advisor to secure priority booking slots.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all text-sm cursor-pointer"
              >
                Schedule Private Site Visit
              </button>
              <a
                href="tel:+918007284546"
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition-colors text-sm"
              >
                Call: 800-PAVILION
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Private Property Tour"
      />
    </div>
  );
}
