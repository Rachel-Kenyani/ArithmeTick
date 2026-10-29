/**
 * Friendly, parent-facing validation for the prototype auth screens (APP-SHELL §2).
 * Pure functions — no React, no network, and nothing here ever stores or logs a password.
 *
 *   isEmail("ja@gmail.com")                 → true
 *   normalizePhone("0723 456-767")          → "+254723456767"
 *   normalizeIdentifier(" Ja@Gmail.com ")   → "ja@gmail.com"
 *   maskIdentifier("+254723456767")         → "+254723****67"
 *   maskIdentifier("james@gmail.com")       → "ja****@gmail.com"
 *   passwordProblem("short")                → "Passwords need at least 8 characters."
 */

/** Minimum password length for Create Account / Reset Password. */
export const MIN_PASSWORD_LENGTH = 8;

/** x@y.z — one @, no spaces, at least one dot in the domain (no empty labels). */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/**
 * Kenyan mobile numbers (Safaricom / Airtel / Telkom 07… and the newer 01… ranges), in any of the
 * ways parents type them: 0723456767, 0110 123 456, +254723456767, 254723456767, 00254…, and the
 * common slip "+254 0723…". Captures the 9 significant digits.
 */
const KE_PHONE_RE = /^(?:(?:\+|00)?254)?0?([17]\d{8})$/;

export function isEmail(raw: string): boolean {
  return EMAIL_RE.test(raw.trim());
}

/** Kenyan phone → E.164 "+2547XXXXXXXX" / "+2541XXXXXXXX", or null when it isn't one. Spaces, dashes, dots and brackets are ignored. */
export function normalizePhone(raw: string): string | null {
  const compact = raw.trim().replace(/[\s\-.()]/g, "");
  const match = KE_PHONE_RE.exec(compact);
  return match ? `+254${match[1]}` : null;
}

/** An email address or a Kenyan phone number. */
export function isValidIdentifier(raw: string): boolean {
  return isEmail(raw) || normalizePhone(raw) !== null;
}

/** Canonical form to keep in the store: lower-cased email or E.164 phone (falls back to the trimmed input). */
export function normalizeIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (isEmail(trimmed)) return trimmed.toLowerCase();
  return normalizePhone(trimmed) ?? trimmed;
}

/** "phone number" or "email" — for "…sent to your phone number +254723****67". */
export function identifierKind(raw: string): "email" | "phone number" {
  return isEmail(raw) ? "email" : "phone number";
}

/**
 * Hide most of the identifier on the Verify screens.
 * Phones keep the first 6 digits after "+" and the last 2 ("+254723****67"); emails keep the first two
 * letters of the name ("ja****@gmail.com").
 */
export function maskIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (isEmail(trimmed)) {
    const at = trimmed.lastIndexOf("@");
    const name = trimmed.slice(0, at);
    const domain = trimmed.slice(at + 1).toLowerCase();
    return `${name.slice(0, name.length > 2 ? 2 : 1)}****@${domain}`;
  }
  const phone = normalizePhone(trimmed);
  if (phone) {
    const digits = phone.slice(1);
    return `+${digits.slice(0, 6)}${"*".repeat(digits.length - 8)}${digits.slice(-2)}`;
  }
  // Not expected (screens validate first) — still never echo the whole thing back.
  return trimmed.length > 4 ? `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}` : "****";
}

/* ------------------------------------------------------------------------------------------------
 * Friendly messages (parent-facing, shown under the field). null = all good.
 * ---------------------------------------------------------------------------------------------- */

export function identifierProblem(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Please enter your email or phone number.";
  if (isValidIdentifier(trimmed)) return null;
  if (trimmed.includes("@")) return "Please check the email address, e.g. name@gmail.com.";
  if (/^[\d\s+\-().]+$/.test(trimmed)) return "Please enter a Kenyan mobile number, e.g. 0723 456 767.";
  return "Please use an email address or a phone number, e.g. 0723 456 767.";
}

export function passwordProblem(pw: string): string | null {
  if (!pw) return "Please enter a password.";
  if (pw.length < MIN_PASSWORD_LENGTH) return `Passwords need at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

export function confirmProblem(pw: string, confirm: string): string | null {
  if (!confirm) return "Please type the password once more.";
  if (confirm !== pw) return "The two passwords don't match yet.";
  return null;
}

/* ------------------------------------------------------------------------------------------------
 * Auth flow hand-offs (no secrets — just "something happened" flags between screens).
 * ---------------------------------------------------------------------------------------------- */

/** sessionStorage key set by Reset Password and read once by Log In ("Password updated" note). */
export const PASSWORD_UPDATED_FLAG = "arithmetick:password-updated"; // NOSONAR storage key name, not a credential
