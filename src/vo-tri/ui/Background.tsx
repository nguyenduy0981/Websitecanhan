/**
 * The global "living" background — mounted once by AppShell, sits fixed
 * behind everything. Pure CSS (no canvas/particle JS): three large,
 * heavily-blurred radial gradients drifting on an extremely slow loop.
 * Cheap for the GPU (opacity/transform only, huge blur radius means no
 * banding to worry about), never steals focus (aria-hidden,
 * pointer-events-none), and — via the ambient float duration being 22s+ —
 * reads as "alive" without ever being distracting enough to notice
 * consciously while reading content on top of it.
 */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-vt-bg">
      <div
        className="vt-float absolute -left-1/4 -top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-vt-primary opacity-[0.14] blur-[120px]"
        style={{ animationDuration: "22s" }}
      />
      <div
        className="vt-float absolute -right-1/4 top-1/3 h-[50vmax] w-[50vmax] rounded-full bg-vt-secondary opacity-[0.10] blur-[130px]"
        style={{ animationDuration: "26s", animationDelay: "-6s" }}
      />
      <div
        className="vt-float absolute bottom-[-20%] left-1/4 h-[45vmax] w-[45vmax] rounded-full bg-vt-vip opacity-[0.08] blur-[140px]"
        style={{ animationDuration: "30s", animationDelay: "-12s" }}
      />
      {/* Faint grain so the huge blur gradients don't look like flat plastic. */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <filter id="vt-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#vt-grain)" />
      </svg>
    </div>
  );
}
