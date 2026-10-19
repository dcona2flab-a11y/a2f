import ArtDirectedImage from "@/components/common/ArtDirectedImage";
import headline365 from "@/assets/home/headline-365.svg";
import headline768 from "@/assets/home/headline-768.svg";
import headline1440 from "@/assets/home/headline-1440.svg";
import headline1920 from "@/assets/home/headline-1920.svg";
import styles from "./HomeHeadline.module.css";

export const HOME_HEADLINE = "Approach 2 Flux, Access 2 Frame";

const LINE_CLASS = [styles.line1, styles.line2];

// The headline is lettering from Figma (outlined, custom "2"), drawn per breakpoint.
// The SVG is the visual; the hidden text is the real <h1>. The same SVG is layered twice, each
// layer showing one line, so the two lines can leave separately on scroll (see the CSS).
export default function HomeHeadline() {
  return (
    <h1 className={styles.headline}>
      <span className="visually-hidden">{HOME_HEADLINE}</span>
      <span className={styles.lines} aria-hidden="true">
        {LINE_CLASS.map((lineClass) => (
          <span key={lineClass} className={`${styles.line} ${lineClass}`}>
            <ArtDirectedImage
              className={styles.image}
              alt=""
              fallback={headline365}
              sources={[
                { media: "(min-width: 1920px)", src: headline1920 },
                { media: "(min-width: 1440px)", src: headline1440 },
                { media: "(min-width: 768px)", src: headline768 },
              ]}
            />
          </span>
        ))}
      </span>
    </h1>
  );
}
