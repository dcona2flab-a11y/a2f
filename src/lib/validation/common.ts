import { z } from "zod";

export const idSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, "id must be lowercase letters, digits and hyphens");

export const dateSchema = z.iso.date(); // YYYY-MM-DD
export const timestampSchema = z.iso.datetime();

export const requiredText = z.string().trim().min(1);
export const optionalText = z.string().trim();

export const imageRefSchema = z.object({
  url: z.url(),
  pathname: requiredText,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: optionalText,
});

const versionMeta = {
  version: z.number().int().nonnegative(),
  updatedAt: timestampSchema,
};

// Envelope for list data: { version, updatedAt, items: [] }
export const listDocument = <T extends z.ZodType>(item: T) =>
  z.object({ ...versionMeta, items: z.array(item) });

// Envelope for single-object data: { version, updatedAt, data: {} }
export const objectDocument = <T extends z.ZodType>(data: T) =>
  z.object({ ...versionMeta, data });

export const recordTimestamps = {
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
};
