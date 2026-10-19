import Image from "next/image";
import bxBiIcon from "@/assets/project/category-bx-bi.svg";
import etcIcon from "@/assets/project/category-etc.svg";
import graphicIcon from "@/assets/project/category-graphic.svg";
import planningIcon from "@/assets/project/category-planning.svg";
import uxUiIcon from "@/assets/project/category-ux-ui.svg";
import type { ProjectCategory } from "@/types/content";
import styles from "./ProjectTag.module.css";

// Figma category icons (green), one per fixed category.
const CATEGORY_ICON: Record<ProjectCategory, { src: typeof uxUiIcon; className: string }> = {
  "UX/UI": { src: uxUiIcon, className: styles.iconUxUi },
  "BX/BI": { src: bxBiIcon, className: styles.iconBxBi },
  Planning: { src: planningIcon, className: styles.iconPlanning },
  Graphic: { src: graphicIcon, className: styles.iconGraphic },
  ETC: { src: etcIcon, className: styles.iconEtc },
};

type Props = {
  category?: ProjectCategory; // with its icon; without: the custom tag
  label: string;
  size?: "card" | "detail";   // 1440 differs (card 18/26, detail 20/30)
};

// #FAFAFA tag: [icon] label.
export default function ProjectTag({ category, label, size = "card" }: Props) {
  const icon = category && CATEGORY_ICON[category];
  return (
    <span className={`${styles.tag} ${size === "detail" ? styles.detail : ""}`}>
      {icon && <Image className={`${styles.icon} ${icon.className}`} src={icon.src} alt="" unoptimized />}
      {label}
    </span>
  );
}
