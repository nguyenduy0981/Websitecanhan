/** Re-mounted on every navigation (unlike layout.tsx), giving every route
 * a light, subtle fade/slide entrance — see .lb-page-enter in globals.css.
 * Deliberately minimal (opacity + 6px translateY, 250ms) so it never
 * fights a page's own, richer entrance animation (e.g. dashboard's
 * staggered card list, or the gift viewer's opening sequence). */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <div className="lb-page-enter">{children}</div>;
}
