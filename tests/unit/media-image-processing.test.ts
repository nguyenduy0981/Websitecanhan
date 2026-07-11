import { describe, expect, it } from "vitest";
import { validateAndProcessImage } from "@/modules/media/image-processing";

// Minimal real 1x1 PNG (valid, fully-formed).
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

// Just the 8-byte PNG magic signature, no real image data after it —
// passes magic-byte sniffing but fails to actually decode.
const TRUNCATED_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("validateAndProcessImage", () => {
  it("rejects an empty buffer", async () => {
    await expect(validateAndProcessImage(Buffer.alloc(0))).rejects.toThrow();
  });

  it("rejects a file over the 10MB limit", async () => {
    const oversized = Buffer.alloc(11 * 1024 * 1024);
    await expect(validateAndProcessImage(oversized)).rejects.toThrow(/10MB/);
  });

  it("rejects content whose magic bytes aren't a supported image format (e.g. SVG/text)", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    await expect(validateAndProcessImage(svg)).rejects.toThrow(/JPEG, PNG, WebP, or GIF/);
  });

  it("rejects a buffer whose magic bytes match but content is corrupted", async () => {
    await expect(validateAndProcessImage(TRUNCATED_PNG)).rejects.toThrow();
  });

  it("re-encodes a valid PNG to WebP and reports real dimensions", async () => {
    const result = await validateAndProcessImage(TINY_PNG);
    expect(result.mimeType).toBe("image/webp");
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.buffer.byteLength).toBeGreaterThan(0);
  });
});
