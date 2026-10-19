"use client";

import { useState, useTransition } from "react";
import { saveMember } from "@/app/admin/(protected)/team-actions";
import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import Button from "@/components/common/Button";
import { Field, Select, TextInput } from "@/components/common/form/Field";
import { TEAM_DEGREES } from "@/config/content";
import type { Member } from "@/types/content";
import styles from "./AwardForm.module.css";

export type MemberDraft = Omit<Member, "order" | "createdAt" | "updatedAt">;

type Props = {
  mode: "create" | "update";
  member: MemberDraft;
  version: number; // members.json version the panel was opened with
  onSaved: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
};

// Student / Alumni form inside the EditPanel. The order is managed by ↑/↓ on the list.
export default function MemberForm({ mode, member, version, onSaved, onCancel, onPendingChange }: Props) {
  const [draft, setDraft] = useState<MemberDraft>(member);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof MemberDraft>(key: K, value: MemberDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = () =>
    startTransition(async () => {
      setError(null);
      onPendingChange?.(true);
      try {
        const outcome = await saveMember(version, mode, draft);
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
      <Field label="구분">
        <Select value={draft.type} onChange={(event) => set("type", event.target.value as MemberDraft["type"])}>
          <option value="STUDENT">Student</option>
          <option value="ALUMNI">Alumni</option>
        </Select>
      </Field>
      <Field label="학위" hint="N/A이면 이름만 표시됩니다.">
        <Select value={draft.degree} onChange={(event) => set("degree", event.target.value as MemberDraft["degree"])}>
          {TEAM_DEGREES.map((degree) => (
            <option key={degree} value={degree}>
              {degree}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="이름">
        <TextInput value={draft.name} onChange={(event) => set("name", event.target.value)} required />
      </Field>
      <Field label="이메일" hint="비워 두면 표시하지 않습니다.">
        <TextInput type="email" value={draft.email} onChange={(event) => set("email", event.target.value)} />
      </Field>
      <Field label="연구 분야">
        <TextInput value={draft.field} onChange={(event) => set("field", event.target.value)} />
      </Field>
      <ImageListEditor
        kind="members"
        entityId={draft.id}
        images={draft.profileImage ? [draft.profileImage] : []}
        onChange={(images) => set("profileImage", images[0] ?? null)}
        max={1}
        label="프로필 이미지 (선택)"
      />

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
