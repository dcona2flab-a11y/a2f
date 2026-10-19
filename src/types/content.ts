import type { z } from "zod";
import type {
  AWARD_ACTIVITY_TYPES,
  AWARD_DEGREES,
  MEMBER_TYPES,
  PROJECT_CATEGORIES,
  TEAM_DEGREES,
} from "@/config/content";
import type { imageRefSchema } from "@/lib/validation/common";
import type {
  awardPersonSchema,
  awardSchema,
  homeSchema,
  memberSchema,
  professorSchema,
  projectMemberSchema,
  projectSchema,
  researchFieldSchema,
  settingsSchema,
  teamIntroSchema,
} from "@/lib/validation/content";

export type { ContentDocuments } from "@/lib/validation/content";

export type AwardActivityType = (typeof AWARD_ACTIVITY_TYPES)[number];
export type AwardDegree = (typeof AWARD_DEGREES)[number];
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type TeamDegree = (typeof TEAM_DEGREES)[number];
export type MemberType = (typeof MEMBER_TYPES)[number];

export type ImageRef = z.infer<typeof imageRefSchema>;
export type ResearchField = z.infer<typeof researchFieldSchema>;
export type HomeContent = z.infer<typeof homeSchema>;
export type HomeVisuals = HomeContent["visuals"];
export type AwardPerson = z.infer<typeof awardPersonSchema>;
export type Award = z.infer<typeof awardSchema>;
export type ProjectMember = z.infer<typeof projectMemberSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Professor = z.infer<typeof professorSchema>;
export type TeamIntro = z.infer<typeof teamIntroSchema>;
export type Member = z.infer<typeof memberSchema>;
export type Settings = z.infer<typeof settingsSchema>;
