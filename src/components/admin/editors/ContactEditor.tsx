"use client";

import { saveContact } from "@/app/admin/(protected)/settings-actions";
import InlineFieldsEditor from "@/components/admin/edit/InlineFieldsEditor";
import type { Settings } from "@/types/content";

// Home contact block (settings.contact). The A2F glyph before the first address line is fixed.
export default function ContactEditor({ contact, version }: { contact: Settings["contact"]; version: number }) {
  return (
    <InlineFieldsEditor
      compact
      fields={[
        {
          name: "address",
          label: "주소",
          multiline: true,
          hint: "한 줄씩 입력하세요. 첫 줄 앞에는 A2F 로고가 붙습니다.",
        },
        { name: "phone", label: "전화번호", type: "tel" },
        { name: "email", label: "이메일", type: "email" },
      ]}
      initialValues={{ address: contact.addressLines.join("\n"), phone: contact.phone, email: contact.email }}
      onSave={(values) => saveContact(version, values)}
    />
  );
}
