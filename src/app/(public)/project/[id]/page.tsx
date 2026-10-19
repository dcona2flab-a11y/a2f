import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/public/project/ProjectDetail";
import { getProjectById } from "@/services/projects";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectById((await params).id);
  return { title: project ? project.title : "페이지를 찾을 수 없습니다" };
}

// Project detail. Unknown ids get the real 404.
export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectById((await params).id);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
