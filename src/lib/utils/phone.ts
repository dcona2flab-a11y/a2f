// tel: link for a phone number as typed by the admin. Keeps digits and a leading "+";
// a Korean number written with both the country code and the trunk 0
// ("+82. 055. 320. 3412") dials as +82 55…, so that 0 is dropped.
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return `tel:${digits.replace(/^\+820/, "+82")}`;
}
