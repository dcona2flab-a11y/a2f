import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE } from "@/config/site";
import ProjectDetail from "@/components/public/project/ProjectDetail";
import { getProjectById } from "@/services/projects";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectById((await params).id);
  if (!project) return { title: "페이지를 찾을 수 없습니다" };
  return {
    title: project.title,
    alternates: { canonical: `/project/${project.id}` },
    openGraph: { title: `${project.title} | ${SITE.name}` },
  };
}

// Project detail. Unknown ids get the real 404.
export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectById((await params).id);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
