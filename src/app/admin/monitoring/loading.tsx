export default function AdminMonitoringLoading() {
  return (
    <div>
      <div className="lb-skeleton mb-2 h-6 w-40" />
      <div className="mb-6 flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="lb-skeleton h-12 w-full" />
        ))}
      </div>
      <div className="lb-skeleton mb-4 h-6 w-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="lb-skeleton h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
