import { z } from "zod";
import {
  AWARD_ACTIVITY_TYPES,
  AWARD_DEGREES,
  LIMITS,
  MEMBER_TYPES,
  PROJECT_CATEGORIES,
  TEAM_DEGREES,
} from "@/config/content";
import { HOME_VISUAL_SLOTS } from "@/config/home";
import { DEFAULT_TEAM_INTRO_TEXT } from "@/config/team";
import type { DataKey } from "@/config/storage";
import {
  dateSchema,
  idSchema,
  imageRefSchema,
  listDocument,
  objectDocument,
  optionalText,
  recordTimestamps,
  requiredText,
} from "./common";

// Home ------------------------------------------------------------------

export const researchFieldSchema = z.object({
  id: idSchema,
  title: requiredText,
  subtitle: optionalText, // Korean heading shown on the card
  description: optionalText,
  order: z.number().int().nonnegative(),
});

// Collage photo slots (positions are fixed in code, see config/home). An empty slot is null.
const visualSlots = (count: number) => z.array(imageRefSchema.nullable()).length(count);

// Versions saved during step 4a had 5 main slots, the first two under the black blocks
// (now decoration); they read as the 3 photo slots.
const LEGACY_MAIN_SLOTS = 5;
const dropLegacyBlackSlots = (value: unknown) =>
  Array.isArray(value) && value.length === LEGACY_MAIN_SLOTS ? value.slice(LEGACY_MAIN_SLOTS - HOME_VISUAL_SLOTS.main) : value;

export const homeVisualsSchema = z.object({
  main: z.preprocess(dropLegacyBlackSlots, visualSlots(HOME_VISUAL_SLOTS.main)),
  secondary: visualSlots(HOME_VISUAL_SLOTS.secondary),
});

const emptyVisuals = () => ({
  main: Array<null>(HOME_VISUAL_SLOTS.main).fill(null),
  secondary: Array<null>(HOME_VISUAL_SLOTS.secondary).fill(null),
});

// Admin-editable Home content. Logo, headline, navigation labels, research field icons and
// decorative blocks are fixed in code. Footer/contact text lives in settings.json.
export const homeSchema = z.object({
  introduction: z.object({
    paragraphs: z.array(requiredText),
  }),
  why: z.object({
    // Exact split of the highlighted lead ("We study") is to be confirmed in Figma.
    statementLead: optionalText,
    statement: optionalText,
    description: optionalText,
  }),
  researchFields: z.array(researchFieldSchema).length(LIMITS.researchFields),
  // Versions saved before the collage photos existed read as all-empty slots.
  visuals: homeVisualsSchema.default(emptyVisuals),
});

// Award & Activity ------------------------------------------------------

export const awardPersonSchema = z.object({
  name: requiredText,
  degree: z.enum(AWARD_DEGREES),
  role: optionalText,
  profileImage: imageRefSchema.optional(),
});

export const awardSchema = z.object({
  id: idSchema,
  type: z.enum(AWARD_ACTIVITY_TYPES),
  title: requiredText, // event / project name
  label: requiredText, // e.g. "Excellence Prize", "Academic Conference"
  date: dateSchema,
  body: optionalText,
  images: z.array(imageRefSchema),
  people: z.array(awardPersonSchema).max(LIMITS.awardPeople),
  ...recordTimestamps,
});

// Project ---------------------------------------------------------------

// Entered directly; not linked to Team data.
export const projectMemberSchema = z.object({
  name: requiredText,
  degree: z.enum(AWARD_DEGREES),
  role: optionalText.default(""), // added in step 6; older versions read as ""
  profileImage: imageRefSchema.optional(),
});

export const projectSchema = z.object({
  id: idSchema,
  title: requiredText,
  date: dateSchema,
  body: optionalText,
  category: z.enum(PROJECT_CATEGORIES),
  customTag: optionalText, // exactly one free-text tag, never an array
  member: projectMemberSchema.nullable(), // at most LIMITS.projectMembers (1)
  images: z.array(imageRefSchema), // images[0] is the representative image
  ...recordTimestamps,
});

// Professor -------------------------------------------------------------

const sectionLines = z.array(requiredText);

// Team page intro ("We are researchers …" + one photo). Team-page-only, so it lives with the
// professor profile. Versions saved before step 7 read as the Figma copy without a photo.
export const teamIntroSchema = z.object({
  text: optionalText,
  image: imageRefSchema.optional(),
});

// The "Prof." prefix before the English name is rendered by the UI, not stored. The Korean
// subtitle is composed from nameKo + title + department ("류안영 교수, 인제대학교 멀티미디어학과").
// Contact is the professor's own (not settings.contact).
export const professorSchema = z.object({
  teamIntro: teamIntroSchema.default(() => ({ text: DEFAULT_TEAM_INTRO_TEXT })),
  name: requiredText,
  nameKo: optionalText,
  title: optionalText,
  department: optionalText,
  addressLines: z.array(requiredText),
  phone: optionalText,
  email: z.union([z.email(), z.literal("")]),
  education: sectionLines,
  experience: sectionLines,
  research: sectionLines,
  projects: sectionLines,
  images: z.array(imageRefSchema).max(LIMITS.professorImages),
});

// Student / Alumni ------------------------------------------------------

export const memberSchema = z.object({
  id: idSchema,
  type: z.enum(MEMBER_TYPES),
  degree: z.enum(TEAM_DEGREES),
  name: requiredText,
  email: z.union([z.email(), z.literal("")]),
  field: optionalText,
  profileImage: imageRefSchema.nullable(),
  order: z.number().int().nonnegative(),
  ...recordTimestamps,
});

// Settings --------------------------------------------------------------

// Site-wide settings. The Publication URL stays in NOTION_PUBLICATION_URL, not here.
export const settingsSchema = z.object({
  contact: z.object({
    addressLines: z.array(requiredText),
    phone: optionalText,
    email: z.union([z.email(), z.literal("")]),
  }),
  // One sentence split into phrases; the footer joins them per breakpoint
  // (1920: 1 line, 1440/768: first phrase + rest, 365: one phrase per line).
  footerLines: z.array(requiredText).min(1).max(6),
});

// Stored documents --------------------------------------------------------

export const documentSchemas = {
  home: objectDocument(homeSchema),
  awards: listDocument(awardSchema),
  projects: listDocument(projectSchema),
  professor: objectDocument(professorSchema),
  members: listDocument(memberSchema),
  settings: objectDocument(settingsSchema),
} as const satisfies Record<DataKey, z.ZodType>;

export type ContentDocuments = {
  [K in DataKey]: z.infer<(typeof documentSchemas)[K]>;
};

// A document's content without the version metadata that saveDocument manages.
export type DocumentContent<K extends DataKey> = Omit<ContentDocuments[K], "version" | "updatedAt">;
