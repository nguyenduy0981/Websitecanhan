import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { ValidationError } from "@/lib/errors";
import { QUOTAS } from "@/config/business-rules";

// Allowlist of real, decodable raster formats. Checked against the file's
// actual magic bytes (via file-type), never the filename/extension the
// client claims — see CLAUDE.md: "validate magic bytes (not extension)
// ... reject SVG/scripts." SVG is excluded on purpose: it's XML text (can
// carry embedded scripts) and isn't in this allowlist, so it's rejected by
// construction regardless of what magic-byte sniffing says about it.
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const MAX_UPLOAD_BYTES = QUOTAS.MAX_IMAGE_UPLOAD_MB * 1024 * 1024;
const MAX_OUTPUT_WIDTH = 1600;
const WEBP_QUALITY = 82;

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/webp";
}

/**
 * Validates a raw upload (size + real magic-byte type) and re-encodes it to
 * WebP, auto-oriented and capped to a max width. Re-encoding through sharp
 * also strips EXIF/metadata by construction (sharp only carries metadata
 * forward if you explicitly call .withMetadata(), which we don't) — see
 * CLAUDE.md: "strip metadata, process via sharp."
 */
export async function validateAndProcessImage(buffer: Buffer): Promise<ProcessedImage> {
  if (buffer.byteLength === 0) {
    throw new ValidationError("Uploaded file is empty");
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new ValidationError(`Image must be ${QUOTAS.MAX_IMAGE_UPLOAD_MB}MB or smaller`);
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw new ValidationError("File must be a JPEG, PNG, WebP, or GIF image");
  }

  let output: Buffer;
  let metadata: sharp.Metadata;
  try {
    const pipeline = sharp(buffer)
      .rotate()
      .resize({ width: MAX_OUTPUT_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY });
    output = await pipeline.toBuffer();
    metadata = await sharp(output).metadata();
  } catch {
    throw new ValidationError("Could not process this image — it may be corrupted");
  }

  if (!metadata.width || !metadata.height) {
    throw new ValidationError("Could not read image dimensions");
  }

  return { buffer: output, width: metadata.width, height: metadata.height, mimeType: "image/webp" };
}
