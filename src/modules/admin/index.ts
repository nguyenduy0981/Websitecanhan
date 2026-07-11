// Public API of the `admin` module.
// Other modules must import only from this file — never reach into
// `src/modules/admin/*` internals directly.

export { hasRole, requireRole } from "./rbac";

export { writeAuditLog } from "./audit";

export { createReport, listReportsForAdmin, resolveReport, type ReportWithGift } from "./reports";

export { suspendGift, unsuspendGift } from "./moderation";

export { listUsers, changeUserRole } from "./users";

export {
  REPORT_REASONS,
  createReportSchema,
  resolveReportSchema,
  setUserRoleSchema,
  type ReportReason,
  type CreateReportInput,
  type ResolveReportInput,
  type SetUserRoleInput,
} from "./schemas";
