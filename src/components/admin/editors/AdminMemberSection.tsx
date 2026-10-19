"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMember, moveMember } from "@/app/admin/(protected)/team-actions";
import ConfirmDialog from "@/components/admin/edit/ConfirmDialog";
import EditPanel from "@/components/admin/edit/EditPanel";
import ListControls from "@/components/admin/edit/ListControls";
import Button from "@/components/common/Button";
import MemberSection from "@/components/public/team/MemberSection";
import type { Member, MemberType } from "@/types/content";
import MemberForm, { type MemberDraft } from "./MemberForm";
import styles from "./AdminAwardSection.module.css";

type Props = {
  type: MemberType;
  id: string;
  title: string;
  members: Member[]; // this type only, in display order
  version: number;   // members.json version
};

type Editing = { mode: "create" | "update"; member: MemberDraft };

// Same shape as createId("member"); a fresh id each time the form opens (the profile photo is
// uploaded under it before the first save). The server rejects an id that already exists.
const newMemberId = () =>
  `member-${Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => (byte % 36).toString(36)).join("")}`;
const toDraft = ({ id, type, degree, name, email, field, profileImage }: Member): MemberDraft => ({
  id,
  type,
  degree,
  name,
  email,
  field,
  profileImage,
});

// The public Student / Alumni section with admin controls composed in: [추가] in the header,
// ↑/↓/수정/삭제 on each member, the form in an EditPanel. Shown even when the list is empty.
export default function AdminMemberSection({ type, id, title, members, version }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionPending, startAction] = useTransition();
  // Until the page has re-rendered with the saved data (new version), no new edit can start.
  const [refreshing, startRefresh] = useTransition();
  const refresh = () => startRefresh(() => router.refresh());
  const locked = refreshing || actionPending;

  const run = (action: () => Promise<{ ok: true } | { ok: false; message: string }>, after?: () => void) =>
    startAction(async () => {
      const outcome = await action();
      after?.();
      if (!outcome.ok) {
        setMessage(outcome.message);
        return;
      }
      setMessage(null);
      refresh();
    });

  const confirmDelete = () => {
    const target = deleting;
    if (target) run(() => deleteMember(version, target.id), () => setDeleting(null));
  };

  return (
    <>
      <MemberSection
        id={id}
        title={title}
        members={members}
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
                  member: { id: newMemberId(), type, degree: "N/A", name: "", email: "", field: "", profileImage: null },
                })
              }
            >
              추가
            </Button>
          </>
        }
        renderItemActions={(member, index) => (
          <ListControls
            itemLabel={member.name}
            disabled={locked}
            onMoveUp={index > 0 ? () => run(() => moveMember(version, member.id, "up")) : undefined}
            onMoveDown={index < members.length - 1 ? () => run(() => moveMember(version, member.id, "down")) : undefined}
            onEdit={() => setEditing({ mode: "update", member: toDraft(member) })}
            onDelete={() => setDeleting(member)}
          />
        )}
        empty={<p className={styles.empty}>등록된 구성원이 없습니다</p>}
      />

      <EditPanel
        open={editing !== null}
        title={editing?.mode === "create" ? `${title} 추가` : `${title} 수정`}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
      >
        {editing && (
          <MemberForm
            key={editing.member.id}
            mode={editing.mode}
            member={editing.member}
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
        title="이 구성원을 삭제할까요?"
        message={deleting ? `"${deleting.name}" 님이 사이트에서 바로 사라집니다.` : undefined}
        confirmLabel={actionPending ? "삭제 중…" : "삭제"}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
