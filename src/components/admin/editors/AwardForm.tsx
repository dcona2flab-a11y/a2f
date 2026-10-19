"use client";

import { useState, useTransition } from "react";
import { saveAward } from "@/app/admin/(protected)/award-actions";
import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import Button from "@/components/common/Button";
import { Field, Select, TextArea, TextInput } from "@/components/common/form/Field";
import { AWARD_ACTIVITY_TYPES } from "@/config/content";
import type { Award } from "@/types/content";
import AwardPeopleFields from "./AwardPeopleFields";
import styles from "./AwardForm.module.css";

export type AwardDraft = Omit<Award, "createdAt" | "updatedAt">;

type Props = {
  mode: "create" | "update";
  award: AwardDraft;
  version: number;     // awards.json version the panel was opened with
  onSaved: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
};

const TYPE_LABEL = { AWARD: "Award", ACTIVITY: "Activity" } as const;

// Award & Activity form inside the EditPanel. Saved as a whole; images and people are part
// of the same save (images[0] is the card image).
export default function AwardForm({ mode, award, version, onSaved, onCancel, onPendingChange }: Props) {
  const [draft, setDraft] = useState<AwardDraft>(award);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof AwardDraft>(key: K, value: AwardDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = () =>
    startTransition(async () => {
      setError(null);
      onPendingChange?.(true);
      try {
        const outcome = await saveAward(version, mode, draft);
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
        <Select value={draft.type} onChange={(event) => set("type", event.target.value as AwardDraft["type"])}>
          {AWARD_ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="행사·프로젝트명" hint="카드의 아이콘 옆 문구 (예: Tech 4 Good Hackathon, SKT & Hana)">
        <TextInput value={draft.title} onChange={(event) => set("title", event.target.value)} required />
      </Field>
      <Field label="수상·활동 내역" hint="카드의 초록색 문구 (예: Grand Prize, Academic Conference)">
        <TextInput value={draft.label} onChange={(event) => set("label", event.target.value)} required />
      </Field>
      <Field label="날짜">
        <TextInput type="date" value={draft.date} onChange={(event) => set("date", event.target.value)} required />
      </Field>
      <Field label="본문">
        <TextArea value={draft.body} onChange={(event) => set("body", event.target.value)} />
      </Field>

      <ImageListEditor
        kind="awards"
        entityId={draft.id}
        images={draft.images}
        onChange={(images) => set("images", images)}
        label="이미지 (첫 번째 = 카드 이미지)"
      />

      <AwardPeopleFields awardId={draft.id} people={draft.people} onChange={(people) => set("people", people)} />

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
