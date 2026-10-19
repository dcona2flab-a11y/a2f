"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  saveProfessorBasics,
  saveProfessorContact,
  saveProfessorImages,
  saveProfessorSection,
  saveTeamIntroImage,
  saveTeamIntroText,
} from "@/app/admin/(protected)/team-actions";
import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import ImageReplace from "@/components/admin/edit/ImageReplace";
import InlineFieldsEditor from "@/components/admin/edit/InlineFieldsEditor";
import InlineTextEditor from "@/components/admin/edit/InlineTextEditor";
import SaveActions, { useSaveAndClose } from "@/components/admin/edit/SaveActions";
import StringListEditor from "@/components/admin/edit/StringListEditor";
import { LIMITS } from "@/config/content";
import { PROFESSOR_SECTIONS, type ProfessorSectionKey } from "@/config/team";
import type { ImageRef, Professor } from "@/types/content";
import styles from "./AwardDetailEditors.module.css";

// Editors for /admin/team (professor.json). Each saves only its own part, against the
// professor.json version the page was rendered with (a newer save elsewhere → conflict message).

type Base = { professor: Professor; version: number };

export function TeamIntroTextEditor({ professor, version }: Base) {
  return (
    <InlineTextEditor
      label="소개 문구"
      initialValue={professor.teamIntro.text}
      hint="줄바꿈이 그대로 표시됩니다."
      multiline
      compact
      onSave={(text) => saveTeamIntroText(version, text)}
    />
  );
}

// "이미지 변경" on the intro photo: upload, then save it at once.
export function TeamIntroImageReplace({ version, children }: { version: number; children: ReactNode }) {
  const router = useRouter();
  return (
    <ImageReplace
      fill
      kind="professor"
      entityId="team-intro"
      onReplace={async (image) => {
        const outcome = await saveTeamIntroImage(version, image);
        if (outcome.ok) router.refresh();
        return outcome;
      }}
    >
      {children}
    </ImageReplace>
  );
}

export function ProfessorBasicsEditor({ professor, version }: Base) {
  return (
    <InlineFieldsEditor
      compact
      fields={[
        { name: "name", label: "영문 이름", hint: "앞에 \"Prof.\"가 자동으로 붙습니다." },
        { name: "nameKo", label: "한글 이름" },
        { name: "title", label: "직함", hint: "예: 교수" },
        { name: "department", label: "소속", hint: "부제는 \"한글 이름 직함, 소속\"으로 표시됩니다." },
      ]}
      initialValues={{ name: professor.name, nameKo: professor.nameKo, title: professor.title, department: professor.department }}
      onSave={(values) => saveProfessorBasics(version, values)}
    />
  );
}

export function ProfessorContactEditor({ professor, version }: Base) {
  return (
    <InlineFieldsEditor
      fields={[
        { name: "addressLines", label: "주소", multiline: true, hint: "한 줄에 하나씩. 첫 줄 앞에 A2F 글리프가 붙습니다." },
        { name: "phone", label: "전화번호", type: "tel" },
        { name: "email", label: "이메일", type: "email" },
      ]}
      initialValues={{ addressLines: professor.addressLines.join("\n"), phone: professor.phone, email: professor.email }}
      onSave={(values) => saveProfessorContact(version, values)}
    />
  );
}

// Up to 3 photos, in rotation order.
export function ProfessorPhotosEditor({ professor, version }: Base) {
  const [images, setImages] = useState<ImageRef[]>(professor.images);
  const { close, error, pending, submit } = useSaveAndClose(() => saveProfessorImages(version, images));
  return (
    <div className={styles.panelForm}>
      <ImageListEditor
        kind="professor"
        entityId="professor"
        images={images}
        onChange={setImages}
        max={LIMITS.professorImages}
        label={`사진 (최대 ${LIMITS.professorImages}장, 순서대로 표시)`}
      />
      <SaveActions pending={pending} error={error} onSave={submit} onCancel={close} />
    </div>
  );
}

export function ProfessorSectionEditor({ professor, version, sectionKey }: Base & { sectionKey: ProfessorSectionKey }) {
  const title = PROFESSOR_SECTIONS.find((section) => section.key === sectionKey)?.title ?? sectionKey;
  return (
    <StringListEditor
      label={title}
      items={professor[sectionKey]}
      onSave={(items) => saveProfessorSection(version, sectionKey, items)}
    />
  );
}
