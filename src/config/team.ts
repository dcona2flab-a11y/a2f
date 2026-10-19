// Team page constants.

// Figma Team intro copy (the line breaks are part of the design; the admin can change them).
export const DEFAULT_TEAM_INTRO_TEXT = [
  "We are researchers with an approach",
  "to flux and access to a frame.",
  "We move between shifting problems",
  "and structured thinking, translating",
  "uncertainty into design direction.",
  "This is how we work, and",
  "how we grow as a lab.",
].join("\n");

// Professor photos rotate on the public Team page (paused for reduced motion).
export const PROFESSOR_PHOTO_INTERVAL_MS = 3000;

// The four professor sections, in page order.
export const PROFESSOR_SECTIONS = [
  { key: "education", title: "Education" },
  { key: "experience", title: "Experience" },
  { key: "research", title: "Research" },
  { key: "projects", title: "Project" },
] as const;

export type ProfessorSectionKey = (typeof PROFESSOR_SECTIONS)[number]["key"];
