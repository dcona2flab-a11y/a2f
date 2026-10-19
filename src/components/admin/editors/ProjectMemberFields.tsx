"use client";

import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import Button from "@/components/common/Button";
import { Field, Select, TextInput } from "@/components/common/form/Field";
import { AWARD_DEGREES } from "@/config/content";
import type { ProjectMember } from "@/types/content";
import styles from "./AwardPeopleFields.module.css";

type Props = {
  projectId: string; // the profile photo is uploaded under the project
  member: ProjectMember | null;
  onChange: (member: ProjectMember | null) => void;
};

// The project member (at most one): name, degree, role, optional profile photo.
export default function ProjectMemberFields({ projectId, member, onChange }: Props) {
  return (
    <fieldset className={styles.people}>
      <legend className={styles.legend}>멤버 ({member ? 1 : 0}/1)</legend>
      {member ? (
        <div className={styles.person}>
          <div className={styles.fields}>
            <Field label="이름">
              <TextInput value={member.name} onChange={(event) => onChange({ ...member, name: event.target.value })} required />
            </Field>
            <Field label="학위" hint="N/A이면 학위 없이 역할만 표시됩니다.">
              <Select
                value={member.degree}
                onChange={(event) => onChange({ ...member, degree: event.target.value as ProjectMember["degree"] })}
              >
                {AWARD_DEGREES.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="역할">
              <TextInput value={member.role} onChange={(event) => onChange({ ...member, role: event.target.value })} />
            </Field>
          </div>
          <ImageListEditor
            kind="projects"
            entityId={projectId}
            images={member.profileImage ? [member.profileImage] : []}
            onChange={(images) => onChange({ ...member, profileImage: images[0] })}
            max={1}
            label="프로필 이미지 (선택)"
          />
          <div className={styles.actions}>
            <Button variant="secondary" size="sm" onClick={() => onChange(null)}>
              멤버 빼기
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => onChange({ name: "", degree: "N/A", role: "" })}>
          멤버 추가
        </Button>
      )}
    </fieldset>
  );
}
