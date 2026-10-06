"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building,
  ShieldCheck,
  Calendar,
  Layers,
  BedDouble,
  Bath,
  Maximize2,
  FileText,
  Download,
  Share2,
  Play,
  CheckCircle2,
  Phone,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";
import EnquiryModal from "@/components/EnquiryModal";
import ProjectCard from "@/components/ProjectCard";
import { apiService } from "@/services/api";
import { ProjectDetail, ProjectCard as ProjectCardType } from "@/types";
import { formatPrice, formatDate } from "@/utils/format";

export default function ProjectDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [similarProjects, setSimilarProjects] = useState<ProjectCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeBhkTab, setActiveBhkTab] = useState<number>(0);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);

  useEffect(() => {
    async function loadProject() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await apiService.publicProjects.getBySlug(slug);
        if (res.success && res.data) {
          setProject(res.data);
          setActiveImage(res.data.primary_image_url || res.data.media?.[0]?.file_url || "");

          // Load similar projects
          const simRes = await apiService.publicProjects.getSimilar(slug, 3);
          if (simRes.success) setSimilarProjects(simRes.data);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 max-w-7xl mx-auto px-4">
        <div className="h-96 rounded-2xl bg-slate-200 animate-pulse mb-8" />
        <div className="h-20 rounded-xl bg-slate-200 animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-28 px-4 text-center">
        <h2 className="text-2xl font-bold font-serif text-slate-800">Property Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">The project you are looking for has been archived or does not exist.</p>
        <a href="/projects" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">
          Browse All Projects
        </a>
      </div>
    );
  }

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: project.short_description,
    image: project.primary_image_url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: project.currency,
      lowPrice: project.min_price,
      highPrice: project.max_price,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: project.city?.name,
      addressRegion: project.state?.name,
      addressCountry: project.country?.code,
    },
  };

  const displayPrice = project.price_label || (
    project.min_price && project.max_price
      ? `${formatPrice(project.min_price, project.currency)} - ${formatPrice(project.max_price, project.currency)}`
      : formatPrice(project.min_price, project.currency)
  );

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      {/* Schema.org script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
          <a href="/" className="hover:text-amber-600">Home</a>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <a href="/projects" className="hover:text-amber-600">Projects</a>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-medium line-clamp-1">{project.name}</span>
        </div>

        {/* 1. PROJECT HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                {project.developer_name}
              </span>
              <span className="bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded">
                {project.construction_status}
              </span>
              {project.rera_number && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>RERA: {project.rera_number}</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
              {project.name}
            </h1>

            <p className="text-sm text-slate-600 flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                {project.address ? `${project.address}, ` : ""}
                {project.locality?.name ? `${project.locality.name}, ` : ""}
                {project.city?.name}, {project.country?.name}
              </span>
            </p>
          </div>

          {/* Price Header */}
          <div className="lg:text-right bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Price Range</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              {displayPrice}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Exclusive of government taxes & registry fees</p>
          </div>
        </div>

        {/* 2. IMAGE GALLERY & LIGHTBOX */}
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Primary Featured Image */}
            <div className="lg:col-span-3 relative h-[450px] sm:h-[520px] rounded-2xl overflow-hidden shadow-lg bg-slate-950">
              <Image
                src={activeImage || project.primary_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"}
                alt={project.name}
                fill
                priority
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />
            </div>

            {/* Thumbnail Strip */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[520px] pb-2 lg:pb-0">
              {project.media && project.media.length > 0 ? (
                project.media.map((med, idx) => (
                  <button
                    key={med.id || idx}
                    onClick={() => setActiveImage(med.file_url)}
                    className={`relative w-28 lg:w-full h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === med.file_url ? "border-amber-500 scale-95 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={med.thumbnail_url || med.file_url}
                      alt={med.alt_text || project.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-400 p-4">No gallery images</div>
              )}
            </div>
          </div>
        </div>

        {/* 3. KEY SPECS SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm mb-12">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Configurations</span>
            <span className="text-sm font-bold text-slate-800">{project.bedrooms_summary || "Bespoke Units"}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Sizes</span>
            <span className="text-sm font-bold text-slate-800">
              {project.area_from ? `${project.area_from} - ${project.area_to || ""} ${project.area_unit}` : "On Request"}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Possession</span>
            <span className="text-sm font-bold text-slate-800">{formatDate(project.possession_date) || "Ready / Imminent"}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Total Towers</span>
            <span className="text-sm font-bold text-slate-800">{project.total_towers || "Exclusive"}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Project Size</span>
            <span className="text-sm font-bold text-slate-800">{project.total_area_acres ? `${project.total_area_acres} Acres` : "Sprawling"}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Property Category</span>
            <span className="text-sm font-bold text-slate-800">{project.property_type?.name || "Luxury Residential"}</span>
          </div>
        </div>

        {/* 4. MAIN DETAILS & STICKY SIDEBAR ENQUIRY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Comprehensive Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview / Description */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
              <h2 className="text-xl font-bold font-serif text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Project Overview
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-light mb-4 whitespace-pre-line">
                {project.full_description || project.short_description}
              </p>
            </div>

            {/* Floor Plans & BHK Configurations Tabs */}
            {project.configurations && project.configurations.length > 0 && (
              <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-2 border-b border-slate-100 gap-3">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">
                      Floor Plans & Configurations
                    </h2>
                    <p className="text-xs text-slate-500">Explore unit layouts and detailed carpet areas</p>
                  </div>
                  <button
                    onClick={() => setBrochureModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Plans</span>
                  </button>
                </div>

                {/* BHK Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                  {project.configurations.map((cfg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBhkTab(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeBhkTab === idx
                          ? "bg-slate-900 text-amber-400 shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cfg.bhk_type} ({cfg.name})
                    </button>
                  ))}
                </div>

                {/* Active Configuration Card */}
                {project.configurations[activeBhkTab] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                        {project.configurations[activeBhkTab].availability_status}
                      </span>
                      <h3 className="text-xl font-bold font-serif text-slate-900 mt-1">
                        {project.configurations[activeBhkTab].name}
                      </h3>
                      <p className="text-2xl font-extrabold text-slate-900 font-serif mt-3">
                        {project.configurations[activeBhkTab].price_label || formatPrice(project.configurations[activeBhkTab].price, project.currency)}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-4 h-4 text-slate-400" />
                          <span>Super Area: {project.configurations[activeBhkTab].super_area} {project.configurations[activeBhkTab].area_unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-4 h-4 text-slate-400" />
                          <span>Bedrooms: {project.configurations[activeBhkTab].bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath className="w-4 h-4 text-slate-400" />
                          <span>Bathrooms: {project.configurations[activeBhkTab].bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span>Balconies: {project.configurations[activeBhkTab].balconies}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setBrochureModalOpen(true)}
                        className="mt-6 w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        Request Exact Price Breakup
                      </button>
                    </div>

                    {/* Floor Plan Visual */}
                    <div className="relative h-56 rounded-xl overflow-hidden border border-slate-300 bg-white flex items-center justify-center">
                      <Image
                        src={
                          project.configurations[activeBhkTab].floor_plan_image_url ||
                          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800"
                        }
                        alt="Floor Plan"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* World-Class Amenities Grid */}
            {project.amenities && project.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-2 pb-2 border-b border-slate-100">
                  World-Class Amenities
                </h2>
                <p className="text-xs text-slate-500 mb-6">Designed to provide a seven-star resort lifestyle</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {project.amenities.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 hover:border-amber-400 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-slate-800 line-clamp-1">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Walkthrough (Requirement #12) */}
            {project.videos && project.videos.length > 0 && (
              <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-2 pb-2 border-b border-slate-100">
                  Video Walkthrough & Virtual Tour
                </h2>
                <p className="text-xs text-slate-500 mb-6">Experience the property ambiance and architecture</p>

                <div className="space-y-6">
                  {project.videos.map((vid) => (
                    <div key={vid.id} className="relative aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
                      {vid.youtube_video_id ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${vid.youtube_video_id}`}
                          title={vid.title || "Property Walkthrough"}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video controls className="w-full h-full object-cover">
                          <source src={vid.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Project Documents & Brochure */}
            {project.documents && project.documents.length > 0 && (
              <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Verified Project Documents
                </h2>
                <div className="space-y-3">
                  {project.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{doc.doc_type} • Verified Official</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setBrochureModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Developer Information */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
              <h2 className="text-xl font-bold font-serif text-slate-900 mb-3 pb-2 border-b border-slate-100">
                About the Developer: {project.developer_name}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                {project.developer_name} is recognized as one of the country's preeminent real estate groups with a legacy of delivering landmark residential townships and high-end commercial addresses.
                All developments by {project.developer_name} carry verified government RERA registrations.
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Consultation Enquiry Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-6 border border-slate-200 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Authorized Advisory</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 mb-1">
                Enquire for {project.name}
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Receive official price sheets, floor plans, and schedule private site visits.
              </p>

              <EnquiryForm
                projectId={project.id}
                projectName={project.name}
                compact={true}
              />

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Direct Hotline:</span>
                <a href="tel:+918007284546" className="font-bold text-slate-900 hover:text-amber-600">
                  800-PAVILION
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SIMILAR PROJECTS RECOMMENDATION */}
        {similarProjects.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200">
            <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight mb-8">
              Similar Luxury Developments You May Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brochure Modal */}
      <EnquiryModal
        isOpen={brochureModalOpen}
        onClose={() => setBrochureModalOpen(false)}
        projectId={project.id}
        projectName={project.name}
        title={`Download Official Brochure & Plans: ${project.name}`}
      />
    </div>
  );
}
