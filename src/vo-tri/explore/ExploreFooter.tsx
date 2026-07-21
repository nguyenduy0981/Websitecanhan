export function ExploreFooter() {
  return (
    <footer className="flex flex-col items-center gap-1 border-t border-vt-divider pt-6 text-center text-xs text-vt-text-secondary">
      <p>Danh sách này còn dài lắm — mỗi tuần lại có thêm vài trò mới.</p>
      <p>VÔ TRI © {new Date().getFullYear()}</p>
    </footer>
  );
}
