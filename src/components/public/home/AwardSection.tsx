"use client";

import type { ReactNode } from "react";
import { AWARD_TYPE_META } from "@/components/public/award/AwardTypeIcon";
import AwardCard from "@/components/public/award/AwardCard";
import FilterDropdown, { type FilterOption } from "@/components/public/ui/FilterDropdown";
import Pagination from "@/components/public/ui/Pagination";
import { useMediaQuery } from "@/components/public/ui/useMediaQuery";
import { updateUrlSearch as updateSearch, useUrlSearch } from "@/components/public/ui/useUrlSearch";
import { AWARD_DETAIL_AVAILABLE } from "@/config/content";
import type { NavBasePath } from "@/config/navigation";
import type { Award } from "@/types/content";
import styles from "./AwardSection.module.css";

type Filter = "all" | "award" | "activity";

const FILTER_OPTIONS: FilterOption<Filter>[] = [
  { value: "all", label: "All" },
  { value: "award", label: AWARD_TYPE_META.AWARD.label, icon: AWARD_TYPE_META.AWARD.icon },
  { value: "activity", label: AWARD_TYPE_META.ACTIVITY.label, icon: AWARD_TYPE_META.ACTIVITY.icon },
];

const FILTER_TYPE = { award: "AWARD", activity: "ACTIVITY" } as const;

// Cards per page (Figma): 768 shows two, every other breakpoint three.
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1439px)";
const FILTER_QUERY = "(min-width: 768px)"; // 365 has no filter: everything is listed

type Props = {
  awards: Award[]; // newest first
  basePath?: NavBasePath;
  // Admin composition hooks (neutral slots; the public page passes none).
  toolbar?: ReactNode;
  renderItemActions?: (award: Award) => ReactNode;
  empty?: ReactNode;
};

// Filter and page live in the URL (?award=activity&page=2), so returning from a detail page
// keeps the place. They are read on the client; the server renders the first page of "All".
export default function AwardSection({ awards, basePath = "", toolbar, renderItemActions, empty }: Props) {
  const params = useUrlSearch();
  const isTablet = useMediaQuery(TABLET_QUERY);
  const hasFilter = useMediaQuery(FILTER_QUERY, true);

  const requested = params.get("award");
  const filter: Filter = hasFilter && (requested === "award" || requested === "activity") ? requested : "all";
  const items = filter === "all" ? awards : awards.filter((award) => award.type === FILTER_TYPE[filter]);

  const pageSize = isTablet ? 2 : 3;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, Number(params.get("page")) || 1), pageCount);
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section id="award" className={styles.section} aria-labelledby="award-title">
      <div className={styles.header}>
        <h2 id="award-title" className={styles.title}>
          Award &amp; Activity
        </h2>
        <div className={styles.controls}>
          {toolbar}
          <FilterDropdown
            className={styles.filter}
            label="Filter Award & Activity"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(value) => updateSearch({ award: value === "all" ? null : value, page: null })}
          />
        </div>
      </div>

      {pageItems.length > 0 ? (
        <ul className={styles.list}>
          {pageItems.map((award, index) => (
            <li key={award.id} className={styles.item}>
              <AwardCard
                award={award}
                href={AWARD_DETAIL_AVAILABLE ? `${basePath}/award/${award.id}` : undefined}
                position={index}
              />
              {renderItemActions?.(award)}
            </li>
          ))}
        </ul>
      ) : (
        empty
      )}

      {pageCount > 1 && (
        <Pagination
          page={page}
          pageCount={pageCount}
          label="Award & Activity pages"
          onChange={(next) => updateSearch({ page: next > 1 ? String(next) : null })}
        />
      )}
    </section>
  );
}
