"use client";

import ImageListEditor from "@/components/admin/edit/ImageListEditor";
import Button from "@/components/common/Button";
import { Field, Select, TextInput } from "@/components/common/form/Field";
import { AWARD_DEGREES, LIMITS } from "@/config/content";
import type { AwardPerson } from "@/types/content";
import styles from "./AwardPeopleFields.module.css";

type Props = {
  awardId: string; // profile photos are uploaded under the award
  people: AwardPerson[];
  onChange: (people: AwardPerson[]) => void;
};

const emptyPerson = (): AwardPerson => ({ name: "", degree: "N/A", role: "" });

const move = (list: AwardPerson[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

// People of an award (up to LIMITS.awardPeople): name, degree, role, optional profile photo,
// in display order. Shared by the Home award form and the detail page's People panel.
export default function AwardPeopleFields({ awardId, people, onChange }: Props) {
  const set = (index: number, person: AwardPerson) => onChange(people.map((current, i) => (i === index ? person : current)));

  return (
    <fieldset className={styles.people}>
      <legend className={styles.legend}>
        참여자 ({people.length}/{LIMITS.awardPeople})
      </legend>
      {people.map((person, index) => (
        <div key={index} className={styles.person}>
          <div className={styles.fields}>
            <Field label="이름">
              <TextInput value={person.name} onChange={(event) => set(index, { ...person, name: event.target.value })} required />
            </Field>
            <Field label="학위" hint="N/A이면 학위 없이 역할만 표시됩니다.">
              <Select
                value={person.degree}
                onChange={(event) => set(index, { ...person, degree: event.target.value as AwardPerson["degree"] })}
              >
                {AWARD_DEGREES.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="역할">
              <TextInput value={person.role} onChange={(event) => set(index, { ...person, role: event.target.value })} />
            </Field>
          </div>
          <ImageListEditor
            kind="awards"
            entityId={awardId}
            images={person.profileImage ? [person.profileImage] : []}
            onChange={(images) => set(index, { ...person, profileImage: images[0] })}
            max={1}
            label="프로필 이미지 (선택)"
          />
          <div className={styles.actions}>
            <Button variant="secondary" size="sm" disabled={index === 0} onClick={() => onChange(move(people, index, index - 1))}>
              위로
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={index === people.length - 1}
              onClick={() => onChange(move(people, index, index + 1))}
            >
              아래로
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onChange(people.filter((_, i) => i !== index))}>
              참여자 {index + 1} 빼기
            </Button>
          </div>
        </div>
      ))}
      {people.length < LIMITS.awardPeople && (
        <Button variant="secondary" size="sm" onClick={() => onChange([...people, emptyPerson()])}>
          참여자 추가
        </Button>
      )}
    </fieldset>
  );
}
