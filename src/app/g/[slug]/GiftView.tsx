import Link from "next/link";

interface Block {
  id: string;
  type: string;
  content: { text?: string };
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
}: {
  title: string;
  message: string;
  blocks: Block[];
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col p-6">
      <article className="flex-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{message}</p>

        <div className="mt-6 flex flex-col gap-4">
          {blocks.map((block) =>
            block.type === "TEXT" && block.content.text ? (
              <p key={block.id} className="whitespace-pre-wrap leading-relaxed">
                {block.content.text}
              </p>
            ) : null,
          )}
        </div>
      </article>

      <footer className="mt-10 border-t pt-6 text-center">
        <p className="text-sm text-muted-foreground">Gửi bằng LoveBox</p>
        <Link
          href="/register"
          className="mt-2 inline-block rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Tạo hộp quà của riêng bạn
        </Link>
      </footer>
    </main>
  );
}
