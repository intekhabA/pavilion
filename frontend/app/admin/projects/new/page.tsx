import ProjectFormTabs from "@/components/ProjectFormTabs";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
          Create Real Estate Project
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete the multi-tab specification form to initialize a new development.
        </p>
      </div>

      <ProjectFormTabs isEdit={false} />
    </div>
  );
}
