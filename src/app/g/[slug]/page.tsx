import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getGiftBySlug,
  listBlocksPublic,
  recordGiftView,
  classifyGiftForViewer,
} from "@/modules/gifts";
import { getMediaUrlsByIds } from "@/modules/media";
import { classifyDevice } from "@/lib/device";
import { GiftView } from "./GiftView";
import { UnavailableView } from "./UnavailableView";

// Generic, static metadata only — never derived from gift content. Gift
// pages are unlisted: a social preview must not leak the private title or
// message to anyone who hasn't opened the link (see CLAUDE.md / SPEC.md).
// The X-Robots-Tag header in next.config.ts covers the same "never
// indexed" rule at the HTTP level; this is defense-in-depth for caches/
// crawlers that only look at the meta tag.
export const metadata: Metadata = {
  title: "Bạn có một món quà — LoveBox",
  description: "Ai đó đã gửi cho bạn một hộp quà kỹ thuật số qua LoveBox.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Bạn có một món quà",
    description: "Mở ra để xem nhé.",
  },
};

export default async function PublicGiftPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gift = await getGiftBySlug(slug);

  if (!gift) {
    notFound();
  }

  const decision = classifyGiftForViewer(gift.status);

  if (decision.type === "not_found") {
    notFound();
  }

  if (decision.type === "unavailable") {
    return <UnavailableView message={decision.message} />;
  }

  const userAgent = (await headers()).get("user-agent");
  // Fire-and-forget-style (but awaited so it's not left dangling on a
  // serverless function) — recordGiftView never throws, so a failure here
  // can never take the gift content down with it.
  await recordGiftView(gift.id, classifyDevice(userAgent));

  const blocks = await listBlocksPublic(gift.id);
  const imageMediaIds = blocks
    .map((block) => (block.content as { mediaAssetId?: string }).mediaAssetId)
    .filter((id): id is string => Boolean(id));
  const mediaUrls = await getMediaUrlsByIds(imageMediaIds);

  return (
    <GiftView
      slug={gift.slug}
      title={gift.title}
      message={gift.message}
      themeId={gift.themeId}
      effectId={gift.effectId}
      blocks={blocks.map((block) => {
        const content = block.content as { text?: string; mediaAssetId?: string };
        return {
          id: block.id,
          type: block.type,
          content: {
            ...content,
            url: content.mediaAssetId ? mediaUrls[content.mediaAssetId] : undefined,
          },
        };
      })}
    />
  );
}
