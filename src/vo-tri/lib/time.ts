/** UTC "YYYY-MM-DD" for a date — the shared key shape for day-bucketed data (streak/active-day lookups), consolidated from 3 near-identical `toISOString().slice(0, 10)` call sites found during the final repository audit. */
export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Shared by every "posted X ago" surface (comments, feed, notifications) so the phrasing/thresholds never drift between them. */
export function timeAgo(date: Date): string {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
}
