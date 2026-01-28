import { Archive, Check, Clock, Loader, RefreshCw } from "lucide-preact";
import { useMemo, useState } from "preact/hooks";
import type { ProjectSummaryDto } from "@broccoliapps/tasquito-shared";
import { FilterPills, IconButton, ProjectForm, ProjectList, Spinner } from "../components";
import { useProjects } from "../hooks";

type ProjectFilter = "all" | "active" | "pending" | "done" | "archived";

const filterOptions: { value: ProjectFilter; label: string; icon?: preact.JSX.Element }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", icon: <Loader size={14} /> },
  { value: "pending", label: "Pending", icon: <Clock size={14} /> },
  { value: "done", label: "Done", icon: <Check size={14} /> },
  { value: "archived", label: "Archived", icon: <Archive size={14} /> },
];

const getProjectStatus = (project: ProjectSummaryDto): "pending" | "active" | "done" | "archived" => {
  if (project.isArchived) return "archived";
  if (project.totalTaskCount === 0) return "pending";
  if (project.openTaskCount === 0) return "done";
  return "active";
};

export const HomePage = () => {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const { projects, isLoading, error, create, refresh } = useProjects();

  const handleCreateProject = async (name: string) => {
    const project = await create(name);
    window.location.href = `/app/projects/${project.id}`;
    return project;
  };

  // Filter projects by status
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const status = getProjectStatus(project);
      if (filter === "all") return status !== "archived";
      return status === filter;
    });
  }, [projects, filter]);

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Projects</h1>
        <IconButton
          icon={isLoading ? <Spinner size={18} /> : <RefreshCw size={18} />}
          aria-label="Refresh projects"
          onClick={refresh}
          disabled={isLoading}
        />
      </div>

      {/* Create Project Form */}
      <ProjectForm onSubmit={handleCreateProject} />

      {/* Filter Pills */}
      <FilterPills options={filterOptions} selected={filter} onSelect={setFilter} />

      {/* Error Message */}
      {error && (
        <div class="text-center py-4">
          <p class="text-red-600">{error}</p>
        </div>
      )}

      {/* Projects Grid */}
      <ProjectList projects={filteredProjects} isLoading={isLoading} filter={filter} />
    </div>
  );
};
