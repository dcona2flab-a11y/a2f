import type { ReactNode } from "react";
import type { HomeVisuals } from "@/types/content";
import HomeVisual from "./HomeVisual";
import styles from "./HomeCollage.module.css";

type Props = {
  visuals: HomeVisuals["main"];
  paragraphs: string[];
  // Composition hooks for the admin (e.g. wrap a photo in ImageReplace, a paragraph in Editable).
  renderVisual?: (index: number, visual: ReactNode) => ReactNode;
  renderParagraph?: (index: number, paragraph: ReactNode) => ReactNode;
};

const SLOT_CLASS = [styles.photo0, styles.photo1, styles.photo2];
// Paint order from Figma (later slots overlap earlier ones).
const PAINT_ORDER = [1, 2, 0];
const PARAGRAPH_CLASS = [styles.intro0, styles.intro1];
const SIZES = "(min-width: 1440px) 24vw, 48vw";

const identity = (_: number, node: ReactNode) => node;

// Main visual: photos, decorative blocks (gradient, light blue, two black) and the introduction placed as in the Figma collage
// of each breakpoint (positions in % of the collage, so in-between widths scale).
export default function HomeCollage({
  visuals,
  paragraphs,
  renderVisual = identity,
  renderParagraph = identity,
}: Props) {
  return (
    <section className={styles.collage} aria-label="Introduction">
      <div className={`${styles.block} ${styles.gradient}`} aria-hidden="true" />
      <div className={`${styles.block} ${styles.blue}`} aria-hidden="true" />
      <div className={`${styles.block} ${styles.black0}`} aria-hidden="true" />
      <div className={`${styles.block} ${styles.black1}`} aria-hidden="true" />
      {PAINT_ORDER.map((index) => (
        <div key={index} className={`${styles.block} ${SLOT_CLASS[index]}`}>
          {renderVisual(
            index,
            <HomeVisual image={visuals[index] ?? null} sizes={SIZES} />,
          )}
        </div>
      ))}
      {paragraphs.slice(0, PARAGRAPH_CLASS.length).map((text, index) => (
        <div key={index} className={`${styles.text} ${PARAGRAPH_CLASS[index]}`}>
          {renderParagraph(index, <p className={styles.paragraph}>{text}</p>)}
        </div>
      ))}
    </section>
  );
}
