"use client";

import { saveIntroParagraph, saveResearchField, saveWhy } from "@/app/admin/(protected)/home-actions";
import InlineFieldsEditor from "@/components/admin/edit/InlineFieldsEditor";
import InlineTextEditor from "@/components/admin/edit/InlineTextEditor";
import type { HomeContent, ResearchField } from "@/types/content";

// In-place editors for the Home texts (opened by <Editable> on /admin).

export function IntroParagraphEditor({ index, value, version }: { index: number; value: string; version: number }) {
  return (
    <InlineTextEditor
      label={`소개 문단 ${index + 1}`}
      initialValue={value}
      hint={index === 1 ? "1440px 이상 화면에서만 보이는 문단입니다." : undefined}
      multiline
      compact
      onSave={(text) => saveIntroParagraph(version, index, text)}
    />
  );
}

export function WhyEditor({ why, version }: { why: HomeContent["why"]; version: number }) {
  return (
    <InlineFieldsEditor
      compact
      fields={[
        { name: "statementLead", label: "강조 문구 (초록색)", hint: "문장 맨 앞에 초록색으로 표시됩니다." },
        { name: "statement", label: "영문 문장", multiline: true },
        { name: "description", label: "한글 설명", multiline: true },
      ]}
      initialValues={why}
      onSave={(values) => saveWhy(version, values)}
    />
  );
}

export function ResearchFieldEditor({ field, version }: { field: ResearchField; version: number }) {
  return (
    <InlineFieldsEditor
      compact
      fields={[
        { name: "title", label: "영문 제목" },
        { name: "subtitle", label: "한글 소제목" },
        { name: "description", label: "설명", multiline: true, hint: "365px 화면에서는 설명이 보이지 않습니다." },
      ]}
      initialValues={{ title: field.title, subtitle: field.subtitle, description: field.description }}
      onSave={(values) => saveResearchField(version, field.id, values)}
    />
  );
}
