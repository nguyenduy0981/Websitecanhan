import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { GiftStatus } from "@prisma/client";
import { getSessionUser, countUsers } from "@/modules/auth";
import { hasRole, countOpenReports } from "@/modules/admin";
import { countGiftsByStatus } from "@/modules/gifts";
import { countActivatedPayments } from "@/modules/payments";
import { listRecentJobRuns } from "@/modules/jobs";
import { giftStatusLabel } from "@/lib/gift-status-label";
import { env, isR2Configured, isResendConfigured, isPayOSConfigured } from "@/env";

const INTEGRATIONS = [
  {
    name: "Lưu trữ ảnh (Cloudflare R2)",
    configured: isR2Configured,
    blocks: "Không thể tải ảnh lên quà cho đến khi cấu hình xong.",
  },
  {
    name: "Gửi email (Resend)",
    configured: isResendConfigured,
    blocks: "Email đặt lại mật khẩu chưa được gửi thật (link vẫn tạo được, chỉ là không gửi email).",
  },
  {
    name: "Thanh toán VIP (PayOS)",
    configured: isPayOSConfigured,
    blocks: "Không thể nâng cấp VIP cho đến khi cấu hình xong.",
  },
] as const;

// The layout only guarantees MODERATOR+; site-wide business metrics and
// cron health are ADMIN only, so it's checked again here (same pattern as
// /admin/users being SUPER_ADMIN only).
export default async function AdminMonitoringPage() {
  const user = await getSessionUser(await cookies());
  if (!user || !hasRole(user, "ADMIN")) {
    notFound();
  }

  const [userCount, giftsByStatus, activatedPayments, openReports, jobRuns] = await Promise.all([
    countUsers(),
    countGiftsByStatus(),
    countActivatedPayments(),
    countOpenReports(),
    listRecentJobRuns(30),
  ]);

  return (
    <div className="lb-fade-in-up">
      <h2 className="mb-2 text-lg font-semibold">Cấu hình hệ thống</h2>
      <ul className="mb-6 flex flex-col gap-2">
        {INTEGRATIONS.map((integration) => (
          <li
            key={integration.name}
            className={`rounded-md border p-3 text-sm ${
              integration.configured ? "" : "border-amber-500"
            }`}
          >
            <span className="font-medium">
              {integration.configured ? "✓" : "✗"} {integration.name}
            </span>
            {!integration.configured && (
              <p className="mt-1 text-xs text-amber-700">{integration.blocks}</p>
            )}
          </li>
        ))}
        <li className="rounded-md border p-3 text-sm">
          <span className="font-medium">
            {env.SUPER_ADMIN_EMAIL ? "✓" : "✗"} Tài khoản quản trị đầu tiên (SUPER_ADMIN_EMAIL)
          </span>
          {!env.SUPER_ADMIN_EMAIL && (
            <p className="mt-1 text-xs text-amber-700">
              Chưa đặt biến SUPER_ADMIN_EMAIL — xem docs/SETUP.md.
            </p>
          )}
        </li>
      </ul>

      <h2 className="mb-4 text-lg font-semibold">Tổng quan hệ thống</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border p-3 text-center">
          <p className="text-2xl font-bold">{userCount}</p>
          <p className="text-xs text-muted-foreground">Người dùng</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-2xl font-bold">{activatedPayments}</p>
          <p className="text-xs text-muted-foreground">Lượt nâng cấp VIP</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-2xl font-bold">{openReports}</p>
          <p className="text-xs text-muted-foreground">Báo cáo đang chờ</p>
        </div>
        <div className="rounded-md border p-3 text-center">
          <p className="text-2xl font-bold">
            {Object.values(giftsByStatus).reduce((sum, n) => sum + n, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Tổng số quà</p>
        </div>
      </div>

      <h3 className="mb-2 mt-6 text-sm font-semibold">Quà theo trạng thái</h3>
      <ul className="flex flex-wrap gap-2 text-sm">
        {(Object.entries(giftsByStatus) as [GiftStatus, number][]).map(([status, count]) => (
          <li key={status} className="rounded-md border px-3 py-1">
            {giftStatusLabel(status)}: <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 mt-6 text-sm font-semibold">Lịch sử tác vụ nền (cron)</h3>
      {jobRuns.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có lần chạy nào được ghi nhận.</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {jobRuns.map((run) => (
            <li
              key={run.id}
              className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                run.ok === false ? "border-red-500" : ""
              }`}
            >
              <span>
                <span className="font-medium">{run.name}</span>{" "}
                <span className="text-xs text-muted-foreground">
                  {new Date(run.startedAt).toLocaleString("vi-VN")}
                </span>
              </span>
              <span className="text-xs">
                {run.ok === false ? (
                  <span className="text-red-600">Lỗi: {run.error}</span>
                ) : (
                  `OK · ${run.itemsProcessed} mục`
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
