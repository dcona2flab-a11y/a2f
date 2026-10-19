// "2026-03-12" → "March 12, 2026" (Figma award date format). Stored dates are plain
// calendar dates, so they are formatted in UTC to avoid shifting by the server time zone.
const DISPLAY_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDisplayDate(date: string): string {
  return DISPLAY_DATE.format(new Date(`${date}T00:00:00Z`));
}
