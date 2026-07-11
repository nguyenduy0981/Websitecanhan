const REPORT_REASON_LABELS: Record<string, string> = {
  INAPPROPRIATE: "Nội dung không phù hợp",
  SPAM: "Spam / lừa đảo",
  COPYRIGHT: "Vi phạm bản quyền",
  HARASSMENT: "Quấy rối / xúc phạm",
  OTHER: "Khác",
};

export function reportReasonLabel(reason: string): string {
  return REPORT_REASON_LABELS[reason] ?? reason;
}

export { REPORT_REASON_LABELS };
