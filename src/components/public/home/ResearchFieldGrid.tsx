import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import ArtDirectedImage from "@/components/common/ArtDirectedImage";
import field01 from "@/assets/home/field-01.svg";
import field01Small from "@/assets/home/field-01-sm.svg";
import field02 from "@/assets/home/field-02.svg";
import field02Small from "@/assets/home/field-02-sm.svg";
import field03 from "@/assets/home/field-03.svg";
import field03Small from "@/assets/home/field-03-sm.svg";
import field04 from "@/assets/home/field-04.svg";
import field04Small from "@/assets/home/field-04-sm.svg";
import field05 from "@/assets/home/field-05.svg";
import field05Small from "@/assets/home/field-05-sm.svg";
import field06 from "@/assets/home/field-06.svg";
import field06Small from "@/assets/home/field-06-sm.svg";
import type { ResearchField } from "@/types/content";
import styles from "./ResearchFieldGrid.module.css";

// Icons are fixed in code and matched by the field id. 365 uses its own (smaller) drawing.
const ICONS: Record<string, { large: StaticImageData; small: StaticImageData; className: string }> = {
  "field-01": { large: field01, small: field01Small, className: styles.icon01 },
  "field-02": { large: field02, small: field02Small, className: styles.icon02 },
  "field-03": { large: field03, small: field03Small, className: styles.icon03 },
  "field-04": { large: field04, small: field04Small, className: styles.icon04 },
  "field-05": { large: field05, small: field05Small, className: styles.icon05 },
  "field-06": { large: field06, small: field06Small, className: styles.icon06 },
};

type Props = {
  fields: ResearchField[];                                        // already in display order
  renderCard?: (field: ResearchField, card: ReactNode) => ReactNode; // admin composition hook
};

export default function ResearchFieldGrid({ fields, renderCard = (_, card) => card }: Props) {
  return (
    <ul className={styles.grid}>
      {fields.map((field) => (
        <li key={field.id} className={styles.cell}>
          {renderCard(field, <ResearchFieldCard field={field} />)}
        </li>
      ))}
    </ul>
  );
}

function ResearchFieldCard({ field }: { field: ResearchField }) {
  const icon = ICONS[field.id];
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{field.title}</h3>
      <div className={styles.iconBox}>
        {icon && (
          <ArtDirectedImage
            className={`${styles.icon} ${icon.className}`}
            alt=""
            fallback={icon.small}
            sources={[{ media: "(min-width: 768px)", src: icon.large }]}
          />
        )}
      </div>
      <div className={styles.text}>
        {field.subtitle && <p className={styles.subtitle}>{field.subtitle}</p>}
        {field.description && <p className={styles.description}>{field.description}</p>}
      </div>
    </article>
  );
}
