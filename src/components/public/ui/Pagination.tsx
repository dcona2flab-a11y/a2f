"use client";

import styles from "./Pagination.module.css";

type Props = {
  page: number;      // 1-based
  pageCount: number;
  onChange: (page: number) => void;
  label: string;     // accessible name of the navigation
};

const WINDOW = 5; // Figma shows five page numbers

// Figma pagination: page numbers (current SemiBold black, others #888) + previous/next arrows
// (green when usable, #888 when not).
export default function Pagination({ page, pageCount, onChange, label }: Props) {
  const first = Math.max(1, Math.min(page - Math.floor(WINDOW / 2), pageCount - WINDOW + 1));
  const pages = Array.from({ length: Math.min(WINDOW, pageCount) }, (_, index) => first + index);

  return (
    <nav className={styles.pagination} aria-label={label}>
      <ul className={styles.pages}>
        {pages.map((number) => (
          <li key={number}>
            <button
              type="button"
              className={`${styles.page} ${number === page ? styles.current : ""}`}
              aria-current={number === page ? "page" : undefined}
              aria-label={`Page ${number}`}
              onClick={() => onChange(number)}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`${styles.arrow} ${styles.previous}`}
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      />
      <button
        type="button"
        className={`${styles.arrow} ${styles.next}`}
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      />
    </nav>
  );
}
