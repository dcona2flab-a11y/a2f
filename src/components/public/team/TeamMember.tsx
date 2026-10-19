import Image from "next/image";
import type { Member } from "@/types/content";
import styles from "./TeamMember.module.css";

// One Student / Alumni: photo (gray gradient placeholder without one), "MA. Name" (N/A shows
// the name alone), email as a mailto link (left out when empty), research field.
export default function TeamMember({ member }: { member: Member }) {
  const displayName = member.degree === "N/A" ? member.name : `${member.degree} ${member.name}`;
  return (
    <article className={styles.member}>
      <div className={`${styles.photo} ${member.profileImage ? "" : styles.placeholder}`}>
        {member.profileImage && (
          <Image
            className={styles.photoImage}
            src={member.profileImage.url}
            alt={member.profileImage.alt || member.name}
            fill
            sizes="(min-width: 1920px) 146px, (min-width: 1440px) 110px, (min-width: 768px) 101px, 99px"
          />
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.identity}>
          <h3 className={styles.name}>{displayName}</h3>
          {member.email && (
            <a className={styles.email} href={`mailto:${member.email}`}>
              {member.email}
            </a>
          )}
        </div>
        {member.field && <p className={styles.field}>{member.field}</p>}
      </div>
    </article>
  );
}
