import type { Metadata } from "next";
import ProjectList from "@/components/public/project/ProjectList";
import ProjectPage from "@/components/public/project/ProjectPage";
import { getProjects } from "@/services/projects";

export const metadata: Metadata = { title: "Project" };

// Project list. The admin (/admin/project) renders the same list with editing composed in.
export default async function ProjectListPage() {
  const projects = await getProjects();
  return (
    <ProjectPage>
      <ProjectList projects={projects} />
    </ProjectPage>
  );
}
