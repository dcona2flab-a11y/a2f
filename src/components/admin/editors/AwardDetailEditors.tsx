"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteAward,
  saveAwardBody,
  saveAwardImages,
  saveAwardPeople,
  saveAwardSummary,
} from "@/app/admin/(protected)/award-actions";
import ConfirmDialog from "@/components/admin/edit/ConfirmDialog";
import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import InlineFieldsEditor from "@/components/admin/edit/InlineFieldsEditor";
import InlineTextEditor from "@/components/admin/edit/InlineTextEditor";
import ListControls from "@/components/admin/edit/ListControls";
import SaveActions, { useSaveAndClose } from "@/components/admin/edit/SaveActions";
import { AWARD_ACTIVITY_TYPES } from "@/config/content";
import type { Award, AwardPerson, ImageRef } from "@/types/content";
import AwardPeopleFields from "./AwardPeopleFields";
import styles from "./AwardDetailEditors.module.css";

// Editors for /admin/award/[id]. Each saves only its own part of the award, against the
// awards.json version the page was rendered with (a newer save elsewhere → conflict message).

type Base = { award: Award; version: number };

const TYPE_OPTIONS = AWARD_ACTIVITY_TYPES.map((type) => ({ value: type, label: type === "AWARD" ? "Award" : "Activity" }));

export function AwardSummaryEditor({ award, version }: Base) {
  return (
    <InlineFieldsEditor
      compact
      fields={[
        { name: "title", label: "제목 (행사·프로젝트명)" },
        { name: "type", label: "구분", type: "select", options: TYPE_OPTIONS },
        { name: "label", label: "수상·활동 내역" },
        { name: "date", label: "날짜", type: "date" },
      ]}
      initialValues={{ title: award.title, type: award.type, label: award.label, date: award.date }}
      onSave={(values) => saveAwardSummary(version, award.id, { ...values, type: values.type as Award["type"] })}
    />
  );
}

export function AwardBodyEditor({ award, version }: Base) {
  return (
    <InlineTextEditor
      label="본문"
      initialValue={award.body}
      hint="빈 줄로 문단을 나눕니다."
      multiline
      compact
      onSave={(body) => saveAwardBody(version, award.id, body)}
    />
  );
}

// Add (upload), remove (with confirmation) and reorder; the first image is the Home card image.
export function AwardImagesEditor({ award, version }: Base) {
  const [images, setImages] = useState<ImageRef[]>(award.images);
  const { close, error, pending, submit } = useSaveAndClose(() => saveAwardImages(version, award.id, images));
  return (
    <div className={styles.editor}>
      <ImageListEditor kind="awards" entityId={award.id} images={images} onChange={setImages} label="이미지 (첫 번째 = Home 카드 이미지)" />
      <SaveActions pending={pending} error={error} onSave={submit} onCancel={close} />
    </div>
  );
}

export function AwardPeopleEditor({ award, version }: Base) {
  const [people, setPeople] = useState<AwardPerson[]>(award.people);
  const { close, error, pending, submit } = useSaveAndClose(() => saveAwardPeople(version, award.id, people));
  return (
    <div className={styles.panelForm}>
      <AwardPeopleFields awardId={award.id} people={people} onChange={setPeople} />
      <SaveActions pending={pending} error={error} onSave={submit} onCancel={close} />
    </div>
  );
}

// 삭제 at the top of the detail page → confirmation → back to the Home list.
export function AwardDeleteControl({ award, version }: Base) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const remove = () =>
    startTransition(async () => {
      const outcome = await deleteAward(version, award.id);
      setConfirming(false);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      router.push("/admin#award");
      router.refresh();
    });

  return (
    <div className={styles.toolbar}>
      <ListControls itemLabel={award.title} onDelete={() => setConfirming(true)} disabled={pending} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirming}
        title="이 항목을 삭제할까요?"
        message={`"${award.title}" 항목이 사이트에서 바로 사라집니다.`}
        confirmLabel={pending ? "삭제 중…" : "삭제"}
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />
    </div>
  );
}
