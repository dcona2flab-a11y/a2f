import Image from "next/image";
import type { ReactNode } from "react";
import glyph from "@/assets/team/contact-glyph-green.svg";
import { PROFESSOR_SECTIONS, type ProfessorSectionKey } from "@/config/team";
import type { ImageRef, Professor } from "@/types/content";
import ProfessorPhotos from "./ProfessorPhotos";
import styles from "./ProfessorProfile.module.css";

type Props = {
  professor: Professor;
  // Admin composition hooks. With renderSection an empty section is still shown (heading only).
  renderHeader?: (header: ReactNode) => ReactNode;
  renderContact?: (contact: ReactNode) => ReactNode;
  renderPhotos?: (images: ImageRef[]) => ReactNode;
  renderSection?: (key: ProfessorSectionKey, section: ReactNode) => ReactNode;
};

// "류안영 교수, 인제대학교 멀티미디어학과": composed, not stored as one sentence.
export function professorSubtitle({ nameKo, title, department }: Professor): string {
  const who = [nameKo, title].filter(Boolean).join(" ");
  return [who, department].filter(Boolean).join(", ");
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// Professor block: name + subtitle, contact (own fields, not the site contact), photos and the
// four sections. 365: contact beside the photo, sections below; 768: photo left, sections
// right; 1440 / 1920: Education–Research | photo | Project.
export default function ProfessorProfile({
  professor,
  renderHeader = (header) => header,
  renderContact = (contact) => contact,
  renderPhotos,
  renderSection,
}: Props) {
  const subtitle = professorSubtitle(professor);
  const [firstLine, ...otherLines] = professor.addressLines;
  const hasContact = professor.addressLines.length > 0 || professor.phone !== "" || professor.email !== "";

  const section = (key: ProfessorSectionKey) => {
    const lines = professor[key];
    if (lines.length === 0 && !renderSection) return null;
    const title = PROFESSOR_SECTIONS.find((item) => item.key === key)?.title;
    const node = (
      <section className={styles.section} aria-labelledby={`professor-${key}`}>
        <h3 id={`professor-${key}`} className={styles.sectionTitle}>
          {title}
        </h3>
        {lines.length > 0 && (
          <ul className={styles.lines}>
            {lines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        )}
      </section>
    );
    return renderSection ? renderSection(key, node) : node;
  };

  const photos = renderPhotos
    ? renderPhotos(professor.images)
    : professor.images.length > 0 && <ProfessorPhotos images={professor.images} name={`Prof. ${professor.name}`} />;

  return (
    <section className={styles.profile} aria-labelledby="professor-name">
      <div className={styles.header}>
        {renderHeader(
          <header className={styles.heading}>
            <h2 id="professor-name" className={styles.name}>
              Prof. {professor.name}
            </h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>,
        )}
      </div>

      <div className={styles.contactArea}>
        {renderContact(
          hasContact && (
            <div className={styles.contact}>
              {firstLine && (
                <address className={`${styles.block} ${styles.address}`}>
                  <span className={styles.line}>
                    <Image className={styles.glyph} src={glyph} alt="A2F" unoptimized />
                    {firstLine}
                  </span>
                  {otherLines.map((line, index) => (
                    <span key={index} className={styles.line}>
                      {line}
                    </span>
                  ))}
                </address>
              )}
              {(professor.phone || professor.email) && (
                <p className={styles.block}>
                  {professor.phone && (
                    <a className={`${styles.line} ${styles.link}`} href={telHref(professor.phone)}>
                      {professor.phone}
                    </a>
                  )}
                  {professor.email && (
                    <a className={`${styles.line} ${styles.link}`} href={`mailto:${professor.email}`}>
                      {professor.email}
                    </a>
                  )}
                </p>
              )}
            </div>
          ),
        )}
      </div>

      <div className={styles.photos}>{photos}</div>

      <div className={styles.main}>
        {section("education")}
        {section("experience")}
        {section("research")}
      </div>
      <div className={styles.project}>{section("projects")}</div>
    </section>
  );
}
