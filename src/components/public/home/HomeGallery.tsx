import type { ReactNode } from "react";
import type { HomeVisuals } from "@/types/content";
import HomeVisual from "./HomeVisual";
import styles from "./HomeGallery.module.css";

type Props = {
  visuals: HomeVisuals["secondary"];
  renderVisual?: (index: number, visual: ReactNode) => ReactNode; // admin composition hook
};

const SLOT_CLASS = [styles.left, styles.right];
const SIZES = ["(min-width: 1440px) 41vw, 65vw", "(min-width: 1440px) 32vw, 31vw"];

const identity = (_: number, node: ReactNode) => node;

// Second collage (between Research Fields and Award & Activity): a tall photo on the left,
// set lower, and a photo top right.
export default function HomeGallery({ visuals, renderVisual = identity }: Props) {
  return (
    <div className={styles.gallery}>
      {SLOT_CLASS.map((className, index) => (
        <div key={index} className={`${styles.slot} ${className}`}>
          {renderVisual(index, <HomeVisual image={visuals[index] ?? null} sizes={SIZES[index]} />)}
        </div>
      ))}
    </div>
  );
}
