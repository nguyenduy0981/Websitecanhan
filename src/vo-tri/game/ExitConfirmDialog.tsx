import { ConfirmDialog } from "@/vo-tri/ui/DialogPresets";

/**
 * Explains the real consequence (progress lost) without being coercive
 * ("không tạo cảm giác ép buộc") — two equally-weighted, honest options,
 * not a guilt-trip or a dark-pattern "no, I want to lose my progress".
 */
export function ExitConfirmDialog({
  open,
  onOpenChange,
  onConfirmExit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmExit: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thoát giữa chừng?"
      description="Tiến trình hiện tại sẽ không được lưu. Không sao nếu bạn muốn quay lại sau."
      confirmLabel="Thoát"
      cancelLabel="Chơi tiếp"
      destructive
      onConfirm={onConfirmExit}
    />
  );
}
