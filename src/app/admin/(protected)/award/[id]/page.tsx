import type { Metadata } from "next";
import Link from "next/link";
import Editable from "@/components/admin/edit/Editable";
import {
  AwardBodyEditor,
  AwardDeleteControl,
  AwardImagesEditor,
  AwardPeopleEditor,
  AwardSummaryEditor,
} from "@/components/admin/editors/AwardDetailEditors";
import AwardDetail from "@/components/public/award/AwardDetail";
import { getPublishedDocument } from "@/services/content";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Award 편집" };

// /admin/award/[id] = the public detail (same component) with editing composed around it.
// Reads the cached latest awards.json; every editor saves against this version.
export default async function AdminAwardDetailPage({ params }: Props) {
  const { id } = await params;
  const document = await getPublishedDocument("awards");
  const award = document?.items.find((item) => item.id === id);
  const version = document?.version ?? 0;

  // Inside the admin (AdminBar stays): a short message instead of the public 404.
  if (!award) {
    return (
      <main className={styles.missing}>
        <p className={styles.message}>해당 항목을 찾을 수 없습니다.</p>
        <Link className={styles.link} href="/admin#award">
          Award &amp; Activity 목록으로
        </Link>
      </main>
    );
  }

  return (
    <AwardDetail
      award={award}
      toolbar={<AwardDeleteControl award={award} version={version} />}
      renderHeader={(header) => (
        <Editable label="제목·구분·날짜" editor={<AwardSummaryEditor award={award} version={version} />}>
          {header}
        </Editable>
      )}
      renderBody={(body) => (
        <Editable label="본문" editor={<AwardBodyEditor award={award} version={version} />}>
          {award.body ? body : <p className={styles.empty}>본문 없음</p>}
        </Editable>
      )}
      renderImages={(images) => (
        <Editable label="이미지" editor={<AwardImagesEditor award={award} version={version} />}>
          {award.images.length > 0 ? images : <p className={styles.empty}>이미지 없음</p>}
        </Editable>
      )}
      renderPeople={(people) => (
        <Editable
          label="참여자"
          panelTitle="참여자 (People)"
          editor={<AwardPeopleEditor award={award} version={version} />}
        >
          {award.people.length > 0 ? people : <p className={styles.empty}>참여자 없음</p>}
        </Editable>
      )}
    />
  );
}
