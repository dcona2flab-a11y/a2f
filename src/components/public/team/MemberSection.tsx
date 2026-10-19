import type { ReactNode } from "react";
import type { Member } from "@/types/content";
import TeamMember from "./TeamMember";
import styles from "./MemberSection.module.css";

type Props = {
  id: string;        // section anchor / heading id, e.g. "student"
  title: string;     // "Student" / "Alumni"
  members: Member[]; // in display order
  // Admin composition slots (the public page leaves an empty section out entirely).
  toolbar?: ReactNode;
  renderItemActions?: (member: Member, index: number) => ReactNode;
  empty?: ReactNode;
};

// Student / Alumni list: 1 / 2 / 3 / 3 columns (365 / 768 / 1440 / 1920).
export default function MemberSection({ id, title, members, toolbar, renderItemActions, empty }: Props) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.header}>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      </div>
      {members.length > 0 ? (
        <ul className={styles.list}>
          {members.map((member, index) => (
            <li key={member.id} className={styles.item}>
              <TeamMember member={member} />
              {renderItemActions?.(member, index)}
            </li>
          ))}
        </ul>
      ) : (
        empty
      )}
    </section>
  );
}
