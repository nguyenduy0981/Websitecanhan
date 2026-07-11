const MOBILE_UA_PATTERN = /Mobi|Android|iPhone|iPod/i;
const TABLET_UA_PATTERN = /iPad|Tablet/i;

/** Coarse device bucket for analytics — never stores IP or other PII. */
export function classifyDevice(userAgent: string | undefined | null): string | undefined {
  if (!userAgent) return undefined;
  if (TABLET_UA_PATTERN.test(userAgent)) return "tablet";
  if (MOBILE_UA_PATTERN.test(userAgent)) return "mobile";
  return "desktop";
}
