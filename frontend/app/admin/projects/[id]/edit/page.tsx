"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectFormTabs from "@/components/ProjectFormTabs";
import { apiService } from "@/services/api";
import { ProjectDetail } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditProjectPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiService.adminProjects
      .getById(Number(id))
      .then((res) => {
        if (res.success) setProject(res.data);
      })
      .catch((err) => console.error("Error loading project for edit:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
        <p className="text-xs">Loading project configuration tabs...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm">Project #{id} not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
          Edit: {project.name}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Update specifications, upload gallery images, manage BHK configurations, and adjust SEO.
        </p>
      </div>

      <ProjectFormTabs initialData={project} isEdit={true} />
    </div>
  );
}
