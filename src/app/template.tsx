/** Next remounts this on every navigation, so the fade/rise plays once per route change — see .vt-page-enter in motion.css. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="vt-page-enter">{children}</div>;
}
