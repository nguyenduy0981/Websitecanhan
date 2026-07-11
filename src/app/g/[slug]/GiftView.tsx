import Link from "next/link";
import { getTheme } from "@/config/themes";
import { EffectOverlay } from "./EffectOverlay";

interface Block {
  id: string;
  type: string;
  content: { text?: string; url?: string };
}

// All text below is rendered as JSX children (never dangerouslySetInnerHTML),
// so React escapes it automatically — required since this content is
// creator-supplied and shown to strangers. See CLAUDE.md: "User-generated
// text renders on a public viewer → treat as hostile: escape/sanitize
// everywhere."
export function GiftView({
  title,
  message,
  blocks,
  themeId,
  effectId,
}: {
  title: string;
  message: string;
  blocks: Block[];
  themeId: string | null;
  effectId: string | null;
}) {
  const theme = getTheme(themeId);

  return (
    <main className={`flex min-h-screen flex-col ${theme.containerClassName}`}>
      {effectId && <EffectOverlay effectId={effectId} />}
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col p-6">
        <article className="flex-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed">{message}</p>

          <div className="mt-6 flex flex-col gap-4">
            {blocks.map((block) => {
              if (block.type === "IMAGE" && block.content.url) {
                return (
                  // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not worth next/image config for V1
                  <img
                    key={block.id}
                    src={block.content.url}
                    alt="Ảnh trong quà"
                    className="w-full rounded-lg object-cover"
                  />
                );
              }
              if (block.type === "TEXT" && block.content.text) {
                return (
                  <p key={block.id} className="whitespace-pre-wrap leading-relaxed">
                    {block.content.text}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </article>

        <footer className={`mt-10 border-t pt-6 text-center ${theme.accentClassName}`}>
          <p className="text-sm opacity-80">Gửi bằng LoveBox</p>
          <Link
            href="/register"
            className="mt-2 inline-block rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Tạo hộp quà của riêng bạn
          </Link>
        </footer>
      </div>
    </main>
  );
}
