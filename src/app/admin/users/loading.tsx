export default function AdminUsersLoading() {
  return (
    <div>
      <div className="lb-skeleton mb-4 h-6 w-40" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded-md border p-3">
            <div className="lb-skeleton h-5 w-40" />
            <div className="lb-skeleton h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
