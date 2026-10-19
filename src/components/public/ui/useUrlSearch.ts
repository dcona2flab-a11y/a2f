"use client";

import { useSyncExternalStore } from "react";

// List filters kept in the URL query (?category=…&year=…). Read on the client (the server
// renders the default state); updates go through the History API, so no request is made and
// back/forward restore the previous filter when updates are pushed.

const SEARCH_CHANGE = "a2f:searchchange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(SEARCH_CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(SEARCH_CHANGE, onChange);
  };
}

export function useUrlSearch(): URLSearchParams {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  return new URLSearchParams(search);
}

// `null` removes a key. `push` adds a history entry (back/forward), otherwise it is replaced.
export function updateUrlSearch(changes: Record<string, string | null>, { push = false } = {}) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  if (url.href === window.location.href) return;
  if (push) window.history.pushState(window.history.state, "", url);
  else window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(SEARCH_CHANGE));
}
