import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SITE } from "@/config/site";
import { projectPath, projectSlug } from "@/lib/content-paths";
import ProjectDetail from "@/components/public/project/ProjectDetail";
import { getProjectBySegment } from "@/services/projects";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySegment((await params).id);
  if (!project) return { title: "페이지를 찾을 수 없습니다" };
  return {
    title: project.title,
    alternates: { canonical: projectPath(project) },
    openGraph: { title: `${project.title} | ${SITE.name}` },
  };
}

// Project detail. Unknown ids get the real 404.
export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectBySegment(id);
  if (!project) notFound();
  // Older or alternative addresses (e.g. /project/project-…) move to the current one.
  if (id !== projectSlug(project)) permanentRedirect(projectPath(project));
  return <ProjectDetail project={project} />;
}
