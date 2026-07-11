import { notFound } from "next/navigation";
import { getGiftForAdmin, listBlocksForAdmin } from "@/modules/gifts";
import { NotFoundError } from "@/lib/errors";
import { giftStatusLabel } from "@/lib/gift-status-label";
import { SuspendToggle } from "./SuspendToggle";

export default async function AdminGiftReviewPage({
  params,
}: {
  params: Promise<{ giftId: string }>;
}) {
  const { giftId } = await params;

  let gift;
  try {
    gift = await getGiftForAdmin(giftId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const blocks = await listBlocksForAdmin(giftId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Xem nội dung quà (quyền quản trị)</h2>
        <SuspendToggle giftId={gift.id} suspended={gift.status === "SUSPENDED"} />
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Trạng thái: {giftStatusLabel(gift.status)}
        {gift.status === "SUSPENDED" && gift.prevStatus
          ? ` (trước đó: ${giftStatusLabel(gift.prevStatus)})`
          : ""}
      </p>

      <div className="rounded-md border p-4">
        <h3 className="text-xl font-bold">{gift.title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{gift.message}</p>

        <div className="mt-4 flex flex-col gap-3">
          {blocks.map((block) => {
            const content = block.content as { text?: string; mediaAssetId?: string };
            return (
              <div key={block.id} className="rounded-md border p-2 text-sm">
                <span className="text-xs font-medium text-muted-foreground">{block.type}</span>
                {content.text && <p className="mt-1 whitespace-pre-wrap">{content.text}</p>}
                {content.mediaAssetId && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    mediaAssetId: {content.mediaAssetId}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
