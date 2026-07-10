import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/modules/auth";
import { getGiftForOwner, listBlocks } from "@/modules/gifts";
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

  return (
    <main className="mx-auto max-w-3xl p-6">
      <GiftEditor
        gift={{
          id: gift.id,
          slug: gift.slug,
          title: gift.title,
          message: gift.message,
          status: gift.status,
        }}
        initialBlocks={blocks.map((block) => ({
          id: block.id,
          type: block.type,
          position: block.position,
          content: block.content as { text?: string },
        }))}
        appUrl={env.APP_URL}
      />
    </main>
  );
}
