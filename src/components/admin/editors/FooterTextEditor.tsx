"use client";

import { saveFooterText } from "@/app/admin/(protected)/settings-actions";
import InlineTextEditor from "@/components/admin/edit/InlineTextEditor";

// The admin edits the footer as one natural sentence; line breaks per screen size are
// derived from the commas, so the admin never manages line structure.
export default function FooterTextEditor({ lines, version }: { lines: string[]; version: number }) {
  return (
    <InlineTextEditor
      label="푸터 문구"
      initialValue={lines.join(" ")}
      hint="쉼표(,) 뒤에서 화면 크기에 따라 줄이 바뀝니다."
      onSave={(sentence) => saveFooterText(version, sentence)}
    />
  );
}
