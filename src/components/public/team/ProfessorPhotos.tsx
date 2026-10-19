"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/components/public/ui/useMediaQuery";
import { PROFESSOR_PHOTO_INTERVAL_MS } from "@/config/team";
import type { ImageRef } from "@/types/content";
import styles from "./ProfessorPhotos.module.css";

type Props = {
  images: ImageRef[];   // 0–3 (0 shows the empty frame; the public page leaves it out)
  name: string;         // for the alt fallback and the indicator labels
  autoRotate?: boolean; // false keeps the selected photo (e.g. while editing)
};

// Professor photos: one at a time, the next every ~3 s; the squares below select a photo
// directly (selected = filled). Rotation stops for reduced motion and pauses while the
// pointer or keyboard focus is on the photos. Automatic changes crossfade; a click switches
// at once and restarts the 3 s wait.
export default function ProfessorPhotos({ images, name, autoRotate = true }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [picked, setPicked] = useState(false); // chosen with a square: switch at once, no fade
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const count = images.length;
  const current = index < count ? index : 0;
  const rotating = autoRotate && count > 1 && !reducedMotion && !paused;

  useEffect(() => {
    if (!rotating) return;
    const timer = setTimeout(() => {
      setPicked(false);
      setIndex((current + 1) % count);
    }, PROFESSOR_PHOTO_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [rotating, current, count]);

  return (
    <div
      className={styles.photos}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Keyboard focus pauses; a mouse click on a square does not (the 3 s wait restarts).
      onFocus={(event) => setPaused(event.target.matches(":focus-visible"))}
      onBlur={() => setPaused(false)}
    >
      <div className={`${styles.frame} ${count === 0 ? styles.empty : ""} ${picked ? styles.picked : ""}`}>
        {images.map((image, i) => (
          <Image
            key={image.pathname}
            className={`${styles.photo} ${i === current ? styles.current : ""}`}
            src={image.url}
            alt={i === current ? image.alt || name : ""}
            aria-hidden={i === current ? undefined : true}
            fill
            sizes="(min-width: 1920px) 408px, (min-width: 1440px) 302px, (min-width: 768px) 223px, 155px"
            priority={i === 0}
          />
        ))}
      </div>
      {count > 1 && (
        <div className={styles.indicators} role="group" aria-label="교수 사진 선택">
          {images.map((image, i) => (
            <button
              key={image.pathname}
              type="button"
              className={`${styles.indicator} ${i === current ? styles.selected : ""}`}
              aria-label={`사진 ${i + 1} / ${count}`}
              aria-pressed={i === current}
              onClick={() => {
                setPicked(true);
                setIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
