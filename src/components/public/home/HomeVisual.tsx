import Image from "next/image";
import type { ImageRef } from "@/types/content";
import styles from "./HomeVisual.module.css";

type Props = {
  image: ImageRef | null;
  sizes: string;
};

// One collage photo, filling its slot (cover crop). An empty slot keeps its place.
export default function HomeVisual({ image, sizes }: Props) {
  return (
    <div className={styles.media}>
      {image && <Image className={styles.image} src={image.url} alt={image.alt} fill sizes={sizes} />}
    </div>
  );
}
