"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProject } from "@/app/admin/(protected)/project-actions";
import ConfirmDialog from "@/components/admin/edit/ConfirmDialog";
import EditPanel from "@/components/admin/edit/EditPanel";
import ListControls from "@/components/admin/edit/ListControls";
import Button from "@/components/common/Button";
import ProjectList from "@/components/public/project/ProjectList";
import type { Project } from "@/types/content";
import ProjectForm, { type ProjectDraft } from "./ProjectForm";
import styles from "./AdminAwardSection.module.css";

type Props = {
  projects: Project[]; // latest, newest first
  version: number;     // projects.json version
};

type Editing = { mode: "create" | "update"; project: ProjectDraft };

const today = () => new Date().toISOString().slice(0, 10);
const newProjectId = () =>
  `project-${Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => (byte % 36).toString(36)).join("")}`;
const toDraft = ({ id, title, date, body, category, customTag, member, images }: Project): ProjectDraft => ({
  id,
  title,
  date,
  body,
  category,
  customTag,
  member,
  images,
});

// The public project list with admin controls composed in: [추가] next to the filters,
// 수정/삭제 on each card, the form in an EditPanel.
export default function AdminProjectList({ projects, version }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const refresh = () => startRefresh(() => router.refresh());
  const locked = refreshing || deletePending;

  const confirmDelete = () => {
    const target = deleting;
    if (!target) return;
    startDelete(async () => {
      const outcome = await deleteProject(version, target.id);
      setDeleting(null);
      if (!outcome.ok) {
        setMessage(outcome.message);
        return;
      }
      setMessage(null);
      refresh();
    });
  };

  return (
    <>
      <ProjectList
        projects={projects}
        basePath="/admin"
        toolbar={
          <>
            {message && (
              <p className={styles.message} role="alert">
                {message}
              </p>
            )}
            <Button
              size="sm"
              disabled={locked}
              onClick={() =>
                setEditing({
                  mode: "create",
                  project: { id: newProjectId(), title: "", date: today(), body: "", category: "UX/UI", customTag: "", member: null, images: [] },
                })
              }
            >
              추가
            </Button>
          </>
        }
        renderItemActions={(project) => (
          <ListControls
            itemLabel={project.title}
            disabled={locked}
            onEdit={() => setEditing({ mode: "update", project: toDraft(project) })}
            onDelete={() => setDeleting(project)}
          />
        )}
        empty={
          <p className={styles.empty}>{projects.length === 0 ? "등록된 프로젝트가 없습니다" : "선택한 조건에 해당하는 프로젝트가 없습니다"}</p>
        }
      />

      <EditPanel
        open={editing !== null}
        title={editing?.mode === "create" ? "Project 추가" : "Project 수정"}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
      >
        {editing && (
          <ProjectForm
            key={editing.project.id}
            mode={editing.mode}
            project={editing.project}
            version={version}
            onPendingChange={setSaving}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              refresh();
            }}
          />
        )}
      </EditPanel>

      <ConfirmDialog
        open={deleting !== null}
        title="이 프로젝트를 삭제할까요?"
        message={deleting ? `"${deleting.title}" 프로젝트가 사이트에서 바로 사라집니다.` : undefined}
        confirmLabel={deletePending ? "삭제 중…" : "삭제"}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
