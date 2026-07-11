export default function GiftEditorLoading() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="lb-skeleton h-4 w-24" />
            <div className="lb-skeleton h-4 w-16" />
          </div>
          <div className="lb-skeleton h-4 w-16" />
          <div className="lb-skeleton mt-1 h-10 w-full" />
          <div className="lb-skeleton mt-4 h-4 w-20" />
          <div className="lb-skeleton mt-1 h-24 w-full" />
          <div className="lb-skeleton mt-6 h-6 w-28" />
          <div className="mt-2 flex flex-col gap-2">
            <div className="lb-skeleton h-16 w-full" />
            <div className="lb-skeleton h-16 w-full" />
          </div>
        </section>
        <section className="lb-skeleton h-64 w-full" />
      </div>
    </main>
  );
}
