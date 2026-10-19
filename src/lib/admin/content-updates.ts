import "server-only";
import type { SaveOutcome } from "@/components/admin/edit/InlineTextEditor";
import { DEFAULT_CONTENT } from "@/config/defaults";
import { saveDocument, VERSION_CONFLICT_MESSAGE } from "@/lib/blob/json-store";
import { readCachedDocument, refreshContent } from "@/services/content";
import type { Award, HomeContent, Member, Professor, Project, Settings } from "@/types/content";

// Read-modify-save for admin Server Actions (call requireAdmin() and validate input first).
// The current content comes from the cached latest version (no Blob list); saveDocument() then
// lists the versions once and only writes if the stored latest is still the version the editor
// was opened with (put with allowOverwrite:false guards the race). Otherwise the admin gets
// the conflict message and nothing is written.

const CONFLICT: SaveOutcome = { ok: false, message: VERSION_CONFLICT_MESSAGE };

// `update` returns the new data, or a message to show instead of saving.
type Update<T> = (current: T) => T | { error: string };

const isError = <T,>(value: T | { error: string }): value is { error: string } =>
  typeof value === "object" && value !== null && "error" in value;

export async function updateHome(expectedVersion: number, update: Update<HomeContent>): Promise<SaveOutcome> {
  const current = await readCachedDocument("home");
  if ((current?.version ?? 0) !== expectedVersion) return CONFLICT;
  const next = update(current?.data ?? DEFAULT_CONTENT.home.data);
  if (isError(next)) return { ok: false, message: next.error };
  const result = await saveDocument("home", expectedVersion, { data: next });
  if (!result.ok) {
    // The stored latest is newer than the cache said (e.g. data written by a script): refresh
    // the cache so a reload shows the latest version instead of conflicting again.
    refreshContent("home");
    return { ok: false, message: result.message };
  }
  refreshContent("home");
  return { ok: true };
}

export async function updateSettings(expectedVersion: number, update: Update<Settings>): Promise<SaveOutcome> {
  const current = await readCachedDocument("settings");
  if ((current?.version ?? 0) !== expectedVersion) return CONFLICT;
  const next = update(current?.data ?? DEFAULT_CONTENT.settings.data);
  if (isError(next)) return { ok: false, message: next.error };
  const result = await saveDocument("settings", expectedVersion, { data: next });
  if (!result.ok) {
    // The stored latest is newer than the cache said (e.g. data written by a script): refresh
    // the cache so a reload shows the latest version instead of conflicting again.
    refreshContent("settings");
    return { ok: false, message: result.message };
  }
  refreshContent("settings");
  return { ok: true };
}

export async function updateAwards(expectedVersion: number, update: Update<Award[]>): Promise<SaveOutcome> {
  const current = await readCachedDocument("awards");
  if ((current?.version ?? 0) !== expectedVersion) return CONFLICT;
  const next = update(current?.items ?? []);
  if (isError(next)) return { ok: false, message: next.error };
  const result = await saveDocument("awards", expectedVersion, { items: next });
  if (!result.ok) {
    // The stored latest is newer than the cache said (e.g. data written by a script): refresh
    // the cache so a reload shows the latest version instead of conflicting again.
    refreshContent("awards");
    return { ok: false, message: result.message };
  }
  refreshContent("awards");
  return { ok: true };
}

export async function updateProjects(expectedVersion: number, update: Update<Project[]>): Promise<SaveOutcome> {
  const current = await readCachedDocument("projects");
  if ((current?.version ?? 0) !== expectedVersion) return CONFLICT;
  const next = update(current?.items ?? []);
  if (isError(next)) return { ok: false, message: next.error };
  const result = await saveDocument("projects", expectedVersion, { items: next });
  if (!result.ok) {
    // The stored latest is newer than the cache said (e.g. data written by a script): refresh
    // the cache so a reload shows the latest version instead of conflicting again.
    refreshContent("projects");
    return { ok: false, message: result.message };
  }
  refreshContent("projects");
  return { ok: true };
}

export async function updateProfessor(expectedVersion: number, update: Update<Professor>): Promise<SaveOutcome> {
  const current = await readCachedDocument("professor");
  if ((current?.version ?? 0) !== expectedVersion) return CONFLICT;
  const next = update(current?.data ?? DEFAULT_CONTENT.professor.data);
  if (isError(next)) return { ok: false, message: next.error };
  const result = await saveDocument("professor", expectedVersion, { data: next });
  if (!result.ok) {
    // The stored latest is newer than the cache said (e.g. data written by a script): refresh
    // the cache so a reload shows the latest version instead of conflicting again.
    refreshContent("professor");
    return { ok: false, message: result.message };
  }
  refreshContent("professor");
  return { ok: true };
}

export async function updateMembers(expectedVersion: number, update: Update<Member[]>): Promise<SaveOutcome> {
  const current = await readCachedDocument("members");
  if ((current?.version ?? 0) !== expectedVersion) return CONFLICT;
  const next = update(current?.items ?? []);
  if (isError(next)) return { ok: false, message: next.error };
  const result = await saveDocument("members", expectedVersion, { items: next });
  if (!result.ok) {
    // The stored latest is newer than the cache said (e.g. data written by a script): refresh
    // the cache so a reload shows the latest version instead of conflicting again.
    refreshContent("members");
    return { ok: false, message: result.message };
  }
  refreshContent("members");
  return { ok: true };
}
