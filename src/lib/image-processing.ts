/**
 * Client-side image resizing & compression.
 *
 * Runs entirely in the browser (canvas), so it works on Vercel, Lovable Cloud,
 * and the edge runtime without any native image libraries (sharp is not
 * available in the Worker/edge runtime). We produce two sizes for every upload:
 *   - a full-size, compressed version (for the lightbox / detail view)
 *   - a small thumbnail (for the fast-loading portfolio grid)
 */

export type ProcessedImage = {
  full: Blob;
  thumb: Blob;
  /** File extension for the produced blobs, e.g. "webp" or "jpg". */
  ext: string;
  contentType: string;
  width: number;
  height: number;
};

const FULL_MAX = 1600; // longest edge for the full image
const THUMB_MAX = 640; // longest edge for the grid thumbnail
const FULL_QUALITY = 0.82;
const THUMB_QUALITY = 0.72;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function fit(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { w, h };
  const scale = w > h ? max / w : max / h;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

async function drawToBlob(
  img: HTMLImageElement,
  max: number,
  type: string,
  quality: number,
): Promise<Blob> {
  const { w, h } = fit(img.naturalWidth, img.naturalHeight, max);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported on this device.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
  if (!blob) throw new Error("Image compression failed.");
  return blob;
}

/**
 * Resize + compress an uploaded image into a full-size and thumbnail blob.
 * Prefers WebP (much smaller); falls back to JPEG if the browser can't encode it.
 */
export async function processWorkImage(file: File): Promise<ProcessedImage> {
  const img = await loadImage(file);

  // Feature-detect WebP encoding support.
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const supportsWebp = probe.toDataURL("image/webp").startsWith("data:image/webp");
  const contentType = supportsWebp ? "image/webp" : "image/jpeg";
  const ext = supportsWebp ? "webp" : "jpg";

  const [full, thumb] = await Promise.all([
    drawToBlob(img, FULL_MAX, contentType, FULL_QUALITY),
    drawToBlob(img, THUMB_MAX, contentType, THUMB_QUALITY),
  ]);

  const { w, h } = fit(img.naturalWidth, img.naturalHeight, FULL_MAX);
  return { full, thumb, ext, contentType, width: w, height: h };
}
