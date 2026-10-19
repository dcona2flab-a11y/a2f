import Image from "next/image";
import type { ReactNode } from "react";
import type { TeamIntro as TeamIntroData } from "@/types/content";
import styles from "./TeamIntro.module.css";

type Props = {
  intro: TeamIntroData;
  // Admin composition hooks. With renderImage the photo slot is shown even when empty.
  renderText?: (text: ReactNode) => ReactNode;
  renderImage?: (image: ReactNode) => ReactNode;
};

// "Meet The Team" + intro text + one photo. The text keeps its line breaks.
export default function TeamIntro({ intro, renderText = (text) => text, renderImage }: Props) {
  const image = intro.image && (
    <Image
      className={styles.photo}
      src={intro.image.url}
      alt={intro.image.alt}
      fill
      sizes="(min-width: 1920px) 553px, (min-width: 1440px) 411px, (min-width: 768px) 223px, 99px"
    />
  );
  const showImage = Boolean(image) || renderImage !== undefined;

  return (
    <section className={styles.intro} aria-labelledby="team-title">
      <h1 id="team-title" className={styles.title}>
        Meet
        <br />
        The Team
      </h1>
      <div className={styles.body}>
        {renderText(<p className={styles.text}>{intro.text}</p>)}
        {showImage && (
          <div className={`${styles.image} ${image ? "" : styles.empty}`}>{renderImage ? renderImage(image) : image}</div>
        )}
      </div>
    </section>
  );
}
