export default function AdminReportsLoading() {
  return (
    <div>
      <div className="lb-skeleton mb-4 h-6 w-56" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-md border p-4">
            <div className="lb-skeleton h-5 w-40" />
            <div className="lb-skeleton mt-2 h-4 w-24" />
            <div className="lb-skeleton mt-3 h-7 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
