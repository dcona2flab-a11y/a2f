"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import styles from "./FilterDropdown.module.css";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  icon?: StaticImageData; // shown on the closed button when this option is selected
};

type Props<T extends string> = {
  label: string; // accessible name, e.g. "Filter Award & Activity"
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "award" | "project"; // Figma sizes of the Award filter (Home) or the Project year filter
  className?: string;
};

// Figma filter dropdown (Award & Activity open state: 1440 0:2325 / 1920 0:326 / 768 0:1721;
// Project year filter: closed 1920 0:570 / 1440 0:2398 / 768 0:1913, open 1920 0:669).
// Button + listbox; keyboard: ↑/↓, Home/End, Enter/Space to choose, Esc to close.
export default function FilterDropdown<T extends string>({ label, options, value, onChange, size = "award", className }: Props<T>) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value) ?? options[0];

  // Close on any pointer press outside the dropdown.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const openList = () => {
    setActiveIndex(Math.max(0, options.indexOf(selected)));
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const choose = (index: number) => {
    onChange(options[index].value);
    close(true);
  };

  const onButtonKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList();
    }
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = options.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActiveIndex((index) => Math.min(last, index + 1)),
      ArrowUp: () => setActiveIndex((index) => Math.max(0, index - 1)),
      Home: () => setActiveIndex(0),
      End: () => setActiveIndex(last),
      Enter: () => choose(activeIndex),
      " ": () => choose(activeIndex),
      Escape: () => close(true),
    };
    if (event.key === "Tab") return close(false);
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.dropdown} ${size === "project" ? styles.project : ""} ${open ? styles.open : ""} ${className ?? ""}`}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${selected.label}`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onButtonKeyDown}
      >
        <span className={styles.current}>
          {selected.icon && <Image className={styles.icon} src={selected.icon} alt="" unoptimized />}
          {selected.label}
        </span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          className={styles.list}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              className={`${styles.option} ${index === activeIndex ? styles.active : ""}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => choose(index)}
              onPointerMove={() => setActiveIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
