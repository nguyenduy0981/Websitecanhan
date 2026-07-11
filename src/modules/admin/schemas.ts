import { z } from "zod";

export const REPORT_REASONS = ["INAPPROPRIATE", "SPAM", "COPYRIGHT", "HARASSMENT", "OTHER"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const createReportSchema = z.object({
  slug: z.string().trim().min(1).max(64),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(2000).optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const resolveReportSchema = z.object({
  action: z.enum(["DISMISS", "SUSPEND"]),
});
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

export const setUserRoleSchema = z.object({
  role: z.enum(["CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
});
export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;
