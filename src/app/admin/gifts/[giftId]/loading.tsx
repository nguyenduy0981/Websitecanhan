export default function AdminGiftReviewLoading() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="lb-skeleton h-6 w-48" />
        <div className="lb-skeleton h-9 w-36" />
      </div>
      <div className="lb-skeleton mb-4 h-4 w-32" />
      <div className="rounded-md border p-4">
        <div className="lb-skeleton h-6 w-2/3" />
        <div className="lb-skeleton mt-3 h-4 w-full" />
        <div className="lb-skeleton mt-2 h-4 w-5/6" />
      </div>
    </div>
  );
}
