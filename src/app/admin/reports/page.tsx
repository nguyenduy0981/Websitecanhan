import Link from "next/link";
import { listReportsForAdmin } from "@/modules/admin";
import { giftStatusLabel } from "@/lib/gift-status-label";
import { reportReasonLabel } from "@/lib/report-reason-label";
import { ReportActions } from "./ReportActions";

export default async function AdminReportsPage() {
  const reports = await listReportsForAdmin("OPEN");

  return (
    <div className="lb-fade-in-up">
      <h2 className="mb-4 text-lg font-semibold">Báo cáo đang chờ xử lý ({reports.length})</h2>

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có báo cáo nào đang chờ xử lý.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{report.gift.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Trạng thái quà: {giftStatusLabel(report.gift.status)}
                  </p>
                </div>
                <Link
                  href={`/admin/gifts/${report.gift.id}`}
                  className="lb-btn shrink-0 text-xs underline"
                >
                  Xem nội dung
                </Link>
              </div>

              <p className="mt-2 text-sm">
                <span className="font-medium">Lý do:</span> {reportReasonLabel(report.reason)}
              </p>
              {report.details && <p className="mt-1 text-sm text-muted-foreground">{report.details}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                Báo cáo lúc {new Date(report.createdAt).toLocaleString("vi-VN")}
              </p>

              <div className="mt-3">
                <ReportActions reportId={report.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
