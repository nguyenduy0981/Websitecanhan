import Link from "next/link";
import { getTheme } from "@/config/themes";
import { EffectCanvas } from "./EffectCanvas";
import { ReportButton } from "./ReportButton";
import { OpeningSequence, openingSequenceStyles as os } from "./OpeningSequence";
import { RevealWords } from "./RevealWords";

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
  slug,
  title,
  message,
  blocks,
  themeId,
  effectId,
}: {
  slug: string;
  title: string;
  message: string;
  blocks: Block[];
  themeId: string | null;
  effectId: string | null;
}) {
  const theme = getTheme(themeId);

  return (
    <main className={`flex min-h-screen flex-col ${theme.containerClassName}`}>
      <OpeningSequence>
        {effectId && <EffectCanvas effectId={effectId} />}
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col p-6">
          <article className="flex-1">
            <h1 className={`${os.section} ${theme.headingFontClassName} text-3xl font-bold`}>
              {title}
            </h1>
            <p
              className={`${os.section} mt-4 whitespace-pre-wrap leading-relaxed`}
              style={{ transitionDelay: "120ms" }}
            >
              <RevealWords text={message} />
            </p>

            <div
              className={`${os.section} mt-6 flex flex-col gap-4`}
              style={{ transitionDelay: "260ms" }}
            >
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

          <footer
            className={`${os.section} mt-10 border-t pt-6 text-center ${theme.accentClassName}`}
            style={{ transitionDelay: "380ms" }}
          >
            <p className="text-sm opacity-80">Gửi bằng LoveBox</p>
            <Link
              href="/register"
              className="mt-2 inline-block rounded-md border px-4 py-2 text-sm font-medium transition-transform duration-150 hover:scale-[1.03] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Tạo hộp quà của riêng bạn
            </Link>
            <div className="mt-3">
              <ReportButton slug={slug} />
            </div>
          </footer>
        </div>
      </OpeningSequence>
    </main>
  );
}
