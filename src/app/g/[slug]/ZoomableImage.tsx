"use client";

import { useState } from "react";

/** Gallery image that zooms into a fullscreen overlay on tap — a spring
 * scale-in over a fading, blurred backdrop, closes on tap-away. */
export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setZoomed(true)}
        className="lb-btn block w-full cursor-zoom-in rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label="Phóng to ảnh"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not worth next/image config for V1 */}
        <img src={src} alt={alt} className="w-full rounded-lg object-cover" />
      </button>

      {zoomed && (
        <div
          role="presentation"
          onClick={() => setZoomed(false)}
          className="lb-fade-in-up fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not worth next/image config for V1 */}
          <img src={src} alt={alt} className="lb-scale-in max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </>
  );
}
