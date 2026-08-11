import { AVATAR_COLORS } from "@/theme/theme";

/** "Steve Davis" -> "SD", "cher" -> "CH" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Stable hash so the same person always gets the same avatar gradient. */
export function avatarGradient(seed: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formats as the user types, following the common Thai groupings:
 *   mobile   08X-XXX-XXXX  (10 digits, prefixed 06/08/09)
 *   Bangkok  0X-XXX-XXXX   (9 digits)
 *
 * The grouping follows the prefix rather than the length so it stays put while
 * typing. Choosing by length instead made every mobile number regroup from
 * `08-898-8698` to `088-988-698` on the tenth digit.
 */
export function formatTel(value: string): string {
  const d = digitsOnly(value).slice(0, 10);
  if (d.length <= 2) return d;

  if (/^0[689]/.test(d)) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  }

  if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
}

/** The `tel:` / `sms:` URL form — separators confuse some dialers. */
export function telHref(value: string): string {
  return digitsOnly(value);
}

export type FieldErrors = {
  name?: string;
  sect?: string;
  tel?: string;
};

export function validateDraft(draft: { name: string; sect: string; tel: string }): FieldErrors {
  const errors: FieldErrors = {};

  const name = draft.name.trim();
  if (!name) errors.name = "Please enter a name.";
  else if (name.length < 2) errors.name = "That name looks too short.";

  if (!draft.sect) errors.sect = "Please pick a section.";

  const digits = digitsOnly(draft.tel);
  if (!digits) errors.tel = "Please enter a phone number.";
  else if (digits.length < 9) errors.tel = "A phone number needs at least 9 digits.";

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Case- and separator-insensitive search across every field. */
export function matchesQuery(
  phone: { name: string; sect: string; tel: string },
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const qDigits = digitsOnly(q);
  if (qDigits && digitsOnly(phone.tel).includes(qDigits)) return true;

  return phone.name.toLowerCase().includes(q) || phone.sect.toLowerCase().includes(q);
}
