import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import QRCode from "qrcode";
import { getSessionUser } from "@/modules/auth";
import { getGiftForOwner, listBlocks } from "@/modules/gifts";
import { getMediaUrlsByIds } from "@/modules/media";
import { NotFoundError } from "@/lib/errors";
import { env } from "@/env";
import { GiftEditor } from "./GiftEditor";

export default async function GiftEditorPage({
  params,
}: {
  params: Promise<{ giftId: string }>;
}) {
  const user = await getSessionUser(await cookies());
  if (!user) {
    redirect("/login");
  }

  const { giftId } = await params;

  let gift;
  try {
    gift = await getGiftForOwner(giftId, user.id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const blocks = await listBlocks(giftId, user.id);
  const shareUrl = `${env.APP_URL}/g/${gift.slug}`;
  const shareQrDataUrl = await QRCode.toDataURL(shareUrl).catch(() => null);

  const imageMediaIds = blocks
    .map((block) => (block.content as { mediaAssetId?: string }).mediaAssetId)
    .filter((id): id is string => Boolean(id));
  const mediaUrls = await getMediaUrlsByIds(imageMediaIds);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <GiftEditor
        gift={{
          id: gift.id,
          slug: gift.slug,
          title: gift.title,
          message: gift.message,
          status: gift.status,
          tier: gift.tier,
          themeId: gift.themeId,
          effectId: gift.effectId,
        }}
        initialBlocks={blocks.map((block) => {
          const content = block.content as { text?: string; mediaAssetId?: string };
          return {
            id: block.id,
            type: block.type,
            position: block.position,
            content: {
              ...content,
              url: content.mediaAssetId ? mediaUrls[content.mediaAssetId] : undefined,
            },
          };
        })}
        appUrl={env.APP_URL}
        shareQrDataUrl={shareQrDataUrl}
        vipPriceVnd={env.VIP_PRICE_VND}
      />
    </main>
  );
}
