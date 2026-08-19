export const CONTACT_NOT_VERIFIED = "Contact not verified";

export function isVerifiedEmail(value: string | undefined | null): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === CONTACT_NOT_VERIFIED) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isVerifiedPhone(value: string | undefined | null): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === CONTACT_NOT_VERIFIED) return false;
  return /\d{7,}/.test(trimmed.replace(/\D/g, ""));
}
