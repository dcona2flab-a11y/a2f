import Image from "next/image";
import type { ReactNode } from "react";
import glyph from "@/assets/home/contact-glyph.svg";
import type { Settings } from "@/types/content";
import styles from "./ContactSection.module.css";

type Props = {
  contact: Settings["contact"];
  renderDetails?: (details: ReactNode) => ReactNode; // admin composition hook
};

// "Evolve your design thinking" + lab address (led by the A2F glyph, read as "A2F Lab"), phone, email.
export default function ContactSection({ contact, renderDetails = (details) => details }: Props) {
  const [firstLine, ...otherLines] = contact.addressLines;
  return (
    <section className={styles.section} aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.title}>
        Evolve your
        <br />
        design thinking
      </h2>
      {renderDetails(
        <div className={styles.details}>
          <address className={styles.block}>
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
          <p className={styles.block}>
            {contact.phone && (
              <a className={styles.line} href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a className={styles.line} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            )}
          </p>
        </div>,
      )}
    </section>
  );
}
