import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Editable from "@/components/admin/edit/Editable";
import {
  ProjectAddressEditor,
  ProjectBodyEditor,
  ProjectDeleteControl,
  ProjectImagesEditor,
  ProjectMemberEditor,
  ProjectSummaryEditor,
} from "@/components/admin/editors/ProjectDetailEditors";
import ProjectDetail from "@/components/public/project/ProjectDetail";
import { getSiteUrl } from "@/config/site";
import { findProject, projectPath, projectSlug } from "@/lib/content-paths";
import { getPublishedDocument } from "@/services/content";
import styles from "../../news/[id]/page.module.css";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Project 편집" };

// /admin/project/[id] = the public detail (same component) with editing composed around it.
export default async function AdminProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const document = await getPublishedDocument("projects");
  const project = findProject(document?.items ?? [], id);
  const version = document?.version ?? 0;

  // Inside the admin (AdminBar stays): a short message instead of the public 404.
  if (!project) {
    return (
      <main className={styles.missing}>
        <p className={styles.message}>해당 항목을 찾을 수 없습니다.</p>
        <Link className={styles.link} href="/admin/project">
          Project 목록으로
        </Link>
      </main>
    );
  }

  const host = new URL(getSiteUrl()).host;

  // Same addresses as the public page; older forms move to the current one.
  if (id !== projectSlug(project)) redirect(`/admin${projectPath(project)}`);

  return (
    <ProjectDetail
      project={project}
      toolbar={
        <>
          <Editable label="주소" editor={<ProjectAddressEditor project={project} version={version} host={host} />}>
            <p className={styles.address}>
              주소 <span className={styles.addressValue}>{host}{projectPath(project)}</span>
            </p>
          </Editable>
          <ProjectDeleteControl project={project} version={version} />
        </>
      }
      renderHeader={(header) => (
        <Editable label="제목·날짜·카테고리·태그" editor={<ProjectSummaryEditor project={project} version={version} />}>
          {header}
        </Editable>
      )}
      renderBody={(body) => (
        <Editable label="본문" editor={<ProjectBodyEditor project={project} version={version} />}>
          {project.body ? body : <p className={styles.empty}>본문 없음</p>}
        </Editable>
      )}
      renderImages={(lead) => (
        <Editable label="이미지" editor={<ProjectImagesEditor project={project} version={version} />}>
          {lead ?? <p className={styles.empty}>이미지 없음</p>}
        </Editable>
      )}
      renderMember={(member) => (
        <Editable label="멤버" panelTitle="멤버 (Member)" editor={<ProjectMemberEditor project={project} version={version} />}>
          {project.member ? member : <p className={styles.empty}>멤버 없음</p>}
        </Editable>
      )}
    />
  );
}
