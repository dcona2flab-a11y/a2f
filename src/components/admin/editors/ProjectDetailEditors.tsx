"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteProject,
  saveProjectBody,
  saveProjectImages,
  saveProjectMember,
  saveProjectSummary,
} from "@/app/admin/(protected)/project-actions";
import ConfirmDialog from "@/components/admin/edit/ConfirmDialog";
import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import InlineFieldsEditor from "@/components/admin/edit/InlineFieldsEditor";
import InlineTextEditor from "@/components/admin/edit/InlineTextEditor";
import ListControls from "@/components/admin/edit/ListControls";
import SaveActions, { useSaveAndClose } from "@/components/admin/edit/SaveActions";
import { PROJECT_CATEGORIES } from "@/config/content";
import type { ImageRef, Project, ProjectMember } from "@/types/content";
import ProjectMemberFields from "./ProjectMemberFields";
import styles from "./AwardDetailEditors.module.css";

// Editors for /admin/project/[id]. Each saves only its own part of the project, against the
// projects.json version the page was rendered with (a newer save elsewhere → conflict message).

type Base = { project: Project; version: number };

export function ProjectSummaryEditor({ project, version }: Base) {
  return (
    <InlineFieldsEditor
      compact
      fields={[
        { name: "title", label: "제목" },
        { name: "date", label: "날짜", type: "date" },
        { name: "category", label: "카테고리", type: "select", options: PROJECT_CATEGORIES.map((value) => ({ value, label: value })) },
        { name: "customTag", label: "태그 (1개)", hint: "카테고리 옆에 표시됩니다. 비워 두면 표시하지 않습니다." },
      ]}
      initialValues={{ title: project.title, date: project.date, category: project.category, customTag: project.customTag }}
      onSave={(values) => saveProjectSummary(version, project.id, { ...values, category: values.category as Project["category"] })}
    />
  );
}

export function ProjectBodyEditor({ project, version }: Base) {
  return (
    <InlineTextEditor
      label="본문"
      initialValue={project.body}
      hint="빈 줄로 문단을 나눕니다."
      multiline
      compact
      onSave={(body) => saveProjectBody(version, project.id, body)}
    />
  );
}

// All images of the project; the first is the representative image (card + detail).
export function ProjectImagesEditor({ project, version }: Base) {
  const [images, setImages] = useState<ImageRef[]>(project.images);
  const { close, error, pending, submit } = useSaveAndClose(() => saveProjectImages(version, project.id, images));
  return (
    <div className={styles.editor}>
      <ImageListEditor kind="projects" entityId={project.id} images={images} onChange={setImages} label="이미지 (첫 번째 = 대표 이미지)" />
      <SaveActions pending={pending} error={error} onSave={submit} onCancel={close} />
    </div>
  );
}

export function ProjectMemberEditor({ project, version }: Base) {
  const [member, setMember] = useState<ProjectMember | null>(project.member);
  const { close, error, pending, submit } = useSaveAndClose(() => saveProjectMember(version, project.id, member));
  return (
    <div className={styles.panelForm}>
      <ProjectMemberFields projectId={project.id} member={member} onChange={setMember} />
      <SaveActions pending={pending} error={error} onSave={submit} onCancel={close} />
    </div>
  );
}

// 삭제 at the top of the detail page → confirmation → back to the list.
export function ProjectDeleteControl({ project, version }: Base) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const remove = () =>
    startTransition(async () => {
      const outcome = await deleteProject(version, project.id);
      setConfirming(false);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      router.push("/admin/project");
      router.refresh();
    });

  return (
    <div className={styles.toolbar}>
      <ListControls itemLabel={project.title} onDelete={() => setConfirming(true)} disabled={pending} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        title="이 프로젝트를 삭제할까요?"
        message={`"${project.title}" 프로젝트가 사이트에서 바로 사라집니다.`}
        confirmLabel={pending ? "삭제 중…" : "삭제"}
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />
    </div>
  );
}
