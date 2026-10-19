"use client";

import { useState, useTransition } from "react";
import { saveProject } from "@/app/admin/(protected)/project-actions";
import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import Button from "@/components/common/Button";
import { Field, Select, TextArea, TextInput } from "@/components/common/form/Field";
import { PROJECT_CATEGORIES } from "@/config/content";
import type { Project } from "@/types/content";
import ProjectMemberFields from "./ProjectMemberFields";
import styles from "./AwardForm.module.css";

export type ProjectDraft = Omit<Project, "createdAt" | "updatedAt">;

type Props = {
  mode: "create" | "update";
  project: ProjectDraft;
  version: number;     // projects.json version the panel was opened with
  onSaved: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
};

// Whole-project form inside the EditPanel (create from the list, or 수정 on a card).
export default function ProjectForm({ mode, project, version, onSaved, onCancel, onPendingChange }: Props) {
  const [draft, setDraft] = useState<ProjectDraft>(project);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = () =>
    startTransition(async () => {
      setError(null);
      onPendingChange?.(true);
      try {
        const outcome = await saveProject(version, mode, draft);
        if (outcome.ok) onSaved();
        else setError(outcome.message);
      } finally {
        onPendingChange?.(false);
      }
    });

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Field label="제목">
        <TextInput value={draft.title} onChange={(event) => set("title", event.target.value)} required />
      </Field>
      <Field label="날짜">
        <TextInput type="date" value={draft.date} onChange={(event) => set("date", event.target.value)} required />
      </Field>
      <Field label="카테고리">
        <Select value={draft.category} onChange={(event) => set("category", event.target.value as ProjectDraft["category"])}>
          {PROJECT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="태그 (1개)" hint="상세 페이지에 카테고리 옆에 표시됩니다. 비워 두면 표시하지 않습니다.">
        <TextInput value={draft.customTag} onChange={(event) => set("customTag", event.target.value)} />
      </Field>
      <Field label="본문" hint="빈 줄로 문단을 나눕니다.">
        <TextArea value={draft.body} onChange={(event) => set("body", event.target.value)} />
      </Field>
      <ImageListEditor
        kind="projects"
        entityId={draft.id}
        images={draft.images}
        onChange={(images) => set("images", images)}
        label="이미지 (첫 번째 = 대표 이미지)"
      />
      <ProjectMemberFields projectId={draft.id} member={draft.member} onChange={(member) => set("member", member)} />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          취소
        </Button>
      </div>
    </form>
  );
}
