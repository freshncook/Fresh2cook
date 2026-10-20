import path from "path";

/*
 * Upload rules (used by /api/upload-file and /api/private-file):
 *   - only JPG, PNG, WEBP, GIF pictures and PDF (checked from the file bytes, not the name)
 *   - max 8 MB
 *   - our own random file name (the user's file name is never used)
 *   - KYC documents (Aadhaar, PAN, licence, RC, photo) go to a PRIVATE folder,
 *     outside "public", and are shown only to the admin and the owner.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const PRIVATE_DIR = () => path.join(process.cwd(), "private-uploads");
export const PUBLIC_DIR = () => path.join(process.cwd(), "public", "uploads");

export const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

/** Real file type from the first bytes; null = not allowed */
export function sniffType(b: Uint8Array): keyof typeof MIME | null {
  const at = (i: number, ...v: number[]) => v.every((x, k) => b[i + k] === x);
  if (b.length < 12) return null;
  if (at(0, 0xff, 0xd8, 0xff)) return "jpg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return "gif";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "webp";
  if (at(0, 0x25, 0x50, 0x44, 0x46, 0x2d)) return "pdf";
  return null;
}

/** private file names look like  r12-<24 hex>.jpg  (r = rider, s = staff, a = admin) */
export const PRIVATE_NAME = /^([ars])(\d+)-([a-f0-9]{24})\.(jpg|png|webp|gif|pdf)$/;
