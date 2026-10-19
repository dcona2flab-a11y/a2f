import type { ReactNode } from "react";
import ArtDirectedImage from "@/components/common/ArtDirectedImage";
import why365 from "@/assets/home/why-label-365.svg";
import why768 from "@/assets/home/why-label-768.svg";
import why1440 from "@/assets/home/why-label-1440.svg";
import why1920 from "@/assets/home/why-label-1920.svg";
import type { HomeContent } from "@/types/content";
import styles from "./WhySection.module.css";

type Props = {
  why: HomeContent["why"];
  renderText?: (text: ReactNode) => ReactNode; // admin composition hook
  children?: ReactNode;                         // the Research Field grid
};

// "Why A2F Lab" label (Figma lettering with the A2F glyph) + statement + description,
// followed by the Research Fields.
export default function WhySection({ why, renderText = (text) => text, children }: Props) {
  return (
    <section className={styles.section} aria-labelledby="why-a2f">
      <div className={styles.intro}>
        <h2 id="why-a2f" className={styles.heading}>
          <span className="visually-hidden">Why A2F Lab</span>
          <ArtDirectedImage
            className={styles.label}
            alt=""
            fallback={why365}
            sources={[
              { media: "(min-width: 1920px)", src: why1920 },
              { media: "(min-width: 1440px)", src: why1440 },
              { media: "(min-width: 768px)", src: why768 },
            ]}
          />
        </h2>
        <div className={styles.textCell}>
          {renderText(
            <div className={styles.text}>
              <p className={styles.statement}>
                {why.statementLead && <span className={styles.lead}>{why.statementLead}</span>}
                {why.statementLead && why.statement && " "}
                {why.statement}
              </p>
              {why.description && <p className={styles.description}>{why.description}</p>}
            </div>,
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
