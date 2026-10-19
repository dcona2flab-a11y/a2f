import Image from "next/image";
import type { ImageRef } from "@/types/content";
import styles from "./PeopleList.module.css";

export type PersonView = {
  name: string;
  degree: string;
  role?: string;
  profileImage?: ImageRef;
};

const DEGREE_HIDDEN = "N/A";

// Award People / project member: photo (or the Figma placeholder), name, degree ■ role.
// "N/A" degree is not shown; the square only separates two values.
export default function PeopleList({ people, label = "People" }: { people: PersonView[]; label?: string }) {
  if (people.length === 0) return null;
  return (
    <ul className={styles.people} aria-label={label}>
      {people.map((person, index) => {
        const details = [person.degree === DEGREE_HIDDEN ? "" : person.degree, person.role ?? ""].filter(Boolean);
        return (
          <li key={index} className={styles.person}>
            <div className={styles.photo}>
              {person.profileImage && (
                <Image className={styles.photoImage} src={person.profileImage.url} alt="" fill sizes="100px" />
              )}
            </div>
            <div className={styles.personText}>
              <p className={styles.name}>{person.name}</p>
              {details.length > 0 && (
                <p className={styles.personMeta}>
                  {details.map((detail, i) => (
                    <span key={`${i}-${detail}`} className={styles.personDetail}>
                      {i > 0 && <span className={styles.personSquare} aria-hidden="true" />}
                      {detail}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
