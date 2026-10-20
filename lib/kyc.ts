import { prisma } from "@/lib/prisma";
import { readSettingRows, writeSetting } from "@/lib/f2c-db";

/*
 * KYC / profile for riders and processing staff (saved in AppSetting, no migration):
 *   "kyc:rider" / "kyc:staff" -> { [id]: KycRecord }
 * Rider documents are also copied to the DeliveryBoy row so the old approval pages see them.
 */

export type KycKind = "rider" | "staff";
export type KycRecord = {
  photo?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  license?: string;
  rc?: string;
  pan?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  lat?: number | null;
  lng?: number | null;
  refName?: string;
  refMobile?: string;
  salary?: number; // staff monthly salary (admin)
  status?: "Incomplete" | "Submitted" | "Approved" | "Rejected";
  note?: string; // admin note (e.g. reason for rejection)
  updatedAt?: number;
};

export const DOCS: Record<KycKind, { key: keyof KycRecord; label: string }[]> = {
  rider: [
    { key: "photo", label: "Photo" },
    { key: "aadhaarFront", label: "Aadhaar (front)" },
    { key: "aadhaarBack", label: "Aadhaar (back)" },
    { key: "license", label: "Driving licence" },
    { key: "rc", label: "Vehicle RC" },
    { key: "pan", label: "PAN card" },
  ],
  staff: [
    { key: "photo", label: "Photo" },
    { key: "aadhaarFront", label: "Aadhaar (front)" },
    { key: "aadhaarBack", label: "Aadhaar (back)" },
    { key: "pan", label: "PAN card" },
  ],
};

export function missing(kind: KycKind, k: KycRecord): string[] {
  const out = DOCS[kind].filter((d) => !k[d.key]).map((d) => d.label);
  if (!String(k.address || "").trim()) out.push("Full address");
  if (!String(k.landmark || "").trim()) out.push("Landmark");
  if (k.lat == null || k.lng == null) out.push("GPS location");
  if (kind === "rider") {
    if (!String(k.refName || "").trim()) out.push("Reference name");
    if (!/^\d{10}$/.test(String(k.refMobile || ""))) out.push("Reference mobile");
  }
  return out;
}

export async function readKycMap(kind: KycKind): Promise<Record<string, KycRecord>> {
  try {
    const row = (await readSettingRows()).find((r) => r.key === `kyc:${kind}`);
    const m = row ? JSON.parse(row.value) : {};
    return m && typeof m === "object" ? m : {};
  } catch {
    return {};
  }
}

export async function readKyc(kind: KycKind, id: number): Promise<KycRecord> {
  const rec = (await readKycMap(kind))[String(id)] || {};
  if (kind === "rider") {
    // fill from the DeliveryBoy row (older uploads)
    const r = await prisma.deliveryBoy.findUnique({ where: { id } }).catch(() => null);
    if (r) {
      rec.photo ||= r.photo || undefined;
      rec.aadhaarFront ||= r.aadhaarFront || r.aadharFile || undefined;
      rec.aadhaarBack ||= r.aadhaarBack || undefined;
      rec.license ||= r.licenseFile || undefined;
      rec.rc ||= r.rcFile || undefined;
      rec.address ||= r.address || undefined;
      if (r.approvalStatus === "Approved" && !rec.status) rec.status = "Approved";
    }
  }
  rec.status ||= "Incomplete";
  return rec;
}

const URL_KEYS = ["photo", "aadhaarFront", "aadhaarBack", "license", "rc", "pan"] as const;

/** Save fields the person can edit themselves */
export async function saveKyc(kind: KycKind, id: number, input: Record<string, unknown>, opts: { admin?: boolean } = {}) {
  const map = await readKycMap(kind);
  const cur: KycRecord = map[String(id)] || {};
  const next: KycRecord = { ...cur };
  for (const k of URL_KEYS) {
    if (input[k] !== undefined) {
      const v = String(input[k] || "").trim().slice(0, 500);
      if (v && !/^(\/|https?:\/\/)/.test(v)) continue;
      next[k] = v || undefined;
    }
  }
  const text = (k: "address" | "landmark" | "pincode" | "refName" | "refMobile", max: number) => {
    if (input[k] !== undefined) next[k] = String(input[k] || "").trim().slice(0, max);
  };
  text("address", 300);
  text("landmark", 120);
  text("pincode", 6);
  text("refName", 60);
  if (input.refMobile !== undefined) next.refMobile = String(input.refMobile || "").replace(/\D/g, "").slice(-10);
  if (input.lat !== undefined && input.lng !== undefined) {
    const lat = Number(input.lat);
    const lng = Number(input.lng);
    next.lat = Number.isFinite(lat) && Math.abs(lat) <= 90 ? lat : null;
    next.lng = Number.isFinite(lng) && Math.abs(lng) <= 180 ? lng : null;
  }
  if (opts.admin) {
    if (input.salary !== undefined) next.salary = Math.max(0, Math.round(Number(input.salary) || 0));
    if (input.status !== undefined) next.status = input.status as KycRecord["status"];
    if (input.note !== undefined) next.note = String(input.note || "").slice(0, 200);
  } else if (next.status === "Approved" || next.status === "Rejected") {
    // the person changed something after review -> needs review again
    if (URL_KEYS.some((k) => input[k] !== undefined) || input.address !== undefined) next.status = "Incomplete";
  }
  next.updatedAt = Date.now();
  map[String(id)] = next;
  await writeSetting(`kyc:${kind}`, JSON.stringify(map));

  if (kind === "rider") {
    const data: Record<string, unknown> = {};
    if (input.photo !== undefined) data.photo = next.photo || null;
    if (input.aadhaarFront !== undefined) data.aadhaarFront = next.aadhaarFront || null;
    if (input.aadhaarBack !== undefined) data.aadhaarBack = next.aadhaarBack || null;
    if (input.license !== undefined) data.licenseFile = next.license || null;
    if (input.rc !== undefined) data.rcFile = next.rc || null;
    if (input.address !== undefined || input.landmark !== undefined)
      data.address = [next.address, next.landmark ? `Landmark: ${next.landmark}` : ""].filter(Boolean).join(", ") || null;
    if (opts.admin && input.status === "Approved") data.approvalStatus = "Approved";
    if (opts.admin && input.status === "Rejected") data.approvalStatus = "Rejected";
    if (Object.keys(data).length) await prisma.deliveryBoy.update({ where: { id }, data }).catch(() => null);
  }
  return next;
}

export async function submitKyc(kind: KycKind, id: number) {
  const rec = await readKyc(kind, id);
  const miss = missing(kind, rec);
  if (miss.length) return { ok: false as const, missing: miss };
  const map = await readKycMap(kind);
  map[String(id)] = { ...(map[String(id)] || {}), ...rec, status: "Submitted", updatedAt: Date.now() };
  await writeSetting(`kyc:${kind}`, JSON.stringify(map));
  return { ok: true as const };
}
