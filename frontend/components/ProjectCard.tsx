"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, ShieldCheck, ArrowRight, Building } from "lucide-react";
import { ProjectCard as ProjectCardType } from "@/types";
import { formatPrice } from "@/utils/format";

interface Props {
  project: ProjectCardType;
}

export default function ProjectCard({ project }: Props) {
  const displayPrice = project.price_label || (
    project.min_price && project.max_price
      ? `${formatPrice(project.min_price, project.currency)} - ${formatPrice(project.max_price, project.currency)}`
      : formatPrice(project.min_price, project.currency)
  );

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col">
      {/* Property Image Container */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-900">
        <Image
          src={project.primary_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {project.featured && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md">
              Featured
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-medium px-2.5 py-1 rounded-md border border-slate-700/60">
            {project.construction_status}
          </span>
        </div>

        {/* RERA Badge */}
        {project.rera_number && (
          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-400/30">
            <ShieldCheck className="w-3 h-3" />
            <span>RERA</span>
          </div>
        )}

        {/* Developer overlay */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
            {project.developer_name}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link href={`/projects/${project.slug}`}>
            <h3 className="text-lg font-bold text-slate-900 font-serif group-hover:text-amber-600 transition-colors line-clamp-1 mb-1.5">
              {project.name}
            </h3>
          </Link>

          {/* Location */}
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>
              {project.locality_name ? `${project.locality_name}, ` : ""}
              {project.city_name}
            </span>
          </p>

          {/* Configurations & Specs */}
          <div className="flex items-center gap-4 py-2.5 border-y border-slate-100 text-xs text-slate-600 mb-4">
            {project.bedrooms_summary && (
              <span className="flex items-center gap-1 font-medium">
                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                {project.bedrooms_summary}
              </span>
            )}
            {project.property_type_name && (
              <span className="flex items-center gap-1 text-slate-500 ml-auto">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {project.property_type_name}
              </span>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-medium">Starting From</span>
            <span className="text-base font-bold text-slate-900 font-serif">
              {displayPrice}
            </span>
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 px-3.5 py-2 rounded-lg transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
