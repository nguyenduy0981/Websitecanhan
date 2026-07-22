/**
 * WCAG 2.4.1 "Bypass Blocks" — without this, a keyboard/screen-reader user
 * has to tab through the entire Header + Sidebar nav on every single page
 * before reaching content. Visually hidden until focused (first Tab stop
 * on any page), then jumps straight to <main id="main-content">.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-vt-md focus-visible:bg-vt-primary focus-visible:px-4 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-vt-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg"
    >
      Nhảy thẳng vào nội dung
    </a>
  );
}
