"use client";

import { useEffect } from "react";
import { HOME_MOTION, MOTION, type MotionBreakpoint, type MotionLayerConfig } from "@/config/homeMotion";

// ani3 — Home scroll motion, ported from the designer's reference (src/config/homeMotion.ts).
// Rendered by the public Home only; without it (admin, no JS, reduced motion) the Home is the
// static Figma layout. The headline and the collage become sticky at their own position, so on
// screen they stay where they are at scroll 0; each layer then rises by its own travel, follows
// the scroll with a short follow-through, and the wiped layers and the headline are erased from
// the bottom edge up. JS only computes the numbers (CSS custom properties); the styling is in
// HomeCollage.module.css / HomeHeadline.module.css.

type Clearance = { photo: Layer; clearance: number; zone: number };

type Layer = MotionLayerConfig & {
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  end: number;
  clearAbove: Clearance[];
  clearBelow: Clearance[];
  travel: number;
  progress: number;
};

type Line = { el: HTMLElement; height: number };

type State = {
  cfg: MotionBreakpoint;
  scale: number;   // artboard unit × u → px
  phaseA: number;  // px
  header: number;
  next: number;    // document y of the next section
  layers: Layer[];
  lines: Line[];
};

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

// Eases into `limit` over the last `zone` px instead of stopping hard.
function resistTop(travel: number, limit: number, zone: number) {
  const start = limit - zone;
  return travel <= start ? travel : start + zone * (1 - Math.exp(-(travel - start) / zone));
}

function pickBreakpoint(): MotionBreakpoint {
  if (matchMedia("(min-width: 1920px)").matches) return HOME_MOTION.large;
  if (matchMedia("(min-width: 1440px)").matches) return HOME_MOTION.desktop;
  if (matchMedia("(min-width: 768px)").matches) return HOME_MOTION.tablet;
  return HOME_MOTION.mobile;
}

function startHomeMotion(collage: HTMLElement, headline: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const layerEls = [...collage.querySelectorAll<HTMLElement>("[data-motion-layer]")];
  const lineEls = [...headline.querySelectorAll<HTMLElement>("[data-motion-line]")];
  let state: State | null = null;
  let current = 0;
  let raf = 0;
  let last = 0;

  const travelAt = (s: State, scroll: number, rate: number) => {
    const span = MOTION.phaseBSpan * s.scale;
    const a = Math.min(scroll, s.phaseA);
    const b = Math.max(0, scroll - s.phaseA);
    return rate * (a + MOTION.phaseBRate * Math.min(b, span) + MOTION.lateRate * Math.max(0, b - span));
  };

  const scrollForTravel = (s: State, distance: number, rate: number) => {
    const normalized = distance / rate;
    if (normalized <= s.phaseA) return Math.max(0, normalized);
    const remainder = normalized - s.phaseA;
    const span = MOTION.phaseBSpan * s.scale;
    return (
      s.phaseA +
      (remainder <= MOTION.phaseBRate * span
        ? remainder / MOTION.phaseBRate
        : span + (remainder - MOTION.phaseBRate * span) / MOTION.lateRate)
    );
  };

  const clear = () => {
    collage.removeAttribute("data-motion");
    headline.removeAttribute("data-motion");
    for (const el of [collage, headline, ...layerEls, ...lineEls]) {
      for (const name of ["--motion-top", "--travel", "--cut", "--edge"]) el.style.removeProperty(name);
      el.removeAttribute("data-gone");
    }
  };

  const measure = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    clear();
    state = null;
    if (reduced.matches) return;

    const cfg = pickBreakpoint();
    const docY = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
    const collageRect = collage.getBoundingClientRect();
    const scale = (cfg.artboardWidth / 1920) * (collageRect.width / cfg.collageWidth);
    const header = parseFloat(getComputedStyle(collage).getPropertyValue("--header-height")) || 0;
    const nextEl = collage.nextElementSibling;
    const next = nextEl ? docY(nextEl) : document.documentElement.scrollHeight;
    const s: State = {
      cfg,
      scale,
      phaseA: cfg.phaseA * (collageRect.width / cfg.collageWidth),
      header,
      next,
      layers: [],
      lines: [],
    };

    for (const layer of cfg.layers) {
      const el = layerEls.find((node) => node.dataset.motionLayer === layer.slot);
      if (!el || el.offsetWidth === 0) continue;  // slot not shown at this breakpoint
      const rect = el.getBoundingClientRect();
      const l: Layer = {
        ...layer,
        el,
        x: rect.left,
        y: rect.top + window.scrollY,
        w: rect.width,
        h: rect.height,
        sectionClearance: (layer.sectionClearance ?? MOTION.sectionClearance) * scale,
        start: 0,
        end: 1,
        clearAbove: [],
        clearBelow: [],
        travel: 0,
        progress: 0,
      };
      if (l.wipe) {
        const beforeHeader = scrollForTravel(s, l.y - header - MOTION.wipeBeforeHeader * scale, l.rate);
        const finishBeforeNext = next - header - MOTION.nextSectionGap * scale;
        l.start = Math.max(
          0,
          Math.min(
            s.phaseA + (l.wipe.start + MOTION.wipeOffset) * scale,
            beforeHeader,
            finishBeforeNext - MOTION.nextSectionLead * scale,
          ),
        );
        l.end = Math.max(l.start + 1, Math.min(l.start + l.wipe.span * scale, finishBeforeNext));
      }
      s.layers.push(l);
    }

    // Text keeps its reading order: it never crosses the photos above or below it.
    for (const l of s.layers) {
      if (!l.copy) continue;
      for (const photo of s.layers) {
        if (photo.copy || l.x >= photo.x + photo.w || l.x + l.w <= photo.x) continue;
        const above = photo.y + photo.h <= l.y;
        const gap = above ? l.y - photo.y - photo.h : photo.y - l.y - l.h;
        if (gap <= 0) continue;
        const clearance = Math.min(MOTION.copyClearance * scale, gap * 0.75);
        const entry = { photo, clearance, zone: Math.min(MOTION.copyZone * scale, gap - clearance) };
        (above ? l.clearAbove : l.clearBelow).push(entry);
      }
    }

    s.lines = lineEls.map((el) => ({ el, height: parseFloat(getComputedStyle(el).getPropertyValue("--band")) * el.offsetHeight }));

    collage.style.setProperty("--motion-top", `${docY(collage)}px`);
    headline.style.setProperty("--motion-top", `${docY(headline)}px`);
    collage.setAttribute("data-motion", "");
    headline.setAttribute("data-motion", "");
    state = s;
    current = window.scrollY;
    paint();
  };

  const paint = () => {
    const s = state;
    if (!s) return;
    const scroll = window.scrollY;
    const nextTop = s.next - scroll;

    for (const l of s.layers) {
      l.travel = travelAt(s, current, l.rate);
      if (l.wipe) l.travel = resistTop(l.travel, l.y - s.header - MOTION.headerGap * s.scale, MOTION.headerZone * s.scale);
      else l.travel = Math.max(l.travel, l.y + l.h - nextTop + (l.sectionClearance ?? 0));
      l.progress = l.wipe ? clamp((current - l.start) / (l.end - l.start)) : 0;
      if (l.wipe) l.progress = Math.max(l.progress, clamp((l.y + l.h - l.travel - nextTop + (l.sectionClearance ?? 0)) / (l.h + 2)));
    }

    for (const l of s.layers) {
      let travel = l.travel;
      let p = l.progress;
      for (const { photo, clearance, zone } of l.clearAbove) {
        const height = photo.wipe ? Math.max(0, Math.min(photo.h, (photo.h + 2) * (1 - photo.progress) - 1)) : photo.h;
        const photoBottom = photo.y + height - photo.travel;
        travel = resistTop(travel, l.y - photoBottom - clearance, zone);
      }
      for (const { photo, clearance, zone } of l.clearBelow) {
        const photoTop = photo.y - photo.travel;
        travel = -resistTop(-travel, -(l.y + l.h - photoTop + clearance), zone);
      }
      if (l.wipe) {
        p = Math.max(p, clamp((l.y + l.h - travel - nextTop + (l.sectionClearance ?? 0)) / (l.h + 2)));
        const visible = Math.max(0, (l.h + 2) * (1 - p));
        const edge = Math.min(MOTION.wipeFeather * s.scale, visible, Math.max(0, l.h + 2 - visible) * 0.75);
        l.el.style.setProperty("--cut", `${(l.h - Math.max(0, visible - 1)).toFixed(2)}px`);
        l.el.style.setProperty("--edge", `${edge.toFixed(2)}px`);
      }
      l.el.style.setProperty("--travel", `${travel.toFixed(2)}px`);
      const aboveHeader = !l.wipe && l.y + l.h - travel <= s.header;
      l.el.toggleAttribute("data-gone", p >= 1 || aboveHeader);
    }

    // Headline: stays in place, both lines erased from their bottom edge by the same amount.
    const progress = clamp((current - MOTION.titleStart * s.scale) / (MOTION.titleSpan * s.scale));
    const inset = (Math.max(...s.lines.map((line) => line.height)) + 1) * progress;
    for (const line of s.lines) {
      const full = line.height + 1;
      const height = Math.max(0, full - inset);
      const edge = Math.min(MOTION.titleFeather * s.scale, height, Math.max(0, full - height) * 0.75);
      line.el.style.setProperty("--cut", `${Math.min(inset, full).toFixed(2)}px`);
      line.el.style.setProperty("--edge", `${edge.toFixed(2)}px`);
      line.el.toggleAttribute("data-gone", height <= 0);
    }
  };

  const tick = (now: number) => {
    const dt = last ? Math.min(now - last, 48) : 16.67;
    last = now;
    const target = window.scrollY;
    current += (target - current) * (1 - Math.exp(-dt / MOTION.followMs));
    if (Math.abs(target - current) < 0.05) current = target;
    paint();
    if (Math.abs(target - current) > 0.05) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      last = 0;
    }
  };

  const wake = () => {
    if (state && !raf) raf = requestAnimationFrame(tick);
  };

  const resizeObserver = new ResizeObserver(() => measure());
  if (collage.parentElement) resizeObserver.observe(collage.parentElement);
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("pageshow", measure);
  reduced.addEventListener("change", measure);
  measure();

  return () => {
    resizeObserver.disconnect();
    window.removeEventListener("scroll", wake);
    window.removeEventListener("resize", measure);
    window.removeEventListener("pageshow", measure);
    reduced.removeEventListener("change", measure);
    cancelAnimationFrame(raf);
    clear();
  };
}

export default function HomeScrollMotion() {
  useEffect(() => {
    const collage = document.querySelector<HTMLElement>('[data-home-motion="collage"]');
    const headline = document.querySelector<HTMLElement>('[data-home-motion="headline"]');
    if (!collage || !headline) return;
    return startHomeMotion(collage, headline);
  }, []);
  return null;
}
