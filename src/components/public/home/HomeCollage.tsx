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
const PARAGRAPH_CLASS = [styles.intro0, styles.intro1];
const SIZES = "(min-width: 1440px) 24vw, 48vw";

const identity = (_: number, node: ReactNode) => node;

// Main visual: photos, decorative blocks (gradient, light blue, two black) and the introduction placed as in the Figma collage
// of each breakpoint (positions in % of the collage, so in-between widths scale). Paint order and
// the data-motion-* hooks are for the Home scroll motion (HomeScrollMotion, public Home only).
export default function HomeCollage({
  visuals,
  paragraphs,
  renderVisual = identity,
  renderParagraph = identity,
}: Props) {
  return (
    <section className={styles.collage} aria-label="Introduction" data-home-motion="collage">
      <div className={`${styles.block} ${styles.black0}`} aria-hidden="true" data-motion-layer="black0" />
      <div className={`${styles.block} ${styles.gradient}`} aria-hidden="true" data-motion-layer="gradient" />
      <div className={`${styles.block} ${styles.blue}`} aria-hidden="true" data-motion-layer="blue" />
      <div className={`${styles.block} ${styles.black1}`} aria-hidden="true" data-motion-layer="black1" />
      {SLOT_CLASS.map((slotClass, index) => (
        <div key={index} className={`${styles.block} ${slotClass}`} data-motion-layer={`photo${index}`}>
          {renderVisual(
            index,
            <HomeVisual image={visuals[index] ?? null} sizes={SIZES} />,
          )}
        </div>
      ))}
      {paragraphs.slice(0, PARAGRAPH_CLASS.length).map((text, index) => (
        <div key={index} className={`${styles.text} ${PARAGRAPH_CLASS[index]}`} data-motion-layer={`intro${index}`}>
          {renderParagraph(index, <p className={styles.paragraph}>{text}</p>)}
        </div>
      ))}
    </section>
  );
}
