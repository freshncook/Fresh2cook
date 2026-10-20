import { readSettingRows, writeSetting } from "@/lib/f2c-db";
import { packGrams, parsePackSizes } from "@/lib/pack-price";

/*
 * Fresh2Cook store settings — saved in the AppSetting table (created automatically).
 * Admin changes them at /admin/settings. If anything fails, the defaults
 * below are used so the shop never breaks.
 */

export type StoreSettings = {
  freeDeliveryTarget: number; // order value for free delivery (₹)
  deliveryCharge: number; // charge below the free-delivery value (₹)
  handlingCharge: number; // per order (₹)
  riderCommission: number; // paid to rider per delivered order (₹)
  referralReward: number; // to the customer who referred, after friend's first delivery (₹)
  referralWelcome: number; // to the new friend on sign-up with a code (₹)
  walletExpiryDays: number; // wallet credit validity
  packExtra500: number; // added to the half of 1 kg price when customer picks 500 g (₹)
  packExtra250: number; // added to the quarter of 1 kg price when customer picks 250 g (₹)
  processingReward: number; // reward to processing staff per successfully packed order (₹)
  businessName: string;
  supportPhone: string;
  supportEmail: string;
  businessAddress: string;
  servicePincodes: string; // comma separated pincodes we deliver to (empty = not set)
  serviceAreaName: string; // shown to customers, e.g. "Dwarka"
  popupOfferOn: string; // "1" = show the offer banner popup when the site opens
  popupOfferImage: string; // banner picture (uploaded in Admin > Refer & Popups)
  popupOfferTitle: string;
  popupOfferText: string;
  popupOfferButton: string;
  popupOfferLink: string;
  popupReferOn: string; // "1" = show the refer-a-friend popup
  popupReferTitle: string;
  popupReferText: string;
  popupFrequency: string; // "session" | "day" | "week"
  packSizes: string; // JSON list of pack sizes customers can choose: [{label:"250g", extra:15}, ...] (empty = default list)
};

export const DEFAULT_SETTINGS: StoreSettings = {
  freeDeliveryTarget: 400,
  deliveryCharge: 40,
  handlingCharge: 10,
  riderCommission: 25,
  referralReward: 50,
  referralWelcome: 25,
  walletExpiryDays: 180,
  packExtra500: 10,
  packExtra250: 15,
  processingReward: 5,
  businessName: "Fresh2Cook",
  supportPhone: "9811001901",
  supportEmail: "info@freshcut.com",
  businessAddress: "Village Pochan Pur, Dwarka, New Delhi 110078",
  servicePincodes: "110075, 110077, 110078", // Dwarka — admin can change in Settings
  serviceAreaName: "Dwarka",
  popupOfferOn: "1",
  popupOfferImage: "",
  popupOfferTitle: "Fresh deals today 🥬",
  popupOfferText: "FREE delivery on orders above ₹400. Fresh vegetables & fruits, cleaned and ready to cook.",
  popupOfferButton: "Shop now",
  popupOfferLink: "/products",
  popupReferOn: "1",
  popupReferTitle: "Refer a friend & earn",
  popupReferText: "Tell us your friend's name, mobile and pincode. When they place their first order, you both get wallet money.",
  popupFrequency: "day",
  packSizes: "",
};

const NUMBER_KEYS = [
  "freeDeliveryTarget",
  "deliveryCharge",
  "handlingCharge",
  "riderCommission",
  "referralReward",
  "referralWelcome",
  "walletExpiryDays",
  "packExtra500",
  "packExtra250",
  "processingReward",
] as const;

const TEXT_KEYS = [
  "businessName",
  "supportPhone",
  "supportEmail",
  "businessAddress",
  "servicePincodes",
  "serviceAreaName",
  "packSizes",
  "popupOfferOn",
  "popupOfferImage",
  "popupOfferTitle",
  "popupOfferText",
  "popupOfferButton",
  "popupOfferLink",
  "popupReferOn",
  "popupReferTitle",
  "popupReferText",
  "popupFrequency",
] as const;

const ON_OFF_KEYS = ["popupOfferOn", "popupReferOn"];

export const SETTING_LIMITS: Record<(typeof NUMBER_KEYS)[number], [number, number]> = {
  freeDeliveryTarget: [0, 100000],
  deliveryCharge: [0, 1000],
  handlingCharge: [0, 500],
  riderCommission: [0, 1000],
  referralReward: [0, 5000],
  referralWelcome: [0, 5000],
  walletExpiryDays: [1, 3650],
  packExtra500: [0, 1000],
  packExtra250: [0, 1000],
  processingReward: [0, 1000],
};

export function settingsTableReady() {
  return true;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const settings: StoreSettings = { ...DEFAULT_SETTINGS };
  try {
    const rows = await readSettingRows();
    for (const row of rows) {
      if ((NUMBER_KEYS as readonly string[]).includes(row.key)) {
        const n = Number(row.value);
        if (Number.isFinite(n)) (settings as Record<string, unknown>)[row.key] = Math.round(n);
      } else if ((TEXT_KEYS as readonly string[]).includes(row.key)) {
        // Empty value = use the default (e.g. Dwarka pincodes)
        if (String(row.value).trim()) (settings as Record<string, unknown>)[row.key] = String(row.value);
      }
    }
  } catch (error) {
    console.error("STORE SETTINGS READ ERROR:", error);
  }
  return settings;
}

export function cleanPincodes(value: string) {
  return [...new Set(String(value || "").match(/\d{6}/g) || [])].join(", ");
}

/** Validates and saves only known keys. Returns the saved settings or an error. */
export async function saveStoreSettings(
  input: Record<string, unknown>
): Promise<{ ok: true; settings: StoreSettings } | { ok: false; error: string }> {
  const updates: { key: string; value: string }[] = [];

  for (const key of NUMBER_KEYS) {
    if (input[key] === undefined || input[key] === "") continue;
    const n = Number(input[key]);
    const [min, max] = SETTING_LIMITS[key];
    if (!Number.isFinite(n) || n < min || n > max) {
      return { ok: false, error: `${key} must be between ${min} and ${max}.` };
    }
    updates.push({ key, value: String(Math.round(n)) });
  }

  for (const key of TEXT_KEYS) {
    if (input[key] === undefined) continue;
    const raw = String(input[key]).trim();
    if (key === "packSizes") continue; // handled below
    const v =
      key === "servicePincodes"
        ? cleanPincodes(raw)
        : ON_OFF_KEYS.includes(key)
          ? (raw === "0" || raw === "false" ? "0" : "1")
          : key === "popupFrequency"
            ? (["session", "day", "week"].includes(raw) ? raw : "day")
            : key === "popupOfferLink"
              ? (/^(\/|https?:\/\/)/.test(raw) ? raw.slice(0, 300) : "/products")
              : key === "popupOfferImage"
                ? (/^(\/|https:\/\/)/.test(raw) ? raw.slice(0, 300) : "")
                : raw.slice(0, 300);
    updates.push({ key, value: v });
  }

  // Pack sizes list (Admin > Settings > Pack sizes)
  if (input.packSizes !== undefined) {
    const list = parsePackSizes(input.packSizes);
    if (list.length > 20) return { ok: false, error: "Maximum 20 pack sizes." };
    updates.push({ key: "packSizes", value: JSON.stringify(list) });
    // keep the old 250 g / 500 g extras in step with the list
    const e250 = list.find((p) => packGrams(p.label) === 250);
    const e500 = list.find((p) => packGrams(p.label) === 500);
    for (const [k, hit] of [["packExtra250", e250], ["packExtra500", e500]] as const) {
      if (!hit) continue;
      const i = updates.findIndex((u) => u.key === k);
      if (i >= 0) updates.splice(i, 1);
      updates.push({ key: k, value: String(hit.extra) });
    }
  }

  try {
    for (const u of updates) await writeSetting(u.key, u.value);
  } catch (error) {
    console.error("STORE SETTINGS SAVE ERROR:", error);
    return { ok: false, error: "Could not save settings: " + (error instanceof Error ? error.message : "database error") };
  }

  return { ok: true, settings: await getStoreSettings() };
}

/** Public, safe subset for the shop (cart / checkout). */
export function publicSettings(s: StoreSettings) {
  return {
    freeDeliveryTarget: s.freeDeliveryTarget,
    deliveryCharge: s.deliveryCharge,
    handlingCharge: s.handlingCharge,
    referralReward: s.referralReward,
    referralWelcome: s.referralWelcome,
    packExtra500: s.packExtra500,
    packExtra250: s.packExtra250,
    packSizes: parsePackSizes(s.packSizes, s),
    popups: {
      offer: {
        on: s.popupOfferOn !== "0",
        image: s.popupOfferImage,
        title: s.popupOfferTitle,
        text: s.popupOfferText,
        button: s.popupOfferButton,
        link: s.popupOfferLink,
      },
      refer: { on: s.popupReferOn !== "0", title: s.popupReferTitle, text: s.popupReferText },
      frequency: s.popupFrequency,
    },
    businessName: s.businessName,
    supportPhone: s.supportPhone,
    supportEmail: s.supportEmail,
    businessAddress: s.businessAddress,
    pincodesConfigured: Boolean(s.servicePincodes.trim()),
    servicePincodes: s.servicePincodes,
    serviceAreaName: s.serviceAreaName,
  };
}
