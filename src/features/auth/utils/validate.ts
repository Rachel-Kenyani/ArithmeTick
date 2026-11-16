export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

const KE_PHONE_RE = /^(?:(?:\+|00)?254)?0?([17]\d{8})$/;

export function isEmail(raw: string): boolean {
  return EMAIL_RE.test(raw.trim());
}

export function normalizePhone(raw: string): string | null {
  const compact = raw.trim().replace(/[\s\-.()]/g, "");
  const match = KE_PHONE_RE.exec(compact);
  return match ? `+254${match[1]}` : null;
}

export function isValidIdentifier(raw: string): boolean {
  return isEmail(raw) || normalizePhone(raw) !== null;
}

export function normalizeIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (isEmail(trimmed)) return trimmed.toLowerCase();
  return normalizePhone(trimmed) ?? trimmed;
}

export function identifierKind(raw: string): "email" | "phone number" {
  return isEmail(raw) ? "email" : "phone number";
}

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
  return trimmed.length > 4 ? `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}` : "****";
}

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

export const PASSWORD_UPDATED_FLAG = "arithmetick:password-updated";
