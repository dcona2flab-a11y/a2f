"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAward } from "@/app/admin/(protected)/award-actions";
import ConfirmDialog from "@/components/admin/edit/ConfirmDialog";
import EditPanel from "@/components/admin/edit/EditPanel";
import ListControls from "@/components/admin/edit/ListControls";
import Button from "@/components/common/Button";
import AwardSection from "@/components/public/home/AwardSection";
import type { Award } from "@/types/content";
import AwardForm, { type AwardDraft } from "./AwardForm";
import styles from "./AdminAwardSection.module.css";

type Props = {
  awards: Award[]; // latest, newest first
  version: number; // awards.json version
};

type Editing = { mode: "create" | "update"; award: AwardDraft };

const today = () => new Date().toISOString().slice(0, 10);

// A fresh id each time the form opens (images are uploaded under it before the first save).
// Same shape as createId("award"); the server rejects an id that already exists.
const newAwardId = () =>
  `award-${Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => (byte % 36).toString(36)).join("")}`;

// The editable fields (timestamps are set by the server).
const toDraft = ({ id, type, title, label, date, body, images, people }: Award): AwardDraft => ({
  id,
  type,
  title,
  label,
  date,
  body,
  images,
  people,
});

// The public Award & Activity section with admin controls composed in: [추가] in the header,
// 수정/삭제 on each card, the form in an EditPanel. Shown even when the list is empty.
export default function AdminAwardSection({ awards, version }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Award | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();
  // Until the page has re-rendered with the saved data (new version), no new edit can start.
  const [refreshing, startRefresh] = useTransition();
  const refresh = () => startRefresh(() => router.refresh());
  const locked = refreshing || deletePending;

  const openCreate = () =>
    setEditing({
      mode: "create",
      award: { id: newAwardId(), type: "AWARD", title: "", label: "", date: today(), body: "", images: [], people: [] },
    });

  const confirmDelete = () => {
    const target = deleting;
    if (!target) return;
    startDelete(async () => {
      const outcome = await deleteAward(version, target.id);
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
      <AwardSection
        awards={awards}
        basePath="/admin"
        toolbar={
          <>
            {message && (
              <p className={styles.message} role="alert">
                {message}
              </p>
            )}
            <Button size="sm" onClick={openCreate} disabled={locked}>
              추가
            </Button>
          </>
        }
        renderItemActions={(award) => (
          <ListControls
            itemLabel={award.title}
            disabled={locked}
            onEdit={() => setEditing({ mode: "update", award: toDraft(award) })}
            onDelete={() => setDeleting(award)}
          />
        )}
        empty={
          <p className={styles.empty}>
            {awards.length === 0 ? "등록된 항목이 없습니다" : "선택한 구분에 해당하는 항목이 없습니다"}
          </p>
        }
      />

      <EditPanel
        open={editing !== null}
        title={editing?.mode === "create" ? "Award & Activity 추가" : "Award & Activity 수정"}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
      >
        {editing && (
          <AwardForm
            key={editing.award.id}
            mode={editing.mode}
            award={editing.award}
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
        title="이 항목을 삭제할까요?"
        message={deleting ? `"${deleting.title}" 항목이 사이트에서 바로 사라집니다.` : undefined}
        confirmLabel={deletePending ? "삭제 중…" : "삭제"}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
