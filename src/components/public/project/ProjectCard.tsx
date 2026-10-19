"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDisplayDate } from "@/lib/utils/date";
import type { Project } from "@/types/content";
import ProjectTag from "./ProjectTag";
import { useHoverCycle } from "./useHoverCycle";
import styles from "./ProjectCard.module.css";

type Props = {
  project: Project;
  href: string;
  index: number; // position in the list: Figma repeats a pattern of image box heights
};

const SIZES = "(min-width: 1440px) 32vw, (min-width: 768px) 48vw, 100vw";

// Project card (Figma list frames). Image box: the Figma height for this position (cover crop of
// images[0]). Reading order is always image → title → tag/date → body; 1920 shows tag/date first.
export default function ProjectCard({ project, href, index }: Props) {
  const { images } = project;
  const { index: shown, active, start, stop } = useHoverCycle(images.length);
  const pattern = `${styles[`p9_${index % 9}`]} ${styles[`p6_${index % 6}`]} ${styles[`p3_${index % 3}`]}`;

  // While cycling, only the previous, current and next photos are mounted (next = preload).
  const layers = active
    ? [
        { at: (shown - 1 + images.length) % images.length, state: styles.previous },
        { at: shown, state: styles.current },
        { at: (shown + 1) % images.length, state: "" },
      ].filter((layer, i, all) => all.findIndex((other) => other.at === layer.at) === i)
    : [];

  return (
    <Link
      className={styles.card}
      href={href}
      onPointerEnter={(event) => event.pointerType === "mouse" && start()}
      onPointerLeave={stop}
    >
      <div className={`${styles.media} ${pattern}`}>
        {images[0] && <Image className={styles.image} src={images[0].url} alt={images[0].alt} fill sizes={SIZES} />}
        {layers.map(({ at, state }) => (
          <Image
            key={images[at].pathname}
            className={`${styles.image} ${styles.layer} ${state}`}
            src={images[at].url}
            alt=""
            fill
            sizes={SIZES}
          />
        ))}
      </div>
      <h2 className={styles.title}>{project.title}</h2>
      <p className={styles.meta}>
        <ProjectTag category={project.category} label={project.category} />
        <time dateTime={project.date}>{formatDisplayDate(project.date)}</time>
      </p>
      {project.body && <p className={styles.body}>{project.body}</p>}
    </Link>
  );
}
