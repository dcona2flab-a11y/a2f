"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ani2 (Figma "Hover type 2" 0:2875): while the pointer is on a card, the photos follow one
// another every ~235 ms (Figma: 0.0976 × 2.409 s), each crossfading in; back to the first photo
// when the pointer leaves. Only on hover-capable desktop layouts (1440+) without reduced motion.
export const HOVER_CYCLE_INTERVAL_MS = 235;
const CYCLE_QUERY = "(hover: hover) and (min-width: 1440px) and (prefers-reduced-motion: no-preference)";

export function useHoverCycle(count: number) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setActive(false);
    setIndex(0);
  }, []);

  const start = useCallback(() => {
    if (count < 2 || timer.current || !window.matchMedia(CYCLE_QUERY).matches) return;
    setActive(true);
    timer.current = setInterval(() => setIndex((current) => (current + 1) % count), HOVER_CYCLE_INTERVAL_MS);
  }, [count]);

  // Clear on unmount.
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  return { index, active, start, stop };
}
