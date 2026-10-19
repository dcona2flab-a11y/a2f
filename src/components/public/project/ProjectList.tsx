"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import FilterDropdown, { type FilterOption } from "@/components/public/ui/FilterDropdown";
import { useMediaQuery } from "@/components/public/ui/useMediaQuery";
import { updateUrlSearch, useUrlSearch } from "@/components/public/ui/useUrlSearch";
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_SLUGS, PROJECT_PAGE_SIZE } from "@/config/content";
import type { NavBasePath } from "@/config/navigation";
import { projectYear, projectYears } from "@/lib/utils/projects";
import type { Project, ProjectCategory } from "@/types/content";
import ProjectCard from "./ProjectCard";
import styles from "./ProjectList.module.css";

type Props = {
  projects: Project[]; // all of them, newest first; filtering happens here
  basePath?: NavBasePath;
  // Admin composition hooks (neutral slots; the public page passes none).
  toolbar?: ReactNode;
  renderItemActions?: (project: Project) => ReactNode;
  empty?: ReactNode;
};

const ALL = "all";
const SLUG_TO_CATEGORY = Object.fromEntries(
  PROJECT_CATEGORIES.map((category) => [PROJECT_CATEGORY_SLUGS[category], category]),
) as Record<string, ProjectCategory>;

// Project list (Figma 365 0:1427 / 768 0:1897 / 1440 0:2381 / 1920 0:553). Filters live in the
// URL (?category=ux-ui&year=2025, pushed so back/forward work). Cards appear 9 at a time; the
// next 9 when the end of the list comes into view. A filter change starts again at 9.
export default function ProjectList({ projects, basePath = "", toolbar, renderItemActions, empty }: Props) {
  const params = useUrlSearch();
  const hasYearFilter = useMediaQuery("(min-width: 768px)", true); // 365: no year filter, all years

  const category = SLUG_TO_CATEGORY[params.get("category") ?? ""] ?? null;
  const years = projectYears(projects);
  const requestedYear = Number(params.get("year"));
  const year = hasYearFilter && years.includes(requestedYear) ? requestedYear : null;

  const items = projects.filter(
    (project) => (!category || project.category === category) && (!year || projectYear(project) === year),
  );

  // Any filter change (buttons, back/forward, URL) starts again at 9 cards.
  const filterKey = `${category ?? ALL}|${year ?? ALL}`;
  const [shown, setShown] = useState({ key: filterKey, count: PROJECT_PAGE_SIZE });
  if (shown.key !== filterKey) setShown({ key: filterKey, count: PROJECT_PAGE_SIZE }); // reset during render (no effect)
  const count = shown.key === filterKey ? shown.count : PROJECT_PAGE_SIZE;
  const visible = items.slice(0, count);
  const hasMore = count < items.length;

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown({ key: filterKey, count: count + PROJECT_PAGE_SIZE });
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, filterKey, count]);

  const yearOptions: FilterOption<string>[] = [
    { value: ALL, label: "All" },
    ...years.map((value) => ({ value: String(value), label: String(value) })),
  ];

  return (
    <section className={styles.section} aria-labelledby="project-title">
      <h1 id="project-title" className={styles.title}>
        Dive into
        <br />
        Our Project Case
      </h1>

      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      <div className={styles.filters}>
        <ul className={styles.categories} aria-label="Category">
          {[null, ...PROJECT_CATEGORIES].map((value) => (
            <li key={value ?? ALL}>
              <button
                type="button"
                className={`${styles.category} ${category === value ? styles.selected : ""}`}
                aria-pressed={category === value}
                onClick={() => updateUrlSearch({ category: value ? PROJECT_CATEGORY_SLUGS[value] : null }, { push: true })}
              >
                {value ?? "All"}
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.year}>
          <FilterDropdown
            size="project"
            label="Year"
            options={yearOptions}
            value={year ? String(year) : ALL}
            onChange={(value) => updateUrlSearch({ year: value === ALL ? null : value }, { push: true })}
          />
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className={styles.grid}>
          {visible.map((project, index) => (
            <li key={project.id} className={styles.item}>
              <ProjectCard project={project} href={`${basePath}/project/${project.id}`} index={index} />
              {renderItemActions?.(project)}
            </li>
          ))}
        </ul>
      ) : (
        empty
      )}
      {hasMore && <div ref={sentinel} className={styles.sentinel} aria-hidden="true" />}
    </section>
  );
}
