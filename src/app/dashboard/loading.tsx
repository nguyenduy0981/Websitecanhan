export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="lb-skeleton h-7 w-28" />
          <div className="lb-skeleton h-4 w-40" />
        </div>
        <div className="lb-skeleton h-8 w-20" />
      </header>

      <div className="lb-skeleton mb-6 h-11 w-36" />

      <div className="lb-skeleton mb-3 h-6 w-32" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-md border p-3">
            <div className="lb-skeleton h-5 w-40" />
            <div className="lb-skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}
